import React, { useState, useMemo } from 'react';
import { Account, Transaction, ExpenseCategory, IncomeCategory, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNT_COLORS } from '../utils/categories';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Building2, 
  Check, 
  X,
  CreditCard,
  Calendar,
  CheckSquare,
  Square,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBatchUpdateTransactions?: (updatedTxs: Transaction[]) => void;
  onBatchDeleteTransactions?: (ids: string[]) => void;
  isQuickAddOpen: boolean;
  onCloseQuickAdd: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onBatchUpdateTransactions,
  onBatchDeleteTransactions,
  isQuickAddOpen,
  onCloseQuickAdd
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGateway, setSelectedGateway] = useState<string>('all');
  const [onlyOverspent, setOnlyOverspent] = useState<boolean>(false);

  // Month & Custom Date Range Filter (Default: Current month 1st to next month 1st)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-09-01');

  // Month switch helper
  const handleSelectMonth = (monthVal: string) => {
    setSelectedMonth(monthVal);
    if (monthVal === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    if (monthVal !== 'custom') {
      const [yStr, mStr] = monthVal.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const start = `${yStr}-${mStr.padStart(2, '0')}-01`;
      
      // Calculate next month 1st
      let nextY = y;
      let nextM = m + 1;
      if (nextM > 12) {
        nextM = 1;
        nextY += 1;
      }
      const end = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Multi-selection state for batch modifications
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [batchCategoryModalOpen, setBatchCategoryModalOpen] = useState<boolean>(false);
  const [batchAccountModalOpen, setBatchAccountModalOpen] = useState<boolean>(false);

  // Edit / Add Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('food');
  const [formCounterparty, setFormCounterparty] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAccountId, setFormAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [formIsOverbudget, setFormIsOverbudget] = useState<boolean>(false);
  const [formOverbudgetReason, setFormOverbudgetReason] = useState<string>('');

  // Open Edit
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormCounterparty(tx.counterparty);
    setFormDescription(tx.description);
    setFormAccountId(tx.accountId);
    setFormDate(tx.date);
    setFormIsOverbudget(!!tx.isOverBudget);
    setFormOverbudgetReason(tx.overBudgetReason || '');
  };

  const handleStepFormAmount = (delta: number) => {
    const current = parseFloat(formAmount) || 0;
    const next = Math.max(0, Math.round(current + delta));
    setFormAmount(next.toString());
  };

  const isFormDirty = editingTx
    ? formType !== editingTx.type ||
      parseFloat(formAmount) !== editingTx.amount ||
      formAccountId !== editingTx.accountId ||
      formCategory !== editingTx.category ||
      formCounterparty !== editingTx.counterparty ||
      formDescription !== editingTx.description ||
      formDate !== editingTx.date ||
      formIsOverbudget !== (!!editingTx.isOverBudget) ||
      formOverbudgetReason !== (editingTx.overBudgetReason || '')
    : (formAmount !== '' && parseFloat(formAmount) > 0) ||
      formCounterparty.trim() !== '' ||
      formDescription.trim() !== '' ||
      formIsOverbudget;

  const executeSaveTransaction = (): boolean => {
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('请输入有效的大于 0 的金额');
      return false;
    }

    const acc = accounts.find(a => a.id === formAccountId);

    if (editingTx) {
      onUpdateTransaction({
        ...editingTx,
        type: formType,
        amount: amountNum,
        category: formCategory as any,
        categoryLabel: formType === 'expense' ? (EXPENSE_CATEGORIES[formCategory as ExpenseCategory]?.name || '消费') : '收入',
        counterparty: formCounterparty.trim() || '日常消费',
        description: formDescription.trim() || formCounterparty,
        accountId: formAccountId,
        paymentMethodText: acc?.name || '银行卡',
        date: formDate,
        isOverBudget: formIsOverbudget,
        overBudgetReason: formIsOverbudget ? formOverbudgetReason : undefined
      });
      setEditingTx(null);
    } else {
      onAddTransaction({
        id: `tx_manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: formType,
        amount: amountNum,
        category: formCategory as any,
        categoryLabel: formType === 'expense' ? (EXPENSE_CATEGORIES[formCategory as ExpenseCategory]?.name || '消费') : '收入',
        counterparty: formCounterparty.trim() || '日常消费',
        description: formDescription.trim() || formCounterparty,
        accountId: formAccountId,
        paymentMethodText: acc?.name || '银行卡',
        date: formDate,
        isOverBudget: formIsOverbudget,
        overBudgetReason: formIsOverbudget ? formOverbudgetReason : undefined,
        createdAt: Date.now(),
        source: 'manual'
      });
      onCloseQuickAdd();
    }
    return true;
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    executeSaveTransaction();
  };

  const handleRequestCloseForm = () => {
    if (isFormDirty) {
      const confirmSave = window.confirm('检测到当前记账账单内容已修改且尚未保存。\n\n• 点击【确定】：保存此条账单记录并退出\n• 点击【取消】：放弃未保存的修改并退出');
      if (confirmSave) {
        const saved = executeSaveTransaction();
        if (saved) {
          setEditingTx(null);
          onCloseQuickAdd();
        }
      } else {
        setEditingTx(null);
        onCloseQuickAdd();
      }
    } else {
      setEditingTx(null);
      onCloseQuickAdd();
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          t.counterparty.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.date.includes(q) ||
          t.amount.toString().includes(q) ||
          (t.transactionId && t.transactionId.includes(q));
        if (!matches) return false;
      }

      // Date Range filter (startDate to endDate)
      if (startDate) {
        const txDatePart = t.date.slice(0, 10);
        if (txDatePart < startDate) {
          return false;
        }
      }
      if (endDate) {
        const txDatePart = t.date.slice(0, 10);
        if (txDatePart >= endDate) {
          return false;
        }
      }

      // Account filter
      if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) {
        return false;
      }

      // Gateway Channel filter (出口渠道: 微信支付 / 支付宝 / 银行直连 / 云闪付 / 现金)
      if (selectedGateway !== 'all') {
        const gw = t.gatewayChannel || (t.source === 'wechat_import' ? 'wechat' : t.source === 'alipay_import' ? 'alipay' : 'bank_direct');
        if (gw !== selectedGateway) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Overspent filter
      if (onlyOverspent && !t.isOverBudget) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date.replace(/\//g, '-')).getTime() - new Date(a.date.replace(/\//g, '-')).getTime());
  }, [transactions, searchTerm, selectedAccountId, selectedCategory, selectedGateway, selectedType, onlyOverspent, startDate, endDate]);

  // Grouped by Date (微信记账本按天卡片展示)
  const groupedByDate = useMemo(() => {
    const groups: { dateKey: string; dateTitle: string; totalDayExpense: number; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    for (const t of filteredList) {
      const dateKey = t.date.slice(0, 10);
      const list = map.get(dateKey) || [];
      list.push(t);
      map.set(dateKey, list);
    }

    for (const [dateKey, items] of map.entries()) {
      const totalDayExpense = items
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Generate friendly date title (e.g. 8月16日 星期日)
      const d = new Date(dateKey);
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekDayStr = isNaN(d.getTime()) ? '' : weekDays[d.getDay()];
      const parts = dateKey.split('-');
      const dateTitle = parts.length === 3 ? `${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日 ${weekDayStr}` : dateKey;

      groups.push({
        dateKey,
        dateTitle,
        totalDayExpense: Math.round(totalDayExpense * 100) / 100,
        items
      });
    }

    return groups;
  }, [filteredList]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTxIds.length === filteredList.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredList.map(t => t.id));
    }
  };

  // Batch actions
  const handleBatchMarkOverbudget = (isOver: boolean, reason?: string) => {
    if (selectedTxIds.length === 0) return;
    const updated = transactions
      .filter(t => selectedTxIds.includes(t.id))
      .map(t => ({
        ...t,
        isOverBudget: isOver,
        overBudgetReason: isOver ? (reason || '批量标记超预算') : undefined
      }));

    if (onBatchUpdateTransactions) {
      onBatchUpdateTransactions(updated);
    } else {
      updated.forEach(t => onUpdateTransaction(t));
    }
    setSelectedTxIds([]);
  };

  const handleBatchChangeCategory = (newCat: ExpenseCategory) => {
    if (selectedTxIds.length === 0) return;
    const catMeta = EXPENSE_CATEGORIES[newCat] || EXPENSE_CATEGORIES.other;
    const updated = transactions
      .filter(t => selectedTxIds.includes(t.id))
      .map(t => ({
        ...t,
        category: newCat,
        categoryLabel: catMeta.name
      }));

    if (onBatchUpdateTransactions) {
      onBatchUpdateTransactions(updated);
    } else {
      updated.forEach(t => onUpdateTransaction(t));
    }
    setBatchCategoryModalOpen(false);
    setSelectedTxIds([]);
  };

  const handleBatchChangeAccount = (newAccountId: string) => {
    if (selectedTxIds.length === 0) return;
    const acc = accounts.find(a => a.id === newAccountId);
    const updated = transactions
      .filter(t => selectedTxIds.includes(t.id))
      .map(t => ({
        ...t,
        accountId: newAccountId,
        paymentMethodText: acc?.name || '银行卡'
      }));

    if (onBatchUpdateTransactions) {
      onBatchUpdateTransactions(updated);
    } else {
      updated.forEach(t => onUpdateTransaction(t));
    }
    setBatchAccountModalOpen(false);
    setSelectedTxIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedTxIds.length === 0) return;
    if (window.confirm(`确定要批量删除选中的 ${selectedTxIds.length} 笔流水记录吗？`)) {
      if (onBatchDeleteTransactions) {
        onBatchDeleteTransactions(selectedTxIds);
      } else {
        selectedTxIds.forEach(id => onDeleteTransaction(id));
      }
      setSelectedTxIds([]);
    }
  };

  const totalFilteredExpense = filteredList
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredList
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalFilteredIncome - totalFilteredExpense;

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3.5 text-white">
        
        {/* Row 1: Month & Custom Date-Range Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          {/* Quick Month Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>月份筛选:</span>
            </span>

            {[
              { label: '2026年8月 (本月)', value: '2026-08' },
              { label: '2026年7月', value: '2026-07' },
              { label: '2026年6月', value: '2026-06' },
              { label: '2026年4月', value: '2026-04' },
              { label: '全部时间', value: 'all' }
            ].map(m => (
              <button
                key={m.value}
                onClick={() => handleSelectMonth(m.value)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                  selectedMonth === m.value 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Manual Date Range Inputs (Default: 1st to 1st) */}
          <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
            <span className="text-slate-400 whitespace-nowrap">时间范围:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setSelectedMonth('custom');
              }}
              className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              title="起始日期 (包含)"
            />
            <span className="text-slate-500">至</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setSelectedMonth('custom');
              }}
              className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              title="截止日期 (不含)"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => handleSelectMonth('2026-08')}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline ml-1"
                title="重置为默认当月1号到1号"
              >
                重置
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search Input & Category / Account / Type Selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="搜索商户、商品说明、单号、ETC、金额..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Account Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="all">所有资金账户</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.cardTail})</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="all">全部分类</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>

            {/* Gateway Filter */}
            <select
              value={selectedGateway}
              onChange={e => setSelectedGateway(e.target.value)}
              className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="all">所有支付出口</option>
              <option value="wechat">🟢 微信支付出口</option>
              <option value="alipay">🔵 支付宝出口</option>
              <option value="bank_direct">🟣 银行直连/代扣</option>
              <option value="unionpay">🔴 云闪付/POS</option>
              <option value="cash">🟡 现金/其他</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="all">全部收支</option>
              <option value="expense">仅支出</option>
              <option value="income">仅收入</option>
              <option value="transfer">仅转账</option>
            </select>

            {/* Overspent Toggle */}
            <button
              onClick={() => setOnlyOverspent(!onlyOverspent)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                onlyOverspent 
                  ? 'bg-amber-950 text-amber-300 border-amber-800' 
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>仅看超预算</span>
            </button>
          </div>

        </div>

        {/* Row 3: Stats Summary & Select All Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2.5 gap-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 transition"
            >
              {selectedTxIds.length === filteredList.length && filteredList.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{selectedTxIds.length === filteredList.length && filteredList.length > 0 ? '取消全选' : '全选当页'}</span>
            </button>

            <span>
              已选 <strong className="text-emerald-400">{selectedTxIds.length}</strong> / {filteredList.length} 笔明细
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <span>筛选期支出: <strong className="text-white font-mono font-semibold">¥{totalFilteredExpense.toFixed(2)}</strong></span>
            <span>筛选期收入: <strong className="text-emerald-400 font-mono font-semibold">¥{totalFilteredIncome.toFixed(2)}</strong></span>
            <span>净结余: <strong className={`font-mono font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>¥{netBalance.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* FLOATING BATCH ACTION BAR (When 1 or more transactions are selected) */}
      {selectedTxIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">
                已选中 {selectedTxIds.length} 笔流水
              </div>
              <div className="text-[10px] text-emerald-300">
                支持批量标记超预算、修改分类、划扣卡或删除
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Mark Overbudget */}
            <button
              onClick={() => handleBatchMarkOverbudget(true, '大额采购与意外开支')}
              className="flex items-center space-x-1 text-xs font-semibold py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition shadow"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>标记超预算</span>
            </button>

            <button
              onClick={() => handleBatchMarkOverbudget(false)}
              className="flex items-center space-x-1 text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>设为预算内</span>
            </button>

            {/* Batch Change Category */}
            <button
              onClick={() => setBatchCategoryModalOpen(true)}
              className="flex items-center space-x-1 text-xs font-semibold py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>批量改分类</span>
            </button>

            {/* Batch Change Account */}
            <button
              onClick={() => setBatchAccountModalOpen(true)}
              className="flex items-center space-x-1 text-xs font-semibold py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>批量改扣款账户</span>
            </button>

            {/* Batch Delete */}
            <button
              onClick={handleBatchDelete}
              className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-800 transition"
              title="批量删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grouped Transaction List (微信记账本同款卡片分组) */}
      <div className="space-y-4">
        {groupedByDate.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">暂无匹配的交易流水明细</p>
          </div>
        ) : (
          groupedByDate.map(group => (
            <div key={group.dateKey} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              
              {/* Date Card Header (微信记账本风格: 8月16日 星期日 支出 ¥23.98) */}
              <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {group.dateTitle}
                </span>
                {group.totalDayExpense > 0 && (
                  <span className="text-slate-400 font-mono">
                    当日支出 ¥{group.totalDayExpense.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Transactions in this Day */}
              <div className="divide-y divide-slate-800/60">
                {group.items.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const catMeta = EXPENSE_CATEGORIES[tx.category as ExpenseCategory] || EXPENSE_CATEGORIES.other;
                  const isSelected = selectedTxIds.includes(tx.id);
                  const accColor = ACCOUNT_COLORS[acc?.type || 'custom'] || ACCOUNT_COLORS.custom;

                  return (
                    <div
                      key={tx.id}
                      className={`p-3 sm:p-4 hover:bg-slate-800/40 transition text-white ${
                        isSelected ? 'bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-4">
                        
                        {/* Left: Checkbox + Icon + Details */}
                        <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                          
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleSelect(tx.id)}
                            className="text-slate-500 hover:text-emerald-400 p-0.5 mt-0.5 sm:mt-0 shrink-0"
                            aria-label="选择流水"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          {/* WeChat-style Round Solid Category Icon */}
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow mt-0.5 sm:mt-0"
                            style={{ backgroundColor: catMeta.color }}
                          >
                            {catMeta.name.slice(0, 1)}
                          </div>

                          {/* Text Information Container */}
                          <div className="min-w-0 flex-1 space-y-1">
                            
                            {/* Row 1: Merchant Name + Overbudget Tag */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-semibold text-xs sm:text-sm text-white truncate max-w-[170px] sm:max-w-xs md:max-w-md">
                                {tx.counterparty}
                              </h4>
                              
                              {tx.isOverBudget && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-700 font-bold shrink-0 flex items-center whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-400" />
                                  超预算 {tx.overBudgetReason ? `· ${tx.overBudgetReason}` : ''}
                                </span>
                              )}
                            </div>

                            {/* Row 2: Time + Description + Bank Account Tag */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                              <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                {tx.date.slice(11, 16) || tx.date.slice(5, 10)}
                              </span>
                              
                              {tx.description && tx.description !== tx.counterparty && (
                                <>
                                  <span className="text-slate-600 hidden sm:inline">·</span>
                                  <span className="truncate max-w-[120px] sm:max-w-xs text-slate-300 text-[11px]">
                                    {tx.description}
                                  </span>
                                </>
                              )}

                              <span className="text-slate-600">·</span>

                              {/* Gateway Channel Badge (微信支付 / 支付宝 / 银行直连) */}
                              {(() => {
                                const gw = tx.gatewayChannel || (tx.source === 'wechat_import' ? 'wechat' : tx.source === 'alipay_import' ? 'alipay' : 'bank_direct');
                                if (gw === 'wechat') {
                                  return (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shrink-0 whitespace-nowrap flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                      <span>出口: 微信</span>
                                    </span>
                                  );
                                } else if (gw === 'alipay') {
                                  return (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-950/80 text-sky-300 border border-sky-800/80 shrink-0 whitespace-nowrap flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                      <span>出口: 支付宝</span>
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shrink-0 whitespace-nowrap flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                      <span>出口: 银行代扣</span>
                                    </span>
                                  );
                                }
                              })()}

                              {/* Bank Card / Funding Account Color Badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 whitespace-nowrap ${accColor.bg} ${accColor.text} ${accColor.border}`}>
                                扣款: {acc?.name || tx.fundingAccountText || tx.paymentMethodText || '银行卡'}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Right: Amount & Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 shrink-0">
                          <div className="text-right">
                            <div className={`text-sm sm:text-base font-bold font-mono tracking-tight whitespace-nowrap ${
                              tx.type === 'income' ? 'text-emerald-400' :
                              tx.type === 'transfer' ? 'text-purple-400' : 'text-white'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}¥{tx.amount.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap block">
                              {catMeta.name}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="编辑"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Batch Change Category Modal */}
      {batchCategoryModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setBatchCategoryModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">批量修改所选 {selectedTxIds.length} 笔流水分类</h3>
              <button 
                type="button"
                onClick={() => setBatchCategoryModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => handleBatchChangeCategory(k as ExpenseCategory)}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: v.color }}
                  >
                    {v.name.slice(0, 1)}
                  </div>
                  <span className="text-xs font-semibold">{v.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batch Change Account Modal */}
      {batchAccountModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setBatchAccountModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">批量修改所选 {selectedTxIds.length} 笔扣款账户</h3>
              <button 
                type="button"
                onClick={() => setBatchAccountModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleBatchChangeAccount(acc.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <span className="text-xs font-semibold block">{acc.name}</span>
                      <span className="text-[10px] text-slate-400">尾号: {acc.cardTail}</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">¥{acc.balance.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal (With 1 Yuan Integer Stepper Adjustments) */}
      {(isQuickAddOpen || editingTx) && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) handleRequestCloseForm(); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-white space-y-4 my-8 cursor-default"
          >
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">
                {editingTx ? '修改流水明细' : '记一笔账目'}
              </h3>
              <button 
                type="button"
                onClick={handleRequestCloseForm} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormType(t)}
                    className={`py-2 rounded-xl text-xs font-semibold transition ${
                      formType === t
                        ? t === 'expense' ? 'bg-red-600 text-white' : t === 'income' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {t === 'expense' ? '支出' : t === 'income' ? '收入' : '转账'}
                  </button>
                ))}
              </div>

              {/* Amount with 1 Yuan Integer Steppers */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">金额 (元)</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-base font-bold text-slate-400">¥</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                      className="w-full bg-slate-950 text-xl font-bold text-white pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
                      placeholder="0"
                      autoFocus
                    />
                  </div>

                  {/* Integer Stepper +/- Quick Buttons */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStepFormAmount(-10)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepFormAmount(-1)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepFormAmount(1)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepFormAmount(10)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepFormAmount(100)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      +100
                    </button>
                  </div>
                </div>
              </div>

              {/* Account & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">扣款/收款账户</label>
                  <select
                    value={formAccountId}
                    onChange={e => setFormAccountId(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.cardTail})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">分类</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Counterparty & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">交易商户 / 对方</label>
                  <input
                    type="text"
                    value={formCounterparty}
                    onChange={e => setFormCounterparty(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                    placeholder="例如: 美宜佳 / 捷停车 / 小桔充电 / 房东"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">备注说明</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                    placeholder="例如: 快充服务费 / 午餐 / 房租"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">交易时间</label>
                <input
                  type="text"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              {/* Overbudget Option */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center space-x-2 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsOverbudget}
                    onChange={e => setFormIsOverbudget(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>标记为超预算支出（将纳入18号复盘超支归因）</span>
                </label>
                {formIsOverbudget && (
                  <input
                    type="text"
                    value={formOverbudgetReason}
                    onChange={e => setFormOverbudgetReason(e.target.value)}
                    placeholder="超支原因 (例如: 大额家居采购/修车保养/阳台改造)"
                    className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-amber-900 focus:outline-none"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleRequestCloseForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  保存记录
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
