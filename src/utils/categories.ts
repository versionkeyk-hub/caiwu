import { ExpenseCategory, IncomeCategory } from '../types';

export interface CategoryMeta {
  key: ExpenseCategory | IncomeCategory;
  name: string;
  type: 'expense' | 'income';
  color: string;
  bgColor: string;
  iconName: string;
  defaultCardType?: 'daily_expense' | 'fixed_expense' | 'savings_loan';
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  food: {
    key: 'food',
    name: '餐饮美食',
    type: 'expense',
    color: '#f97316', // Orange
    bgColor: '#ffedd5',
    iconName: 'Utensils',
    defaultCardType: 'daily_expense'
  },
  housing: {
    key: 'housing',
    name: '房租与生活缴费',
    type: 'expense',
    color: '#0284c7', // Sky blue
    bgColor: '#e0f2fe',
    iconName: 'Home',
    defaultCardType: 'fixed_expense'
  },
  vehicle_loan: {
    key: 'vehicle_loan',
    name: '汽车车贷',
    type: 'expense',
    color: '#8b5cf6', // Violet
    bgColor: '#ede9fe',
    iconName: 'Car',
    defaultCardType: 'savings_loan'
  },
  vehicle_daily: {
    key: 'vehicle_daily',
    name: '交通出行(ETC/充电/停车)',
    type: 'expense',
    color: '#06b6d4', // Cyan
    bgColor: '#cffafe',
    iconName: 'Fuel',
    defaultCardType: 'daily_expense'
  },
  pension: {
    key: 'pension',
    name: '自动养老金',
    type: 'expense',
    color: '#10b981', // Emerald
    bgColor: '#d1fae5',
    iconName: 'ShieldCheck',
    defaultCardType: 'fixed_expense'
  },
  parents: {
    key: 'parents',
    name: '父母医保/孝敬',
    type: 'expense',
    color: '#ec4899', // Pink
    bgColor: '#fce7f3',
    iconName: 'HeartHandshake',
    defaultCardType: 'fixed_expense'
  },
  telecom: {
    key: 'telecom',
    name: '话费与平台会员',
    type: 'expense',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    iconName: 'Smartphone',
    defaultCardType: 'fixed_expense'
  },
  social_sec: {
    key: 'social_sec',
    name: '社保补充',
    type: 'expense',
    color: '#6366f1', // Indigo
    bgColor: '#e0e7ff',
    iconName: 'FileCheck2',
    defaultCardType: 'fixed_expense'
  },
  special_proj: {
    key: 'special_proj',
    name: '专项改造/大额项目',
    type: 'expense',
    color: '#d97706', // Amber
    bgColor: '#fef3c7',
    iconName: 'Hammer',
    defaultCardType: 'daily_expense'
  },
  shopping: {
    key: 'shopping',
    name: '日常购物/超市',
    type: 'expense',
    color: '#eab308', // Yellow
    bgColor: '#fef9c3',
    iconName: 'ShoppingBag',
    defaultCardType: 'daily_expense'
  },
  digital_ai: {
    key: 'digital_ai',
    name: '数码科技/云服务/AI',
    type: 'expense',
    color: '#a855f7', // Purple
    bgColor: '#f3e8ff',
    iconName: 'Cpu',
    defaultCardType: 'fixed_expense'
  },
  medical: {
    key: 'medical',
    name: '医疗健康/门诊',
    type: 'expense',
    color: '#ef4444', // Red
    bgColor: '#fee2e2',
    iconName: 'Activity',
    defaultCardType: 'daily_expense'
  },
  gifts_human: {
    key: 'gifts_human',
    name: '人情往来/礼金红包',
    type: 'expense',
    color: '#f43f5e', // Rose
    bgColor: '#ffe4e6',
    iconName: 'Gift',
    defaultCardType: 'daily_expense'
  },
  other: {
    key: 'other',
    name: '其他支出',
    type: 'expense',
    color: '#64748b', // Slate
    bgColor: '#f1f5f9',
    iconName: 'MoreHorizontal',
    defaultCardType: 'daily_expense'
  }
};

export const INCOME_CATEGORIES: Record<IncomeCategory, CategoryMeta> = {
  salary: {
    key: 'salary',
    name: '工资薪酬',
    type: 'income',
    color: '#059669', // Green
    bgColor: '#d1fae5',
    iconName: 'Coins'
  },
  refund: {
    key: 'refund',
    name: '退款入账',
    type: 'income',
    color: '#0ea5e9', // Blue
    bgColor: '#e0f2fe',
    iconName: 'Undo2'
  },
  transfer_in: {
    key: 'transfer_in',
    name: '转账/提现入账',
    type: 'income',
    color: '#8b5cf6', // Violet
    bgColor: '#ede9fe',
    iconName: 'ArrowDownToLine'
  },
  reimburse: {
    key: 'reimburse',
    name: '报销/违章清分/返还',
    type: 'income',
    color: '#10b981', // Emerald
    bgColor: '#d1fae5',
    iconName: 'Receipt'
  },
  other_income: {
    key: 'other_income',
    name: '其他收入',
    type: 'income',
    color: '#64748b', // Slate
    bgColor: '#f1f5f9',
    iconName: 'PlusCircle'
  }
};

/**
 * Account Color map for Bank/Platform badges
 */
