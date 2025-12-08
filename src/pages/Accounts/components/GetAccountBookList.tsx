import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ProductLine } from "./ProductLine";
import PaymentLine from "./PaymentLine";
import { saveAccountBook } from "../utils/saveAccountBook";
import { getAccountBooksById, updateAccountBook } from "../../../db/accountBook";
import { accountLine, deleteAccountLine } from "../../../db/productLines";
import { deletePaymentLine, payments } from "../../../db/paymentLines";
import calculateTotals from "../utils/calculateTotals";
import { loadAccountLines } from "../utils/loadPage";
import loadSpin from "../../../assets/progress.svg";
import ErrorState from "./ErrorState";

interface GetAccountBookListProps {
  userId: number;
  accountBookId: number;
  onChange: (data: Array<
    ({ kind: "product" } & accountLine) | ({ kind: "payment" } & payments)
  >) => void;
}

export interface AccountBookListRef {
  addLine: (kind: "product" | "payment") => void;
}

const GetAccountBookList = forwardRef<AccountBookListRef, GetAccountBookListProps>(function GetAccountBookList({
  userId,
  accountBookId,
  onChange
}: GetAccountBookListProps, ref) {
    const lineID = useRef(1);
  const [isDeleting, setDeleting] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clickedLineId, setClickedLineId] = useState<number | string | null>(
    `temp-0`
  );
  const [errors, setErrors] = useState<Record<string | number, string | null>>(
    {}
  );
  const [combinedLines, setCombinedLines] = useState<Array<
    ({ kind: "product" } & accountLine) | ({ kind: "payment" } & payments)
  > | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const mergedLines = await loadAccountLines(accountBookId);
        setCombinedLines(mergedLines);
        onChange(mergedLines);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [userId, accountBookId]);

    useImperativeHandle(ref, () => ({
    addLine(kind: "product" | "payment") {
        handleAddLine(kind, accountBookId);
    }
  }));

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={loadSpin}
          alt="Loading"
          className="spin-animation"
          style={{ width: "48px", height: "48px" }}
        />
      </div>
    );

    if (!combinedLines) {
        return  <ErrorState onRetry={() => loadAccountLines(accountBookId).then(setCombinedLines)} />;
    }
    
    const handleAddLine = (kind: "product" | "payment", account_book_id: number) => {
    lineID.current++;
    const date = new Date().toISOString();
    let newId = `temp-${lineID.current}`;
    let updatedCombinedLines = combinedLines;
    const totals = calculateTotals(combinedLines);

    let newLine: accountLine | payments;
    if (kind === "product") {
      const tmpProduct = combinedLines.filter((line) => typeof line.id === "string");
      for (const line of tmpProduct) {
        if ((line.kind === "payment" && (line.payment === "" || !line.payment || line.payment === "0") && typeof line.id === "string")
        || (line.kind === "product" && (!line.net_price || line.net_price === "") && (line.name === "" || !line.name) && typeof line.id === "string")) {
          newId = line.id;
          if (line.kind === "payment") {
            updatedCombinedLines = combinedLines.filter((line) => line.id != newId);
            break;
          }
          setClickedLineId(newId);
          return;
        }
      }

      newLine = {
        id: newId,
        name: "",
        account_book_id: account_book_id,
        net_price: "",
        amount: "1",
        price: "",
        tax: "20",
        discount: "0",
        total_price: "",
        date,
      };
    } else {
      const tmpProduct = combinedLines.filter((line) => typeof line.id === "string");
      for (const line of tmpProduct) {
        if ((line.kind === "payment" && (line.payment === "" || !line.payment || line.payment === "0") && typeof line.id === "string")
        || (line.kind === "product" && (!line.net_price || line.net_price === "") && (line.name === "" || !line.name) && typeof line.id === "string")) {
          newId = line.id;
          if (line.kind === "product") {
            updatedCombinedLines = combinedLines.filter((line) => line.id != newId);
            break;
          }
          setClickedLineId(newId);
          return;
        }
      }

      newLine = {
      id: newId,
      name: "",
      payment: "0",
      old_debt: String(totals.totalGross - totals.totalPayment),
      account_book_id: account_book_id,
      date: date,
    };
    }
    console.log("newLine id", newLine.id);
    console.log("newLine",newLine);
    updatedCombinedLines = [
      ...(updatedCombinedLines ?? []),
      (kind === "product"
        ? ({ kind: "product" as const, ...newLine })
        : ({ kind: "payment" as const, ...newLine })) as
        | ({ kind: "product" } & accountLine)
        | ({ kind: "payment" } & payments),
    ]

    setCombinedLines(updatedCombinedLines);

    setClickedLineId(newLine.id);
  };

  const handleLineChange = (id: number | string, data: Partial<payments>) => {
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
      onChange(updatedLines);
      return updatedLines;
    });
  };

  const updatePaymentLines = (
    combinedLines: (
      | ({
          kind: "product";
        } & accountLine)
      | ({
          kind: "payment";
        } & payments)
    )[],
    totalPaymentBalance: Record<
      number | string,
      { balance: number; old_debt: number }
    >
  ) => {
    return combinedLines.map((line) => {
      if (totalPaymentBalance[line.id] && line.kind === "payment") {
        console.log("totalPaymentBalance", totalPaymentBalance[line.id]);
        return {
          ...line,
          old_debt: String(totalPaymentBalance[line.id].old_debt),
        };
      }
      return line;
    });
  };

  const handleLineDelete = async (
    lines:
      | ({ kind: "product" } & accountLine)
      | ({ kind: "payment" } & payments)
  ) => {
    try {
      if (typeof lines.id === "number") {
        const accountBookResult = await getAccountBooksById(accountBookId);
        if (!accountBookResult.success || !accountBookResult.accountBooks) {
            throw ("account book couldnt find");
        }
        const accountBook = accountBookResult.accountBooks;
        if (lines.kind === "product") {
          const result = await deleteAccountLine(lines.id);
          if (!result.success) {
            throw result.error ? result.error : result.message;
          }
          const updateResult = await updateAccountBook(
            accountBook.id,
            accountBook.debt -
              parseFloat(lines.total_price) * parseFloat(lines.amount),
            accountBook.balance,
            accountBook.name
          );
          if (!updateResult.success) {
            console.error("Account book couldn't updated");
          }
        } else if (lines.kind === "payment") {
          const result = await deletePaymentLine(lines.id);
          if (!result.success) {
            throw result.error ? result.error : result.message;
          }
          const updateResult = await updateAccountBook(
            accountBook.id,
            accountBook.debt,
            accountBook.balance + parseFloat(lines.payment),
            accountBook.name
          );
          if (!updateResult.success) {
            console.error("Account book couldn't updated");
          }
        }
        console.log(`Line deleted: ${lines.id}`);
      }

      const deletedList = combinedLines.filter((line) => line.id !== lines.id);
      const totals = calculateTotals(deletedList);
      const updatedCombinedLines = updatePaymentLines(
        deletedList,
        totals.paymentBalance
      );
      onChange(updatedCombinedLines);
      setCombinedLines(updatedCombinedLines);
      await saveAccountBook(updatedCombinedLines, null);
    } catch (err) {
      console.error(err);
    } finally {
      if (typeof lines.id === "number") {
        await loadAccountLines(accountBookId);
      }
    }
  };

  return (
    <>
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
              isDeleting={isDeleting === line.id}
              onDelete={async () => {
                setDeleting(line.id);
                await handleLineDelete(line);
                setDeleting(null);
              }}
              onChange={(data) => {
                handleLineChange(line.id, data);
              }}
            />
          ) : (
            <PaymentLine
              isClicked={clickedLineId === line.id}
              isDisplay={clickedLineId !== line.id}
              _payment={line}
              isDeleting={isDeleting === line.id}
              onDelete={async () => {
                setDeleting(line.id);
                await handleLineDelete(line);
                setDeleting(null);
              }}
              onChange={(data) => {
                handleLineChange(line.id, data);
              }}
              error={errors[line.id] || null}
            />
          )}
        </div>
      ))}
    </>
  );
}
)

export default GetAccountBookList;