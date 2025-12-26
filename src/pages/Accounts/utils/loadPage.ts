import { accountBook, setupAccountBook } from "../../../db/accountBook";
import { getPayment } from "../../../db/paymentLines";
import { getAccountLines } from "../../../db/productLines";


export async function createAccountBook (userId: number) {
    try {
      const result = await setupAccountBook(userId);
      if (!result.success || !result.name || !result.lastRowId) {
        throw result.error;
      }
      const newAccount: accountBook = {
        id: result.lastRowId,
        account_id: userId,
        name: result.name,
        debt: 0,
        balance: 0,
      };
      return newAccount;
    } catch (err) {
      console.error(`Error while getting account book: ${err}`);
      return null;
    }
  };

  const loadPayments = async (account_book_id: number) => {
    try {
      const result = await getPayment(account_book_id);
      if (!result.success) {
        throw result.error;
      }
      return {
        success: true,
        payments: result.payments ? result.payments : [],
        error: null
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        payments: null,
        error: err
      }
    }
  };

  export async function loadAccountLines (account_book_id: number) {
    try {
      const result = await getAccountLines(account_book_id);
      if (!result.success) {
        throw result.error;
      }
      const lines = result.accountLines || [];
      const date = new Date().toISOString();
      lines.push({
        id: `temp-0`,
        name: "",
        account_book_id: account_book_id,
        net_price: "",
        tax: "20",
        amount: "1",
        price: "",
        discount: "0",
        total_price: "",
        date: date,
      });

      const pmts = await loadPayments(account_book_id);
      if (!pmts.success || !pmts.payments) {
        throw pmts.error
      }
      const payments = pmts.payments;
      const productDisplay = lines.map((l) => ({ kind: "product" as const, ...l }));
      const paymentDisplay = payments.map((p) => ({ kind: "payment" as const, ...p }));

      const merged = [...productDisplay, ...paymentDisplay].sort((a, b) => {
        const da = new Date(a.date as string).getTime();
        const db = new Date(b.date as string).getTime();
        return da - db;
      });
      // throw "Test Error";
      return merged;
    } catch (err) {
      console.error(err);
      return null;
    }
  };