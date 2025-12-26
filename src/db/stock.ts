import { getDb } from "./db";

export interface stock {
  id: number;
  name: string;
  type: string;
  brand: string;
  supplier: string;
  barcode: string;
  count: number;
  cost: number;
}

export async function setNewStock({
  name,
  type,
  brand,
  supplier,
  barcode,
  count,
  cost,
}: Partial<stock>) {
  const db = await getDb();
  try {
    const result = await db.execute(
      `
        INSERT INTO products
        (name, type, brand, supplier, barcode, count, cost)
        VALUES ( ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, brand, supplier, barcode, count, cost] 
    );
    if (!result.lastInsertId) {
        throw ("Product couldn't be saved");
    }
    return {
        success: true,
        error: null
    }
  } catch (err) {
    console.error(err);
    return {
        success:false,
        error: err
    };
  }
}

export interface stockOptions {
  name: string | null;
  brand: string | null;
  type: string | null;
  supplier: string | null;
  countGreaterThan: number | null;
  costGreaterThan: number | null;
  countLowerThan: number | null;
  costLowerThan: number | null;
  barcode?: string | null;
  orderBy?: "id" | "name" | "brand" | "type" | "supplier" | "count" | "cost" | "barcode" | null;
  orderDir?: "ASC" | "DESC" | null;
}

const stockQueryBuiler = ({
  name,
  brand,
  type,
  supplier,
  countGreaterThan,
  costGreaterThan,
  countLowerThan,
  costLowerThan,
  barcode,
  orderBy,
  orderDir
}: stockOptions) => {
  const whereParts: string[] = [];
  const params: (string | number)[] = [];

  if (name) {
    whereParts.push("name LIKE ?");
    params.push(`%${name}%`);
  }
  if (brand) {
    whereParts.push("brand LIKE ?");
    params.push(`%${brand}%`);
  }
  if (type) {
    whereParts.push("type LIKE ?");
    params.push(`%${type}%`);
  }
  if (supplier) {
    whereParts.push("supplier LIKE ?");
    params.push(`%${supplier}%`);
  }
  if (barcode) {
    whereParts.push("barcode LIKE ?");
    params.push(`%${barcode}%`);
  }
  if (typeof countGreaterThan === "number") {
    whereParts.push("count > ?");
    params.push(countGreaterThan);
  }
  if (typeof countLowerThan === "number") {
    whereParts.push("count < ?");
    params.push(countLowerThan);
  }
  if (typeof costGreaterThan === "number") {
    whereParts.push("cost > ?");
    params.push(costGreaterThan);
  }
  if (typeof costLowerThan === "number") {
    whereParts.push("cost < ?");
    params.push(costLowerThan);
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  // Whitelist orderable columns to avoid SQL injection
  const allowedOrderColumns: Record<string, string> = {
    id: "id",
    name: "name",
    brand: "brand",
    type: "type",
    supplier: "supplier",
    count: "count",
    cost: "cost",
    barcode: "barcode",
  };
  const orderCol = orderBy && allowedOrderColumns[orderBy] ? allowedOrderColumns[orderBy] : "id";
  const orderDirection = orderDir === "ASC" ? "ASC" : "DESC";

  const query = `SELECT * FROM products ${whereClause} ORDER BY ${orderCol} ${orderDirection} LIMIT 100`;

  return { query, params };
};

export async function getStocks({
  name,
  brand,
  type,
  supplier,
  countGreaterThan,
  costGreaterThan,
  countLowerThan,
  costLowerThan,
  barcode,
  orderBy,
  orderDir
}: stockOptions) {
  const db = await getDb();
  try {
    const { query, params } = stockQueryBuiler({
      name,
      brand,
      type,
      supplier,
      countGreaterThan,
      costGreaterThan,
      countLowerThan,
      costLowerThan,
      barcode,
      orderBy,
      orderDir
    });
    const result = await db.select<stock[]>(query, params);
    return {
      success: true,
      stocks: result,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      stocks: [],
      error: err,
    };
  }
}

export async function getStockById(id: number) {
  const db = await getDb();
  try {
    const result = await db.select<stock[]>(`SELECT * FROM products WHERE id = ?`, [id]);
    if (result.length === 0) {
      return {
        success: true,
        stocks: null,
        error: null
      }
    }
    return {
      success: true,
      stocks: result[0],
      error: null
    }

  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      stocks: null,
      error: err
    }

  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  try {
    const result = await db.execute(`DELETE FROM products WHERE id = ?`, [id]);
    const success = (result.rowsAffected > 0);
    return {
      success: success,
      error: success ? null : `No product find with id ${id}`
    }
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      error: err
    }
  }
}

interface types {
  id: number;
  name: string;
}
interface brand {
  id: number;
  name: string;
}

export async function checkTypesExist(name: string) {
  const db = await getDb();
  try {
    const result = await db.select<types[]>(`
      SELECT 1 FROM types WHERE name = ?  
    `, [name]);
    if (result.length > 0) {
      return {
      success: true,
      type: true,
      error: null
    };
    }
    return {
    success: true,
    type: false,
    error: null
  };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      type: null,
      error: err
    }
  }
}

export async function setTypes(name: string) {
  const db = await getDb();
  try {
    const result = await db.execute(`
      INSERT INTO types (name) VALUES (?)  
    `, [name]);
    if (result.lastInsertId) {
      return {
        success: true,
        id: result.lastInsertId,
        error: null
      }
    }
    throw ("Unkown error! type couldn't saved");
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      id: null,
      error: err
    }
  }
}
export async function checkBrandsExist(name: string) {
  const db = await getDb();
  try {
    const result = await db.select<brand[]>(`
      SELECT 1 FROM brands WHERE name = ?  
    `, [name]);
    if (result.length > 0) {
      return {
      success: true,
      type: true,
      error: null
    };
    }
    return {
    success: true,
    type: false,
    error: null
  };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      type: null,
      error: err
    }
  }
}

export async function setBrands(name: string) {
  const db = await getDb();
  try {
    const result = await db.execute(`
      INSERT INTO brands (name) VALUES (?)  
    `, [name]);
    if (result.lastInsertId) {
      return {
        success: true,
        id: result.lastInsertId,
        error: null
      }
    }
    throw ("Unkown error! brand couldn't saved");
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      id: null,
      error: err
    }
  }
}

export async function searchTypes(query: string) {
  const db = await getDb();
  try {
    const result = await db.select<types[]>(`
      SELECT * FROM types 
      WHERE name LIKE ? 
      ORDER BY 
        CASE 
          WHEN name = ? THEN 1
          WHEN name LIKE ? THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 10
    `, [`%${query}%`, query, `${query}%`]);
    return {
      success: true,
      types: result,
      error: null
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      types: [],
      error: err
    };
  }
}

export async function searchBrands(query: string) {
  const db = await getDb();
  try {
    const result = await db.select<brand[]>(`
      SELECT * FROM brands 
      WHERE name LIKE ? 
      ORDER BY 
        CASE 
          WHEN name = ? THEN 1
          WHEN name LIKE ? THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 10
    `, [`%${query}%`, query, `${query}%`]);
    return {
      success: true,
      brands: result,
      error: null
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      brands: [],
      error: err
    };
  }
}
