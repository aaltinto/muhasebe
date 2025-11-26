import { useState, useRef, useEffect } from "react";
import close from "../assets/close.svg"
import { accountBook } from "../db/accounts";

interface addPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    accountBook: accountBook | null;
}

export default function AddPayment({
    isOpen,
    onClose,
    accountBook,
}: addPaymentProps) {
    const [isLineChanged, setLineChange] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!isOpen || !accountBook) return null;

    const savePayment = async () => {

    }

    return (
        <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content big card"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal-header card-flex">
            <h2>{`'${accountBook.name}' defterine ödeme ekle`}</h2>
          <button className="modal-close" onClick={onClose}>
            <img src={close} alt="Close" />
          </button>
        </div>
        <div className="card-content big">
            <div className="bill-header">
            <strong>Açıklama</strong>
            <div className="bill-prices title">
              <p>Eski Borç</p>
              <p>Ödeme</p>
              <p>Bakiye</p>
              <p>Kalan</p>
            </div>
          </div>
          <div className="bill-items">
            <input
                type="text"
                className="input input-bill-title"
            />
            <div className="bill-prices prices">

            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="gross-bill">
            <div className="gross-bill-items">
              <span data-value={`₺`}>
                Ödeme
              </span>
              <span data-value={`${accountBook.balance}₺`}>Bakiye</span>
              <p data-value={`${accountBook.debt}₺`}>Kalan Borç</p>
            </div>
          </div>
        </div>
        {isLineChanged ? (
          <div className="card-footer">
            <div className="btn-group">
              <button onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button onClick={savePayment} className="btn btn-primary">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        ) : (
          ``
        )}
      </div>
    </div>
    );
}