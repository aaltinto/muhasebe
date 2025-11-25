import { useState, useEffect, useRef } from "react";
import deleteBtn from "../assets/delete.svg";

interface ProductProps {
  _name: string;
  _amount: string;
  _net_price: string;
  _discount: string;
  _tax: string;
  _price: string;
  isClicked: boolean;
  onDelete: () => void;
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
  _price,
  isClicked,
  onDelete,
  onChange,
}: ProductProps) {
  const [name, setName] = useState<string>(_name);
  const [amount, setAmount] = useState<string>(_amount || '1');
  const [net_price, setNetPrice] = useState<string>(_net_price);
  const [discount, setDiscount] = useState<string>(_discount);
  const [tax, setTax] = useState<string>(_tax || "20");
  const [price, setGross] = useState<string>(_price);
    const nameInputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    onChange({amount: newAmount})
  }

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNetPrice = e.target.value;
    setNetPrice(newNetPrice);

    const netNum = parseFloat(newNetPrice) || 0;
    const discountNum = parseFloat(discount) || 0;
    const taxRateNum = parseFloat(tax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = netAfterDiscount * (1 + taxRateNum / 100);
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
    const grossValue = netAfterDiscount * (1 + taxRateNum / 100);
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
    const grossValue = netAfterDiscount * (1 + taxRateNum / 100);
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ tax: newTax, price: newGross });
  };

  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGross = e.target.value;
    setGross(newGross);

    const grossNum = parseFloat(newGross) || 0;
    const taxRateNum = parseFloat(tax) || 0;

    const netValue = grossNum / (1 + taxRateNum / 100);
    const newNetPrice = netValue.toFixed(2);
    setNetPrice(newNetPrice);
    setDiscount("0");

    onChange({ price: newGross, net_price: newNetPrice, discount: "0" });
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
            onFocus={() => {nameInputRef.current = null}}
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="1"
          />
          <input
            id="net_price"
            className="input input-bill"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {nameInputRef.current = null}}
            type="number"
            value={net_price}
            onChange={handleNetChange}
            placeholder="0"
          />
          <input
            id="discount"
            className="input input-bill"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {nameInputRef.current = null}}
            type="number"
            value={discount}
            onChange={handleDiscountChange}
            placeholder="0"
          />
          <input
            id="tax"
            className="input input-bill"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {nameInputRef.current = null}}
            type="number"
            value={tax}
            onChange={handleTaxChange}
            placeholder="0"
          />
          <input
            id="price"
            className="input input-bill"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {nameInputRef.current = null}}
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
        <p>{discount || "0"}</p>
        <p>{tax || "0"}</p>
        <p>{calcTotal(price, amount)}</p>
        <button onClick={(e) => {
          e.stopPropagation();
          onDelete();
          }} className="btn btn-delete btn-small">
          <img src={deleteBtn} alt="Delete" />
        </button>
      </div>
    </div>
  );
}
