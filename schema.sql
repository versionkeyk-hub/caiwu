-- D1 数据库初始化表结构
CREATE TABLE IF NOT EXISTS finance_state (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    user_avatar TEXT,
    data_json TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    account_id TEXT NOT NULL,
    payer TEXT NOT NULL,
    description TEXT,
    split_method TEXT,
    split_shares TEXT,
    status TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL NOT NULL,
    currency TEXT DEFAULT 'CNY',
    icon TEXT,
    card_last4 TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
    category TEXT PRIMARY KEY,
    budget_limit REAL NOT NULL,
    alert_threshold REAL DEFAULT 0.8,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL,
    total_expense REAL NOT NULL,
    total_income REAL NOT NULL,
    user_shares TEXT NOT NULL,
    settlement_status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
