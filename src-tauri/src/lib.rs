// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::{Migration, MigrationKind};  

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let migrations = vec![  
        Migration {  
            version: 1,  
            description: "create accounts table",  
            sql: "CREATE TABLE IF NOT EXISTS accounts (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,  
                email TEXT,
                phone TEXT,
                adress TEXT,
                debt INTEGER DEFAULT 0,
                balance INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_action TEXT,
                account_type TEXT DEFAULT 'customer'
            )",  
            kind: MigrationKind::Up,  
        },
        Migration {  
            version: 2,  
            description: "create account book table",  
            sql: "CREATE TABLE IF NOT EXISTS account_book (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,
                account_id INTEGER NOT NULL,
                debt INTEGER DEFAULT 0,
                balance INTEGER DEFAULT 0,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            )",  
            kind: MigrationKind::Up,  
        },
        Migration {  
            version: 3,  
            description: "create account line table",  
            sql: "CREATE TABLE IF NOT EXISTS account_line (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,
                account_book_id INTEGER NOT NULL,
                net_price INTEGER NOT NULL,
                amount INTEGER NOT NULL,
                price INTEGER NOT NULL,
                tax INTEGER NOT NULL DEFAULT 20,
                discount INTEGER NOT NULL DEFAULT 0,
                total_price INTEGER NOT NULL,
                date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_book_id) REFERENCES account_book(id) ON DELETE CASCADE
            )",
            kind: MigrationKind::Up,  
        },
        Migration {  
            version: 4,  
            description: "create products table",  
            sql: "CREATE TABLE IF NOT EXISTS products (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                brand TEXT NOT NULL,
                supplier TEXT NOT NULL,
                barcode INTEGER NOT NULL DEFAULT 0,
                count INTEGER NOT NULL DEFAULT 0,
                price INTEGER NOT NULL,
                tax INTEGER NOT NULL DEFAULT 20
            )",
            kind: MigrationKind::Up,  
        },
        Migration {  
            version: 5,  
            description: "create payments table",  
            sql: "CREATE TABLE IF NOT EXISTS payments (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT DEFAULT NULL,
                amount NUMBER NOT NULL,
                account_book_id INTEGER NOT NULL,
                date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            kind: MigrationKind::Up,  
        }
    ];  

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:base.db", migrations)
            .build()
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
