import { useState, useEffect, useRef } from "react";
import "../../../style/AccountBook.css";
import close from "../../../assets/close.svg";
import add from "../../../assets/add.svg";
import saveButton from "../../../assets/save.svg";
import payment from "../../../assets/payments.svg";
import check from "../../../assets/check.svg";
import edit from "../../../assets/edit.svg";
import loadSpin from "../../../assets/progress.svg";
import { saveAccountBook } from "../utils/saveAccountBook";
import { accountBook } from "../../../db/accountBook";
import { accountLine } from "../../../db/productLines";
import { payments } from "../../../db/paymentLines";
import calculateTotals from "../utils/calculateTotals";
import { createAccountBook, loadAccountLines } from "../utils/loadPage";
import GetAccountBookList from "./GetAccountBookList";
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
  const [isTitleOnEdit, setTitleOnEdit] = useState(false);

  const [combinedLines, setCombinedLines] = useState<Array<
    | ({ kind: "product" } & accountLine)
    | ({
        kind: "payment";
      } & payments)
  > | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isOpen) return;
      setLineChange(false);
      try {
        let book = accountBookData;

        if (!book) {
          book = await createAccountBook(userId);
        }
        if (book) {
          setAccountBook(book);
          setAccountBookTitle(book.name);
          const mergedLines = await loadAccountLines(book.id);
          setCombinedLines(mergedLines);
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    init();
  }, [userId, isOpen, accountBookData]);

  if (!isOpen) return null;

  const handleAddLine = (
    kind: "product" | "payment"
  ) => {
    if (!accountBook || !combinedLines) return;
    
    lineID.current++;
    const date = new Date().toISOString();
    let newId = `temp-${lineID.current}`;
    let updatedCombinedLines = combinedLines;
    const totals = calculateTotals(combinedLines);

    let newLine: accountLine | payments;
    if (kind === "product") {
      const tmpProduct = combinedLines.filter(
        (line) => typeof line.id === "string"
      );
      for (const line of tmpProduct) {
        if (
          (line.kind === "payment" &&
            (line.payment === "" || !line.payment || line.payment === "0") &&
            typeof line.id === "string") ||
          (line.kind === "product" &&
            (!line.net_price || line.net_price === "") &&
            (line.name === "" || !line.name) &&
            typeof line.id === "string")
        ) {
          newId = line.id;
          if (line.kind === "payment") {
            updatedCombinedLines = combinedLines.filter(
              (line) => line.id != newId
            );
            break;
          }
          return;
        }
      }

      newLine = {
        id: newId,
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
    } else {
      const tmpProduct = combinedLines.filter(
        (line) => typeof line.id === "string"
      );
      for (const line of tmpProduct) {
        if (
          (line.kind === "payment" &&
            (line.payment === "" || !line.payment || line.payment === "0") &&
            typeof line.id === "string") ||
          (line.kind === "product" &&
            (!line.net_price || line.net_price === "") &&
            (line.name === "" || !line.name) &&
            typeof line.id === "string")
        ) {
          newId = line.id;
          if (line.kind === "product") {
            updatedCombinedLines = combinedLines.filter(
              (line) => line.id != newId
            );
            break;
          }
          return;
        }
      }

      newLine = {
        id: newId,
        name: "",
        payment: "0",
        old_debt: String(totals.totalGross - totals.totalPayment),
        account_book_id: accountBook.id,
        date: date,
      };
    }
    updatedCombinedLines = [
      ...(updatedCombinedLines ?? []),
      (kind === "product"
        ? { kind: "product" as const, ...newLine }
        : { kind: "payment" as const, ...newLine }) as
        | ({ kind: "product" } & accountLine)
        | ({ kind: "payment" } & payments),
    ];

    setCombinedLines(updatedCombinedLines);
    setLineChange(true);
  };

  const totals = calculateTotals(combinedLines);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content big card"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}
      >
        <div className="modal-header card-flex">
          <div className="btn-group card-flex">
            {isTitleOnEdit ? (
              <div className="btn-group card-flex">
                <input
                  className="input"
                  onChange={(e) => {
                    setLineChange(true);
                    setAccountBookTitle(e.target.value);
                  }}
                  value={accountBookTitle ?? (accountBook ? accountBook.name : "-")}
                  placeholder="Hesap defteri başlığı"
                  style={{ fontSize: "1.1rem", fontWeight: 600 }}
                />
                <button
                  className="btn btn-secondary btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTitleOnEdit(false);
                  }}
                >
                  <img src={check} alt="check" />
                </button>
              </div>
            ) : (
              <div className="btn-group card-flex">
                <h2>{accountBookTitle ?? (accountBook ? accountBook.name : "-")}</h2>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTitleOnEdit(true);
                  }}
                >
                  <img src={edit} alt="check" />
                </button>
              </div>
            )}
          </div>
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAddLine("product");
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
                handleAddLine("payment");
              }}
            >
              <img src={payment} alt="Payment" />
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>
            <img src={close} alt="Close" />
          </button>
        </div>

        <div
          className="card-content big"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
          >
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
              <GetAccountBookList
              accountBookId={accountBook ? accountBook.id : -1}
              combinedLines={combinedLines}
              onChange={(data) => {
                setCombinedLines(data);
                setLineChange(true);
              }}
              />

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
          {isLineChanged && combinedLines && accountBookTitle && accountBook && (
            <div className="btn-group">
              <button onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  // Filter out temporary empty lines before saving
                  const validLines = combinedLines.filter(line => {
                    if (typeof line.id === 'string') {
                      // Skip temporary product lines that are empty
                      if (line.kind === 'product' && (!line.name || !line.net_price)) {
                        return false;
                      }
                      // Skip temporary payment lines that are empty
                      if (line.kind === 'payment' && (!line.payment || line.payment === '0')) {
                        return false;
                      }
                    }
                    return true;
                  });
                  
                  if (validLines.length === 0) {
                    setSaving(false);
                    return;
                  }
                  
                  await saveAccountBook(validLines, accountBookTitle);
                  setSaving(false);
                  setLineChange(false);
                }}
                className="btn btn-primary card-flex"
                disabled={saving}
              >
                {saving ?
                  <img src={loadSpin} alt="Loading" className="spin-animation" />
                :
                <>
                  <img src={saveButton} alt="save" />
                  <strong>Kaydet</strong>
                </>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
