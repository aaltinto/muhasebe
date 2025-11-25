import { getDb } from "./db";

export interface accounts {
  id: number;
  name: string;
  email: string;
  phone: string;
  adress: string;
  debt: number;
  balance: number;
  created_at?: string;
  last_action?: string;
  account_type: string;
}

export async function setUser({
  name,
  email,
  phone,
  adress,
  debt,
  balance,
  account_type,
  last_action,
}: Omit<accounts, "id" | "created_at">) {
  const db = await getDb();
  try {
    const result = await db.execute(
      `
        INSERT INTO accounts (name, email, phone, adress, debt, balance, account_type, last_action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, adress, debt, balance, account_type, last_action]
    );
    if (result.lastInsertId) {
      return result.lastInsertId;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error creating account`, error);
    throw error;
  }
}

export async function updateUser({
  id,
  name,
  email,
  phone,
  adress,
  debt,
  balance,
  last_action,
}: Omit<accounts, "created_at" | "account_type">) {
  const db = await getDb();
  try {
    db.execute(
      `
        UPDATE accounts 
        SET name = ?, email = ?, phone = ?, adress = ?, debt = ?, balance = ?, last_action = ?
        WHERE id = ?`,
      [name, email, phone, adress, debt, balance, last_action, id]
    );
  } catch (error) {
    console.error(`Error updating account`, error);
    throw error;
  }
}

export type account_type = "customer" | "supplier" | "";
export async function getAccounts(accountType: account_type) {
  const db = await getDb();
  let result:
    | accounts[]
    | Omit<accounts, "email" | "phone" | "adress" | "created_at">[];
  try {
    if (accountType !== "") {
      result = await db.select<
        Omit<accounts, "email" | "phone" | "adress" | "created_at">[]
      >(
        "SELECT id, name, debt, balance, last_action FROM accounts WHERE account_type = ?",
        [accountType]
      );
    } else {
      result = await db.select<accounts[]>("SELECT * FROM accounts");
    }
    return result.length > 0 ? result : null;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Re-throw to handle in component
  }
}

export async function getAccountById(id: number) {
  const db = await getDb();
  const result = await db.select<accounts[]>(
    "SELECT * from accounts WHERE id = ?",
    [id]
  );
  return result.length > 0 ? result[0] : null;
}

export async function deleteAccount(id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`DELETE FROM accounts WHERE id = ?`, [id]);

    const success = result.rowsAffected > 0;

    return {
      success,
      rowsAffected: result.rowsAffected,
      message: success
        ? "Account deleted successfully"
        : "No account found with that ID",
    };
  } catch (error) {
    console.error(`Error deleting account with id ${id}:`, error);
    return {
      success: false,
      rowsAffected: 0,
      message: "Failed to delete account",
      error,
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

export interface accountBook {
  id: number;
  name: string;
  debt: number;
  balance: number;
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

export interface accountLine {
  id: number | string;
  name: string;
  account_book_id: number;
  net_price: string;
  amount: string;
  price: string;
  tax: string;
  discount: string;
  total_price: string;
}

export async function createAccountLine(
  name: string,
  account_book_id: number,
  amount: number,
  tax: number,
  net_price: number,
  discount: number,
  price: number,
  total_price: number,
  id?: number | null,
) {
  const db = await getDb();

  try {
    if (id) {
      const result = await db.execute(`
        UPDATE account_line
        SET name = ?, net_price = ?, amount = ?, price = ?, tax = ?, discount = ?, total_price = ?
        WHERE id = ?
        `, [name, net_price, amount, price, tax, discount, total_price, id]);
      if (result.rowsAffected > 0) {
        return {
          success: true,
          error: null,
        }
      }
      return {
        success: false,
        error: `Couldn't update id: ${id}`
      }
    }
    const result = await db.execute(
      `
      INSERT INTO account_line
      (name, account_book_id, net_price, amount, price, tax, discount, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        account_book_id,
        net_price,
        amount,
        price,
        tax,
        discount,
        total_price,
      ]
    );
    if (result.lastInsertId) {
      return {
        success: true,
        lineId: result.lastInsertId,
        error: null,
      };
    }
    throw "Line couldn't saved";
  } catch (err) {
    console.error(err);
    return {
      success: false,
      lineId: null,
      error: "Account line couldn't created",
    };
  }
}

export async function getAccountLines(account_book_id: number) {
  const db = await getDb();
  try {
    const result = await db.select<accountLine[]>(
      `
      SELECT * FROM account_line WHERE account_book_id = ?`,
      [account_book_id]
    );
    if (result.length <= 0) {
      return {
        success: true,
        accountLines: null,
        error: null,
      };
    }
    return {
      success: true,
      accountLines: result,
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
export async function getAccountLinesById(id: number) {
  const db = await getDb();
  try {
    const result = await db.select<accountLine>(
      `
      SELECT * FROM account_line WHERE id = ?`,
      [id]
    );

    return {
      success: true,
      accountLines: result,
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

export async function updateAccountBook(
  account_book_id: number,
  name: string,
  debt: number,
  balance: number
) {
  const db = await getDb();
  try {
    const result = await db.execute(
      `
      UPDATE account_book
      SET name = ?, debt = ?, balance = ?
      WHERE id = ?`,
      [name, debt, balance, account_book_id]
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

export async function deleteAccountLine(id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`DELETE FROM account_line WHERE id = ?`, [
      id,
    ]);

    const success = result.rowsAffected > 0;

    return {
      success,
      rowsAffected: result.rowsAffected,
      message: success
        ? "Account line deleted successfully"
        : "No account line found with that ID",
    };
  } catch (error) {
    console.error(`Error deleting account line with id ${id}:`, error);
    return {
      success: false,
      rowsAffected: 0,
      message: "Failed to delete account line",
      error: error,
    };
  }
}