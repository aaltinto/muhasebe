import { useState, useEffect, useRef } from "react";
import deleteBtn from "../assets/delete.svg";

interface ProductProps {
  _name: string;
  _payment: string;
  isClicked: boolean;
  onDelete: () => void;
  onChange: (data: {
    name?: string;
    payment?: string;
  }) => void;
}

export function ProductLine({
  _name,
  _payment,
  isClicked,
  onDelete,
  onChange,
}: ProductProps) {
  const [name, setName] = useState<string>(_name);
  const [payment, setPayment] = useState<string>(_payment);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onChange({ name: newName });
  };

  useEffect(() => {
    if (isClicked && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current = null;
    }
  });

  if (isClicked) {
    return (
      <>
        <div className="bill-header-edit">
          <strong>Ürün Adı</strong>
          <div className="bill-prices title">
            <p>Adet</p>
            <p>Net Fiyat</p>
            <p>İskonto</p>
            <p>KDV (%)</p>
            <p>{"Toplam"}</p>
          </div>
        </div>
        <div className="bill-items">
          <input
            ref={nameInputRef}
            className="input input-bill-title"
            onClick={(e) => e.stopPropagation()}
            value={name}
            onChange={handleNameChange}
            type="text"
            placeholder="Ürün adı"
          />
          <div className="bill-prices">
            <input
              id="amount"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                nameInputRef.current = null;
              }}
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="1"
            />
            <input
              id="net_price"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                nameInputRef.current = null;
              }}
              type="number"
              value={net_price}
              onChange={handleNetChange}
              placeholder="0"
            />
            <input
              id="discount"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                nameInputRef.current = null;
              }}
              type="number"
              value={discount}
              onChange={handleDiscountChange}
              placeholder="0"
            />
            <input
              id="tax"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                nameInputRef.current = null;
              }}
              type="number"
              value={tax}
              onChange={handleTaxChange}
              placeholder="0"
            />
            <input
              id="price"
              className="input input-bill"
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                nameInputRef.current = null;
              }}
              type="number"
              value={price}
              onChange={handleGrossChange}
              placeholder="0"
            />
          </div>
          <button onClick={onDelete} className="btn btn-delete btn-small">
            <img src={deleteBtn} alt="Delete" />
          </button>
        </div>
      </>
    );
  }

  const calcTotal = (price: string, amount: string) => {
    if (!price || !amount) return "0";
    const grossFloat = parseFloat(price);
    const amountFloat = parseFloat(amount);
    return String(grossFloat * amountFloat);
  };

  return (
    <div className="bill-items">
      <p>{name || "-"}</p>
      <div className="bill-prices prices">
        <p>{amount || "0"}</p>
        <p>{net_price || "0"}</p>
        <p>{price || "0"}</p>
        <p>{calcTotal(price, amount)}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn btn-delete btn-small"
        >
          <img src={deleteBtn} alt="Delete" />
        </button>
      </div>
    </div>
  );
}
