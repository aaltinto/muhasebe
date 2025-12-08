import { useState, useEffect, useRef } from "react";
import deleteBtn from "../../../assets/delete.svg";
import loadSpin from "../../../assets/progress.svg";

interface ProductProps {
  _name: string;
  _amount: string;
  _net_price: string;
  _discount: string;
  _tax: string;
  _date: string;
  _price: string;
  isClicked: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onChange: (data: {
    name?: string;
    amount?: string;
    net_price?: string;
    discount?: string;
    tax?: string;
    price?: string;
  }) => void;
}

export function ProductLine({
  _name,
  _amount,
  _net_price,
  _discount,
  _tax,
  _date,
  _price,
  isClicked,
  isDeleting,
  onDelete,
  onChange,
}: ProductProps) {
  const [name, setName] = useState<string>(_name);
  const [amount, setAmount] = useState<string>(_amount || "1");
  const [net_price, setNetPrice] = useState<string>(_net_price);
  const [discount, setDiscount] = useState<string>(_discount);
  const [tax, setTax] = useState<string>(_tax || "20");
  const [price, setGross] = useState<string>(_price);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    onChange({ amount: newAmount });
  };

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNetPrice = e.target.value;
    setNetPrice(newNetPrice);

    const netNum = parseFloat(newNetPrice) || 0;
    const discountNum = parseFloat(discount) || 0;
    const taxRateNum = parseFloat(tax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = (netAfterDiscount / 100 * taxRateNum) + netAfterDiscount;
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ net_price: newNetPrice, price: newGross });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiscount = e.target.value;
    setDiscount(newDiscount);

    const netNum = parseFloat(net_price) || 0;
    const discountNum = parseFloat(newDiscount) || 0;
    const taxRateNum = parseFloat(tax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = (netAfterDiscount / 100 * taxRateNum) + netAfterDiscount;
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ discount: newDiscount, price: newGross });
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTax = e.target.value;
    setTax(newTax);

    const netNum = parseFloat(net_price) || 0;
    const discountNum = parseFloat(discount) || 0;
    const taxRateNum = parseFloat(newTax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = (netAfterDiscount / 100 * taxRateNum) + netAfterDiscount;
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ tax: newTax, price: newGross });
  };

  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGross = e.target.value;
    setGross(newGross);

    const grossNum = parseFloat(newGross) || 0;
    const taxRateNum = parseFloat(tax) || 0;
    const discountNum = parseFloat(discount) || 0;

    const netValue = grossNum - (grossNum / 100 * taxRateNum);
    const newNetPrice = (netValue + discountNum).toFixed(2);
    setNetPrice(newNetPrice);

    onChange({ price: newGross, net_price: newNetPrice });
  };

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
          <strong style={{ fontSize: '1rem' }}>Ürün Düzenleme</strong>
          <div style={{ marginRight: '3.5rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
            <p style={{ margin: 0 }}>Adet</p>
            <p style={{ margin: 0 }}>Net Fiyat</p>
            <p style={{ margin: 0 }}>İskonto</p>
            <p style={{ margin: 0 }}>KDV (%)</p>
            <p style={{ margin: 0 }}>Brüt Fiyat</p>
          </div>
        </div>
        <div className="bill-items" style={{ gridTemplateColumns: '1fr auto auto' }}>
          <input
            ref={nameInputRef}
            className="input input-bill-title"
            onClick={(e) => e.stopPropagation()}
            value={name}
            onChange={handleNameChange}
            type="text"
            placeholder="Ürün adı giriniz"
            style={{ fontWeight: 500 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', alignItems: 'center' }}>
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
              placeholder="0.00"
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
              placeholder="0.00"
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
              placeholder="20"
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
              placeholder="0.00"
            />
          </div>
          <button onClick={onDelete} className="btn btn-delete btn-small">
          {isDeleting ?
                  <img src={loadSpin} alt="Loading" className="spin-animation" />
                :
                <>
                  <img src={deleteBtn} alt="Delete" />
                </>
                }
          </button>
        </div>
      </>
    );
  }

  const calcTotal = (price: string, amount: string) => {
    if (!price || !amount) return "0.00";
    const grossFloat = parseFloat(price);
    const amountFloat = parseFloat(amount);
    return (grossFloat * amountFloat).toFixed(2);
  };

  return (
    <div className="bill-items">
      <p>{new Date(_date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}</p>
      <p style={{ fontWeight: 600 }}>{name || "Ürün adı yok"}</p>
      <div className="bill-prices prices">
        <p>{amount || "0"}x</p>
        <p>₺{parseFloat(net_price || "0").toFixed(2)}</p>
        <p>₺{parseFloat(price || "0").toFixed(2)}</p>
        <p style={{ fontWeight: 700, color: '#3b82f6' }}>₺{calcTotal(price, amount)}</p>
      </div>
    </div>
  );
}
