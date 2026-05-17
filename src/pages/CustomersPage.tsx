import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import {
  getCustomers,
  saveCustomer,
  updateCustomer,
  deleteCustomer,
} from '../servers/firestoreService';
import type { ICustomers } from '../schemas/customers';

const emptyForm = { companyName: '', address: '', taxId: '', phone: '' };

export function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<ICustomers[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingCustomer, setEditingCustomer] = useState<ICustomers | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await getCustomers();
      data.sort((a, b) => a.companyName.localeCompare(b.companyName, 'th'));
      setCustomers(data);
    } catch {
      setError('โหลดข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function startEdit(customer: ICustomers) {
    setEditingCustomer(customer);
    setFormValues({
      companyName: customer.companyName,
      address: customer.address,
      taxId: customer.taxId,
      phone: customer.phone,
    });
  }

  function cancelEdit() {
    setEditingCustomer(null);
    setFormValues(emptyForm);
  }

  function setField(field: keyof typeof emptyForm, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!formValues.companyName.trim() || !formValues.address.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const data = {
        companyName: formValues.companyName.trim(),
        address: formValues.address.trim(),
        taxId: formValues.taxId.trim(),
        phone: formValues.phone.trim(),
      };
      if (editingCustomer) {
        await updateCustomer(editingCustomer.docId, data);
      } else {
        await saveCustomer(data);
      }
      setFormValues(emptyForm);
      setEditingCustomer(null);
      await loadCustomers();
    } catch {
      setError('บันทึกข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!window.confirm('ต้องการลบข้อมูลลูกค้านี้หรือไม่?')) return;
    try {
      await deleteCustomer(docId);
      await loadCustomers();
    } catch {
      setError('ลบข้อมูลลูกค้าไม่สำเร็จ');
    }
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let ok = 0;
        let fail = 0;
        for (const row of results.data) {
          const companyName = row.companyName?.trim() ?? '';
          const address = row.address?.trim() ?? '';
          if (!companyName || !address) {
            fail++;
            continue;
          }
          try {
            await saveCustomer({
              companyName,
              address,
              taxId: row.taxId?.trim() ?? '',
              phone: row.phone?.trim() ?? '',
            });
            ok++;
          } catch {
            fail++;
          }
        }
        await loadCustomers();
        e.target.value = '';
        setImporting(false);
        await Swal.fire({
          icon: ok > 0 ? 'success' : 'warning',
          title: 'นำเข้าข้อมูล CSV',
          text: `สำเร็จ ${ok} รายการ${fail ? ` / ล้มเหลว ${fail} รายการ` : ''}`,
        });
      },
    });
  }

  return (
    <div className='customers-page'>
      <div className='customers-page__header'>
        <h1 className='customers-page__title'>รายชื่อลูกค้า</h1>
        <div className='customers-page__header-actions'>
          <div className='customers-page__import-wrap'>
            <input
              type='file'
              accept='.csv'
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImportCsv}
            />
            <button
              type='button'
              className='customers-page__btn customers-page__btn--import'
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? 'กำลังนำเข้า...' : 'นำเข้า CSV'}
            </button>
            <small className='customers-page__csv-hint'>
              คอลัมน์: companyName, address, taxId, phone
            </small>
          </div>
          <button type='button' className='customers-page__back' onClick={() => navigate('/')}>
            ← กลับหน้าฟอร์ม
          </button>
        </div>
      </div>

      {error && <p className='customers-page__error'>{error}</p>}

      {loading ? (
        <p className='customers-page__loading'>กำลังโหลด...</p>
      ) : (
        <div className='customers-page__table-wrapper'>
          <table className='customers-page__table'>
            <thead>
              <tr>
                <th>ชื่อบริษัท</th>
                <th>ที่อยู่</th>
                <th>เลขผู้เสียภาษี</th>
                <th>เบอร์โทร</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className='customers-page__empty'>
                    ยังไม่มีข้อมูลลูกค้า
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c.docId}>
                  <td className='customers-page__actions'>{c.companyName}</td>
                  <td className='customers-page__actions'>{c.address}</td>
                  <td className='customers-page__actions'>{c.taxId || '—'}</td>
                  <td className='customers-page__actions'>{c.phone || '—'}</td>
                  <td className='customers-page__actions'>
                    <button
                      type='button'
                      className='customers-page__btn'
                      onClick={() => startEdit(c)}
                    >
                      แก้ไข
                    </button>
                    <button
                      type='button'
                      className='customers-page__btn customers-page__btn--danger'
                      onClick={() => handleDelete(c.docId)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='customers-page__form'>
        <h2 className='customers-page__form-title'>
          {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
        </h2>
        <div className='customers-page__form-field'>
          <label>ชื่อบริษัท *</label>
          <input
            type='text'
            value={formValues.companyName}
            onChange={(e) => setField('companyName', e.target.value)}
            placeholder='ชื่อบริษัท'
          />
        </div>
        <div className='customers-page__form-field'>
          <label>ที่อยู่ *</label>
          <textarea
            rows={3}
            value={formValues.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder='ที่อยู่'
          />
        </div>
        <div className='customers-page__form-field'>
          <label>เลขประจำตัวผู้เสียภาษี</label>
          <input
            type='text'
            value={formValues.taxId}
            onChange={(e) => setField('taxId', e.target.value)}
            placeholder='เลขประจำตัวผู้เสียภาษี'
          />
        </div>
        <div className='customers-page__form-field'>
          <label>เบอร์โทรศัพท์</label>
          <input
            type='text'
            value={formValues.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder='เบอร์โทรศัพท์'
          />
        </div>
        <div className='customers-page__form-actions'>
          <button
            type='button'
            className='customers-page__btn customers-page__btn--primary'
            onClick={handleSave}
            disabled={saving || !formValues.companyName.trim() || !formValues.address.trim()}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          {editingCustomer && (
            <button type='button' className='customers-page__btn' onClick={cancelEdit}>
              ยกเลิก
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
