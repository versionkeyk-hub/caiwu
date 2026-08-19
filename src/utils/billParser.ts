import { Transaction, Account } from '../types';
import { detectCategory } from './categories';

export interface ParseResult {
  transactions: Transaction[];
  duplicates: DuplicateMatch[];
  totalParsed: number;
  totalNew: number;
  totalDuplicates: number;
}

export interface DuplicateMatch {
  incoming: Transaction;
  existing: Transaction;
  reason: string;
  confidence: 'high' | 'medium';
}

/**
 * Match account ID by payment method text (e.g. "中信银行储蓄卡", "招商银行储蓄卡", "零钱", "农业银行")
 */
export function matchAccountIdByPaymentText(paymentText: string, accounts: Account[]): string {
  const text = (paymentText || '').toLowerCase();
  
  if (text.includes('中信') || text.includes('8362')) {
    const acc = accounts.find(a => a.type === 'daily_expense' || a.cardTail === '8362');
    if (acc) return acc.id;
  }
  if (text.includes('5903') || text.includes('电子卡') || text.includes('虚拟卡') || text.includes('车贷卡')) {
    const acc = accounts.find(a => a.type === 'savings_loan' || a.cardTail === '5903');
    if (acc) return acc.id;
  }
  if (text.includes('招商') || text.includes('7827')) {
    const acc = accounts.find(a => a.type === 'fixed_expense' || a.cardTail === '7827');
    if (acc) return acc.id;
  }
  if (text.includes('农行') || text.includes('农业') || text.includes('6163')) {
    const acc = accounts.find(a => a.type === 'salary' || a.cardTail === '6163');
    if (acc) return acc.id;
  }
  if (text.includes('支付宝') || text.includes('余额宝') || text.includes('花呗')) {
    const acc = accounts.find(a => a.type === 'alipay');
    if (acc) return acc.id;
  }
  if (text.includes('零钱') || text.includes('微信') || text.includes('财付通')) {
    const acc = accounts.find(a => a.type === 'wechat');
    if (acc) return acc.id;
  }

  // Default fallback to CITIC (daily card) or first account
  const defaultAcc = accounts.find(a => a.type === 'daily_expense') || accounts[0];
  return defaultAcc ? defaultAcc.id : 'acc_citic_daily';
}

/**
 * Clean and parse CSV text from WeChat / Alipay
 */
