import { useState, useEffect, useRef } from "react";
import "../../../style/AccountBook.css";
import close from "../../../assets/close.svg";
import add from "../../../assets/add.svg";
import saveButton from "../../../assets/save.svg";
import payment from "../../../assets/payments.svg";
import { ProductLine } from "./ProductLine";
import PaymentLine from "./PaymentLine";
import { saveAccountBook } from "../utils/saveAccountBook";
import { accountBook, updateAccountBook } from "../../../db/accountBook";
import { accountLine, deleteAccountLine } from "../../../db/productLines";
import { payments } from "../../../db/paymentLines";
import calculateTotals from "../utils/calculateTotals";
import { createAccountBook, loadAccountLines } from "../utils/loadPage";

interface AddAccountBookProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  accountBookData: accountBook | null;
}

export function AddAccountBook({
  isOpen,
  onClose,
  accountBookData,
  userId,
}: AddAccountBookProps) {
  const lineID = useRef(1);
  const [accountBookTitle, setAccountBookTitle] = useState<string | null>(null);
  const [accountBook, setAccountBook] = useState<accountBook | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLineChanged, setLineChange] = useState(false);
  const [clickedLineId, setClickedLineId] = useState<number | string | null>(
    `temp-0`
  );
  const [errors, setErrors] = useState<Record<string | number, string | null>>(
    {}
  );
  const [combinedLines, setCombinedLines] = useState<Array<
    | ({ kind: "product" } & accountLine)
    | ({
        kind: "payment";
      } & payments)
  > | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isOpen) return;
      let book = accountBookData;

      if (!book) {
        book = await createAccountBook(userId);
      }
      if (book) {
        setAccountBook(book);
        const mergedLines = await loadAccountLines(book.id);
        setCombinedLines(mergedLines);
      }
    };

    init();
    if (accountBook) setAccountBookTitle(accountBook.name);
  }, [userId, isOpen, accountBookData]);

  if (!isOpen || !combinedLines || !accountBook) return null;

  const handleProductLineDelete = async (id: number | string, debt: number) => {
    try {
      if (typeof id === "number") {
        const result = await deleteAccountLine(id);
        if (!result.success) {
          throw result.error ? result.error : result.message;
        }
        const updateResult = await updateAccountBook(
          accountBook.id,
          accountBook.debt - debt,
          accountBook.balance,
          accountBook.name
        );
        if (!updateResult.success) {
          console.error("Account book couldn't updated");
        }
        console.log(`Line deleted: ${id}`);
        return;
      }

      setCombinedLines(combinedLines.filter((line) => line.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      if (typeof id === "number") {
        loadAccountLines(accountBook.id);
      }
    }
  };

  const handleAddProductLine = () => {
    if (!accountBook) return;
    lineID.current++;
    const date = new Date().toISOString();

    const newProductLine: accountLine = {
      id: `temp-${lineID.current}`,
      name: "",
      account_book_id: accountBook.id,
      net_price: "",
      amount: "1",
      price: "",
      tax: "20",
      discount: "0",
      total_price: "",
      date,
    };

    setCombinedLines((prev) => [
      ...(prev ?? []),
      { kind: "product", ...newProductLine },
    ]);

    setClickedLineId(newProductLine.id);
    setLineChange(true);
  };

  const handleAddNewPayment = () => {
    if (!accountBook) return;
    lineID.current++;
    const newId = `temp-${lineID.current}`
    setClickedLineId(newId);
    for (const line of combinedLines) {
      if (typeof line.id === "number" || line.kind === "product") continue;
      if (line.payment === "0") {
        setErrors({ ...errors, [line.id]: "Ödeme 0 olamaz" });
        return;
      }
    }
    const newPaymentLine: payments = {
      id: newId,
      name: "",
      payment: "0",
      old_debt: String(totals.totalGross - totals.totalPayment),
      old_balance: String(accountBook.balance),
      account_book_id: accountBook.id,
      date: new Date().toISOString()
    }

    setCombinedLines((prev) => [
      ...(prev ?? []),
      { kind: "payment", ...newPaymentLine },
    ]);
    setClickedLineId(newId);
    setLineChange(true);
  };

  const handleProductLineChange = (
    id: number | string,
    data: Partial<accountLine>
  ) => {
    setCombinedLines((prevLines) => {
      if (!prevLines) return null;

      const updatedLines = prevLines.map((line) => {
        if (String(line.id) === String(id)) {
          const updated = { ...line, ...data };
          return updated;
        }
        return line;
      });
      return updatedLines;
    });
  };

  const handlePaymentChange = (
    id: number | string,
    data: Partial<payments>
  ) => {
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
    setCombinedLines((prevLines) => {
      if (!prevLines) return null;

      const updatedLines = prevLines.map((line) => {
        if (String(line.id) === String(id)) {
          const updated = { ...line, ...data };
          return updated;
        }
        return line;
      });
      return updatedLines;
    });
  };

  const totals = calculateTotals(combinedLines);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content big card"
        onClick={(e) => {
          e.stopPropagation();
          setClickedLineId(null);
        }}
        style={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}
      >
        <div className="modal-header card-flex">
          <div className="btn-group card-flex">
            <input
              className="input"
              onChange={(e) => {
                setLineChange(true);
                setAccountBookTitle(e.target.value);
              }}
              value={accountBookTitle ?? accountBook.name}
              placeholder="Hesap defteri başlığı"
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
            />
          </div>
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAddProductLine();
              }}
              title="Yeni ürün ekle"
            >
              <img src={add} alt="add" />
            </button>
            <button
              className="btn btn-secondary"
              title="Ödeme Ekle"
              onClick={(e) => {
                e.stopPropagation();
                handleAddNewPayment();
              }}
            >
              <img src={payment} alt="Payment" />
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>
            <img src={close} alt="Close" />
          </button>
        </div>

        <div className="card-content big">
          <div className="bill-header">
            <p>Tarih</p>
            <strong>Açıklama</strong>
            <div className="bill-prices title">
              <p>Adet</p>
              <p>Net Fiyat</p>
              <p>Birim Fiyat</p>
              <p>Toplam</p>
            </div>
          </div>
          {(combinedLines ?? []).map((line) => (
            <div
              key={`${line.kind}-${line.id}`}
              className=""
              onClick={(e) => {
                e.stopPropagation();
                setClickedLineId(line.id);
              }}
            >
              {line.kind === "product" ? (
                <ProductLine
                  _name={line.name}
                  _amount={line.amount}
                  _discount={line.discount}
                  _price={line.price}
                  _net_price={line.net_price}
                  _tax={line.tax}
                  _date={line.date}
                  isClicked={clickedLineId === line.id}
                  onDelete={() =>
                    handleProductLineDelete(
                      line.id,
                      parseFloat(line.price) * parseFloat(line.amount)
                    )
                  }
                  onChange={(data) => {
                    handleProductLineChange(line.id, data);
                    setLineChange(true);
                  }}
                />
              ) : (
                <PaymentLine
                  isClicked={clickedLineId === line.id}
                  isDisplay={clickedLineId !== line.id}
                  _payment={line}
                  onDelete={() => {}}
                  onChange={(data) => {
                    handlePaymentChange(line.id, data);
                    setLineChange(true);
                  }}
                  error={errors[line.id] || null}
                />
              )}
            </div>
          ))}
        </div>
        <div
          className="card-footer"
          style={{ justifyContent: "space-between" }}
        >
          <div className="gross-bill">
            <div className="gross-bill-items">
              <span data-value={`₺${totals.totalnet_price.toFixed(2)}`}>
                Net Toplam
              </span>
              <span data-value={`₺${totals.totalTax.toFixed(2)}`}>KDV</span>
              <span
                data-value={`₺${
                  totals.totalDiscount > 0 ? "-" : ""
                }${totals.totalDiscount.toFixed(2)}`}
              >
                İskonto
              </span>
              <span data-value={`₺${totals.totalPayment.toFixed(2) || 0}`}>
                Toplam Ödemeler
              </span>
              <p
                data-value={`₺${(
                  totals.totalGross - totals.totalPayment
                ).toFixed(2)}`}
              >
                Kalan Borç
              </p>
            </div>
          </div>
          {isLineChanged && (
            <div className="btn-group">
              <button onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  await saveAccountBook(combinedLines, accountBookTitle);
                  setSaving(false);
                  setLineChange(false);
                }}
                className="btn btn-primary card-flex"
                disabled={saving}
              >
                <img src={saveButton} alt="save" />
                <strong>Kaydet</strong>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
