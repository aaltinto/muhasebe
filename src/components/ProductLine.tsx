import { useState, useEffect, useRef } from "react";

interface ProductProps {
  _name: string;
  _netPrice: string;
  _discount: string;
  _tax: string;
  _gross: string;
  isClicked: boolean;
  onChange: (data: {
    name?: string;
    netPrice?: string;
    discount?: string;
    tax?: string;
    gross?: string;
  }) => void;
}

export function ProductLine({
  _name,
  _netPrice,
  _discount,
  _tax,
  _gross,
  isClicked,
  onChange,
}: ProductProps) {
  const [name, setName] = useState<string>(_name);
  const [netPrice, setNetPrice] = useState<string>(_netPrice);
  const [discount, setDiscount] = useState<string>(_discount);
  const [tax, setTax] = useState<string>(_tax || "20");
  const [gross, setGross] = useState<string>(_gross);
    const nameInputRef = useRef<HTMLInputElement>(null);

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

    onChange({ netPrice: newNetPrice, gross: newGross });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiscount = e.target.value;
    setDiscount(newDiscount);

    const netNum = parseFloat(netPrice) || 0;
    const discountNum = parseFloat(newDiscount) || 0;
    const taxRateNum = parseFloat(tax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = netAfterDiscount * (1 + taxRateNum / 100);
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ discount: newDiscount, gross: newGross });
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTax = e.target.value;
    setTax(newTax);

    const netNum = parseFloat(netPrice) || 0;
    const discountNum = parseFloat(discount) || 0;
    const taxRateNum = parseFloat(newTax) || 0;

    const netAfterDiscount = netNum - discountNum;
    const grossValue = netAfterDiscount * (1 + taxRateNum / 100);
    const newGross = grossValue.toFixed(2);
    setGross(newGross);

    onChange({ tax: newTax, gross: newGross });
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

    onChange({ gross: newGross, netPrice: newNetPrice, discount: "0" });
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
          value={name}
          onChange={handleNameChange}
          type="text"
          placeholder="Ürün adı"
        />
        <div className="bill-prices">
          <input
            id="netPrice"
            className="input input-bill"
            type="number"
            value={netPrice}
            onChange={handleNetChange}
            placeholder="0"
          />
          <input
            id="discount"
            className="input input-bill"
            type="number"
            value={discount}
            onChange={handleDiscountChange}
            placeholder="0"
          />
          <input
            id="tax"
            className="input input-bill"
            type="number"
            value={tax}
            onChange={handleTaxChange}
            placeholder="0"
          />
          <input
            id="gross"
            className="input input-bill"
            type="number"
            value={gross}
            onChange={handleGrossChange}
            placeholder="0"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="bill-items">
      <p>{name || "-"}</p>
      <div className="bill-prices">
        <p>{netPrice || "0"}</p>
        <p>{discount || "0"}</p>
        <p>{tax || "0"}</p>
        <p>{gross || "0"}</p>
      </div>
    </div>
  );
}
