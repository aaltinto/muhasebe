import { useState, useEffect, useRef } from "react";
import "../style/AccountBook.css";
import close from "../assets/close.svg";
import add from "../assets/add.svg";
import { ProductLine } from "./ProductLine";
import {
  accountBook,
  setupAccountBook,
  getAccountLines,
  createAccountLine,
  accountLine,
  getAccountLinesById,
  updateAccountBook,
  deleteAccountLine,
} from "../db/accounts";

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
  const lineID = useRef(0);
  const lineCount = useRef(0);
  const [accountBookTitle, setAccountBookTitle] = useState<string | null>(null);
  const [accountBook, setAccountBook] = useState<accountBook | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLineChanged, setLineChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickedLineId, setClickedLineId] = useState<number | string | null>(
    `temp-0`
  );
  const [productLines, setProductLines] = useState<accountLine[] | null>(null);

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
      return newAccount;
    } catch (err) {
      console.error(`Error while getting account book: ${err}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadAccountLines = async (account_book_id: number) => {
    try {
      setLoading(true);
      let addedLine = false;
      const result = await getAccountLines(account_book_id);
      if (!result.success) {
        throw result.error;
      }
      const lines = result.accountLines || [];
      lines.push({
        id: `temp-${lineID.current}`,
        name: "",
        account_book_id: account_book_id,
        net_price: "",
        tax: "20",
        amount: "1",
        price: "",
        discount: "0",
        total_price: "",
      });
      addedLine = true;
      lineCount.current = lines.length - (addedLine ? 1 : 0);
      setProductLines(lines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (isOpen) {
        let book = accountBookData;

        if (!book) {
          book = await createAccountBook();
        }
        if (book) {
          setAccountBook(book);
          await loadAccountLines(book.id);
        }
      }
    };
    init();
    if (accountBook)
      setAccountBookTitle(accountBook.name)
  }, [userId, isOpen, accountBookData]);

  if (!isOpen || !productLines || !accountBook) return null;

  const isUpdated = (newLine: accountLine, oldLine: accountLine) => {
    if (
      newLine.account_book_id !== oldLine.account_book_id ||
      newLine.amount !== oldLine.amount ||
      newLine.discount !== oldLine.discount ||
      newLine.name !== oldLine.name ||
      newLine.net_price !== oldLine.net_price ||
      newLine.price !== oldLine.price ||
      newLine.tax !== oldLine.tax ||
      newLine.total_price !== oldLine.total_price
    ) {
      return true;
    }
    return false;
  };

  const saveAccountBook = async () => {
    let total_price: number = 0;
    try {
      setSaving(true);
      for (const line of productLines) {
        console.log("line id:", line.id, "price:", line.price, "amount:", line.amount);
        if (line.net_price == '' || !line.net_price) {
          continue;
        }
        total_price += parseFloat(line.price || "0") * parseFloat(line.amount || "1");
        if (typeof line.id === "number") {
          const oldLineResult = await getAccountLinesById(line.id);
          if (!oldLineResult.success) {
            throw oldLineResult.error;
          }
          if (
            !oldLineResult.accountLines ||
            !isUpdated(line, oldLineResult.accountLines)
          ) {
            console.log('line not updated', line.name)
            continue;
          }
          console.log('line will updated', line.name, line.id)
        }
        
        const amount = parseFloat(line.amount);
        const net_price = parseFloat(line.net_price);
        const tax = parseFloat(line.tax);
        const discount = parseFloat(line.discount);
        const price = parseFloat(line.price);
        const line_total = parseFloat(line.price) * amount;

        const result = await createAccountLine(
          line.name,
          line.account_book_id,
          amount,
          tax,
          net_price,
          discount,
          price,
          line_total,
          typeof line.id === "number" ? line.id : null
        );
        if (!result.success) {
          throw result.error;
        }
      }
      const result = await updateAccountBook(
        accountBook.id,
        accountBookTitle ? accountBookTitle : accountBook.name,
        total_price,
        accountBook.balance
      );
      if (!result.success) {
        throw result.error;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setLineChange(false);
      lineCount.current = productLines.length;
    }
  };

  const handleProductLineDelete = async (id: number | string, debt: number) => {
    try {
      if (typeof id === "number") {
        const result = await deleteAccountLine(id);
        if (!result.success) {
          throw result.error ? result.error : result.message;
        }
        console.log("debt", debt);
        const updateResult = await updateAccountBook(
          accountBook.id,
          accountBook.name,
          accountBook.debt - debt,
          accountBook.balance
        );
        if (!updateResult.success) {
          console.error("Account book couldn't updated");
        }
        console.log(`Line deleted: ${id}`);
        return;
      }

      setProductLines(productLines.filter((line) => line.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      if (typeof id === "number") {
        loadAccountLines(accountBook.id);
      }
    }
  };

  const handleAddProductLine = () => {
    lineID.current++;
    setProductLines([
      ...productLines,
      {
        id: `temp-${lineID.current}`,
        name: "",
        account_book_id: accountBook.id,
        net_price: "",
        amount: "1",
        price: "",
        tax: "20",
        discount: "0",
        total_price: "",
      },
    ]);
    setClickedLineId(lineID.current);
  };

  const handleProductLineChange = (
    id: number | string,
    data: Partial<accountLine>
  ) => {

    setProductLines((prevLines) => {
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

  // Calculate totals
  const totalnet_price = productLines.reduce(
    (sum, line) =>
      sum + (parseFloat(line.net_price) * parseFloat(line.amount) || 0),
    0
  );
  const totalDiscount = productLines.reduce(
    (sum, line) =>
      sum + (parseFloat(line.discount) * parseFloat(line.amount) || 0),
    0
  );
  const totalTax = productLines.reduce((sum, line) => {
    const net = parseFloat(line.net_price) || 0;
    const disc = parseFloat(line.discount) || 0;
    const taxRate = parseFloat(line.tax) || 0;
    return sum + (net - disc) * (taxRate / 100) * parseFloat(line.amount);
  }, 0);
  const totalGross = productLines.reduce(
    (sum, line) =>
      sum + (parseFloat(line.price) * parseFloat(line.amount) || 0),
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
            <input
              className="input"
              onChange={(e) => {
                setLineChange(true)
                setAccountBookTitle(e.target.value)
              }}
              value={accountBookTitle ?? accountBook.name}
              placeholder="Başlık"
              />
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
            <div className="bill-prices title">
              <p>Adet</p>
              <p>Net Fiyat</p>
              <p>Adet Fiyat</p>
              <p>{"Toplam"}</p>
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
                _amount={line.amount}
                _discount={line.discount}
                _price={line.price}
                _net_price={line.net_price}
                _tax={line.tax}
                isClicked={clickedLineId === line.id}
                onDelete={() =>
                  handleProductLineDelete(
                    line.id,
                    parseFloat(line.price) * parseFloat(line.amount)
                  )
                }
                onChange={(data) => {
                  handleProductLineChange(line.id, data);
                  setLineChange(true)
                }}
              />
            </div>
          ))}
        </div>
        <div className="card-footer">
          <div className="gross-bill">
            <div className="gross-bill-items">
              <span data-value={`₺${totalnet_price.toFixed(2)}`}>
                Net Toplam
              </span>
              <span data-value={`₺${totalTax.toFixed(2)}`}>KDV</span>
              <span
                data-value={`₺${
                  totalDiscount > 0 ? "-" : ""
                }${totalDiscount.toFixed(2)}`}
              >
                İskonto
              </span>
              <p data-value={`₺${totalGross.toFixed(2)}`}>Toplam Borç</p>
            </div>
          </div>
        </div>
        {isLineChanged ? (
          <div className="card-footer">
            <div className="btn-group">
              <button onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button onClick={saveAccountBook} className="btn btn-primary">
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
