import React, { useState, useEffect } from 'react';
import { Account, BudgetItem, MonthlyReviewSnapshot } from '../types';
import { calculateMonthlySplit, SplitInput, SplitCalculationResult } from '../utils/splitCalculator';
import confetti from 'canvas-confetti';
import { BankLogo } from './BankLogo';
import { 
  CalendarCheck2, 
  ArrowRight, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  PiggyBank, 
  Layers, 
  CheckCircle, 
  Info,
  DollarSign,
  CreditCard,
  SlidersHorizontal
} from 'lucide-react';

interface SplitReviewWizardProps {
  accounts: Account[];
  budgets: BudgetItem[];
  onSaveSnapshot: (snapshot: MonthlyReviewSnapshot, updateAccountBalances: boolean) => void;
  onNavigateToHistory: () => void;
}

export const SplitReviewWizard: React.FC<SplitReviewWizardProps> = ({
  accounts,
  budgets,
  onSaveSnapshot,
  onNavigateToHistory
}) => {
  // Find accounts
  const abcAcc = accounts.find(a => a.type === 'salary') || accounts[0];
  const citicAcc = accounts.find(a => a.type === 'daily_expense') || accounts[1];
  const cmbMainAcc = accounts.find(a => a.type === 'fixed_expense') || accounts[2];
  const cmbVirtualAcc = accounts.find(a => a.type === 'savings_loan') || accounts[3];
  const wechatAcc = accounts.find(a => a.type === 'wechat');
  const alipayAcc = accounts.find(a => a.type === 'alipay');

  // Input states
  const today = new Date();
  const defaultMonthStr = today.toISOString().slice(0, 7);
  const defaultReviewDate = `${defaultMonthStr}-18`;

  const [month, setMonth] = useState<string>(defaultMonthStr);
  const [reviewDate, setReviewDate] = useState<string>(defaultReviewDate);

  // Balances: By default, initialized to 0 for pristine monthly review entry
  const [abcBalance, setAbcBalance] = useState<number>(0);
  const [cmbMainBalance, setCmbMainBalance] = useState<number>(0);
  const [citicBalance, setCiticBalance] = useState<number>(0);
  const [cmbVirtualBalance, setCmbVirtualBalance] = useState<number>(0);
  const [wechatBalance, setWechatBalance] = useState<number>(0);
  const [alipayBalance, setAlipayBalance] = useState<number>(0);

  // Quick fill helper if user wants to sync current system account balances
  const handleFillCurrentBalances = () => {
    setAbcBalance(Math.round(abcAcc?.balance || 0));
    setCmbMainBalance(Math.round(cmbMainAcc?.balance || 0));
    setCiticBalance(Math.round(citicAcc?.balance || 0));
    setCmbVirtualBalance(Math.round(cmbVirtualAcc?.balance || 0));
    setWechatBalance(Math.round(wechatAcc?.balance || 0));
    setAlipayBalance(Math.round(alipayAcc?.balance || 0));
  };

  const handleResetToZeroBalances = () => {
    setAbcBalance(0);
    setCmbMainBalance(0);
    setCiticBalance(0);
    setCmbVirtualBalance(0);
    setWechatBalance(0);
    setAlipayBalance(0);
  };

  // Planned budget items: default strictly to 2500.00
  const citicTotalFromBudgets = budgets
    .filter(b => b.targetAccountType === 'daily_expense')
    .reduce((sum, b) => sum + b.budgetAmount, 0) || 2500;

  const [citicBudget, setCiticBudget] = useState<number>(2500);

  const initialFixedList = budgets
    .filter(b => b.targetAccountType === 'fixed_expense' || b.targetAccountType === 'savings_loan')
    .map(b => ({
      id: b.id,
      name: b.name,
      amount: b.budgetAmount,
      target: b.targetAccountType === 'savings_loan' ? '招商电子卡(5903)' : '招商主卡(7827)',
      isCarLoan: b.category === 'vehicle_loan'
    }));

  const [fixedList, setFixedList] = useState<{ id: string; name: string; amount: number; target: string; isCarLoan?: boolean }[]>(
    initialFixedList.length > 0 ? initialFixedList : [
      { id: '1', name: '车贷固定自动扣款', amount: 2900, target: '招商电子卡(5903)', isCarLoan: true },
      { id: '2', name: '房租水电及物业费', amount: 1680, target: '招商主卡(7827)' },
      { id: '3', name: '自动养老金定投', amount: 1000, target: '招商主卡(7827)' },
      { id: '4', name: '社保补充', amount: 330, target: '招商主卡(7827)' },
      { id: '5', name: '父母医保与保险', amount: 160, target: '招商主卡(7827)' },
      { id: '6', name: '手机话费与平台会员', amount: 150, target: '招商主卡(7827)' }
    ]
  );

  // Overspending & Refunds
  const [overspendItems, setOverspendItems] = useState<{ name: string; amount: number; account: string; date?: string; note?: string }[]>([
    { name: '拼一箱纸', amount: 33, account: '招商卡', note: '日用超支' },
    { name: '打车去火车站', amount: 90, account: '招商卡', note: '出行超支' }
  ]);

  const [refundItems, setRefundItems] = useState<{ name: string; amount: number; note?: string }[]>([
    { name: '停车费退款/违章返还', amount: 0, note: '如有返还可填入' }
  ]);

  const [reviewNotes, setReviewNotes] = useState<string>('本月18号分账梳理正常进行，储蓄按计划锁定。');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Calculation Result
  const splitResult: SplitCalculationResult = calculateMonthlySplit(
    {
      month,
      reviewDate,
      abcSalaryBalance: abcBalance,
      cmbMainBalance,
      citicDailyBalance: citicBalance,
      cmbVirtualBalance,
      wechatBalance,
      alipayBalance,
      citicPlannedBudget: citicBudget,
      fixedBudgets: fixedList,
      overspendingNotes: overspendItems.filter(i => i.amount > 0),
      refundItems: refundItems.filter(i => i.amount > 0)
    },
    accounts
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const handleAddFixedItem = () => {
    setFixedList([
      ...fixedList,
      { id: Date.now().toString(), name: '新增固定支出项', amount: 100, target: '招商主卡(7827)' }
    ]);
  };

  const handleRemoveFixedItem = (id: string) => {
    setFixedList(fixedList.filter(item => item.id !== id));
  };

  const handleAddOverspendItem = () => {
    setOverspendItems([
      ...overspendItems,
      { name: '超支明细项', amount: 50, account: '招商卡', note: '' }
    ]);
  };

  const handleRemoveOverspendItem = (index: number) => {
    setOverspendItems(overspendItems.filter((_, i) => i !== index));
  };

  const handleFinalSave = () => {
    const snapshot: MonthlyReviewSnapshot = {
      id: `snap_${month.replace('-', '_')}_${Date.now()}`,
      month,
      reviewDate,
      salaryReceived: abcBalance,
      accountBalances: {
        abcSalary: abcBalance,
        cmbMain: cmbMainBalance,
        citicDaily: citicBalance,
        cmbVirtualSavings: cmbVirtualBalance,
        wechat: wechatBalance,
        alipay: alipayBalance
      },
      plannedExpenses: {
        citicDailyLimit: splitResult.plannedCiticTotal,
        cmbFixedExpenses: splitResult.plannedFixedTotal,
        items: [
          { name: `中信限制日常消费 (规划)`, amount: splitResult.plannedCiticTotal, target: '中信日常卡' },
          ...fixedList.map(f => ({ name: f.name, amount: f.amount, target: f.target }))
        ]
      },
      savingsCalculated: splitResult.calculatedSavings,
      actualTransfers: splitResult.transfers.map(t => ({
        id: `trans_${t.step}_${Date.now()}`,
        fromAccountName: t.fromAccountName,
        fromAccountId: t.fromAccountName.includes('农业') ? abcAcc.id : cmbMainAcc.id,
        toAccountName: t.toAccountName,
        toAccountId: t.toAccountName.includes('电子') ? cmbVirtualAcc.id : t.toAccountName.includes('中信') ? citicAcc.id : cmbMainAcc.id,
        amount: t.amount,
        description: t.formulaText,
        completed: true // 确认保存时默认全部标记为已完成
      })),
      overbudgetItems: overspendItems.filter(i => i.amount > 0),
      notes: reviewNotes,
      createdAt: Date.now()
    };

    onSaveSnapshot(snapshot, true);
    setIsSaved(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-700 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">每月18号 · 工资分账与账目梳理向导</h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              15号发工资后（遇周末可能顺延），于18号全面统计农行、招商、中信及微信支付宝余额，自动生成卡间转账闭环。
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
            <div>
              <label className="block text-[11px] text-slate-400">复盘月份</label>
              <input
                type="month"
                value={month}
                onChange={e => {
                  setMonth(e.target.value);
                  setReviewDate(`${e.target.value}-18`);
                }}
                className="bg-slate-950 text-xs font-semibold text-white px-2 py-1 rounded border border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400">梳理基准日</label>
              <input
                type="date"
                value={reviewDate}
                onChange={e => setReviewDate(e.target.value)}
                className="bg-slate-950 text-xs font-semibold text-white px-2 py-1 rounded border border-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Account Balances on 18th */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="font-bold text-sm text-white">统计各账户当前实时余额（分账基数）</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleResetToZeroBalances}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
              title="将所有卡余额设为0"
            >
              全部清零 (默认)
            </button>
            <button
              onClick={handleFillCurrentBalances}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs transition"
              title="读取各账户当前在系统中记录的余额"
            >
              读取当前账户余额
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* ABC Salary Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="ABC" customLogoUrl={abcAcc?.customLogoUrl} size="sm" />
                <span>农业银行 (工资卡 6163)</span>
              </div>
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900">
                工资发源地
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={abcBalance}
                onChange={e => setAbcBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <button
                onClick={() => setAbcBalance(prev => Math.max(0, prev - 100))}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                -100
              </button>
              <button
                onClick={() => setAbcBalance(prev => prev + 100)}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                +100
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">实发工资到账后农行总余额</span>
          </div>

          {/* CMB Main Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-blue-400">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="CMB" customLogoUrl={cmbMainAcc?.customLogoUrl} size="sm" />
                <span>招商主卡 (固定消费 7827)</span>
              </div>
              <span className="text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-900">
                主卡结余
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={cmbMainBalance}
                onChange={e => setCmbMainBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
              <button
                onClick={() => setCmbMainBalance(prev => Math.max(0, prev - 100))}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                -100
              </button>
              <button
                onClick={() => setCmbMainBalance(prev => prev + 100)}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                +100
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">用于分账抵扣，结余多可减少转入</span>
          </div>

          {/* CITIC Daily Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-red-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-red-400">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="CITIC" customLogoUrl={citicAcc?.customLogoUrl} size="sm" />
                <span>中信银行 (日常消费 8362)</span>
              </div>
              <span className="text-[10px] text-red-300 bg-red-950 px-1.5 py-0.5 rounded border border-red-900">
                上月剩余生活费
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={citicBalance}
                onChange={e => setCiticBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:border-red-500 focus:outline-none"
                placeholder="0"
              />
              <button
                onClick={() => setCiticBalance(prev => Math.max(0, prev - 100))}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                -100
              </button>
              <button
                onClick={() => setCiticBalance(prev => prev + 100)}
                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              >
                +100
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">若有上月结余，转入金额自动补差</span>
          </div>

          {/* CMB Virtual / Car Loan Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-purple-400">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="CMB" customLogoUrl={cmbVirtualAcc?.customLogoUrl} size="sm" />
                <span>招商电子卡 (车贷储蓄 5903)</span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-900">
                储蓄池
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={cmbVirtualBalance}
                onChange={e => setCmbVirtualBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <span className="text-[10px] text-slate-400 block">当前储蓄总蓄水池</span>
          </div>

          {/* WeChat */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="WECHAT" customLogoUrl={wechatAcc?.customLogoUrl} size="sm" />
                <span>微信零钱</span>
              </div>
              <span className="text-[10px] text-slate-400">日常零钱</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={wechatBalance}
                onChange={e => setWechatBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Alipay */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center space-x-1.5">
                <BankLogo bankCode="ALIPAY" customLogoUrl={alipayAcc?.customLogoUrl} size="sm" />
                <span>支付宝余额</span>
              </div>
              <span className="text-[10px] text-slate-400">日常余额</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-400">¥</span>
              <input
                type="number"
                step="1"
                min="0"
                value={alipayBalance}
                onChange={e => setAlipayBalance(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-900 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Planned Budgets Checklist */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-bold text-sm text-white">分账预算与固定开销计划</h3>
          </div>
          <button
            onClick={handleAddFixedItem}
            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加开销项</span>
          </button>
        </div>

        {/* CITIC Daily limit */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-red-400">中信日常限制消费总额度</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              包含吃饭 1500 + 其他日常杂销/备用金 1000（严格控制非固定消费）
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCiticBudget(2500)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-300 text-xs font-semibold border border-red-900/60"
              title="重置为默认 2500"
            >
              默认 2500
            </button>
            <button
              onClick={() => setCiticBudget(prev => Math.max(0, prev - 100))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              -100
            </button>
            <span className="text-xs text-slate-400 font-bold">¥</span>
            <input
              type="number"
              step="1"
              value={citicBudget}
              onChange={e => setCiticBudget(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
              className="w-28 bg-slate-900 text-white font-bold text-sm px-2 py-1 rounded border border-red-800 focus:outline-none"
            />
            <button
              onClick={() => setCiticBudget(prev => prev + 100)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              +100
            </button>
          </div>
        </div>

        {/* Fixed CMB expenses items */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">招商固定消费清单 (合计 ¥{splitResult.plannedFixedTotal})：</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fixedList.map((item, index) => (
              <div key={item.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">{index + 1}</span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => {
                      const updated = [...fixedList];
                      updated[index].name = e.target.value;
                      setFixedList(updated);
                    }}
                    className="bg-transparent text-white font-medium focus:outline-none w-36"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-bold">¥</span>
                  <input
                    type="number"
                    step="1"
                    value={item.amount}
                    onChange={e => {
                      const updated = [...fixedList];
                      updated[index].amount = Math.max(0, Math.round(parseFloat(e.target.value) || 0));
                      setFixedList(updated);
                    }}
                    className="w-20 bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded border border-slate-700 text-right focus:outline-none"
                  />
                  {fixedList.length > 2 && (
                    <button
                      onClick={() => handleRemoveFixedItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overspending tracking input */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>上月超额支出登记 (超支归因与追踪)</span>
            </div>
            <button
              onClick={handleAddOverspendItem}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
            >
              + 添加超支项
            </button>
          </div>
          <div className="space-y-1.5">
            {overspendItems.map((ov, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-1.5 rounded border border-slate-800">
                <input
                  type="text"
                  placeholder="超支事项 (如: 拼纸巾/打车/沙发)"
                  value={ov.name}
                  onChange={e => {
                    const up = [...overspendItems];
                    up[idx].name = e.target.value;
                    setOverspendItems(up);
                  }}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs w-48"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 font-bold">-¥</span>
                  <input
                    type="number"
                    step="1"
                    value={ov.amount}
                    onChange={e => {
                      const up = [...overspendItems];
                      up[idx].amount = Math.max(0, Math.round(parseFloat(e.target.value) || 0));
                      setOverspendItems(up);
                    }}
                    className="w-16 bg-slate-950 text-red-400 font-bold px-1 rounded border border-slate-700 text-right focus:outline-none"
                  />
                  <button onClick={() => handleRemoveOverspendItem(idx)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: Live Mathematical Calculation Summary */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 rounded-2xl p-5 border border-purple-800/80 shadow-md text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-bold text-base text-white">分账计算总揽与核心储蓄锁定</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-semibold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            自动执行分账公式
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400">总可支配流动资金池</span>
            <div className="text-xl font-bold text-white mt-1">
              ¥{splitResult.totalAvailablePool.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              农行(¥{abcBalance}) + 招商主(¥{cmbMainBalance}) + 中信(¥{citicBalance})
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400">计划总支出 (刚性保障)</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              ¥{splitResult.plannedTotalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              中信限额(¥{splitResult.plannedCiticTotal}) + 招商固定(¥{splitResult.plannedFixedTotal})
            </p>
          </div>

          {/* Card 3 (Savings Locked) */}
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700">
            <span className="text-xs text-emerald-300 font-medium flex items-center">
              <PiggyBank className="w-3.5 h-3.5 mr-1" />
              招商储蓄分配金额 (结余锁定)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              ¥{splitResult.calculatedSavings.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-emerald-200 mt-1">
              直接转入招商电子卡，保障财富稳步增长
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 4: Actionable Transfer Orders (实际转账执行指令单) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center justify-center">4</span>
            <h3 className="font-bold text-sm text-white">实际转账执行指引（请按步骤在银行App转账）</h3>
          </div>
          <span className="text-xs text-slate-400">严谨闭环 · 复制卡号即可操作</span>
        </div>

        <div className="space-y-3">
          {splitResult.transfers.map(t => {
            const isDone = !!completedSteps[t.step];
            return (
              <div 
                key={t.step}
                className={`p-4 rounded-xl border transition-all ${
                  isDone 
                    ? 'bg-slate-950/60 border-emerald-800/80 opacity-90' 
                    : 'bg-slate-950 border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        t.step === 1 ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        t.step === 2 ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        第 {t.step} 步
                      </span>
                      <h4 className="font-bold text-sm text-white">{t.title}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="text-slate-400">收款账户:</span>
                      <span className="font-semibold text-white">{t.toAccountName}</span>
                      <span className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {t.toAccountNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(t.toAccountNumber.replace(/\s+/g, ''), `card_${t.step}`)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title="复制卡号"
                      >
                        {copiedKey === `card_${t.step}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono">
                      {t.formulaText}
                    </p>
                  </div>

                  {/* Right: Amount & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-emerald-400 font-bold">¥</span>
                      <span className="text-xl font-extrabold text-white tracking-tight">
                        {t.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleCopy(t.amount.toFixed(2), `amt_${t.step}`)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title="复制金额"
                      >
                        {copiedKey === `amt_${t.step}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleStep(t.step)}
                      className={`mt-2 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isDone 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{isDone ? '已在银行App完成转账' : '标记已转账'}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Notes & Complete Button */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white mb-1.5">
            本月复盘总结与备忘备注
          </label>
          <textarea
            value={reviewNotes}
            onChange={e => setReviewNotes(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
            placeholder="记录本月特殊支出、超额原因或下月调整方向..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center">
            <Info className="w-4 h-4 mr-1.5 text-emerald-400" />
            点击保存后将自动归档至历史记录，并同步校准各账户最新结余。
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {isSaved ? (
              <button
                onClick={onNavigateToHistory}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/80 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>已成功归档 · 查看历史复盘</span>
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>完成并归档本次 18 号分账复盘</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
