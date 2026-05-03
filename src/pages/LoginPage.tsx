import { useState, type SubmitEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../servers/firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='login-page'>
      <form className='login-form' onSubmit={handleSubmit}>
        <div className='login-form__brand'>
          <div className='login-form__logo'>
            <svg
              width={28}
              height={28}
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth={1.75}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <h1 className='login-form__title'>
            ระบบสร้างเอกสาร
            <br />
            รุ่งรัตน์สูท
          </h1>
          <p className='login-form__subtitle'>กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <div className='login-form__field'>
          <label htmlFor='login-email'>อีเมล์</label>
          <input
            id='login-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
        </div>

        <div className='login-form__field'>
          <label htmlFor='login-password'>รหัสผ่าน</label>
          <input
            id='login-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />
        </div>

        {error && <p className='login-form__error'>{error}</p>}

        <button type='submit' className='login-form__submit' disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
