import { getDb } from "./db";

export interface payments {
  id: number | string;
  name: string;
  payment: string;
  old_debt: string;
  old_balance: string;
  account_book_id: number;
  date: string;
}

export async function savePayment (name: string | null, payment: number, old_debt: number, old_balance: number, date: string, account_book_id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`
      INSERT INTO payments
      (name, payment, old_debt, old_balance, account_book_id, date)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [name, payment, old_debt, old_balance, account_book_id, date]);

    if (!result.lastInsertId) {
      throw ("Error while inserting new payment")
    }
    return {
      success: true,
      lastInsertedId: result.lastInsertId,
      error: null
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      lastInsertedId: null,
      error: err
    }
  }
}

export async function getPayment(account_book_id: number) {
  const db = await getDb();
  try {
    const result = await db.select<payments[]>(`
      SELECT * FROM payments
      WHERE account_book_id = ?`,
      [account_book_id]);
    return {
      success: true,
      payments: result,
      error: null
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      payments: null,
      error: err
    }
  }
}

export async function getPaymentsLinesById(id: number) {
  const db = await getDb();
  try {
    const result = await db.select<payments[]>(
      `
      SELECT * FROM payments WHERE id = ?`,
      [id]
    );

    return {
      success: true,
      accountLines: result.length > 0 ? result[0] : null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      accountLines: null,
      error: `Error: ${err}`,
    };
  }
}

export async function deletePaymentLine(id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`DELETE FROM payments WHERE id = ?`, [
      id,
    ]);

    const success = result.rowsAffected > 0;

    return {
      success,
      rowsAffected: result.rowsAffected,
      message: success
        ? "Payment deleted successfully"
        : "No payments found with that ID",
    };
  } catch (error) {
    console.error(`Error deleting account line with id ${id}:`, error);
    return {
      success: false,
      rowsAffected: 0,
      message: "Failed to delete payment",
      error: error,
    };
  }
}