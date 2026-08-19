import { Account, BudgetItem, MonthlyReviewSnapshot, Transaction } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_BUDGETS, INITIAL_HISTORICAL_SNAPSHOTS, INITIAL_TRANSACTIONS } from '../data/initialData';

// 获取当前登录用户的专属存储命名空间 Key
export function getUserStoragePrefix(email?: string): string {
  const currentEmail = (email || localStorage.getItem('split_app_useremail') || 'version.keyk@gmail.com').trim().toLowerCase();
  // 标准化安全 key
  const safeId = currentEmail.replace(/[^a-zA-Z0-9_]/g, '_');
  return `split_app_${safeId}`;
}

export function getCurrentUserEmail(): string {
  return (localStorage.getItem('split_app_useremail') || 'version.keyk@gmail.com').trim().toLowerCase();
}

export function isOwnerAccount(email?: string): boolean {
  const e = (email || getCurrentUserEmail()).trim().toLowerCase();
  return e === 'version.keyk@gmail.com' || e === 'owner' || e === 'admin';
}

// 陌生新账号的空白模版（所有卡余额为0，流水和分账为空）
export function getBlankInitialState() {
  const blankAccounts: Account[] = INITIAL_ACCOUNTS.map(a => ({
    ...a,
    balance: 0.00,
  }));

  return {
    accounts: blankAccounts,
    budgets: INITIAL_BUDGETS,
    transactions: [] as Transaction[],
    snapshots: [] as MonthlyReviewSnapshot[],
  };
}

// ----------------------------------------------------
// LocalStorage 读取与写入（严格按用户邮箱隔离）
// ----------------------------------------------------

