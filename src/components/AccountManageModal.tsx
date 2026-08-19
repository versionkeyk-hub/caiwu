import React, { useState, useEffect, useRef } from 'react';
import { Account, AccountType } from '../types';
import { 
  X, 
  CreditCard, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { BankLogo, PRESET_BANKS, detectBankCode } from './BankLogo';
import { compressAccountLogo } from '../utils/imageCompressor';

interface AccountManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount?: (accountId: string) => void;
}

export const AccountManageModal: React.FC<AccountManageModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  onSaveAccount,
  onDeleteAccount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('招商银行');
  const [bankCode, setBankCode] = useState<string>('CMB');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardTail, setCardTail] = useState('');
  const [type, setType] = useState<AccountType>('custom');
  const [balance, setBalance] = useState('0.00');
  const [color, setColor] = useState('#df0012');
  const [iconName, setIconName] = useState('CreditCard');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const isEditing = !!accountToEdit;

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setBankName(accountToEdit.bankName);
      setBankCode(accountToEdit.bankCode || detectBankCode(accountToEdit.bankName, accountToEdit.name));
      setAccountNumber(accountToEdit.accountNumber || '');
      setCardTail(accountToEdit.cardTail || '');
      setType(accountToEdit.type);
      setBalance(accountToEdit.balance.toString());
      setColor(accountToEdit.color || '#df0012');
      setIconName(accountToEdit.iconName || 'CreditCard');
      setCustomLogoUrl(accountToEdit.customLogoUrl);
      setNote(accountToEdit.note || '');
    } else {
      setName('');
      setBankName('招商银行');
      setBankCode('CMB');
      setAccountNumber('');
      setCardTail('');
      setType('custom');
      setBalance('0.00');
      setColor('#df0012');
      setIconName('CreditCard');
      setCustomLogoUrl(undefined);
      setNote('');
    }
    setCompressionInfo(null);
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const isDirty = isEditing
    ? name !== accountToEdit.name ||
      bankName !== accountToEdit.bankName ||
      bankCode !== (accountToEdit.bankCode || detectBankCode(accountToEdit.bankName, accountToEdit.name)) ||
      accountNumber !== (accountToEdit.accountNumber || '') ||
      cardTail !== (accountToEdit.cardTail || '') ||
      type !== accountToEdit.type ||
      balance !== accountToEdit.balance.toString() ||
      color !== (accountToEdit.color || '#df0012') ||
      customLogoUrl !== accountToEdit.customLogoUrl ||
      note !== (accountToEdit.note || '')
    : name.trim() !== '' ||
      accountNumber.trim() !== '' ||
      (balance !== '0.00' && balance !== '0' && balance !== '') ||
      customLogoUrl !== undefined ||
      note.trim() !== '';

  const handleCardNumberChange = (val: string) => {
    setAccountNumber(val);
    const clean = val.replace(/\s+/g, '');
    if (clean.length >= 4) {
      setCardTail(clean.slice(-4));
    }
  };

  const handleSelectPresetBank = (preset: typeof PRESET_BANKS[0]) => {
    setBankCode(preset.code);
    setBankName(preset.name);
    setColor(preset.color);
    if (!name || name === '新建账户' || PRESET_BANKS.some(p => name.startsWith(p.name))) {
      setName(`${preset.name}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const originalSizeKb = Math.round(file.size / 1024);
      // High efficiency compression to 128x128 webp/jpeg
      const compressedDataUrl = await compressAccountLogo(file, 128, 0.85);
      
      // Calculate compressed size in KB
      const compressedBytes = Math.round((compressedDataUrl.length * 3) / 4);
      const compressedSizeKb = (compressedBytes / 1024).toFixed(1);

      setCustomLogoUrl(compressedDataUrl);
      setCompressionInfo(`已深度压缩：${originalSizeKb} KB ➔ ${compressedSizeKb} KB (轻量高效)`);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('图片压缩处理失败，请重试');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearCustomLogo = () => {
    setCustomLogoUrl(undefined);
    setCompressionInfo(null);
  };

  const handleSaveAndClose = (): boolean => {
    if (!name.trim()) {
      alert('请输入账户名称后再保存');
      return false;
    }

    const finalAccount: Account = {
      id: accountToEdit ? accountToEdit.id : `acc_custom_${Date.now()}`,
      name: name.trim(),
      bankName: bankName.trim() || '银行卡',
      bankCode,
      accountNumber: accountNumber.trim() || '6200000000000000',
      cardTail: cardTail.trim() || accountNumber.slice(-4) || '8888',
      type,
      balance: parseFloat(balance) || 0,
      color,
      iconName,
      customLogoUrl,
      note: note.trim() || undefined,
      isPrimarySalary: type === 'salary',
      isDailyBudgetCard: type === 'daily_expense',
      isFixedExpenseCard: type === 'fixed_expense',
      isSavingsTarget: type === 'savings_loan'
    };

    onSaveAccount(finalAccount);
    onClose();
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveAndClose();
  };

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmSave = window.confirm('检测到您有修改的账户信息尚未保存。\n\n• 点击【确定】：保存当前修改并退出\n• 点击【取消】：放弃未保存的修改并退出');
      if (confirmSave) {
        handleSaveAndClose();
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

  const handleDelete = () => {
    if (!accountToEdit || !onDeleteAccount) return;
    if (window.confirm(`确定要删除账户「${accountToEdit.name}」吗？相关流水仍将保留。`)) {
      onDeleteAccount(accountToEdit.id);
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 text-white space-y-4 my-8 cursor-default"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <BankLogo
              bankCode={bankCode}
              bankName={bankName}
              customLogoUrl={customLogoUrl}
              size="md"
            />
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? '修改与配置银行卡账户' : '添加新银行卡 / 资金账户'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `正在编辑账户: ${accountToEdit.name}` : '配置官方图标或自定义照片，支持高压缩率'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleRequestClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Logo Selection Section (Official Brands & Custom Photo Upload) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                银行卡 Logo 与图标设置
              </label>
              
              {customLogoUrl ? (
                <button
                  type="button"
                  onClick={handleClearCustomLogo}
                  className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除自定义照片</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium flex items-center space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80"
                >
                  <Upload className="w-3 h-3 mr-0.5" />
                  <span>上传照片/图标</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Custom Photo Preview if present */}
            {customLogoUrl ? (
              <div className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700">
                <img
                  src={customLogoUrl}
                  alt="Custom Bank Logo"
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500/60 shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-emerald-400 font-semibold text-xs flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    已应用自定义图标照片
                  </div>
                  {compressionInfo && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{compressionInfo}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                >
                  更换
                </button>
              </div>
            ) : (
              /* Preset Bank Grid */
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400">选择国内主流官方真实银行 Logo：</div>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {PRESET_BANKS.map(preset => {
                    const isSelected = bankCode === preset.code;
                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectPresetBank(preset)}
                        className={`p-1.5 rounded-xl flex flex-col items-center justify-center space-y-1 border transition-all ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                        title={preset.fullName}
                      >
                        <BankLogo bankCode={preset.code} size="sm" />
                        <span className="text-[10px] text-slate-300 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isCompressing && (
              <div className="text-xs text-emerald-400 flex items-center space-x-1.5 animate-pulse">
                <span>正在执行高压缩率画质优化处理...</span>
              </div>
            )}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-slate-400 mb-1">账户显示名称 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如: 中信银行 (日常消费卡) / 招商主卡"
              className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Bank & Tail */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">所属银行/机构名称</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="例如: 中信银行 / 招商银行"
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">卡号尾号 (4位)</label>
              <input
                type="text"
                value={cardTail}
                onChange={e => setCardTail(e.target.value)}
                placeholder="例如: 8362"
                maxLength={6}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Full Card / Account Number */}
          <div>
            <label className="block text-slate-400 mb-1">完整卡号 / 账号 (可选，用于复制转账)</label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => handleCardNumberChange(e.target.value)}
              placeholder="6214 8300 0000 0000"
              className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 font-mono focus:outline-none"
            />
          </div>

          {/* Role / Split Property */}
          <div>
            <label className="block text-slate-400 mb-1">账户分账属性定位</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            >
              <option value="daily_expense">日常消费卡 (限额控制 · 推荐中信)</option>
              <option value="fixed_expense">固定消费卡 (房租/车位/保险中转 · 推荐招商主卡)</option>
              <option value="savings_loan">储蓄与车贷卡 (蓄水池/强制储蓄 · 推荐招商电子卡)</option>
              <option value="salary">工资到账卡 (资金源头 · 推荐农行)</option>
              <option value="wechat">微信零钱/常用支付</option>
              <option value="alipay">支付宝账户</option>
              <option value="custom">通用资金账户</option>
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-slate-400 mb-1">当前实时余额 (元)</label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="w-full bg-slate-950 text-white font-bold p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-400 mb-1">功能用途备注</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="例如: 车贷月扣2900 / 日常吃饭2500限额"
              className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEditing && onDeleteAccount ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除账户</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow flex items-center space-x-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? '保存修改' : '确认添加账户'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
