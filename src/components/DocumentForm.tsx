import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pdf } from '@react-pdf/renderer';
import Swal from 'sweetalert2';
import { getMeta, updateMeta } from '../servers/firestoreService';
import { DocumentPdf, type DocumentFormData } from './DocumentPdf';
import { ProductTable } from './ProductTable';
import { CustomerPickerModal } from './CustomerPickerModal';

const DOC_TYPES = ['ใบเสนอราคา', 'ใบแจ้งหนี้', 'ใบส่งของ', 'ใบเสร็จรับเงิน'] as const;

const schema = z.object({
  documentType: z
    .array(z.enum(['ใบเสนอราคา', 'ใบแจ้งหนี้', 'ใบส่งของ', 'ใบเสร็จรับเงิน']))
    .min(1, 'กรุณาเลือกอย่างน้อย 1 ประเภท'),
  year: z.number(),
  monthNumber: z.number(),
  runningNumber: z.number(),
  date: z.string().min(1),
  customerInfo: z.object({
    companyName: z.string().min(1, 'กรุณากรอกชื่อบริษัท'),
    address: z.string().min(1, 'กรุณากรอกที่อยู่'),
    taxId: z.string(),
    phone: z.string(),
  }),
  products: z
    .array(
      z.object({
        detail: z.string(),
        amount: z.string(),
        price: z.string(),
        netPrice: z.string(),
      }),
    )
    .min(1),
  deposit: z.number().min(0).max(100),
});

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function padRunningNo(n: number): string {
  return String(n).padStart(3, '0');
}

