import React, { useState, useMemo } from 'react';
import { Account, BudgetItem, Transaction, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES, ACCOUNT_COLORS } from '../utils/categories';
import { CustomLeaderDonutChart, DonutDataItem } from './CustomLeaderDonutChart';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Layers, 
  CreditCard,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  HelpCircle
} from 'lucide-react';

interface BudgetAnalyticsProps {
  transactions: Transaction[];
  budgets: BudgetItem[];
  accounts: Account[];
  onOpenBudgetConfig?: () => void;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({
  transactions,
  budgets,
  accounts,
  onOpenBudgetConfig
}) => {
  // Month selector (defaults to current month: 2026-08)
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('2026-08');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  const handlePrevMonth = () => {
    const [year, month] = selectedYearMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedYearMonth(`${nextY}-${nextM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedYearMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedYearMonth(`${nextY}-${nextM}`);
  };

  // Filter transactions for current selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedYearMonth));
  }, [transactions, selectedYearMonth]);

  // Expenses & Incomes
  const expenseList = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'expense');
  }, [monthTransactions]);

  const incomeList = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'income');
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return expenseList.reduce((sum, t) => sum + t.amount, 0);
  }, [expenseList]);

  const totalIncome = useMemo(() => {
    return incomeList.reduce((sum, t) => sum + t.amount, 0);
  }, [incomeList]);

  // Category Distribution for Leader Donut Chart
  const categoryData: DonutDataItem[] = useMemo(() => {
    const targetList = activeTab === 'expense' ? expenseList : incomeList;
    const total = activeTab === 'expense' ? totalExpense : totalIncome;
    const map = new Map<string, { name: string; value: number; color: string; count: number }>();

    for (const t of targetList) {
      const catKey = t.category as ExpenseCategory;
      const meta = EXPENSE_CATEGORIES[catKey] || EXPENSE_CATEGORIES.other;
      const existing = map.get(catKey) || { name: meta.name, value: 0, color: meta.color, count: 0 };
      existing.value += t.amount;
      existing.count += 1;
      map.set(catKey, existing);
    }

    return Array.from(map.values())
      .map(item => ({
        ...item,
        value: Math.round(item.value * 100) / 100,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0'
      }))
      .sort((a, b) => b.value - a.value);
  }, [activeTab, expenseList, incomeList, totalExpense, totalIncome]);

  // Daily Spending for Vertical Bar Chart (微信记账本截图 2 每日对比)
  const dailySpendingData = useMemo(() => {
    const [year, month] = selectedYearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const map = new Map<string, number>();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${month}.${day}`;
      map.set(dayKey, 0);
    }

    for (const t of expenseList) {
      const parts = t.date.slice(5, 10).split('-');
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const d = parseInt(parts[1], 10);
        const dayKey = `${m}.${d}`;
        map.set(dayKey, (map.get(dayKey) || 0) + t.amount);
      }
    }

    return Array.from(map.entries()).map(([day, amount]) => ({
      day,
      amount: Math.round(amount * 100) / 100
    }));
  }, [selectedYearMonth, expenseList]);

  // Monthly Comparison Bar Chart (微信记账本截图 3 月度对比)
  const monthlyComparisonData = useMemo(() => {
    const months = ['03', '04', '05', '06', '07', '08'];
    return months.map(m => {
      const prefix = `2026-${m}`;
      const spent = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(prefix))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: `${parseInt(m, 10)}月`,
        monthKey: prefix,
        amount: Math.round(spent * 100) / 100,
        isCurrent: prefix === selectedYearMonth
      };
    });
  }, [transactions, selectedYearMonth]);

  // Spending Leaderboard (微信记账本截图 3 支出排行)
  const topRankExpenses = useMemo(() => {
    return [...expenseList]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [expenseList]);

  // Multi-tier Over-Budget Progress calculation
  const budgetComparison = useMemo(() => {
    return budgets.map(b => {
      const spent = expenseList
        .filter(t => t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const ratio = b.budgetAmount > 0 ? (spent / b.budgetAmount) * 100 : 0;
      const isOver = spent > b.budgetAmount;
      const overflowAmount = Math.max(0, spent - b.budgetAmount);
      const overflowPercent = b.budgetAmount > 0 ? (overflowAmount / b.budgetAmount) * 100 : 0;

      // Calculate number of overflow tiers (each tier is 100%)
      // If ratio = 150%: base = 100%, tier1 = 50%
      // If ratio = 250%: base = 100%, tier1 = 100%, tier2 = 50%
      const tier1 = Math.min(100, Math.max(0, ratio - 100));
      const tier2 = Math.min(100, Math.max(0, ratio - 200));

      return {
        ...b,
        spent: Math.round(spent * 100) / 100,
        ratio: Math.round(ratio),
        isOver,
        overflowAmount: Math.round(overflowAmount * 100) / 100,
        overflowPercent: Math.round(overflowPercent),
        baseBarFill: Math.min(100, ratio),
        tier1,
        tier2
      };
    }).sort((a, b) => (b.isOver ? 1 : 0) - (a.isOver ? 1 : 0) || b.spent - a.spent);
  }, [budgets, expenseList]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalOverspent = budgetComparison
    .filter(b => b.isOver)
    .reduce((sum, b) => sum + b.overflowAmount, 0);

  const [yearStr, monthStr] = selectedYearMonth.split('-');
  const displayMonthCN = `${yearStr}年${parseInt(monthStr, 10)}月`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner (微信记账本同款 Header: 月份切换 + 支出/入账 Tabs + 总支出大字) */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 border border-emerald-700/60 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Month Switcher & Switcher Tabs */}
          <div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-800/80">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">{displayMonthCN}</span>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Expense / Income Toggle */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-emerald-900 ml-2">
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeTab === 'expense' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-300 hover:text-white'
                  }`}
                >
                  支出
                </button>
                <button
                  onClick={() => setActiveTab('income')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeTab === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-300 hover:text-white'
                  }`}
                >
                  入账
                </button>
              </div>
            </div>

            {/* Total Spending Display */}
            <div className="mt-4">
              <span className="text-xs text-emerald-200/90">
                {activeTab === 'expense' ? '共支出' : '共入账'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold text-emerald-300">¥</span>
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {(activeTab === 'expense' ? totalExpense : totalIncome).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Budget Status & Settings Entry */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-800/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">月度预算规划</span>
              <span className="font-bold text-white">¥{totalBudget.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">超支警报监控</span>
              {totalOverspent > 0 ? (
                <span className="text-rose-400 font-bold flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  已超支 ¥{totalOverspent.toFixed(2)}
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  预算内可控
                </span>
              )}
            </div>

            {onOpenBudgetConfig && (
              <button
                onClick={onOpenBudgetConfig}
                className="mt-1 w-full py-1.5 px-3 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>自定义预算与固定额度</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 1: 支出构成 (微信记账本同款 带折线引出标注的环状图 + 分类胶囊列表) */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-sm text-white space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="font-bold text-base text-white whitespace-nowrap">
              {displayMonthCN} · {activeTab === 'expense' ? '支出构成' : '入账构成'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            共计 {categoryData.length} 个分类 · {activeTab === 'expense' ? expenseList.length : incomeList.length} 笔明细
          </span>
        </div>

        {/* Chart + List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Custom Leader Donut Chart */}
          <div className="lg:col-span-6 flex justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <CustomLeaderDonutChart
              data={categoryData}
              totalAmount={activeTab === 'expense' ? totalExpense : totalIncome}
            />
          </div>

          {/* Category Capsule Progress List (微信记账本同款圆图标+水平胶囊条+金额) */}
          <div className="lg:col-span-6 space-y-3">
            {categoryData.map(cat => {
              const meta = EXPENSE_CATEGORIES[cat.name as ExpenseCategory] || EXPENSE_CATEGORIES.other;

              return (
                <div key={cat.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name.slice(0, 1)}
                      </div>
                      <span className="font-semibold text-white">{cat.name}</span>
                      <span className="text-slate-500 text-[10px]">({cat.count}笔)</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">¥{cat.value.toFixed(2)}</span>
                      <span className="text-emerald-400 font-mono text-xs w-12 text-right">{cat.percentage}%</span>
                    </div>
                  </div>

                  {/* Horizontal capsule bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, parseFloat(cat.percentage))}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* SECTION 2: 预算规划 vs 实际执行【超预算多级溢出进度条看板】 */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-white space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              预算执行与超支多级溢出看板
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              超支50%即叠加红进度条 · 动态反映偏离倍数
            </span>
            {onOpenBudgetConfig && (
              <button
                type="button"
                onClick={onOpenBudgetConfig}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 hover:border-emerald-500/50 flex items-center space-x-1.5 transition shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>自定义调整预算目标</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetComparison.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                b.isOver
                  ? 'bg-rose-950/25 border-rose-800/80 shadow-sm'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {/* Header: Title and Status badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{b.name}</span>
                {b.isOver ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    超支 +{b.overflowPercent}% (¥{b.overflowAmount})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    剩余 ¥{(b.budgetAmount - b.spent).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Amount Row */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">已花: </span>
                  <span className={`text-base font-bold font-mono ${b.isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ¥{b.spent.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">规划: </span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    ¥{b.budgetAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Base Progress Bar (0 - 100%) */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.isOver ? 'bg-emerald-500' : b.ratio > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${b.baseBarFill}%` }}
                  />
                </div>

                {/* OVERFLOW TIER 1: If exceeded 100% (e.g. 150%), add red progress bar */}
                {b.isOver && (
                  <div className="space-y-1 pt-1 border-t border-rose-950/80">
                    <div className="flex items-center justify-between text-[10px] text-rose-300">
                      <span>超支阶梯 1 (+100% 以内)</span>
                      <span>+{b.tier1}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-rose-900">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${b.tier1}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* OVERFLOW TIER 2: If exceeded 200% (e.g. 250%), add 2nd red progress bar */}
                {b.tier2 > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold">
                      <span>严重超支阶梯 2 (+200% 以上)</span>
                      <span>+{b.tier2}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-red-700">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all animate-pulse"
                        style={{ width: `${b.tier2}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>{b.description || '月度预算项'}</span>
                <span className="font-mono">{b.ratio}% 执行率</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: 微信记账本截图 2 每日对比 + 截图 3 月度对比 & 支出排行榜 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Comparison Bar Chart (每日对比) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-white">每日对比走势</h3>
            </div>
            <span className="text-xs text-slate-400">每日实际支出柱状波动</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} interval={2} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  formatter={(val: number) => [`¥${val.toFixed(2)}`, '当日支出']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Comparison Bar Chart (月度对比) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-base text-white">月度对比 (3月-8月)</h3>
            </div>
            <span className="text-xs text-slate-400">历史月份总支出对比</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: number) => [`¥${val.toFixed(2)}`, '当月支出']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {monthlyComparisonData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#10b981' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 4: 8月支出排行 Top (微信记账本截图 3 排行榜) */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              {displayMonthCN} 支出排行 Top
            </h3>
          </div>
          <span className="text-xs text-slate-400">单笔大额支出追踪</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topRankExpenses.map((tx, idx) => {
            const acc = accounts.find(a => a.id === tx.accountId);
            const catMeta = EXPENSE_CATEGORIES[tx.category as ExpenseCategory] || EXPENSE_CATEGORIES.other;

            return (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-white"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: catMeta.color }}
                  >
                    {catMeta.name.slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-white truncate">
                      {tx.counterparty}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {tx.date.slice(5, 16)} · {acc?.name || '银行卡'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-white font-mono">
                    -¥{tx.amount.toFixed(2)}
                  </span>
                  {tx.isOverBudget && (
                    <span className="block text-[9px] text-amber-400">超预算</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
