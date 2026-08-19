import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  ShieldCheck, 
  Check, 
  Key, 
  LogOut, 
  Sparkles,
  Calendar,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  LogIn
} from 'lucide-react';
import { APP_VERSION, APP_BUILD_DATE } from '../version';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  isLoggedIn: boolean;
  onUpdateUserName: (name: string) => void;
  onRefreshData: () => void;
  onLogout: () => void;
  onLogin: (email: string, name: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  isLoggedIn,
  onUpdateUserName,
  onRefreshData,
  onLogout,
  onLogin
}) => {
  if (!isOpen) return null;

  const [inputName, setInputName] = useState(userName);
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginNameInput, setLoginNameInput] = useState('');
  const [saved, setSaved] = useState(false);

  const isDirty = isLoggedIn && inputName.trim() !== userName;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;
    onUpdateUserName(inputName.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExecuteLogout = () => {
    const confirmLogout = window.confirm('确定要退出当前登录账号吗？\n\n您的本地分账流水和银行卡数据将妥善保存在本地，退出后随时可重新登录。');
    if (confirmLogout) {
      onLogout();
      onClose();
    }
  };

  const handleExecuteLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmailInput.trim() || 'version.keyk@gmail.com';
    const name = loginNameInput.trim() || '主理人';
    onLogin(email, name);
  };

  const handleRequestClose = () => {
    if (isDirty && inputName.trim() !== '') {
      const confirmSave = window.confirm('检测到您修改了用户昵称尚未保存。\n\n• 点击【确定】：保存修改并退出\n• 点击【取消】：放弃修改直接退出');
      if (confirmSave) {
        onUpdateUserName(inputName.trim());
        onClose();
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

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 text-white space-y-4 cursor-default"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-10 h-10 rounded-full ${isLoggedIn ? 'bg-gradient-to-tr from-emerald-500 to-indigo-600' : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-white font-bold text-base shadow`}>
              {isLoggedIn ? (userEmail ? userEmail.slice(0, 1).toUpperCase() : 'U') : <User className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{isLoggedIn ? '个人账号中心' : '用户登录'}</h3>
              <p className="text-xs text-slate-400">{isLoggedIn ? '已授权安全同步与分账数据加密' : '登录以管理多卡分账与流水同步'}</p>
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

        {/* Logged in View */}
        {isLoggedIn ? (
          <div className="space-y-3 text-xs">
            
            {/* Email Info */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>绑定主登录邮箱 (Google / SSO)</span>
              </div>
              <div className="font-mono text-sm text-white font-semibold pt-0.5 break-all">
                {userEmail}
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>当前状态：已认证 · 安全连接正常</span>
              </div>
            </div>

            {/* Nickname Form */}
            <form onSubmit={handleSave} className="space-y-2">
              <label className="block text-slate-400">用户昵称 / 专属记账尊称</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  placeholder="例如: 主理人"
                  className="flex-1 bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow flex items-center space-x-1"
                >
                  {saved ? <Check className="w-4 h-4" /> : <span>保存</span>}
                </button>
              </div>
            </form>

            {/* System metadata */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>系统版本</span>
                <span className="text-emerald-400 font-mono font-semibold">{APP_VERSION} ({APP_BUILD_DATE})</span>
              </div>
              <div className="flex justify-between">
                <span>分账模型</span>
                <span className="text-slate-200">18号复盘日多卡分离体系</span>
              </div>
              <div className="flex justify-between">
                <span>云端数据库</span>
                <span className="text-emerald-400 font-medium">Cloudflare D1 多租户隔离存储</span>
              </div>
            </div>

            {/* Refresh and Logout Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onRefreshData();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>保存并实质刷新</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteLogout}
                className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 border border-red-800/80 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>退出登录</span>
              </button>
            </div>

          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleExecuteLogin} className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1">
              <p className="font-semibold text-white">您当前处于未登录模式</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                登录后即可绑定您的分账身份与个人偏好，本地数据将自动与该身份关联。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400">登录邮箱</label>
              <input
                type="email"
                value={loginEmailInput}
                onChange={e => setLoginEmailInput(e.target.value)}
                placeholder="version.keyk@gmail.com"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400">用户昵称</label>
              <input
                type="text"
                value={loginNameInput}
                onChange={e => setLoginNameInput(e.target.value)}
                placeholder="主理人"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>立即登录</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