export function DocumentForm() {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const { register, handleSubmit, control, formState, setValue, watch, reset } = useForm<DocumentFormData>(
    {
      resolver: zodResolver(schema),
      defaultValues: {
        documentType: [],
        year: new Date().getFullYear(),
        monthNumber: new Date().getMonth() + 1,
        runningNumber: 1,
        date: todayISO(),
        customerInfo: { companyName: '', address: '', taxId: '', phone: '' },
        products: [{ detail: '', amount: '', price: '', netPrice: '' }],
        deposit: 0,
      },
    },
  );

  const selectedTypes = watch('documentType');

  function handleDocTypeChange(type: (typeof DOC_TYPES)[number], checked: boolean) {
    if (checked) {
      if (type === DOC_TYPES[0]) {
        setValue('documentType', [DOC_TYPES[0]], { shouldValidate: true });
      } else {
        const next = selectedTypes.filter((t) => t !== DOC_TYPES[0]);
        setValue('documentType', next.includes(type) ? next : [...next, type], { shouldValidate: true });
      }
    } else {
      setValue('documentType', selectedTypes.filter((t) => t !== type), { shouldValidate: true });
    }
  }

  useEffect(() => {
    async function initMeta() {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const meta = await getMeta();

      if (meta === null || meta.month !== currentMonth) {
        await updateMeta({ latestRunningNo: 1, month: currentMonth });
        setValue('runningNumber', 1);
      } else {
        setValue('runningNumber', meta.latestRunningNo);
      }

      setValue('monthNumber', currentMonth);
      setValue('year', currentYear);
      setValue('date', todayISO());
    }
    initMeta().catch(console.error);
  }, [setValue]);

  async function onSubmit(data: DocumentFormData) {
    const confirmed = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการสร้างเอกสาร?',
      text: `สร้างเอกสาร ${data.documentType.join(', ')} สำหรับ ${data.customerInfo.companyName}`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });
    if (!confirmed.isConfirmed) return;

    setStatus('loading');
    try {
      await updateMeta({ latestRunningNo: data.runningNumber + 1 });
      for (const docType of data.documentType) {
        const singleData: DocumentFormData = { ...data, documentType: [docType] };
        const blob = await pdf(<DocumentPdf data={singleData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docType}-${data.year}-${padRunningNo(data.runningNumber)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      reset({
        documentType: [],
        year: data.year,
        monthNumber: data.monthNumber,
        runningNumber: data.runningNumber + 1,
        date: todayISO(),
        customerInfo: { companyName: '', address: '', taxId: '', phone: '' },
        products: [{ detail: '', amount: '', price: '', netPrice: '' }],
        deposit: 0,
      });
      setStatus('idle');
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'ดาวโหลดเอกสารสำเร็จจ้า!',
        confirmButtonText: 'ตกลง',
      });
    } catch {
      setStatus('idle');
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง',
        confirmButtonText: 'ตกลง',
      });
    }
  }

  return (
    <>
      <form className='doc-form' onSubmit={handleSubmit(onSubmit)}>
        <h1 className='doc-form__title'>ระบบสร้างเอกสาร รุ่งรัตน์สูท</h1>

        {/* Document Type */}
        <div className='doc-form__field'>
          <label>เอาเอกสารอะไรบ้างจ้ะ?</label>
          <div className='doc-form__radio-group'>
            {DOC_TYPES.map((type) => (
              <label key={type} className='doc-form__radio-label'>
                <input
                  type='checkbox'
                  value={type}
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => handleDocTypeChange(type, e.target.checked)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
          {formState.errors.documentType && (
            <span className='doc-form__field-error'>{formState.errors.documentType.message}</span>
          )}
        </div>

        {/* Year */}
        <div className='doc-form__number-grid'>
          <div className='doc-form__field'>
            <label htmlFor='year'>เลขที่เอกสาร</label>
            <input
              id='year'
              type='number'
              {...register('year', { valueAsNumber: true })}
              required
            />
          </div>

          {/* Month Number */}
          <div className='doc-form__field'>
            <label htmlFor='monthNumber'>(เดือน)</label>
            <input
              id='monthNumber'
              type='number'
              min={1}
              max={12}
              {...register('monthNumber', { valueAsNumber: true })}
              required
            />
          </div>

          {/* Running Number */}
          <div className='doc-form__field'>
            <label htmlFor='runningNumber'>(Running No.)</label>
            <input
              id='runningNumber'
              type='number'
              min={1}
              {...register('runningNumber', { valueAsNumber: true })}
              required
            />
          </div>
        </div>

        {/* Date */}
        <div className='doc-form__field'>
          <label htmlFor='date'>วันที่เอกสาร</label>
          <input id='date' type='date' {...register('date')} required />
        </div>

        {/* Customer Info */}
        <div className='doc-form__field'>
          <div>
            <label>ข้อมูลลูกค้า</label>
            <button
              type='button'
              className='doc-form__customer-pick'
              onClick={() => setShowCustomerModal(true)}
            >
              เลือกลูกค้า
            </button>
          </div>
          <div className='doc-form__field'>
            <label htmlFor='customerInfo.companyName'>ชื่อบริษัท *</label>
            <input
              id='customerInfo.companyName'
              type='text'
              {...register('customerInfo.companyName')}
            />
            {formState.errors.customerInfo?.companyName && (
              <span className='doc-form__field-error'>
                {formState.errors.customerInfo.companyName.message}
              </span>
            )}
          </div>
          <div className='doc-form__field'>
            <label htmlFor='customerInfo.address'>ที่อยู่ *</label>
            <textarea id='customerInfo.address' rows={3} {...register('customerInfo.address')} />
            {formState.errors.customerInfo?.address && (
              <span className='doc-form__field-error'>
                {formState.errors.customerInfo.address.message}
              </span>
            )}
          </div>
          <div className='doc-form__field'>
            <label htmlFor='customerInfo.taxId'>เลขประจำตัวผู้เสียภาษี</label>
            <input id='customerInfo.taxId' type='text' {...register('customerInfo.taxId')} />
          </div>
          <div className='doc-form__field'>
            <label htmlFor='customerInfo.phone'>เบอร์โทรศัพท์</label>
            <input id='customerInfo.phone' type='text' {...register('customerInfo.phone')} />
          </div>
        </div>

        {/* Product Table */}
        <div className='doc-form__field'>
          <label>รายการสินค้า</label>
          <ProductTable control={control} register={register} />
          {formState.errors.products && (
            <span className='doc-form__field-error'>At least one product row is required</span>
          )}
        </div>

        {/* Deposit */}
        <div className='doc-form__field'>
          <label htmlFor='deposit'>หักมัดจำกี่เปอร์เซ็น</label>
          <input
            id='deposit'
            type='number'
            min={0}
            max={100}
            {...register('deposit', { valueAsNumber: true })}
            required
          />
          {formState.errors.deposit && (
            <span className='doc-form__field-error'>{formState.errors.deposit.message}</span>
          )}
        </div>

        <div className='doc-form__actions'>
          <button type='submit' className='doc-form__submit' disabled={status === 'loading'}>
            {status === 'loading' ? (
              <span className='doc-form__spinner' aria-label='Generating…' />
            ) : (
              'สร้างเอกสาร'
            )}
          </button>
        </div>
      </form>

      {showCustomerModal && (
        <CustomerPickerModal
          onSelect={(customer) => {
            setValue('customerInfo.companyName', customer.companyName);
            setValue('customerInfo.address', customer.address);
            setValue('customerInfo.taxId', customer.taxId);
            setValue('customerInfo.phone', customer.phone);
            setShowCustomerModal(false);
          }}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </>
  );
}
