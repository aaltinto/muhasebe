import { getAccountById, updateUserDebt } from "../../../db/accounts";
import {
  getPaymentsLinesById,
  payments,
  savePayment,
} from "../../../db/paymentLines";
import calculateTotals from "./calculateTotals";
import {
  getAccountLinesById,
  accountLine,
  createAccountLine,
} from "../../../db/productLines";
import {
  updateAccountBook,
  getAccountBooksById,
  getAccountBooksDebt,
} from "../../../db/accountBook";

function isUpdated(
  newLine:
    | ({ kind: "product" } & accountLine)
    | ({ kind: "payment" } & payments),
  oldLine:
    | ({ kind: "product" } & accountLine)
    | ({ kind: "payment" } & payments)
) {
  if (
    newLine.kind === "product" &&
    oldLine.kind === "product" &&
    (newLine.account_book_id !== oldLine.account_book_id ||
      newLine.amount !== oldLine.amount ||
      newLine.discount !== oldLine.discount ||
      newLine.name !== oldLine.name ||
      newLine.net_price !== oldLine.net_price ||
      newLine.price !== oldLine.price ||
      newLine.tax !== oldLine.tax ||
      newLine.total_price !== oldLine.total_price)
  ) {
    return true;
  }
  if (
    newLine.kind === "payment" &&
    oldLine.kind === "payment" &&
    (newLine.name !== oldLine.name ||
      newLine.payment !== oldLine.payment ||
      newLine.old_debt !== oldLine.old_debt ||
      newLine.account_book_id !== oldLine.account_book_id)
  ) {
    return true;
  }
  return false;
}

async function saveAccountLine(line: accountLine) {
  const amount = parseFloat(line.amount);
  const net_price = parseFloat(line.net_price);
  const tax = parseFloat(line.tax);
  const discount = parseFloat(line.discount);
  const price = parseFloat(line.price);
  const line_total = parseFloat(line.price) * amount;

  if (!amount || !net_price || !tax || !price || !line_total) {
    return 0;
  }
  const result = await createAccountLine(
    line.name,
    line.account_book_id,
    amount,
    tax,
    net_price,
    discount,
    price,
    line_total,
    line.date,
    typeof line.id === "number" ? line.id : null
  );
  if (!result.success) {
    throw result.error;
  }
  return line_total;
}

async function savePaymentLine(line: { kind: "payment" } & payments) {
  const n_old_debt = parseFloat(line.old_debt);
  const n_payment = parseFloat(line.payment);
  const result = await savePayment(
    line.name,
    n_payment,
    n_old_debt,
    line.date,
    line.account_book_id,
    typeof line.id === "number" ? line.id : null
  );
  if (!result.success) {
    throw result.error;
  }
}

export async function saveAccountBook(
  combinedLines: Array<
    | ({ kind: "product" } & accountLine)
    | ({
        kind: "payment";
      } & payments)
  >,
  accountBookTitle: string | null
) {
  let account_book_id = 0;
  let lastBalance = 0;
  try {
    for (const line of combinedLines) {
      account_book_id = line.account_book_id;
      if (line.kind === "payment") {
        lastBalance = parseFloat(line.old_debt) - parseFloat(line.payment);
        if (typeof line.id === "number") {
          const oldLineResult = await getPaymentsLinesById(line.id);
          if (!oldLineResult.success || !oldLineResult.accountLines) {
            throw oldLineResult.error || `could't get the line: ${line.id}`;
          }
          if (
            !isUpdated(line, { kind: "payment", ...oldLineResult.accountLines })
          ) {
            continue;
          }
        }
        await savePaymentLine(line);
        continue;
      }

      if (typeof line.id === "number") {
        const oldLineResult = await getAccountLinesById(line.id);
        if (!oldLineResult.success || !oldLineResult.accountLines) {
          throw oldLineResult.error || `could't get the line: ${line.id}`;
        }
        if (
          !isUpdated(line, { kind: "product", ...oldLineResult.accountLines })
        ) {
          continue;
        }
      }
      await saveAccountLine(line);
    }
    const totals = calculateTotals(combinedLines);
    const accountBookResult = await getAccountBooksById(account_book_id);
    if (!accountBookResult.success || !accountBookResult.accountBooks) {
      throw accountBookResult.error || "Can't get Account book";
    }
    const accountBook = accountBookResult.accountBooks;
    const result = await updateAccountBook(
      accountBook.id,
      totals.totalGross - totals.totalPayment,
      lastBalance,
      accountBookTitle ? accountBookTitle : accountBook.name
    );
    if (!result.success) {
      throw result.error;
    }
    const account = await getAccountById(accountBook.account_id);
    if (!account) {
      throw "Couldn't find account";
    }
    const debtResult = await getAccountBooksDebt(
      accountBook.account_id,
      accountBook.id
    );
    if (!debtResult.success) {
      throw debtResult.error;
    }
    await updateUserDebt(
      account.id,
      debtResult.debt + (totals.totalGross - totals.totalPayment),
      debtResult.balance + lastBalance,
      new Date().toISOString()
    );
  } catch (err) {
    console.error(err);
  }
}
