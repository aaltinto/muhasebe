import Database from '@tauri-apps/plugin-sql';

let db : Database | null = null;

export async function getDb() {
    if (!db) {
        db = await Database.load('sqlite:base.db');
        await db.execute("PRAGMA foreign_keys = ON;");
    }
    return db;
}
