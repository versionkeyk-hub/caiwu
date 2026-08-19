import React, { useState } from 'react';
import { 
  Calculator, 
  Receipt, 
  PieChart, 
  CreditCard, 
  History, 
  Plus, 
  Upload, 
  Download, 
  RotateCw,
  User,
  ShieldCheck, 
  CalendarCheck2,
  LogOut,
  LogIn
} from 'lucide-react';

import { APP_VERSION, APP_BUILD_DATE } from '../version';

export type ActiveTab = 'overview' | 'split_wizard' | 'transactions' | 'analytics' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  onOpenImport: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onOpenUserProfile: () => void;
  onLogout?: () => void;
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenImport,
  onExport,
  onRefresh,
  onOpenUserProfile,
  onLogout,
  isLoggedIn,
  userEmail,
  userName
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleQuickLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmLogout = window.confirm('确定要退出当前登录账号吗？\n\n您的本地分账流水和银行卡数据将安全保存在本地。');
    if (confirmLogout && onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & Identity & Version Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center shadow-md shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline font-bold text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">分账与记账管家</span>
              
              {/* Version Number Tag with Build Date */}
              <span className="inline-flex items-center text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-mono font-bold whitespace-nowrap" title={`发布构建时间: ${APP_BUILD_DATE}`}>
                {APP_VERSION}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-amber-300 border border-amber-500/40 font-medium whitespace-nowrap" title="已接入 Cloudflare D1 数据库与 R2 对象存储">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                D1 & R2 云端联机
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>账户分账大盘</span>
            </button>

            <button
              onClick={() => setActiveTab('split_wizard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'split_wizard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4 text-emerald-300" />
              <span>18号分账向导</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>流水明细</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>图表分析与超支</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>历史归档</span>
            </button>
          </nav>

          {/* Action Tools & User Account & Refresh */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Real Refresh Button (Auto-saves & Syncs) */}
            <button
              onClick={handleRefreshClick}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition shadow-sm flex items-center space-x-1"
              title="自动保存当前数据并实质刷新"
              aria-label="自动保存并刷新数据"
            >
              <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden xl:inline text-xs font-medium">刷新</span>
            </button>

            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition shadow-sm"
              title="导入微信/支付宝账单流水"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">导入流水</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">记一笔</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onExport}
              className="hidden sm:inline-flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="导出账本 CSV / 备份"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* User Account / Profile Pill */}
            {isLoggedIn ? (
              <div className="flex items-center bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition pl-1.5 pr-1 py-1 shrink-0">
                <button
                  onClick={onOpenUserProfile}
                  className="flex items-center space-x-1.5 text-left pr-1.5"
                  title={`当前登录账号: ${userEmail} (点击查看账号详情)`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {userEmail ? userEmail.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block min-w-0 max-w-[110px]">
                    <div className="text-[11px] font-semibold text-white truncate leading-tight">
                      {userName || '主理人'}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate leading-tight font-mono">
                      {userEmail}
                    </div>
                  </div>
                </button>

                {/* Quick Logout Button */}
                {onLogout && (
                  <button
                    onClick={handleQuickLogout}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="退出登录"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenUserProfile}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>登录</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800/80 px-2 py-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
            activeTab === 'overview' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-4 h-4 mb-0.5" />
          <span>账户</span>
        </button>

        <button
          onClick={() => setActiveTab('split_wizard')}
          className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
            activeTab === 'split_wizard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4 mb-0.5" />
          <span>18号分账</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
            activeTab === 'transactions' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span>明细</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
            activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <PieChart className="w-4 h-4 mb-0.5" />
          <span>图表</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
            activeTab === 'history' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span>历史</span>
        </button>
      </div>
    </header>
  );
};
