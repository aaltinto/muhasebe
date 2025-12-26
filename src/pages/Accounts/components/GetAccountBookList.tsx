import {
  useState,
} from "react";
import { ProductLine } from "./ProductLine";
import PaymentLine from "./PaymentLine";
import { saveAccountBook } from "../utils/saveAccountBook";
import {
  getAccountBooksById,
  updateAccountBook,
} from "../../../db/accountBook";
import { accountLine, deleteAccountLine } from "../../../db/productLines";
import { deletePaymentLine, payments } from "../../../db/paymentLines";
import calculateTotals from "../utils/calculateTotals";
import { loadAccountLines } from "../utils/loadPage";
import ErrorState from "../../../components/ErrorState";
import { LoadingState } from "../../../components/LoadingState";

interface GetAccountBookListProps {
  accountBookId: number;
  combinedLines: Array<
    ({ kind: "product" } & accountLine) | ({ kind: "payment" } & payments)
  > | null;
  onChange: (
    data: Array<
      ({ kind: "product" } & accountLine) | ({ kind: "payment" } & payments)
    >
  ) => void;
}

const GetAccountBookList = function GetAccountBookList(
  { accountBookId, combinedLines, onChange }: GetAccountBookListProps
) {
  const [isDeleting, setDeleting] = useState<number | string | null>(null);
  const [error, setError] = useState(false);
  const [clickedLineId, setClickedLineId] = useState<number | string | null>(
    `temp-0`
  );
  const [errors, setErrors] = useState<Record<string | number, string | null>>(
    {}
  );

  if (!combinedLines) {
    if (error) {
      return (
        <ErrorState
          onRetry={async () => {
            setError(false);
            const result = await loadAccountLines(accountBookId);
            if (!result) {
              setError(true);
              return;
            }
            onChange(result);
          }}
        />
      );
    }
    return (
      <LoadingState/>
    );
  }

  const handleLineChange = (id: number | string, data: Partial<payments>) => {
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
    
    const updatedLines = combinedLines.map((line) => {
      if (String(line.id) === String(id)) {
        const updated = { ...line, ...data };
        return updated;
      }
      return line;
    });
    onChange(updatedLines);
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
          throw "account book couldnt find";
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
      }

      const deletedList = combinedLines.filter((line) => line.id !== lines.id);
      const totals = calculateTotals(deletedList);
      const updatedCombinedLines = updatePaymentLines(
        deletedList,
        totals.paymentBalance
      );
      onChange(updatedCombinedLines);
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
};

export default GetAccountBookList;
