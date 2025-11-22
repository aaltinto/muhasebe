import { useState, useEffect, useRef } from "react";
import "../style/AccountBook.css";
import close from "../assets/close.svg";
import add from "../assets/add.svg";
import deleteBtn from "../assets/delete.svg";
import edit from "../assets/edit.svg";
import { ProductLine } from "./ProductLine";
import { accountBook, setupAccountBook } from "../db/accounts";

interface AddAccountBookProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  accountBookData: accountBook | null;
}

interface ProductLineData {
  id: number;
  name: string;
  netPrice: string;
  discount: string;
  tax: string;
  gross: string;
}

export function AddAccountBook({
  isOpen,
  onClose,
  accountBookData,
  userId,
}: AddAccountBookProps) {
  if (!isOpen) return null;

  const lineID = useRef(0);
  const [accountBook, setAccountBook] = useState<accountBook | null>(
    accountBookData
  );
  const [loading, setLoading] = useState(false);
  const [clickedLineId, setClickedLineId] = useState<number | null>(0);
  const [productLines, setProductLines] = useState<ProductLineData[]>([
    { id: 0, name: "", netPrice: "", discount: "", tax: "20", gross: "" },
  ]);

  const createAccountBook = async () => {
    try {
      setLoading(true);
      const result = await setupAccountBook(userId);
      if (!result.success || !result.name || !result.lastRowId) {
        throw result.error;
      }
      const newAccount: accountBook = {
        id: result.lastRowId,
        name: result.name,
        debt: 0,
        balance: 0,
      };
      setAccountBook(newAccount);
    } catch (err) {
      console.error(`Error while getting account book: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accountBook) {
      createAccountBook();
    }
  }, [userId]);

  const handleAddProductLine = () => {
    lineID.current++;
    setProductLines([
      ...productLines,
      {
        id: lineID.current,
        name: "",
        netPrice: "",
        discount: "",
        tax: "20",
        gross: "",
      },
    ]);
    setClickedLineId(lineID.current);
  };

  const handleProductLineChange = (
    id: number,
    data: Partial<ProductLineData>
  ) => {
    setProductLines((prevLines) =>
      prevLines.map((line) => (line.id === id ? { ...line, ...data } : line))
    );
  };

  // Calculate totals
  const totalNetPrice = productLines.reduce(
    (sum, line) => sum + (parseFloat(line.netPrice) || 0),
    0
  );
  const totalDiscount = productLines.reduce(
    (sum, line) => sum + (parseFloat(line.discount) || 0),
    0
  );
  const totalTax = productLines.reduce((sum, line) => {
    const net = parseFloat(line.netPrice) || 0;
    const disc = parseFloat(line.discount) || 0;
    const taxRate = parseFloat(line.tax) || 0;
    return sum + (net - disc) * (taxRate / 100);
  }, 0);
  const totalGross = productLines.reduce(
    (sum, line) => sum + (parseFloat(line.gross) || 0),
    0
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content big card"
        onClick={(e) => {
          e.stopPropagation();
          setClickedLineId(null);
        }}
      >
        <div className="modal-header card-flex">
          <div className="btn-group card-flex">
            <h2>{accountBook ? accountBook.name : "başlık"}</h2>
            <button className="btn btn-secondary btn-small">
              <img src={edit} alt="edit" />
            </button>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleAddProductLine();
              }}
            >
              <img src={add} alt="add" />
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>
            <img src={close} alt="Close" />
          </button>
        </div>
        <div className="card-content big">
          <div className="bill-header">
            <strong>Ürün</strong>
            <div className="bill-prices">
              <p>Net Fiyat</p>
              <p>İskonto</p>
              <p>KDV (%)</p>
              <p>Brüt</p>
            </div>
          </div>
          {productLines.map((line) => (
            <div
              key={line.id}
              className=""
              onClick={(e) => {
                e.stopPropagation();
                setClickedLineId(line.id);
              }}
            >
              <ProductLine
                _name={line.name}
                _discount={line.discount}
                _gross={line.gross}
                _netPrice={line.netPrice}
                _tax={line.tax}
                isClicked={clickedLineId === line.id}
                onChange={(data) => handleProductLineChange(line.id, data)}
              />
            </div>
          ))}
        </div>
        <div className="card-footer">
          <div className="gross-bill">
            <div className="gross-bill-items">
              <span data-value={`₺${totalNetPrice.toFixed(2)}`}>
                Net Toplam
              </span>
              <span data-value={`₺${totalTax.toFixed(2)}`}>KDV</span>
              <span data-value={`₺${totalDiscount > 0 ? '-' : ''}${totalDiscount.toFixed(2)}`}>İskonto</span>
              <p data-value={`₺${totalGross.toFixed(2)}`}>Toplam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