export function loadStoredAccounts(email?: string): Account[] {
  const prefix = getUserStoragePrefix(email);
  try {
    const raw = localStorage.getItem(`${prefix}_accounts`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load accounts', e);
  }
  return isOwnerAccount(email) ? INITIAL_ACCOUNTS : getBlankInitialState().accounts;
}

export function saveStoredAccounts(accounts: Account[], email?: string) {
  const prefix = getUserStoragePrefix(email);
  try {
    localStorage.setItem(`${prefix}_accounts`, JSON.stringify(accounts));
    recordLocalUpdateTimestamp(email);
    triggerCloudSync(email);
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
}

export function loadStoredBudgets(email?: string): BudgetItem[] {
  const prefix = getUserStoragePrefix(email);
  try {
    const raw = localStorage.getItem(`${prefix}_budgets`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load budgets', e);
  }
  return INITIAL_BUDGETS;
}

export function saveStoredBudgets(budgets: BudgetItem[], email?: string) {
  const prefix = getUserStoragePrefix(email);
  try {
    localStorage.setItem(`${prefix}_budgets`, JSON.stringify(budgets));
    recordLocalUpdateTimestamp(email);
    triggerCloudSync(email);
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
}

export function loadStoredTransactions(email?: string): Transaction[] {
  const prefix = getUserStoragePrefix(email);
  try {
    const raw = localStorage.getItem(`${prefix}_transactions`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions', e);
  }
  return isOwnerAccount(email) ? INITIAL_TRANSACTIONS : [];
}

export function saveStoredTransactions(transactions: Transaction[], email?: string) {
  const prefix = getUserStoragePrefix(email);
  try {
    localStorage.setItem(`${prefix}_transactions`, JSON.stringify(transactions));
    recordLocalUpdateTimestamp(email);
    triggerCloudSync(email);
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadStoredSnapshots(email?: string): MonthlyReviewSnapshot[] {
  const prefix = getUserStoragePrefix(email);
  try {
    const raw = localStorage.getItem(`${prefix}_snapshots`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load snapshots', e);
  }
  return isOwnerAccount(email) ? INITIAL_HISTORICAL_SNAPSHOTS : [];
}

export function saveStoredSnapshots(snapshots: MonthlyReviewSnapshot[], email?: string) {
  const prefix = getUserStoragePrefix(email);
  try {
    localStorage.setItem(`${prefix}_snapshots`, JSON.stringify(snapshots));
    recordLocalUpdateTimestamp(email);
    // 立即执行云端持久化，不等 debounce
    syncDirectToD1(email);
  } catch (e) {
    console.error('Failed to save snapshots', e);
  }
}

function recordLocalUpdateTimestamp(email?: string) {
  const prefix = getUserStoragePrefix(email);
  const now = new Date().toISOString();
  localStorage.setItem(`${prefix}_last_local_update`, now);
}

function getLocalUpdateTimestamp(email?: string): string {
  const prefix = getUserStoragePrefix(email);
  return localStorage.getItem(`${prefix}_last_local_update`) || '1970-01-01T00:00:00.000Z';
}

// ----------------------------------------------------
// Cloudflare D1 云端数据库双向可靠同步
// ----------------------------------------------------
let syncDebounceTimer: any = null;

export function triggerCloudSync(email?: string) {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncDirectToD1(email);
  }, 600);
}

/**
 * 直接将当前内存/本地数据全量保存到 Cloudflare D1 (经 /api/finance)
 */
export async function syncDirectToD1(email?: string): Promise<boolean> {
  const currentEmail = (email || getCurrentUserEmail()).trim().toLowerCase();

  const payload = {
    accounts: loadStoredAccounts(currentEmail),
    budgets: loadStoredBudgets(currentEmail),
    transactions: loadStoredTransactions(currentEmail),
    snapshots: loadStoredSnapshots(currentEmail),
    monthlySalary: 11250,
    currentMonth: '2026-08',
    userProfile: {
      email: currentEmail,
      name: localStorage.getItem('split_app_username') || (isOwnerAccount(currentEmail) ? '理财官' : currentEmail.split('@')[0]),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    lastUpdated: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(payload);

  try {
    const res = await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr,
    });
    if (res.ok) {
      console.log('[Cloudflare D1] 经 API 成功持久化');
      return true;
    }
  } catch (e) {
    console.warn('[Cloudflare D1] 同步异常:', e);
  }

  return false;
}

/**
 * 应用启动或刷新时，从 Cloudflare D1 拉取数据，支持时间戳防覆盖与陌生账号空白处理
 */
export async function syncFromCloudD1(email?: string): Promise<{
  accounts: Account[];
  budgets: BudgetItem[];
  transactions: Transaction[];
  snapshots: MonthlyReviewSnapshot[];
}> {
  const currentEmail = (email || getCurrentUserEmail()).trim().toLowerCase();
  const prefix = getUserStoragePrefix(currentEmail);
  const localLastUpdate = getLocalUpdateTimestamp(currentEmail);

  let cloudData: any = null;
  let cloudUpdatedAt: string = '1970-01-01T00:00:00.000Z';

  // 从 /api/finance?email=... 读取
  try {
    const res = await fetch(`/api/finance?email=${encodeURIComponent(currentEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        cloudData = json.data;
        cloudUpdatedAt = json.updatedAt || json.data.lastUpdated || new Date().toISOString();
      }
    }
  } catch (e) {
    console.warn('[Cloudflare D1] 从 API 读取异常:', e);
  }

  // 决策：本地时间 vs 云端时间
  const localTime = new Date(localLastUpdate).getTime();
  const cloudTime = new Date(cloudUpdatedAt).getTime();

  if (cloudData) {
    // 如果云端有数据且比本地新，更新本地
    if (cloudTime > localTime || !localStorage.getItem(`${prefix}_accounts`)) {
      if (cloudData.accounts) localStorage.setItem(`${prefix}_accounts`, JSON.stringify(cloudData.accounts));
      if (cloudData.budgets) localStorage.setItem(`${prefix}_budgets`, JSON.stringify(cloudData.budgets));
      if (cloudData.transactions) localStorage.setItem(`${prefix}_transactions`, JSON.stringify(cloudData.transactions));
      if (cloudData.snapshots) localStorage.setItem(`${prefix}_snapshots`, JSON.stringify(cloudData.snapshots));
      localStorage.setItem(`${prefix}_last_local_update`, cloudUpdatedAt);
      console.log('[Cloudflare D1] 已从云端更新最新数据到本地');
    } else {
      // 本地数据更新，反向同步到云端 D1
      console.log('[Cloudflare D1] 本地数据较新，正在反向同步上云...');
      syncDirectToD1(currentEmail);
    }
  } else {
    // 云端尚无此用户数据：播种初始数据并上云
    console.log(`[Cloudflare D1] 用户(${currentEmail})初始化档案并同步上云`);
    syncDirectToD1(currentEmail);
  }

  return {
    accounts: loadStoredAccounts(currentEmail),
    budgets: loadStoredBudgets(currentEmail),
    transactions: loadStoredTransactions(currentEmail),
    snapshots: loadStoredSnapshots(currentEmail),
  };
}

// ----------------------------------------------------
// 导出与重置工具
// ----------------------------------------------------
export function exportTransactionsToCSV(transactions: Transaction[], accounts: Account[]): void {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));
  const headers = ['交易时间', '类型', '金额(元)', '分类', '交易对方/商户', '说明/备注', '扣款/收款账户', '交易单号', '是否超额支出', '超额原因'];
  const rows = transactions.map(t => [
    `"${t.date}"`,
    `"${t.type === 'expense' ? '支出' : t.type === 'income' ? '收入' : '转账'}"`,
    t.amount.toFixed(2),
    `"${t.categoryLabel || t.category}"`,
    `"${(t.counterparty || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${accountMap.get(t.accountId) || t.paymentMethodText || '未知账户'}"`,
    `"${t.transactionId || ''}"`,
    `"${t.isOverBudget ? '是' : '否'}"`,
    `"${(t.overBudgetReason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `财务账单流水_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFullBackup(
  accounts: Account[] = loadStoredAccounts(),
  budgets: BudgetItem[] = loadStoredBudgets(),
  transactions: Transaction[] = loadStoredTransactions(),
  snapshots: MonthlyReviewSnapshot[] = loadStoredSnapshots()
): void {
  const fullData = {
    version: '2.6.0',
    exportTime: new Date().toISOString(),
    accounts,
    budgets,
    transactions,
    snapshots
  };

  const jsonStr = JSON.stringify(fullData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `财务完整备份_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function resetAllDataToDefault(email?: string): void {
  const prefix = getUserStoragePrefix(email);
  localStorage.removeItem(`${prefix}_accounts`);
  localStorage.removeItem(`${prefix}_budgets`);
  localStorage.removeItem(`${prefix}_transactions`);
  localStorage.removeItem(`${prefix}_snapshots`);
  localStorage.removeItem(`${prefix}_last_local_update`);
}

// ----------------------------------------------------
// Cloudflare R2 对象存储：单据/票据/PDF图片上传
// ----------------------------------------------------
export async function uploadReceiptToR2(file: File): Promise<{ url: string; key: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('上传失败');
    const data = await res.json();
    if (data.success) {
      return { url: data.url, key: data.key };
    }
  } catch (err) {
    console.error('[Cloudflare R2] 上传票据到 R2 失败:', err);
  }
  return null;
}

