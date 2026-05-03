import { useFieldArray, useWatch } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';
import type { DocumentFormData } from './DocumentPdf';

const LEADING_NUM = /^\d+(\.\d+)?/;
const CELL_MIDDLE = { verticalAlign: 'middle' as const };

function extractNum(s: string): number | null {
  const m = s.match(LEADING_NUM);
  return m ? parseFloat(m[0]) : null;
}

interface RowProps {
  index: number;
  control: Control<DocumentFormData>;
  register: UseFormRegister<DocumentFormData>;
  onRemove: () => void;
  disableRemove: boolean;
}

function ProductRow({ index, control, register, onRemove, disableRemove }: RowProps) {
  const amount = useWatch({ control, name: `products.${index}.amount` }) ?? '';
  const price = useWatch({ control, name: `products.${index}.price` }) ?? '';

  const a = extractNum(amount);
  const p = extractNum(price);
  const suggestion = a !== null && p !== null ? a * p : null;

  const netPriceField = register(`products.${index}.netPrice`);

  return (
    <tr className='product-table__row'>
      <td className='product-table__cell'>
        <textarea className='product-table__textarea' {...register(`products.${index}.detail`)} />
      </td>
      <td className='product-table__cell'>
        <input
          type='text'
          className='product-table__input'
          {...register(`products.${index}.amount`)}
        />
      </td>
      <td className='product-table__cell'>
        <input
          type='text'
          className='product-table__input'
          {...register(`products.${index}.price`)}
        />
      </td>
      <td className='product-table__cell'>
        <input
          type='text'
          className='product-table__input'
          {...netPriceField}
          onChange={netPriceField.onChange}
        />
        {suggestion !== null && (
          <small className='product-table__suggestion'>
            {a} * {p} = {suggestion}
          </small>
        )}
      </td>
      <td className='product-table__cell' style={CELL_MIDDLE}>
        <button
          type='button'
          className='product-table__remove'
          onClick={onRemove}
          disabled={disableRemove}
        >
          X
        </button>
      </td>
    </tr>
  );
}

export interface ProductTableProps {
  control: Control<DocumentFormData>;
  register: UseFormRegister<DocumentFormData>;
}

export function ProductTable({ control, register }: ProductTableProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'products' });

  const disableRemove = fields.length === 1;

  function handleRemove(index: number) {
    remove(index);
  }

  return (
    <div className='product-table'>
      <div className='product-table__scroll'>
        <table className='product-table__table'>
          <thead>
            <tr>
              <th>รายละเอียด</th>
              <th>จำนวน (ตัว)</th>
              <th>ราคาต่อหน่วย</th>
              <th>ราคาสุทธิ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.map(({ id }, index) => (
              <ProductRow
                key={id}
                index={index}
                control={control}
                register={register}
                onRemove={() => handleRemove(index)}
                disableRemove={disableRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
      <button
        type='button'
        className='product-table__add'
        onClick={() => append({ detail: '', amount: '', price: '', netPrice: '' })}
      >
        + เพิ่มรายการ
      </button>
    </div>
  );
}
