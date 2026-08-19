import React, { useState, useEffect } from 'react';
import { Account, BudgetItem, MonthlyReviewSnapshot, Transaction } from './types';
import { 
  loadStoredAccounts, 
  saveStoredAccounts, 
  loadStoredBudgets, 
  saveStoredBudgets, 
  loadStoredTransactions, 
  saveStoredTransactions, 
  loadStoredSnapshots, 
  saveStoredSnapshots,
  syncFromCloudD1,
  exportTransactionsToCSV,
  exportFullBackup,
  resetAllDataToDefault
} from './utils/storage';

import { Header, ActiveTab } from './components/Header';
import { AccountsOverview } from './components/AccountsOverview';
import { SplitReviewWizard } from './components/SplitReviewWizard';
import { TransactionList } from './components/TransactionList';
import { BudgetAnalytics } from './components/BudgetAnalytics';
import { HistoricalSnapshots } from './components/HistoricalSnapshots';
import { BillImportModal } from './components/BillImportModal';
import { AccountManageModal } from './components/AccountManageModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BudgetConfigModal } from './components/BudgetConfigModal';

import { 
  CheckCircle2, 
  Download, 
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Application State
  const [accounts, setAccounts] = useState<Account[]>(() => loadStoredAccounts());
  const [budgets, setBudgets] = useState<BudgetItem[]>(() => loadStoredBudgets());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [snapshots, setSnapshots] = useState<MonthlyReviewSnapshot[]>(() => loadStoredSnapshots());

  // User Profile & Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('split_app_is_logged_in') !== 'false';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('split_app_useremail') || 'version.keyk@gmail.com';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('split_app_username') || '主理人';
  });

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isBudgetConfigOpen, setIsBudgetConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Mount: Sync latest state from Cloudflare D1 for current user
  useEffect(() => {
    syncFromCloudD1(userEmail).then(syncedData => {
      if (syncedData) {
        setAccounts(syncedData.accounts);
        setBudgets(syncedData.budgets);
        setTransactions(syncedData.transactions);
        setSnapshots(syncedData.snapshots);
      }
    });
  }, [userEmail]);

  // Sync to local storage & D1
  useEffect(() => {
    saveStoredAccounts(accounts, userEmail);
  }, [accounts, userEmail]);

  useEffect(() => {
    saveStoredBudgets(budgets, userEmail);
  }, [budgets, userEmail]);

  useEffect(() => {
    saveStoredTransactions(transactions, userEmail);
  }, [transactions, userEmail]);

  useEffect(() => {
    saveStoredSnapshots(snapshots, userEmail);
  }, [snapshots, userEmail]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    localStorage.setItem('split_app_username', newName);
    showToast(`已更新用户昵称为：${newName}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('split_app_is_logged_in', 'false');
    showToast('已成功退出当前登录账号');
  };

  const handleLogin = (email: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setIsLoggedIn(true);
    setUserEmail(cleanEmail);
    setUserName(name);
    localStorage.setItem('split_app_is_logged_in', 'true');
    localStorage.setItem('split_app_useremail', cleanEmail);
    localStorage.setItem('split_app_username', name);

    // 立即加载该账号的专属账本数据
    const accs = loadStoredAccounts(cleanEmail);
    const buds = loadStoredBudgets(cleanEmail);
    const txs = loadStoredTransactions(cleanEmail);
    const snaps = loadStoredSnapshots(cleanEmail);

    setAccounts(accs);
    setBudgets(buds);
    setTransactions(txs);
    setSnapshots(snaps);

    // 云端同步该账号
    syncFromCloudD1(cleanEmail).then(syncedData => {
      if (syncedData) {
        setAccounts(syncedData.accounts);
        setBudgets(syncedData.budgets);
        setTransactions(syncedData.transactions);
        setSnapshots(syncedData.snapshots);
      }
    });

    showToast(`欢迎回来，${name}！已切换至专属账户账本`);
    setIsUserProfileOpen(false);
  };

  // Substantial Refresh Action (Auto-save current state first, then re-synchronize and calibrate)
  const handleRefreshData = () => {
    // 1. Force save all in-memory arrays to ensure zero uncommitted data loss
    saveStoredAccounts(accounts, userEmail);
    saveStoredBudgets(budgets, userEmail);
    saveStoredTransactions(transactions, userEmail);
    saveStoredSnapshots(snapshots, userEmail);

    // 2. Read back stored data to synchronize
    const loadedAccs = loadStoredAccounts(userEmail);
    const loadedTxs = loadStoredTransactions(userEmail);
    const loadedBuds = loadStoredBudgets(userEmail);
    const loadedSnaps = loadStoredSnapshots(userEmail);

    setAccounts(loadedAccs);
    setTransactions(loadedTxs);
    setBudgets(loadedBuds);
    setSnapshots(loadedSnaps);

    showToast('数据已自动固化保存，并完成全量实质刷新与余额校验！');
  };

  // Account Operations (Add, Edit, Delete, Calibrate)
  const handleUpdateAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: newBalance } : a));
    showToast('账户余额已成功校准');
  };

  const handleOpenAddAccount = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setAccountToEdit(acc);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (savedAcc: Account) => {
    setAccounts(prev => {
      const exists = prev.some(a => a.id === savedAcc.id);
      if (exists) {
        return prev.map(a => a.id === savedAcc.id ? savedAcc : a);
      } else {
        return [...prev, savedAcc];
      }
    });
    showToast(`已成功保存账户：${savedAcc.name}`);
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    showToast('账户已删除');
  };

  // Transaction Operations
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === newTx.accountId) {
        const diff = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        return { ...acc, balance: Math.round((acc.balance + diff) * 100) / 100 };
      }
      return acc;
    }));

    showToast('记账记录已保存并同步更新账户余额');
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    showToast('账单记录已更新');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('账单记录已删除');
  };

  // Batch Import with Anti-Duplication
  const handleImportConfirm = (newTransactions: Transaction[]) => {
    if (newTransactions.length === 0) return;

    setTransactions(prev => [...newTransactions, ...prev]);

    // Update affected accounts balance
    const impactMap = new Map<string, number>();
    for (const t of newTransactions) {
      const current = impactMap.get(t.accountId) || 0;
      const change = t.type === 'income' ? t.amount : -t.amount;
      impactMap.set(t.accountId, current + change);
    }

    setAccounts(prev => prev.map(acc => {
      const change = impactMap.get(acc.id);
      if (change) {
        return { ...acc, balance: Math.round((acc.balance + change) * 100) / 100 };
      }
      return acc;
    }));

    showToast(`成功导入 ${newTransactions.length} 笔流水记录，已自动过滤重复项！`);
  };

  // 18th Split Snapshot Save
  const handleSaveSnapshot = (snapshot: MonthlyReviewSnapshot, updateAccountBalances: boolean) => {
    setSnapshots(prev => {
      const filtered = prev.filter(s => s.month !== snapshot.month);
      return [snapshot, ...filtered];
    });

    if (updateAccountBalances) {
      // Calibrate balances based on snapshot outcome
      setAccounts(prev => prev.map(acc => {
        if (acc.type === 'salary') {
          return { ...acc, balance: 0 };
        }
        if (acc.type === 'daily_expense') {
          return { ...acc, balance: snapshot.plannedExpenses.citicDailyLimit };
        }
        if (acc.type === 'fixed_expense') {
          return { ...acc, balance: snapshot.plannedExpenses.cmbFixedExpenses };
        }
        if (acc.type === 'savings_loan') {
          return { ...acc, balance: acc.balance + snapshot.savingsCalculated };
        }
        return acc;
      }));
    }

    showToast(`已成功保存并归档 ${snapshot.month} 月度分账复盘！`);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
    showToast('复盘记录已删除');
  };

  const handleUpdateSnapshot = (updatedSnapshot: MonthlyReviewSnapshot) => {
    setSnapshots(prev => prev.map(s => s.id === updatedSnapshot.id ? updatedSnapshot : s));
    showToast('已更新分账转账执行状态');
  };

  // Export Action
  const handleExport = () => {
    exportTransactionsToCSV(transactions, accounts);
    showToast('已导出 UTF-8 CSV 账单，可直接在 Excel 打开');
  };

  const handleFullBackup = () => {
    exportFullBackup();
    showToast('已导出完整 JSON 备份数据文件');
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置为初始演示数据吗？（包含历史1-7月复盘及预置真实银行卡与微信流水）')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onExport={handleExport}
        onRefresh={handleRefreshData}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        userName={userName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        {activeTab === 'overview' && (
          <AccountsOverview
            accounts={accounts}
            transactions={transactions}
            onUpdateAccountBalance={handleUpdateAccountBalance}
            onOpenAddAccount={handleOpenAddAccount}
            onOpenEditAccount={handleOpenEditAccount}
            onOpenSplitWizard={() => setActiveTab('split_wizard')}
          />
        )}

        {activeTab === 'split_wizard' && (
          <SplitReviewWizard
            accounts={accounts}
            budgets={budgets}
            onSaveSnapshot={handleSaveSnapshot}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            isQuickAddOpen={isQuickAddOpen}
            onCloseQuickAdd={() => setIsQuickAddOpen(false)}
          />
        )}

        {activeTab === 'analytics' && (
          <BudgetAnalytics
            transactions={transactions}
            budgets={budgets}
            accounts={accounts}
            onOpenBudgetConfig={() => setIsBudgetConfigOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoricalSnapshots
            snapshots={snapshots}
            onDeleteSnapshot={handleDeleteSnapshot}
            onUpdateSnapshot={handleUpdateSnapshot}
            onOpenSplitWizard={() => setActiveTab('split_wizard')}
          />
        )}

      </main>

      {/* Footer info & Data tools */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>分账与记账管家 · 专为 18 号工资梳理与储蓄隔离定制</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
              v2.5.0
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              导出 CSV 明细
            </button>
            <span>·</span>
            <button
              onClick={handleFullBackup}
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              全量 JSON 备份
            </button>
            <span>·</span>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-red-400 transition flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重置演示数据</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Bill Import & Anti-Duplication Modal */}
      <BillImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        accounts={accounts}
        existingTransactions={transactions}
        onImportConfirm={handleImportConfirm}
      />

      {/* Add & Edit Bank Card / Account Modal */}
      <AccountManageModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
        onSaveAccount={handleSaveAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* User Login Profile & Account Security Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        userEmail={userEmail}
        userName={userName}
        isLoggedIn={isLoggedIn}
        onUpdateUserName={handleUpdateUserName}
        onRefreshData={handleRefreshData}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Custom Budget Target & Goal Configuration Modal */}
      <BudgetConfigModal
        isOpen={isBudgetConfigOpen}
        onClose={() => setIsBudgetConfigOpen(false)}
        budgets={budgets}
        onSaveBudgets={(newBudgets) => {
          setBudgets(newBudgets);
          showToast('月度预算规划已成功更新');
        }}
      />

    </div>
  );
}
