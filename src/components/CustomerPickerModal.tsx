import { useEffect, useState } from 'react';
import { getCustomers } from '../servers/firestoreService';
import type { ICustomers, ICustomersDoc } from '../schemas/customers';

interface CustomerPickerModalProps {
  onSelect: (customer: ICustomersDoc) => void;
  onClose: () => void;
}

export function CustomerPickerModal({ onSelect, onClose }: CustomerPickerModalProps) {
  const [customers, setCustomers] = useState<ICustomers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div
        className='modal-content'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label='Select Customer'
      >
        <div className='modal-content__header'>
          <h2 className='modal-content__title'>เลือกลูกค้า</h2>
          <button type='button' className='modal-content__close' onClick={onClose}>
            ✕
          </button>
        </div>

        <div className='modal-content__body'>
          {loading && <p className='modal-content__loading'>กำลังโหลด…</p>}
          {error && <p className='modal-content__error'>{error}</p>}
          {!loading && !error && customers.length === 0 && (
            <p className='customer-list__empty'>ไม่พบรายการลูกค้า</p>
          )}
          {!loading && !error && (
            <ul className='customer-list'>
              {customers.map((c) => (
                <li key={c.docId} className='customer-list__item'>
                  <button type='button' className='customer-list__btn' onClick={() => onSelect(c)}>
                    <span className='customer-list__name'>{c.companyName}</span>
                    {c.address && <span className='customer-list__address'>{c.address}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
