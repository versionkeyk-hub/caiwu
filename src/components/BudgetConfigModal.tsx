import React, { useState } from 'react';
import { BudgetItem, AccountType } from '../types';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Settings2, 
  ShieldCheck, 
  PiggyBank, 
  Layers, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface BudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: BudgetItem[];
  onSaveBudgets: (newBudgets: BudgetItem[]) => void;
}

export const BudgetConfigModal: React.FC<BudgetConfigModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets
}) => {
  if (!isOpen) return null;

  const [localBudgets, setLocalBudgets] = useState<BudgetItem[]>(JSON.parse(JSON.stringify(budgets)));

  const handleUpdateAmount = (id: string, newAmount: number) => {
    setLocalBudgets(prev => prev.map(b => b.id === id ? { ...b, budgetAmount: Math.max(0, Math.round(newAmount)) } : b));
  };

  const handleStepAmount = (id: string, delta: number) => {
    setLocalBudgets(prev => prev.map(b => {
      if (b.id === id) {
        const next = Math.max(0, Math.round(b.budgetAmount + delta));
        return { ...b, budgetAmount: next };
      }
      return b;
    }));
  };

  const handleUpdateName = (id: string, name: string) => {
    setLocalBudgets(prev => prev.map(b => b.id === id ? { ...b, name } : b));
  };

  const handleToggleFixed = (id: string) => {
    setLocalBudgets(prev => prev.map(b => b.id === id ? { ...b, isFixed: !b.isFixed } : b));
  };

  const handleUpdateAccountType = (id: string, targetAccountType: AccountType) => {
    setLocalBudgets(prev => prev.map(b => b.id === id ? { ...b, targetAccountType } : b));
  };

  const handleAddNewItem = () => {
    const newItem: BudgetItem = {
      id: `b_custom_${Date.now()}`,
      category: 'other',
      name: '自定义预算项',
      budgetAmount: 200,
      targetAccountType: 'daily_expense',
      isFixed: false,
      description: '自建月度预算规划'
    };
    setLocalBudgets([...localBudgets, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setLocalBudgets(localBudgets.filter(b => b.id !== id));
  };

  const isDirty = JSON.stringify(localBudgets) !== JSON.stringify(budgets);

  const handleSave = () => {
    onSaveBudgets(localBudgets);
    onClose();
  };

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmSave = window.confirm('检测到您调整了预算规划数据尚未保存。\n\n• 点击【确定】：保存预算调整并退出\n• 点击【取消】：放弃修改直接退出');
      if (confirmSave) {
        handleSave();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleRequestClose();
    }
  };

  const citicDailyTotal = localBudgets
    .filter(b => b.targetAccountType === 'daily_expense')
    .reduce((sum, b) => sum + b.budgetAmount, 0);

  const cmbFixedTotal = localBudgets
    .filter(b => b.targetAccountType === 'fixed_expense' || b.targetAccountType === 'savings_loan')
    .reduce((sum, b) => sum + b.budgetAmount, 0);

  const totalMonthlyBudget = citicDailyTotal + cmbFixedTotal;

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-white cursor-default"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">自定义预算规划与固定开销限额</h3>
              <p className="text-xs text-slate-400">
                支持自由修改每项额度、以1元为整数调节，实时同步至18号分账与超支追踪看板
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleRequestClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Summary Metric Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/60">
              <span className="text-[11px] text-rose-300">中信日常限额合计</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5">¥{citicDailyTotal}</div>
              <span className="text-[10px] text-slate-400">日常餐饮 + 杂销限额</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/60">
              <span className="text-[11px] text-blue-300">招商固定支出合计</span>
              <div className="text-xl font-bold text-blue-400 mt-0.5">¥{cmbFixedTotal}</div>
              <span className="text-[10px] text-slate-400">房租/车贷/养老/保险/话费</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800">
              <span className="text-[11px] text-emerald-300">全月预算总额</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">¥{totalMonthlyBudget}</div>
              <span className="text-[10px] text-emerald-200/80">刚性保障与日常规划</span>
            </div>
          </div>

          {/* Budget items list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center">
                <Layers className="w-4 h-4 mr-1 text-emerald-400" />
                各项预算明细清单 ({localBudgets.length})
              </span>
              <button
                onClick={handleAddNewItem}
                className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold py-1 px-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加预算项</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {localBudgets.map((item, idx) => {
                const catMeta = EXPENSE_CATEGORIES[item.category] || EXPENSE_CATEGORIES.other;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-white"
                  >
                    {/* Left: Name and Category */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateName(item.id, e.target.value)}
                          className="bg-transparent font-semibold text-sm text-white w-full border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none"
                        />
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {catMeta.name}
                          </span>
                          <span>·</span>
                          <select
                            value={item.targetAccountType}
                            onChange={e => handleUpdateAccountType(item.id, e.target.value as AccountType)}
                            className="bg-slate-900 text-slate-300 rounded px-1.5 py-0.5 border border-slate-800 text-[11px] focus:outline-none"
                          >
                            <option value="daily_expense">中信日常卡划扣</option>
                            <option value="fixed_expense">招商主卡划扣</option>
                            <option value="savings_loan">招商电子卡(车贷)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stepper Controls with 1 Yuan minimum integer adjustments */}
                    <div className="flex items-center space-x-2 shrink-0 justify-between md:justify-end">
                      {/* Step Quick Buttons */}
                      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleStepAmount(item.id, -100)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="减少100元"
                        >
                          -100
                        </button>
                        <button
                          onClick={() => handleStepAmount(item.id, -10)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="减少10元"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleStepAmount(item.id, -1)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="减少1元"
                        >
                          -1
                        </button>

                        <div className="flex items-center px-1">
                          <span className="text-xs font-bold text-slate-400 mr-0.5">¥</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={item.budgetAmount}
                            onChange={e => handleUpdateAmount(item.id, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-950 font-bold text-sm text-emerald-400 text-right px-1.5 py-0.5 rounded border border-slate-700 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => handleStepAmount(item.id, 1)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="增加1元"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleStepAmount(item.id, 10)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="增加10元"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleStepAmount(item.id, 100)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="增加100元"
                        >
                          +100
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                        title="删除预算项"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ETC Guidance Note */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              ETC 卡与汽车专属支出分账建议：
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong>日常通行扣费</strong>：若 ETC 绑定中信银行卡自动扣费，建议归属为「中信日常卡 - 车辆日常 (ETC/充电/停车)」；<br/>
              • <strong>每月固定充值</strong>：若每月固定日期充值固定金额，也可将其设置为「招商主卡固定消费」。
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950 rounded-b-2xl">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>保存并应用全部预算规划</span>
          </button>
        </div>

      </div>
    </div>
  );
};
