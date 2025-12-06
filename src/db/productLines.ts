import { getDb } from "./db";

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
  date: string;
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
  date: string,
  id?: number | null,
) {
  const db = await getDb();

  try {
    if (id) {
      const result = await db.execute(`
        UPDATE account_line
        SET name = ?, net_price = ?, amount = ?, price = ?, tax = ?, discount = ?, total_price = ?, date = ?
        WHERE id = ?
        `, [name, net_price, amount, price, tax, discount, total_price, date, id]);
      if (result.rowsAffected > 0) {
        return {
          success: true,
          lineId: null,
          error: null,
        }
      }
      return {
        success: false,
        lineId: null,
        error: `Couldn't update id: ${id}`
      }
    }
    const result = await db.execute(
      `
      INSERT INTO account_line
      (name, account_book_id, net_price, amount, price, tax, discount, total_price, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        date
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
    const result = await db.select<accountLine[]>(
      `
      SELECT * FROM account_line WHERE id = ?`,
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

