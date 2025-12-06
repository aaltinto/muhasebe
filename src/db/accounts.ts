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
}: Omit<accounts, "account_type" | "created_at">) {
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
export async function updateUserInfo(
  id: number,
  name: string,
  email: string,
  phone: string,
  adress: string,
) {
  const db = await getDb();
  try {
    db.execute(
      `
        UPDATE accounts 
        SET name = ?, email = ?, phone = ?, adress = ?
        WHERE id = ?`,
      [name, email, phone, adress, id]
    );
  } catch (error) {
    console.error(`Error updating account`, error);
    throw error;
  }
}

export async function updateUserDebt(
  id: number,
  debt: number,
  balance: number,
  last_action: string,
) {
  const db = await getDb();
  try {
    db.execute(
      `
        UPDATE accounts 
        SET debt = ?, balance = ?, last_action = ?
        WHERE id = ?`,
      [debt, balance, last_action, id]
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
    throw error;
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


