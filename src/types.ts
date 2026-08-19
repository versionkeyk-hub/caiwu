export type AccountType = 
  | 'salary'        // 农业银行 - 工资卡
  | 'daily_expense' // 中信银行 - 日常消费卡
  | 'fixed_expense' // 招商主卡 - 固定消费与中转
  | 'savings_loan'  // 招商电子卡 - 车贷扣款与储蓄
  | 'wechat'        // 微信零钱/支付
  | 'alipay'        // 支付宝
  | 'custom';       // 其他自定义账户

export interface Account {
  id: string;
  name: string;
  bankName: string;
  bankCode?: string; // e.g. 'CITIC' | 'CMB' | 'ABC' | 'ICBC' | 'CCB' | 'BOC' | 'WECHAT' | 'ALIPAY' | 'OTHER'
  accountNumber: string;
  cardTail: string;
  type: AccountType;
  balance: number;
  isPrimarySalary?: boolean;
  isPrimary?: boolean;
  isSavingsTarget?: boolean;
  isDailyBudgetCard?: boolean;
  isFixedExpenseCard?: boolean;
  color: string;
  iconName: string;
  customLogoUrl?: string; // Compressed base64 or URL for custom user uploaded card icon
  note?: string;
  description?: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export type ExpenseCategory = 
  | 'food'           // 餐饮美食 / 吃饭
  | 'housing'        // 房租水电物业
  | 'vehicle_loan'   // 车贷固定支出
  | 'vehicle_daily'  // 车辆充电/加油/洗车/停车/ETC
  | 'pension'        // 自动养老金 / 补充养老
  | 'parents'        // 父母医保/孝敬/保险
  | 'telecom'        // 话费宽带 / 会员费
  | 'social_sec'     // 社保补充
  | 'special_proj'   // 专项改造 / 大额项目
  | 'shopping'       // 日常购物 / 美宜佳 / 淘宝拼多多
  | 'digital_ai'     // 数码科技 / 软件云服务 (智谱/腾讯云/硅基流动)
  | 'medical'        // 医疗健康 / 病历预约
  | 'gifts_human'    // 人情往来 / 份子钱 / 红包
  | 'other';         // 其他支出

export type IncomeCategory =
  | 'salary'         // 工资薪酬
  | 'refund'         // 退款
  | 'transfer_in'    // 他人转账 / 零钱提现
  | 'reimburse'      // 报销 / 违章清分 / 停车返还
  | 'other_income';  // 其他收入

export type GatewayChannel = 'wechat' | 'alipay' | 'bank_direct' | 'unionpay' | 'cash' | 'other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory | 'transfer';
  categoryLabel?: string;
  counterparty: string; // 交易对方 / 商家
  description: string;  // 商品说明 / 备注
  accountId: string;    // 支付账户 ID
  targetAccountId?: string; // 转账目标账户 ID (若为 transfer)
  paymentMethodText?: string; // 原始支付方式 (如 "中信银行储蓄卡")
  gatewayChannel?: GatewayChannel; // 出口渠道 (如微信支付/支付宝/银行直连/云闪付)
  gatewayChannelLabel?: string; // 出口渠道中文 (如 "微信支付", "支付宝", "银行直连")
  fundingAccountText?: string; // 扣款资金来源 (如 "中信银行(8362)")
  transactionId?: string; // 微信/支付宝交易单号 (用于精准去重)
  isOverBudget?: boolean; // 是否属于超额/意外支出
  overBudgetReason?: string; // 超支说明
  createdAt: number;
  source: 'wechat_import' | 'alipay_import' | 'manual' | 'statement_import';
}

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  budgetAmount: number;
  targetAccountType: AccountType; // 对应从哪张卡划扣
  isFixed: boolean; // 是否固定开支
  description?: string;
}

export interface MonthlyReviewSnapshot {
  id: string;
  month: string; // e.g. "2026-07"
  reviewDate: string; // e.g. "2026-07-18"
  salaryReceived: number;
  accountBalances: {
    abcSalary: number; // 农行工资卡
    cmbMain: number;   // 招商主卡
    citicDaily: number;// 中信日常卡
    cmbVirtualSavings: number; // 招商电子卡
    wechat: number;
    alipay: number;
    [key: string]: number;
  };
  plannedExpenses: {
    citicDailyLimit: number; // 中信限制消费 (如 2500)
    cmbFixedExpenses: number; // 招商固定消费 (如 6220)
    items: { name: string; amount: number; target: string }[];
  };
  savingsCalculated: number; // 招商储蓄分配金额
  actualTransfers: {
    id: string;
    fromAccountName: string;
    fromAccountId: string;
    toAccountName: string;
    toAccountId: string;
    amount: number;
    description: string;
    completed: boolean;
  }[];
  overbudgetItems?: {
    name: string;
    amount: number;
    account: string;
    date?: string;
    note?: string;
  }[];
  notes?: string;
  createdAt: number;
}
