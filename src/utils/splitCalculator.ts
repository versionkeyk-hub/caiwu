import { Account, BudgetItem, MonthlyReviewSnapshot } from '../types';

export interface SplitInput {
  month: string; // e.g. "2026-08"
  reviewDate: string; // e.g. "2026-08-18"
  abcSalaryBalance: number;     // 农业银行工资卡余额 (含当月发放工资)
  cmbMainBalance: number;       // 招商主卡7827当前余额
  citicDailyBalance: number;    // 中信日常消费卡8362当前余额
  cmbVirtualBalance: number;    // 招商电子卡5903当前储蓄/车贷余额
  wechatBalance: number;        // 微信零钱余额
  alipayBalance: number;        // 支付宝余额
  citicPlannedBudget: number;   // 中信限制消费预算 (默认 2500)
  fixedBudgets: { name: string; amount: number; target: string; isCarLoan?: boolean }[];
  overspendingNotes?: { name: string; amount: number; account: string; date?: string; note?: string }[];
  refundItems?: { name: string; amount: number; note?: string }[];
}

export interface SplitCalculationResult {
  month: string;
  reviewDate: string;
  totalAvailablePool: number;   // 总可支配资金池 = 农行 + 招商主 + 中信
  plannedCiticTotal: number;    // 中信日常消费限额
  plannedFixedTotal: number;    // 招商固定消费总计 (含车贷2900、房租1680、养老1000等)
  plannedTotalExpense: number;  // 计划总支出 = 中信限额 + 招商固定
  totalRefunds: number;         // 超额返还/进账
  calculatedSavings: number;    // 最终计算出的储蓄额 = 资金池 + 返还 - 计划总支出
  transfers: {
    step: number;
    title: string;
    fromAccountName: string;
    fromAccountNumber: string;
    toAccountName: string;
    toAccountNumber: string;
    amount: number;
    formulaText: string;
    purpose: string;
    completed: boolean;
  }[];
  summaryText: string;
}

export function calculateMonthlySplit(
  input: SplitInput,
  accounts: Account[]
): SplitCalculationResult {
  const abcAccount = accounts.find(a => a.type === 'salary') || accounts[0];
  const citicAccount = accounts.find(a => a.type === 'daily_expense') || accounts[1];
  const cmbMainAccount = accounts.find(a => a.type === 'fixed_expense') || accounts[2];
  const cmbVirtualAccount = accounts.find(a => a.type === 'savings_loan') || accounts[3];

  // 1. Total available pool in core bank accounts
  const totalAvailablePool = 
    (input.abcSalaryBalance || 0) + 
    (input.cmbMainBalance || 0) + 
    (input.citicDailyBalance || 0);

  // 2. Fixed expenses sum
  const plannedFixedTotal = input.fixedBudgets.reduce((sum, item) => sum + (item.amount || 0), 0);
  const plannedCiticTotal = input.citicPlannedBudget || 2500;
  const plannedTotalExpense = plannedCiticTotal + plannedFixedTotal;

  // 3. Refunds / extra inflows
  const totalRefunds = (input.refundItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);

  // 4. Savings allocation
  // 公式: 工资卡余额 + 招商余额 + 中信余额 + 返还 - 计划总支出
  const calculatedSavings = Math.max(0, totalAvailablePool + totalRefunds - plannedTotalExpense);

  // 5. Transfer Orders (3-Step Golden Flow)
  // 步骤 1: 农行工资卡 ➔ 招商主卡(7827)
  // 转入招商 = 储蓄分配 + 固定消费 - 招商当前余额
  const transferToCmbMainAmount = Math.max(
    0,
    calculatedSavings + plannedFixedTotal - (input.cmbMainBalance || 0)
  );

  // 步骤 2: 招商主卡(7827) ➔ 招商电子卡/车贷储蓄(5903)
  // 转入招行储蓄卡也就是车贷卡 = 储蓄分配额 (车贷2900留在主卡或打入电子卡)
  const transferToCmbVirtualAmount = calculatedSavings;

  // 步骤 3: 农行工资卡 ➔ 中信日常消费卡(8362)
  // 转入中信 = 预算限额 - 中信当前余额
  const transferToCiticAmount = Math.max(
    0,
    plannedCiticTotal - (input.citicDailyBalance || 0)
  );

  const transfers = [
    {
      step: 1,
      title: '第一步：农行工资卡 ➔ 招商主卡 (中转与固定消费准备)',
      fromAccountName: abcAccount.name,
      fromAccountNumber: abcAccount.accountNumber,
      toAccountName: cmbMainAccount.name,
      toAccountNumber: cmbMainAccount.accountNumber,
      amount: Math.round(transferToCmbMainAmount * 100) / 100,
      formulaText: `转入招商 = 储蓄分配(¥${calculatedSavings}) + 固定消费(¥${plannedFixedTotal}) - 招商余额(¥${input.cmbMainBalance})`,
      purpose: '为固定开支（房租、养老金、保险）及电子卡储蓄准备资金池',
      completed: false
    },
    {
      step: 2,
      title: '第二步：招商主卡 ➔ 招商电子卡 (车贷与核心储蓄归集)',
      fromAccountName: cmbMainAccount.name,
      fromAccountNumber: cmbMainAccount.accountNumber,
      toAccountName: cmbVirtualAccount.name,
      toAccountNumber: cmbVirtualAccount.accountNumber,
      amount: Math.round(transferToCmbVirtualAmount * 100) / 100,
      formulaText: `转入招行储蓄卡(电子卡) = 储蓄结余分配 ¥${calculatedSavings}`,
      purpose: '存入不可直接收款的电子卡，用于车贷自动扣款与强制储蓄',
      completed: false
    },
    {
      step: 3,
      title: '第三步：农行工资卡 ➔ 中信消费卡 (日常消费额度注入)',
      fromAccountName: abcAccount.name,
      fromAccountNumber: abcAccount.accountNumber,
      toAccountName: citicAccount.name,
      toAccountNumber: citicAccount.accountNumber,
      amount: Math.round(transferToCiticAmount * 100) / 100,
      formulaText: `转入中信 = 消费限额(¥${plannedCiticTotal}) - 中信现有余额(¥${input.citicDailyBalance})`,
      purpose: '补充本月生活费/餐饮/日常非固定消费可用额度',
      completed: false
    }
  ];

  const summaryText = `本次复盘总资金池 ¥${totalAvailablePool.toFixed(2)}，计划总支出 ¥${plannedTotalExpense.toFixed(2)}（中信日常限额 ¥${plannedCiticTotal} + 招商固定消费 ¥${plannedFixedTotal}），成功锁定结余储蓄 ¥${calculatedSavings.toFixed(2)}。需执行3笔卡间转账完成分账闭环。`;

  return {
    month: input.month,
    reviewDate: input.reviewDate,
    totalAvailablePool,
    plannedCiticTotal,
    plannedFixedTotal,
    plannedTotalExpense,
    totalRefunds,
    calculatedSavings,
    transfers,
    summaryText
  };
}
