import { getDb } from "./db";

export interface accountBook {
  id: number;
  account_id: number;
  name: string;
  debt: number;
  balance: number;
}

export async function getAccountBooksDebt(userId: number, account_book_id?:number) {
  const db = await getDb();
  try {
    if (account_book_id) {
      const result = await db.select<Array<{debt: number, balance: number}>>(
        `
        SELECT 
          COALESCE(SUM(debt), 0) as debt,
          COALESCE(SUM(balance), 0) as balance
        FROM account_book 
        WHERE account_id = ? AND id != ?
        `,
        [userId, account_book_id]
      );
      return {
        success: true,
        debt: result.length > 0 ? result[0].debt : 0,
        balance: result.length > 0 ? result[0].balance : 0,
        error: null,
      };
    }
    
    const result = await db.select<Array<{debt: number, balance: number}>>(
      `
      SELECT 
        COALESCE(SUM(debt), 0) as debt,
        COALESCE(SUM(balance), 0) as balance
      FROM account_book 
      WHERE account_id = ?
      `,
      [userId]
    );
    return {
      success: true,
      debt: result.length > 0 ? result[0].debt : 0,
      balance: result.length > 0 ? result[0].balance : 0,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching account books debt:", err);
    return {
      success: false,
      debt: 0,
      balance: 0,
      error: err,
    };
  }
}

export async function setupAccountBook(userId: number) {
  const db = await getDb();
  try {
    const accountCount = await db.select<Array<{ [key: string]: any }>>(
      `SELECT 1 FROM account_book WHERE account_id = ?`,
      [userId]
    );
    const count = accountCount.length;
    const result = await db.execute(
      `
      INSERT INTO account_book (name, account_id) VALUES (?, ?)
    `,
      [`Hesap defteri ${count + 1}`, userId]
    );
    if (result.lastInsertId) {
      return {
        success: true,
        lastRowId: result.lastInsertId,
        name: `Hesap defteri ${count + 1}`,
        error: null,
      };
    }
    return {
      success: false,
      lastRowId: null,
      name: null,
      error: "Unknown Error",
    };
  } catch (err) {
    console.error("Failed to create an account book");
    return {
      success: false,
      lastRowId: null,
      name: null,
      error: `Error: ${err}`,
    };
  }
}

export async function updateAccountBook(
  account_book_id: number,
  debt: number,
  balance: number,
  name?: string
) {
  const db = await getDb();
  try {
    const params = name 
      ? [name, debt, balance, account_book_id]
      : [debt, balance, account_book_id];
    const result = await db.execute(
      `
      UPDATE account_book
      SET ${name ? "name = ? ," : ""} debt = ?, balance = ?
      WHERE id = ?`,
      params
    );
    if (result.rowsAffected > 0) {
      return {
        success: true,
        error: null,
      };
    }
    throw "Couldn't save the account book";
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
}

export async function getAccountBooks(userId: number) {
  const db = await getDb();

  try {
    const result = await db.select<accountBook[]>(
      `SELECT * FROM account_book WHERE account_id = ?`,
      [userId]
    );
    if (result.length > 0) {
      return {
        success: true,
        length: result.length,
        accountBooks: result,
        error: null,
      };
    }
    return {
      success: true,
      length: result.length,
      accountBooks: null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      length: 0,
      accountBooks: null,
      error: `Error while fetching account books ${err}`,
    };
  }
}

export async function getAccountBooksById(account_book_id: number) {
  const db = await getDb();

  try {
    const result = await db.select<accountBook[]>(
      `SELECT * FROM account_book WHERE id = ?`,
      [account_book_id]
    );
    return {
      success: true,
      accountBooks: result.length > 0 ? result[0] : null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      accountBooks: null,
      error: `Error while fetching account books ${err}`,
    };
  }
}

export async function deleteAccountBook(id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`DELETE FROM account_book WHERE id = ?`, [
      id,
    ]);

    const success = result.rowsAffected > 0;

    return {
      success,
      rowsAffected: result.rowsAffected,
      message: success
        ? "Account book deleted successfully"
        : "No account book found with that ID",
    };
  } catch (error) {
    console.error(`Error deleting account book with id ${id}:`, error);
    return {
      success: false,
      rowsAffected: 0,
      message: "Failed to delete account book",
      error: error,
    };
  }
}