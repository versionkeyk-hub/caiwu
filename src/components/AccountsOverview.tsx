import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { 
  CreditCard, 
  ArrowRight, 
  Plus, 
  Edit3, 
  Check, 
  Sparkles, 
  PiggyBank,
  CheckCircle2,
  Settings2,
  Layers,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { BankLogo } from './BankLogo';

interface AccountsOverviewProps {
  accounts: Account[];
  transactions: Transaction[];
  onUpdateAccountBalance: (accountId: string, newBalance: number) => void;
  onOpenAddAccount: () => void;
  onOpenEditAccount: (account: Account) => void;
  onOpenSplitWizard: () => void;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({
  accounts,
  transactions,
  onUpdateAccountBalance,
  onOpenAddAccount,
  onOpenEditAccount,
  onOpenSplitWizard
}) => {
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [balanceEditValue, setBalanceEditValue] = useState<string>('');

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsAccount = accounts.find(a => a.type === 'savings_loan');
  const dailyAccount = accounts.find(a => a.type === 'daily_expense');
  const salaryAccount = accounts.find(a => a.type === 'salary');

  // Calculate current month's expenses on daily card (Citic)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const dailyCardSpentThisMonth = transactions
    .filter(t => t.type === 'expense' && t.accountId === dailyAccount?.id && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleStartEditBalance = (acc: Account) => {
    setEditingBalanceId(acc.id);
    setBalanceEditValue(acc.balance.toString());
  };

  const handleSaveBalance = (accountId: string) => {
    const num = parseFloat(balanceEditValue);
    if (!isNaN(num)) {
      onUpdateAccountBalance(accountId, num);
    }
    setEditingBalanceId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Assets */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>总资产净值 (多卡合计)</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-sm font-semibold text-emerald-400">¥</span>
            <span className="text-3xl font-bold tracking-tight text-white">
              {totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/60 pt-2.5">
            <span>管理 {accounts.length} 个资金账户</span>
            <span className="text-emerald-400 font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 储蓄/消费已隔离
            </span>
          </div>
        </div>

        {/* Savings & Car Loan Balance */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-purple-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-purple-300 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <BankLogo bankCode="CMB" customLogoUrl={savingsAccount?.customLogoUrl} size="sm" />
              <span>招商电子卡 (车贷 & 储蓄)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              禁止随意动用
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-sm font-semibold text-purple-400">¥</span>
            <span className="text-2xl font-bold tracking-tight text-white">
              {(savingsAccount?.balance || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2.5">
            <span>尾号 {savingsAccount?.cardTail || '5903'}</span>
            <span className="text-purple-400">车贷自动划扣点</span>
          </div>
        </div>

        {/* Daily Living Budget Card (Citic) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-red-300 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <BankLogo bankCode="CITIC" customLogoUrl={dailyAccount?.customLogoUrl} size="sm" />
              <span>中信银行 (日常消费卡)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
              月规划 ¥2,500
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-sm font-semibold text-red-400">¥</span>
            <span className="text-2xl font-bold tracking-tight text-white">
              {(dailyAccount?.balance || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2.5">
            <span>本月已支出 ¥{dailyCardSpentThisMonth.toFixed(2)}</span>
            <span className="text-amber-400 font-medium">吃饭/日常限额</span>
          </div>
        </div>

        {/* Quick Review Entry */}
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 rounded-2xl p-5 border border-emerald-800/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">每月18号 · 分账复盘日</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              15号工资到账后，18号统一梳理多卡资金，按公式一键生成转账指令。
            </p>
          </div>
          <button
            onClick={onOpenSplitWizard}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow"
          >
            <span>进入本月分账复盘向导</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Visual Fund Routing Pipeline Map (卡与卡之间的关系图) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-white">资金分账与中转流向拓扑（严密卡间关系）</h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            解决虚拟卡无法直接收款限制 · 锁定强制储蓄与消费纪律
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
          
          {/* Node 1: ABC Salary Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/80 relative">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
              <BankLogo bankCode="ABC" size="sm" />
              <span>1. 农行工资卡 (6163) · 资金源头</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 leading-relaxed">
              每月15号接收公司实发工资，汇集所有初始流动资金。18号作为唯一转出源头向各卡分发。
            </div>
            <div className="mt-3 text-[11px] text-emerald-300 font-mono bg-emerald-950/60 p-2 rounded border border-emerald-900">
              当前余额: ¥{(salaryAccount?.balance || 0).toFixed(2)}
            </div>
          </div>

          {/* Node 2: Middle Transfers */}
          <div className="space-y-3">
            
            {/* Route A to CMB Main */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-800/80">
              <div className="flex items-center justify-between text-blue-400 text-xs font-semibold">
                <span className="flex items-center">
                  <BankLogo bankCode="CMB" size="sm" className="mr-1.5" />
                  2A. 招商主卡 (7827) · 中转与固定消费
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                承接固定开销（房租水电1680、养老1000、保险160、话费150等），并作为通往电子卡的中转站。
              </p>
            </div>

            {/* Route B to CITIC */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-red-800/80">
              <div className="flex items-center justify-between text-red-400 text-xs font-semibold">
                <span className="flex items-center">
                  <BankLogo bankCode="CITIC" size="sm" className="mr-1.5" />
                  2B. 中信消费卡 (8362) · 限额消费
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                补足本月生活费与吃饭预算（限额 ¥2500）。微信/支付宝主要绑定此卡日常刷卡。
              </p>
            </div>

          </div>

          {/* Node 3: Target Savings & Loan */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold">
                <BankLogo bankCode="CMB" size="sm" />
                <span>3. 招商电子卡 (5903) · 终点储蓄池</span>
              </div>
              <div className="mt-2 text-xs text-slate-300 leading-relaxed">
                由招商主卡 (7827) 转入。专用于<strong>每月车贷 2900 元自动划扣</strong>及结余资金长期稳健储蓄。
              </div>
            </div>
            <div className="mt-3 text-[11px] text-purple-300 font-mono bg-purple-950/60 p-2 rounded border border-purple-900">
              储蓄+车贷锁定: ¥{(savingsAccount?.balance || 0).toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* All Accounts Grid with Add & Edit Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">所有独立资金账户 ({accounts.length})</h3>
              <p className="text-xs text-slate-400 hidden sm:block">支持真实银行 Logo、自定义上传压缩图标及独立分账管理</p>
            </div>
          </div>
          
          {/* Action Buttons: Add Account */}
          <button
            onClick={onOpenAddAccount}
            className="flex items-center space-x-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 font-semibold py-2 px-3.5 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>添加新账户 / 银行卡</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div 
              key={acc.id}
              className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    
                    {/* Authentic Bank Logo or Custom Uploaded Compressed Photo */}
                    <BankLogo
                      bankCode={acc.bankCode}
                      bankName={acc.bankName}
                      customLogoUrl={acc.customLogoUrl}
                      size="md"
                    />

                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-white truncate">{acc.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {acc.bankName} · 尾号 {acc.cardTail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {acc.isSavingsTarget && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 whitespace-nowrap">
                        储蓄车贷
                      </span>
                    )}
                    {acc.isDailyBudgetCard && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 whitespace-nowrap">
                        消费卡
                      </span>
                    )}
                    {acc.isPrimarySalary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                        工资卡
                      </span>
                    )}
                    {acc.isFixedExpenseCard && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 whitespace-nowrap">
                        固定消费
                      </span>
                    )}
                  </div>
                </div>

                {acc.note && (
                  <p className="mt-2.5 text-xs text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                    {acc.note}
                  </p>
                )}
              </div>

              {/* Balance & Edit Row */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">账户余额</span>
                  {editingBalanceId === acc.id ? (
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-xs text-emerald-400 font-bold">¥</span>
                      <input
                        type="number"
                        step="0.01"
                        value={balanceEditValue}
                        onChange={e => setBalanceEditValue(e.target.value)}
                        className="w-24 bg-slate-950 text-white text-xs font-semibold rounded px-1.5 py-0.5 border border-emerald-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBalance(acc.id)}
                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                        title="确认保存"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs font-semibold text-emerald-400">¥</span>
                      <span className="text-lg font-bold text-white tracking-tight">
                        {acc.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations: Quick Calibrate & Full Edit Account */}
                <div className="flex items-center space-x-1.5">
                  {editingBalanceId !== acc.id && (
                    <button
                      onClick={() => handleStartEditBalance(acc)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition"
                      title="快速校准当前余额"
                    >
                      校准
                    </button>
                  )}

                  {/* Modify / Edit Account Button */}
                  <button
                    onClick={() => onOpenEditAccount(acc)}
                    className="flex items-center space-x-1 text-[11px] text-emerald-300 hover:text-emerald-200 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/80 transition"
                    title="修改银行卡信息、Logo、照片与分账定位"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>修改账户</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
