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
import { AccountBookListRef } from "./GetAccountBookList";

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
  const listRef = useRef<AccountBookListRef | null>(null);
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
      try {
        let book = accountBookData;

        if (!book) {
          book = await createAccountBook(userId);
        }
        if (book) {
          setAccountBook(book);
          const mergedLines = await loadAccountLines(book.id);
          // await sleep(1000);
          setCombinedLines(mergedLines);
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    init();

    if (accountBook) setAccountBookTitle(accountBook.name);
  }, [userId, isOpen, accountBookData]);

  if (!isOpen) return null;

  if (!combinedLines || !accountBook) return null;


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
                  value={accountBookTitle ?? accountBook.name}
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
                <h2>{accountBookTitle ?? accountBook.name}</h2>
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
                listRef.current?.addLine("product");
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
                listRef.current?.addLine("payment");
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
              userId={userId}
              accountBookId={accountBook.id}
              ref={listRef}
              onChange={(data) => {
                console.log(data);
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
