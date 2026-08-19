import * as pdfjsLib from 'pdfjs-dist';
import { Transaction, Account } from '../types';
import { detectCategory } from './categories';
import { matchAccountIdByPaymentText, checkDuplicates, ParseResult } from './billParser';

// Set worker source to CDN or local fallback
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // pdfjs-dist CDN worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup:', e);
}

/**
 * Extract raw text from a PDF file
 */
export async function extractTextFromPDF(file: File | ArrayBuffer): Promise<string> {
  try {
    const data = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group items by line roughly or join with spaces
      const items = textContent.items as any[];
      let lineText = '';
      let lastY: number | null = null;

      for (const item of items) {
        if ('str' in item) {
          const currentY = item.transform ? item.transform[5] : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
            lineText += '\n';
          }
          lineText += (item.str || '') + ' ';
          lastY = currentY;
        }
      }
      fullText += lineText + '\n--- PAGE BREAK ---\n';
    }

    return fullText;
  } catch (err) {
    console.error('Error extracting PDF text:', err);
    throw new Error('PDF 文本解析失败，请检查文件是否加密或已损坏。');
  }
}

/**
 * Parse WeChat / Alipay / Bank Statement PDF into structured transactions
 */
export function parsePDFStatementContent(
  pdfText: string,
  accounts: Account[],
  existingTransactions: Transaction[]
): ParseResult {
  const lines = pdfText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsedList: Transaction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('--- PAGE BREAK ---') || line.length < 5) continue;
    if (line.includes('微信支付') && line.includes('账单明细') && line.includes('流水')) continue;
    if (line.includes('开户行') || line.includes('打印日期') || line.includes('第') && line.includes('页')) continue;

    // Detect transaction patterns in lines
    // Pattern 1: Date (e.g. 2026-08-16 12:45:00 or 2026/08/16 or 2026-08-16)
    const dateMatch = line.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/);
    if (!dateMatch) continue;

    // Pattern 2: Amount (e.g. 16.98 or ¥16.98 or -16.98 or 16.98元)
    const amountMatches = line.match(/(?:¥|￥|\+|-)?\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/g);
    if (!amountMatches || amountMatches.length === 0) continue;

    // Find the valid numeric amount
    let detectedAmount = 0;
    let isIncome = line.includes('收入') || line.includes('贷') || line.includes('+') || line.includes('代发') || line.includes('退款');
    const isTransfer = line.includes('转账') || line.includes('中性交易');

    for (const raw of amountMatches) {
      const clean = raw.replace(/[¥￥\s\+]/g, '');
      const num = parseFloat(clean);
      if (!isNaN(num) && num > 0 && num < 1000000) {
        // Exclude year like 2026 or 2025
        if (num === 2024 || num === 2025 || num === 2026 || num === 2027) continue;
        detectedAmount = num;
        break;
      }
    }

    if (detectedAmount === 0) continue;

    const dateStr = dateMatch[0];
    
    // Extract description & counterparty
    let textPortion = line
      .replace(dateMatch[0], '')
      .replace(/[¥￥元]/g, '')
      .replace(new RegExp(`${detectedAmount}`, 'g'), '')
      .replace(/(?:商户消费|扫二维码付款|转账|微信支付|支付宝|交易成功|已扣款)/g, '')
      .trim();

    if (!textPortion) {
      textPortion = isIncome ? '收入入账' : '日常消费';
    }

    const counterparty = textPortion.slice(0, 30);
    const description = textPortion;
    const accountId = matchAccountIdByPaymentText(line, accounts);
    const category = isIncome 
      ? (counterparty.includes('工资') ? 'salary' : 'other_income')
      : detectCategory(description, counterparty);

    parsedList.push({
      id: `tx_pdf_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      date: dateStr,
      type: isIncome ? 'income' : isTransfer ? 'transfer' : 'expense',
      amount: detectedAmount,
      category: category,
      counterparty: counterparty || 'PDF账单项',
      description: description || counterparty,
      accountId: accountId,
      paymentMethodText: line.includes('中信') ? '中信银行' : line.includes('招商') ? '招商银行' : '微信/支付宝/银行卡',
      createdAt: new Date(dateStr.replace(/\//g, '-')).getTime() || Date.now(),
      source: 'statement_import'
    });
  }

  return checkDuplicates(parsedList, existingTransactions);
}