export function parseWeChatOrAlipayCSV(
  csvContent: string,
  accounts: Account[],
  existingTransactions: Transaction[]
): ParseResult {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsedList: Transaction[] = [];

  // Find header index
  let headerIndex = -1;
  let isAlipay = false;

  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    if (line.includes('微信支付账单明细') || (line.includes('交易时间') && line.includes('交易类型') && line.includes('金额(元)'))) {
      headerIndex = i;
      isAlipay = false;
      break;
    }
    if (line.includes('支付宝') || (line.includes('交易时间') && line.includes('交易分类') && line.includes('对方账号'))) {
      headerIndex = i;
      isAlipay = true;
      break;
    }
  }

  if (headerIndex === -1) {
    // Try to find any line with "交易时间"
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      if (lines[i].includes('交易时间')) {
        headerIndex = i;
        break;
      }
    }
  }

  const startLine = headerIndex >= 0 ? headerIndex + 1 : 0;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    // Skip empty or summary lines
    if (!line || line.startsWith('-----') || line.startsWith('注：') || line.startsWith('共') || line.includes('总支出')) {
      continue;
    }

    // Split CSV cells considering quotes
    const cells = splitCSVLine(line);
    if (cells.length < 5) continue;

    try {
      if (!isAlipay) {
        // WeChat format: 交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态,交易单号,商户单号,备注
        const dateStr = cells[0]?.replace(/"/g, '').trim() || new Date().toISOString().slice(0, 19).replace('T', ' ');
        const transType = cells[1]?.replace(/"/g, '').trim() || '';
        const counterparty = cells[2]?.replace(/"/g, '').trim() || '未知商户';
        const description = cells[3]?.replace(/"/g, '').trim() || transType;
        const incomeExpense = cells[4]?.replace(/"/g, '').trim() || '';
        const rawAmountStr = cells[5]?.replace(/[¥,"]/g, '').trim() || '0';
        const amount = parseFloat(rawAmountStr) || 0;
        const paymentMethod = cells[6]?.replace(/"/g, '').trim() || '';
        const status = cells[7]?.replace(/"/g, '').trim() || '';
        const transactionId = cells[8]?.replace(/[\t"]/g, '').trim() || '';

        // Skip refund records or failed states if necessary
        if (status.includes('退款') && incomeExpense === '支出') {
          // refunded
        }

        const isIncome = incomeExpense.includes('收入') || transType.includes('收入');
        const isTransfer = incomeExpense.includes('中性') || transType.includes('转账');

        const category = isIncome 
          ? (counterparty.includes('工资') ? 'salary' : 'transfer_in')
          : detectCategory(description, counterparty);

        const accountId = matchAccountIdByPaymentText(paymentMethod, accounts);

        parsedList.push({
          id: `tx_imp_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          date: dateStr,
          type: isIncome ? 'income' : isTransfer ? 'transfer' : 'expense',
          amount: Math.abs(amount),
          category: category,
          categoryLabel: isIncome ? '收入' : undefined,
          counterparty: counterparty,
          description: description || counterparty,
          accountId: accountId,
          paymentMethodText: paymentMethod,
          gatewayChannel: 'wechat',
          gatewayChannelLabel: '微信支付',
          fundingAccountText: paymentMethod || '中信银行(8362)',
          transactionId: transactionId || undefined,
          createdAt: parseDateToTimestamp(dateStr),
          source: 'wechat_import'
        });
      } else {
        // Alipay format
        const dateStr = cells[0]?.replace(/"/g, '').trim();
        const categoryStr = cells[1]?.replace(/"/g, '').trim();
        const counterparty = cells[2]?.replace(/"/g, '').trim() || '未知商户';
        const description = cells[4]?.replace(/"/g, '').trim() || categoryStr;
        const incomeExpense = cells[5]?.replace(/"/g, '').trim() || '';
        const rawAmountStr = cells[6]?.replace(/[¥,"]/g, '').trim() || '0';
        const amount = parseFloat(rawAmountStr) || 0;
        const paymentMethod = cells[7]?.replace(/"/g, '').trim() || '';
        const transactionId = cells[9]?.replace(/[\t"]/g, '').trim() || '';

        const isIncome = incomeExpense.includes('收入');
        const category = isIncome ? 'other_income' : detectCategory(description + ' ' + categoryStr, counterparty);
        const accountId = matchAccountIdByPaymentText(paymentMethod, accounts);

        parsedList.push({
          id: `tx_imp_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          date: dateStr || new Date().toISOString().slice(0, 19).replace('T', ' '),
          type: isIncome ? 'income' : 'expense',
          amount: Math.abs(amount),
          category: category,
          counterparty: counterparty,
          description: description || counterparty,
          accountId: accountId,
          paymentMethodText: paymentMethod,
          gatewayChannel: 'alipay',
          gatewayChannelLabel: '支付宝',
          fundingAccountText: paymentMethod || '余额宝/快捷卡',
          transactionId: transactionId || undefined,
          createdAt: parseDateToTimestamp(dateStr),
          source: 'alipay_import'
        });
      }
    } catch {
      // Continue parsing next line
    }
  }

  // Deduplication check
  return checkDuplicates(parsedList, existingTransactions);
}

/**
 * Intelligent Smart Text Parser (Parses unstructured text, screenshot OCR dumps, or manual notes)
 */
export function parseSmartTextBills(
  rawText: string,
  accounts: Account[],
  existingTransactions: Transaction[]
): ParseResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsedList: Transaction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip separators
    if (line.startsWith('---') || line.startsWith('===') || line.length < 2) continue;

    // Pattern: 2026-08-16 12:45 美宜佳 16.8 中信
    // Or: 08-16 美宜佳 16.8
    // Or: 房租1680
    // Or: 小桔充电 -51.54
    const amountMatch = line.match(/(?:¥|￥|\+|-)?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:元)?/);
    if (!amountMatch) continue;

    const amount = parseFloat(amountMatch[1]);
    if (isNaN(amount) || amount === 0) continue;

    // Check date pattern
    const dateMatch = line.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)|(\d{1,2}[-/.]\d{1,2}(?:\s+\d{1,2}:\d{2})?)/);
    let dateStr = '';
    if (dateMatch) {
      dateStr = dateMatch[0];
      if (dateStr.length <= 5) {
        dateStr = `2026-${dateStr.replace('.', '-')}`;
      }
    } else {
      dateStr = new Date().toISOString().slice(0, 10);
    }

    // Is income
    const isIncome = line.includes('收入') || line.includes('工资') || line.includes('退款') || line.includes('+');

    // Extract counterparty/description
    let textClean = line
      .replace(amountMatch[0], '')
      .replace(dateMatch ? dateMatch[0] : '', '')
      .replace(/[¥￥元支出收入已支付已转账]/g, '')
      .trim();

    if (!textClean) textClean = '日常开销';

    const accountId = matchAccountIdByPaymentText(line, accounts);
    const category = isIncome ? (textClean.includes('工资') ? 'salary' : 'other_income') : detectCategory(textClean, textClean);

    parsedList.push({
      id: `tx_smart_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      date: dateStr,
      type: isIncome ? 'income' : 'expense',
      amount: amount,
      category: category,
      counterparty: textClean.slice(0, 20),
      description: textClean,
      accountId: accountId,
      paymentMethodText: line.includes('中信') ? '中信银行' : line.includes('招商') ? '招商银行' : '微信支付',
      createdAt: parseDateToTimestamp(dateStr),
      source: 'manual'
    });
  }

  return checkDuplicates(parsedList, existingTransactions);
}

/**
 * Deduplication Engine
 */
export function checkDuplicates(
  incoming: Transaction[],
  existing: Transaction[]
): ParseResult {
  const duplicates: DuplicateMatch[] = [];
  const uniqueItems: Transaction[] = [];

  for (const item of incoming) {
    let isDupe = false;

    for (const ex of existing) {
      // Rule 1: Exact transaction ID match
      if (item.transactionId && ex.transactionId && item.transactionId === ex.transactionId) {
        duplicates.push({
          incoming: item,
          existing: ex,
          reason: `完全匹配微信/支付宝交易单号 (${item.transactionId})`,
          confidence: 'high'
        });
        isDupe = true;
        break;
      }

      // Rule 2: Same amount, same day, and same counterparty / payment account
      const sameAmount = Math.abs(item.amount - ex.amount) < 0.001;
      const sameDateDay = item.date.slice(0, 10) === ex.date.slice(0, 10);
      const sameMerchant = item.counterparty.includes(ex.counterparty) || ex.counterparty.includes(item.counterparty);

      if (sameAmount && sameDateDay && sameMerchant) {
        duplicates.push({
          incoming: item,
          existing: ex,
          reason: `同一日期 (${item.date.slice(0, 10)}) 同一商户 [${item.counterparty}] 相同金额 (¥${item.amount.toFixed(2)})`,
          confidence: 'high'
        });
        isDupe = true;
        break;
      }
    }

    if (!isDupe) {
      uniqueItems.push(item);
    }
  }

  return {
    transactions: uniqueItems,
    duplicates,
    totalParsed: incoming.length,
    totalNew: uniqueItems.length,
    totalDuplicates: duplicates.length
  };
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDateToTimestamp(dateStr: string): number {
  try {
    const clean = (dateStr || '').replace(/\//g, '-');
    const parsed = new Date(clean).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  } catch {
    return Date.now();
  }
}