export const ACCOUNT_COLORS: Record<string, { bg: string; text: string; border: string; label: string; ringColor: string }> = {
  salary: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-700', label: '农行工资卡', ringColor: '#059669' },
  daily_expense: { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-700', label: '中信消费卡', ringColor: '#e11d48' },
  fixed_expense: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-700', label: '招商主卡', ringColor: '#2563eb' },
  savings_loan: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-700', label: '招商电子卡', ringColor: '#9333ea' },
  wechat: { bg: 'bg-green-950/80', text: 'text-green-300', border: 'border-green-700', label: '微信支付', ringColor: '#16a34a' },
  alipay: { bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-700', label: '支付宝', ringColor: '#0284c7' },
  custom: { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700', label: '银行卡', ringColor: '#64748b' }
};

export function detectCategory(text: string, counterparty: string = ''): ExpenseCategory | IncomeCategory {
  const query = (text + ' ' + counterparty).toLowerCase();

  // Income patterns
  if (query.includes('工资') || query.includes('代发') || query.includes('薪酬') || query.includes('奖金')) return 'salary';
  if (query.includes('退款') || query.includes('退费') || query.includes('退回')) return 'refund';
  if (query.includes('提现') || query.includes('零钱提现')) return 'transfer_in';
  if (query.includes('违章清分') || query.includes('报销') || query.includes('返还') || query.includes('停车费返还') || query.includes('押金退还')) return 'reimburse';

  // Expense patterns - ETC & Transportation
  if (query.includes('etc') || query.includes('粤通卡') || query.includes('高速公路') || query.includes('通行费') || query.includes('路桥费') || query.includes('etc助手') || query.includes('高速扣费') || query.includes('充电') || query.includes('小桔') || query.includes('云快充') || query.includes('特来电') || query.includes('星星充电') || query.includes('停车') || query.includes('捷停车') || query.includes('加油') || query.includes('中石化') || query.includes('中石油') || query.includes('洗车') || query.includes('保养') || query.includes('补胎') || query.includes('车位') || query.includes('滴滴') || query.includes('打车') || query.includes('高德打车') || query.includes('出行') || query.includes('公交') || query.includes('地铁')) {
    return 'vehicle_daily';
  }

  // Loans & Fixed Bills
  if (query.includes('车贷') || query.includes('汽车金融') || query.includes('车贷还款')) return 'vehicle_loan';
  if (query.includes('房租') || query.includes('同方物业') || query.includes('房东') || query.includes('水电') || query.includes('电费') || query.includes('水费') || query.includes('燃气') || query.includes('物业管理') || query.includes('对面楼')) return 'housing';
  if (query.includes('养老金') || query.includes('养老保险') || query.includes('定投') || query.includes('个人养老')) return 'pension';
  if (query.includes('社保') || query.includes('公积金')) return 'social_sec';
  if (query.includes('医保') || query.includes('父母') || query.includes('爸妈') || query.includes('惠民保') || query.includes('商业保险') || query.includes('平安保险') || query.includes('太平洋')) return 'parents';
  if (query.includes('话费') || query.includes('移动') || query.includes('联通') || query.includes('电信') || query.includes('腾讯视频') || query.includes('网易云') || query.includes('爱奇艺') || query.includes('百度网盘') || query.includes('会员') || query.includes('宽带')) return 'telecom';

  // Tech / AI / Server
  if (query.includes('硅基流动') || query.includes('siliconflow') || query.includes('腾讯云') || query.includes('阿里云') || query.includes('华为云') || query.includes('智谱') || query.includes('chatgpt') || query.includes('openai') || query.includes('api') || query.includes('服务器') || query.includes('域名') || query.includes('软慧科技') || query.includes('链动万商')) return 'digital_ai';

  // Special project / Furnishing
  if (query.includes('阳台') || query.includes('装修') || query.includes('瓷砖') || query.includes('牛粪') || query.includes('基质') || query.includes('改造') || query.includes('微波炉') || query.includes('沙发') || query.includes('家具') || query.includes('家电') || query.includes('露营')) return 'special_proj';

  // Medical
  if (query.includes('病历') || query.includes('医院') || query.includes('挂号') || query.includes('门诊') || query.includes('药房') || query.includes('大药房') || query.includes('健康') || query.includes('诊所')) return 'medical';

  // Gift & Red Packets
  if (query.includes('礼金') || query.includes('结婚') || query.includes('红包') || query.includes('份子钱') || query.includes('转账-转给')) return 'gifts_human';

  // Food & Dining
  if (query.includes('餐馆') || query.includes('水饺') || query.includes('早饭') || query.includes('包德欢') || query.includes('烧鹅') || query.includes('美团外卖') || query.includes('饿了么') || query.includes('麦当劳') || query.includes('肯德基') || query.includes('麻辣烫') || query.includes('火锅') || query.includes('牛肉') || query.includes('猪脚饭') || query.includes('吃饭') || query.includes('熟食') || query.includes('饭店') || query.includes('面馆') || query.includes('咖啡') || query.includes('奶茶') || query.includes('瑞幸') || query.includes('星巴克')) return 'food';

  // Shopping & Groceries
  if (query.includes('美宜佳') || query.includes('百佳华') || query.includes('淘宝') || query.includes('天猫') || query.includes('拼多多') || query.includes('京东') || query.includes('超市') || query.includes('百货') || query.includes('水果') || query.includes('菜档') || query.includes('便利店') || query.includes('日用品') || query.includes('购物') || query.includes('纸巾') || query.includes('屈臣氏')) return 'shopping';

  return 'food';
}
