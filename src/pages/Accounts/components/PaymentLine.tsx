import { useState, useEffect, useRef } from "react";
import deleteBtn from "../../../assets/delete.svg";
import { payments } from "../../../db/paymentLines";

interface ProductProps {
  _payment: payments;
  isDisplay: boolean;
  isClicked?: boolean;
  onDelete?: () => void;
  onChange?: (data: { name?: string; payment?: string }) => void;
  error?: string | null;
}

export default function PaymentLine({
  _payment,
  isDisplay,
  isClicked,
  onDelete,
  onChange,
  error
}: ProductProps) {
  const [name, setName] = useState<string>( _payment.name);
  const [payment, setPayment] = useState(_payment.payment);
  const [oldDebt, setOldDebt] = useState(_payment.old_debt);
  const [oldBalance, setOldBalance] = useState(_payment.old_balance);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const localeDate = new Date(_payment.date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const newName = e.target.value;
      setName(newName);
      onChange({ name: newName });
    }
  };
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const newPayment = e.target.value;
      setPayment(newPayment);
      onChange({ payment: newPayment });
    }
  };

  useEffect(() => {
    if (isClicked && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current = null;
    }
  });
  console.log(error);

  if (isClicked) {
    return (
      <>
        <div className="bill-header-edit">
          <strong style={{ fontSize: '1rem' }}>Ödeme Düzenleme</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
            <p style={{ margin: 0 }}>Eski Borç</p>
            <p style={{ margin: 0 }}>Eski Bakiye</p>
            <p style={{ margin: 0 }}>Ödeme Tutarı</p>
          </div>
        </div>
        <div className={`bill-items ${error ? 'error' : ''}`} style={{ gridTemplateColumns: '1fr auto auto' }}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="input input-bill-title"
            placeholder="Ödeme açıklaması"
            style={{ fontWeight: 500 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>₺{oldDebt}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>₺{oldBalance}</p>
            </div>
            <input
              id="payment"
              type="number"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onChange={handlePaymentChange}
              value={payment}
              placeholder="0.00"
            />
          </div>
          <button
            onClick={onDelete}
            className="btn btn-delete btn-small"
          >
            <img src={deleteBtn} alt="Delete" />
          </button>
        </div>
      </>
    );
  }

  if (isDisplay) {
    const newBalance = (parseFloat(oldDebt) - parseFloat(payment)).toFixed(2);
    return (
      <div className="bill-items payment-line">
        <p>{localeDate}</p>
        <p style={{ fontWeight: 600, color: '#10b981' }}>{name || 'Ödeme'}</p>
        <div className="bill-prices pay card-flex" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ödeme</span>
            <p style={{ margin: 0, color: '#10b981', fontWeight: 700 }}>-₺{payment}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yeni Bakiye</span>
            <p style={{ margin: 0, fontWeight: 700 }}>₺{newBalance}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bill-items payment-line ${error != null ? 'error' : ''}`}>
      <p>{localeDate}</p>
      <p style={{ fontWeight: 600 }}>{name || 'Ödeme'}</p>
      <div className="bill-prices pay card-flex">
        <p>₺{oldDebt}</p>
        <p>₺{payment}</p>
        <p>₺{oldBalance}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          className="btn btn-delete btn-small"
        >
          <img src={deleteBtn} alt="Delete" />
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
