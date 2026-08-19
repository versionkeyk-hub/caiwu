import React, { useState } from 'react';
import { MonthlyReviewSnapshot } from '../types';
import { 
  History, 
  CalendarCheck2, 
  ChevronDown, 
  ChevronUp, 
  PiggyBank, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2,
  FileText
} from 'lucide-react';

interface HistoricalSnapshotsProps {
  snapshots: MonthlyReviewSnapshot[];
  onDeleteSnapshot: (id: string) => void;
  onUpdateSnapshot?: (snapshot: MonthlyReviewSnapshot) => void;
  onOpenSplitWizard: () => void;
}

export const HistoricalSnapshots: React.FC<HistoricalSnapshotsProps> = ({
  snapshots,
  onDeleteSnapshot,
  onUpdateSnapshot,
  onOpenSplitWizard
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(snapshots[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleTransfer = (snapshot: MonthlyReviewSnapshot, transferIndex: number) => {
    if (!onUpdateSnapshot) return;
    const updatedTransfers = snapshot.actualTransfers.map((t, idx) => {
      if (idx === transferIndex) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    onUpdateSnapshot({
      ...snapshot,
      actualTransfers: updatedTransfers
    });
  };

  const handleMarkAllTransfersCompleted = (snapshot: MonthlyReviewSnapshot) => {
    if (!onUpdateSnapshot) return;
    const updatedTransfers = snapshot.actualTransfers.map(t => ({
      ...t,
      completed: true
    }));
    onUpdateSnapshot({
      ...snapshot,
      actualTransfers: updatedTransfers
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">历月 18 号分账与账目梳理复盘归档</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            清晰记录每个月发薪后的资金流转指令、储蓄锁定金额与超支归因明细
          </p>
        </div>

        <button
          onClick={onOpenSplitWizard}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow"
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>开始本月 18 号分账</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="space-y-4">
        {snapshots.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">暂无历史复盘归档记录</p>
          </div>
        ) : (
          snapshots.map(snap => {
            const isExpanded = expandedId === snap.id;

            return (
              <div 
                key={snap.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition overflow-hidden text-white shadow-sm"
              >
                {/* Summary Banner Header */}
                <div 
                  onClick={() => toggleExpand(snap.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-900/90 hover:bg-slate-850"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-xs">
                      {snap.month}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-white">
                          {snap.month} 月度分账梳理复盘报告
                        </h4>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                          复盘日: {snap.reviewDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        实发工资: <span className="text-white font-semibold">¥{snap.salaryReceived.toFixed(2)}</span>
                        <span className="mx-2">·</span>
                        锁定储蓄: <span className="text-emerald-400 font-bold">¥{snap.savingsCalculated.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">完成转账</span>
                      <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {snap.actualTransfers.filter(t => t.completed).length} / {snap.actualTransfers.length} 笔已执行
                      </div>
                    </div>

                    <div className="text-slate-400 p-1 rounded-lg bg-slate-800">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4 text-xs">
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">农行工资到账</span>
                        <div className="text-base font-bold text-white mt-0.5">
                          ¥{snap.accountBalances.abcSalary.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">中信日常限额预算</span>
                        <div className="text-base font-bold text-red-400 mt-0.5">
                          ¥{snap.plannedExpenses.citicDailyLimit.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800">
                        <span className="text-emerald-300 font-medium">存入招商电子卡储蓄</span>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">
                          ¥{snap.savingsCalculated.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actual Transfer Orders */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-300">实际执行转账清单：</div>
                        {onUpdateSnapshot && snap.actualTransfers.some(t => !t.completed) && (
                          <button
                            onClick={() => handleMarkAllTransfersCompleted(snap)}
                            className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>一键标记为全部已执行</span>
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {snap.actualTransfers.map((t, idx) => {
                          const isDone = t.completed !== false;
                          return (
                            <div 
                              key={idx} 
                              onClick={() => handleToggleTransfer(snap, idx)}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition ${
                                isDone 
                                  ? 'bg-slate-900 border-slate-800 hover:border-emerald-700/60' 
                                  : 'bg-slate-950/90 border-amber-900/50 hover:border-amber-700'
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-white flex items-center">
                                  <span>{t.fromAccountName}</span>
                                  <ArrowRight className="w-3.5 h-3.5 mx-2 text-emerald-400" />
                                  <span>{t.toAccountName}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                  {t.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">
                                  ¥{t.amount.toFixed(2)}
                                </span>
                                {isDone ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>已执行</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 font-semibold">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>点击标为已完成</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Overbudget items if any */}
                    {snap.overbudgetItems && snap.overbudgetItems.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold text-amber-400 flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          <span>当期超额支出归因清单：</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {snap.overbudgetItems.map((ov, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-amber-900/50 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-white">{ov.name}</span>
                                {ov.note && <span className="text-[10px] text-slate-400 ml-1.5">({ov.note})</span>}
                              </div>
                              <span className="text-red-400 font-bold">-¥{ov.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {snap.notes && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                        <span className="text-slate-400 font-medium">复盘备忘：</span> {snap.notes}
                      </div>
                    )}

                    {/* Delete snapshot button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onDeleteSnapshot(snap.id)}
                        className="text-slate-500 hover:text-red-400 flex items-center space-x-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除此归档记录</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
