import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { parseWeChatOrAlipayCSV, parseSmartTextBills, ParseResult, DuplicateMatch } from '../utils/billParser';
import { extractTextFromPDF, parsePDFStatementContent } from '../utils/pdfParser';
import { uploadReceiptToR2 } from '../utils/storage';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  PlusCircle, 
  Trash2,
  Receipt,
  FileType,
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';

interface BillImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  existingTransactions: Transaction[];
  onImportConfirm: (newTransactions: Transaction[]) => void;
}

export const BillImportModal: React.FC<BillImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  existingTransactions,
  onImportConfirm
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'pdf_file' | 'text' | 'automation'>('pdf_file');
  const [pastedText, setPastedText] = useState<string>(
`2026-08-16 12:45 商户消费 包德欢手工水饺 16.98 中信银行储蓄卡
2026-08-16 08:30 扫二维码付 按时吃早饭 7.00 中信银行储蓄卡
2026-08-15 18:20 商户消费 湘赣餐馆 34.00 中信银行储蓄卡
2026-08-15 11:15 商户消费 广东美宜佳便利店 16.80 中信银行储蓄卡
2026-08-14 21:10 商户消费 小桔充电 51.54 中信银行储蓄卡
2026-08-14 09:20 扫二维码付 捷停车 15.00 中信银行储蓄卡
2026-08-14 08:10 商户消费 粤通卡ETC通行费 42.50 中信银行储蓄卡
2026-08-13 14:00 商户消费 腾讯云费用 48.70 招商银行储蓄卡
2026-08-12 16:30 商户消费 硅基流动SiliconFlow 120.00 招商银行储蓄卡
2026-08-01 10:00 商户消费 同方物业房租水电 1740.00 招商银行储蓄卡
2026-08-05 09:00 商户消费 招商银行车贷 2900.00 招商银行储蓄卡`
  );
  
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [includeDuplicates, setIncludeDuplicates] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleParseText = () => {
    setIsProcessing(true);
    setStatusMessage('正在智能识别文本账单并查重...');
    setTimeout(() => {
      const res = parseSmartTextBills(pastedText, accounts, existingTransactions);
      setParseResult(res);
      setIsProcessing(false);
      setStatusMessage(null);
    }, 150);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsProcessing(true);

    try {
      // 异步上传源文件到 Cloudflare R2 存储桶归档备份
      uploadReceiptToR2(file).then(res => {
        if (res) console.log('[Cloudflare R2] 账单已安全归档至 R2 存储桶:', res.key);
      });

      if (file.name.toLowerCase().endsWith('.pdf')) {
        setStatusMessage(`正在解析 PDF 电子对账单《${file.name}》...`);
        const extractedText = await extractTextFromPDF(file);
        const res = parsePDFStatementContent(extractedText, accounts, existingTransactions);
        setParseResult(res);
      } else {
        // CSV or text
        setStatusMessage(`正在读取 CSV 账单《${file.name}》...`);
        const content = await file.text();
        const res = parseWeChatOrAlipayCSV(content, accounts, existingTransactions);
        setParseResult(res);
      }
    } catch (err: any) {
      alert(`解析失败: ${err.message || '文件格式不兼容'}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const hasUnsavedImports = parseResult !== null && (parseResult.totalNew > 0 || (includeDuplicates && parseResult.totalParsed > 0));

  const handleExecuteImport = () => {
    if (!parseResult) return;
    
    let itemsToImport = parseResult.transactions;
    if (includeDuplicates && parseResult.duplicates.length > 0) {
      itemsToImport = [...itemsToImport, ...parseResult.duplicates.map(d => d.incoming)];
    }

    onImportConfirm(itemsToImport);
    onClose();
  };

  const handleRequestClose = () => {
    if (hasUnsavedImports) {
      const confirmSave = window.confirm('检测到当前已解析待导入的流水记录尚未保存入库。\n\n• 点击【确定】：立即确认导入并退出\n• 点击【取消】：放弃本次导入直接退出');
      if (confirmSave) {
        handleExecuteImport();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">流水账单智能导入与防重复记账</h3>
              <p className="text-xs text-slate-400">
                支持微信/支付宝/银行卡 PDF 电子对账单、CSV 账单与剪贴板智能识别
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => { setActiveTab('pdf_file'); setParseResult(null); }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'pdf_file'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileType className="w-4 h-4" />
              <span>📄 上传 PDF 电子账单 / CSV 文件</span>
            </button>

            <button
              onClick={() => { setActiveTab('text'); setParseResult(null); }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'text'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>智能文本 / 截图OCR提取粘贴</span>
            </button>

            <button
              onClick={() => { setActiveTab('automation'); }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'automation'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>动账自动化获取方案</span>
            </button>
          </div>

          {/* Tab 1: PDF / CSV File Upload */}
          {activeTab === 'pdf_file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center transition bg-slate-950/60">
                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-semibold text-sm text-white">
                  选择微信、支付宝或银行导出的 PDF / CSV 账单
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  支持各大手机银行（招商、中信、农行）与微信支付导出的 <strong>PDF 电子回单/明细</strong> 及 <strong>CSV 账单</strong>，系统将自动按卡号、金额与用途分流。
                </p>

                {uploadFileName && (
                  <div className="mt-3 inline-block px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-400">
                    已选文件：{uploadFileName}
                  </div>
                )}

                <div className="mt-4">
                  <label className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition shadow">
                    <span>浏览并上传 PDF / CSV 账单</span>
                    <input
                      type="file"
                      accept=".pdf,.csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {isProcessing && statusMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center justify-center space-x-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Text Paste */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                粘贴流水文本、银行动账短信或截图 OCR 结果：
              </label>
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
                placeholder="例如: 2026-08-16 12:45 美宜佳 16.80 中信银行储蓄卡..."
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  支持多行、含金额、商户名及银行卡信息的文本
                </span>
                <button
                  onClick={handleParseText}
                  disabled={isProcessing || !pastedText.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>智能解析并查重</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Automation & Zero-Manual Guide */}
          {activeTab === 'automation' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/80 space-y-3">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  如何实现“免手动逐笔记账、全自动获取流水”？
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  为了摆脱传统记账软件“一笔一笔记录、容易遗漏忘记”的痛点，推荐使用以下自动化接入方案：
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">方案 1：微信/支付宝「月度账单直导」</span>
                    <p className="text-slate-400 text-[11px]">
                      每月18号复盘前，在微信支付【我的钱包 → 账单 → 常见问题 → 下载账单】导出 PDF 或 CSV，一键拖拽上传本系统，2秒内自动完成所有扣款分类和查重。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">方案 2：手机动账通知 / 短信自动监听</span>
                    <p className="text-slate-400 text-[11px]">
                      借助 iOS 快捷指令（检测银行短信/微信服务号通知）或 Android 无障碍通知监听应用，消费发生后自动将商户与金额同步入库。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parse & Deduplication Result View */}
          {parseResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">解析账单总笔数</span>
                  <span className="font-bold text-base text-white">{parseResult.totalParsed} 笔</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-300 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    全新有效账单
                  </span>
                  <span className="font-bold text-base text-emerald-400">{parseResult.totalNew} 笔</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  parseResult.totalDuplicates > 0 
                    ? 'bg-amber-950/70 border-amber-800 text-amber-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <span className="text-xs flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    检测到重复账单
                  </span>
                  <span className="font-bold text-base">{parseResult.totalDuplicates} 笔</span>
                </div>
              </div>

              {/* Duplicate Warnings & Options */}
              {parseResult.totalDuplicates > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-amber-300 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-amber-400" />
                        系统已自动开启防重复记账过滤保护
                      </h4>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">
                        以下 {parseResult.totalDuplicates} 笔交易已在您的历史流水库中存在，默认将自动剔除以防止重复记账。
                      </p>
                    </div>

                    <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDuplicates}
                        onChange={e => setIncludeDuplicates(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                      />
                      <span>强制包含重复项</span>
                    </label>
                  </div>

                  {/* Duplicate List Details */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {parseResult.duplicates.map((dup, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-amber-900/60 text-xs flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{dup.incoming.date}</span>
                          <span className="mx-2 text-slate-400">·</span>
                          <span className="text-amber-300">{dup.incoming.counterparty}</span>
                          <span className="mx-2 text-slate-400">·</span>
                          <span className="text-slate-400">{dup.reason}</span>
                        </div>
                        <span className="text-red-400 font-bold">¥{dup.incoming.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Items Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">即将纳入流水库的明细清单 ({parseResult.totalNew} 笔)：</span>
                  <span className="text-[11px] text-slate-400">已智能分配消费类别与对应扣款账户</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {parseResult.transactions.map((tx, idx) => {
                    const acc = accounts.find(a => a.id === tx.accountId);
                    return (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400 font-mono">{tx.date.slice(5, 16)}</span>
                          <span className="font-semibold text-white">{tx.counterparty}</span>
                          <span className="text-slate-400 text-[11px]">{tx.description}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {acc?.name || '未知账户'}
                          </span>
                        </div>
                        <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {tx.type === 'income' ? '+' : '-'}¥{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950 rounded-b-2xl">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            取消
          </button>

          <button
            onClick={handleExecuteImport}
            disabled={!parseResult || (parseResult.totalNew === 0 && !includeDuplicates)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow disabled:opacity-50 flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              确认导入 {includeDuplicates ? parseResult?.totalParsed : parseResult?.totalNew} 笔账单
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
