import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth } from '../servers/firebase';
import { updateMeta } from '../servers/firestoreService';
import { DocumentForm } from '../components/DocumentForm';

export function FormPage() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/login');
  }

  async function handleResetRunningNumber() {
    const result = await Swal.fire({
      title: 'ตั้งค่าเลขที่เริ่มต้น',
      input: 'number',
      inputValue: 1,
      inputAttributes: { min: '1', step: '1' },
      inputValidator: (v) => (!v || Number(v) < 1 ? 'กรุณากรอกเลขที่ถูกต้อง' : null),
      showCancelButton: true,
      confirmButtonText: 'ตั้งค่า',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      const currentMonth = new Date().getMonth() + 1;
      await updateMeta({ latestRunningNo: Number(result.value), month: currentMonth });
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className='form-page'>
      <nav className='form-page__nav'>
        <span className='form-page__nav-brand'>รุ่งรัตน์สูท</span>
        <div className='form-page__nav-actions'>
          <button
            type='button'
            className='form-page__nav-btn form-page__nav-btn--primary'
            onClick={() => navigate('/customers')}
          >
            จัดการข้อมูลลูกค้า
          </button>
          <button
            type='button'
            className='form-page__nav-btn form-page__nav-btn--warning'
            onClick={handleResetRunningNumber}
          >
            รีเซ็ตเลขที่
          </button>
          <button
            type='button'
            className='form-page__nav-btn form-page__nav-btn--secondary'
            onClick={handleSignOut}
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>
      <div className='form-page__content'>
        <DocumentForm key={formKey} />
      </div>
    </div>
  );
}
