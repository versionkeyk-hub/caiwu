import { Account, BudgetItem, MonthlyReviewSnapshot, Transaction } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_abc_salary',
    name: '农业银行 (工资卡)',
    bankName: '中国农业银行',
    bankCode: 'ABC',
    accountNumber: '6228230127223626163',
    cardTail: '6163',
    type: 'salary',
    balance: 11250.00,
    isPrimarySalary: true,
    color: '#009072', // Authentic ABC Green
    iconName: 'Building2',
    note: '每月15号左右接收工资，每月18号分账发源地'
  },
  {
    id: 'acc_citic_daily',
    name: '中信银行 (日常消费卡)',
    bankName: '中信银行',
    bankCode: 'CITIC',
    accountNumber: '6217734705378362',
    cardTail: '8362',
    type: 'daily_expense',
    balance: 850.50,
    isDailyBudgetCard: true,
    color: '#d62027', // Authentic CITIC Red
    iconName: 'ShoppingBag',
    note: '日常非固定消费卡（餐饮生活费/日常杂销），每月预算限额 ¥2,500'
  },
  {
    id: 'acc_cmb_main',
    name: '招商银行 (固定消费主卡)',
    bankName: '招商银行',
    bankCode: 'CMB',
    accountNumber: '6214830033227827',
    cardTail: '7827',
    type: 'fixed_expense',
    balance: 2460.00,
    isFixedExpenseCard: true,
    color: '#df0012', // Authentic CMB Red
    iconName: 'CreditCard',
    note: '固定消费扣款卡（房租水电/养老金/保险/话费）与转账中转枢纽'
  },
  {
    id: 'acc_cmb_virtual',
    name: '招商银行 (电子卡/车贷储蓄)',
    bankName: '招商银行',
    bankCode: 'CMB',
    accountNumber: '6212760430155903',
    cardTail: '5903',
    type: 'savings_loan',
    balance: 28560.00,
    isSavingsTarget: true,
    color: '#7c3aed', // Purple
    iconName: 'Landmark',
    note: '车贷自动扣款(¥2900/月)与核心储蓄账户。注：需从招商7827主卡中转存入'
  },
  {
    id: 'acc_wechat',
    name: '微信支付 / 零钱',
    bankName: '微信支付',
    bankCode: 'WECHAT',
    accountNumber: 'wechat_pay_01',
    cardTail: '零钱',
    type: 'wechat',
    balance: 680.20,
    color: '#07c160', // Authentic WeChat Green
    iconName: 'Smartphone',
    note: '日常微信扫码/红包/零钱渠道'
  },
  {
    id: 'acc_alipay',
    name: '支付宝 / 余额宝',
    bankName: '支付宝',
    bankCode: 'ALIPAY',
    accountNumber: 'alipay_pay_01',
    cardTail: '余额',
    type: 'alipay',
    balance: 420.00,
    color: '#1677ff', // Authentic Alipay Blue
    iconName: 'Wallet',
    note: '日常支付宝网购/出行支付渠道'
  }
];

export const INITIAL_BUDGETS: BudgetItem[] = [
  // 中信日常限制消费预算
  {
    id: 'b_food',
    category: 'food',
    name: '日常吃饭 / 餐饮外卖',
    budgetAmount: 1500,
    targetAccountType: 'daily_expense',
    isFixed: false,
    description: '中信卡日常限额主要组成部分'
  },
  {
    id: 'b_daily_living',
    category: 'shopping',
    name: '其他日常消费 / 备用金',
    budgetAmount: 1000,
    targetAccountType: 'daily_expense',
    isFixed: false,
    description: '日用百货/零食/临时开销'
  },
  // 招商固定消费预算
  {
    id: 'b_car_loan',
    category: 'vehicle_loan',
    name: '车辆贷款 (车贷自动扣款)',
    budgetAmount: 2900,
    targetAccountType: 'savings_loan',
    isFixed: true,
    description: '每月招商电子卡固定自动划扣'
  },
  {
    id: 'b_rent_water',
    category: 'housing',
    name: '房租及水电管理费',
    budgetAmount: 1680,
    targetAccountType: 'fixed_expense',
    isFixed: true,
    description: '每月固定房租及水电费'
  },
  {
    id: 'b_pension',
    category: 'pension',
    name: '自动养老金 / 补充储备',
    budgetAmount: 1000,
    targetAccountType: 'fixed_expense',
    isFixed: true,
    description: '每月固定养老储备'
  },
  {
    id: 'b_social_sec',
    category: 'social_sec',
    name: '社保补充 / 公积金补充',
    budgetAmount: 330,
    targetAccountType: 'fixed_expense',
    isFixed: true,
    description: '社保补充每月固定'
  },
  {
    id: 'b_parents_insurance',
    category: 'parents',
    name: '父母医保与商业保险',
    budgetAmount: 160,
    targetAccountType: 'fixed_expense',
    isFixed: true,
    description: '父母医保(65+65)及健康保障'
  },
  {
    id: 'b_telecom_member',
    category: 'telecom',
    name: '手机话费与平台会员',
    budgetAmount: 150,
    targetAccountType: 'fixed_expense',
    isFixed: true,
    description: '话费100元 + 各平台会员50元'
  },
  {
    id: 'b_car_daily',
    category: 'vehicle_daily',
    name: '车辆日常 (充电/洗车/停车/ETC)',
    budgetAmount: 300,
    targetAccountType: 'daily_expense',
    isFixed: false,
    description: '小桔充电/云快充/捷停车等'
  }
];

export const INITIAL_HISTORICAL_SNAPSHOTS: MonthlyReviewSnapshot[] = [
  {
    id: 'snap_2026_08',
    month: '2026-08',
    reviewDate: '2026-08-18',
    salaryReceived: 11250.00,
    accountBalances: {
      abcSalary: 11250.00,
      cmbMain: 2460.00,
      citicDaily: 0.00,
      cmbVirtualSavings: 28560.00,
      wechat: 580.00,
      alipay: 360.00
    },
    plannedExpenses: {
      citicDailyLimit: 2500,
      cmbFixedExpenses: 6220,
      items: [
        { name: '中信日常限制消费 (吃饭1500+其他1000)', amount: 2500, target: '中信日常卡' },
        { name: '车贷固定扣款', amount: 2900, target: '招商电子卡' },
        { name: '房租水电及物业', amount: 1680, target: '招商主卡' },
        { name: '自动养老金定投', amount: 1000, target: '招商主卡' },
        { name: '社保补充', amount: 330, target: '招商主卡' },
        { name: '父母医保与健康保障', amount: 160, target: '招商主卡' },
        { name: '手机话费与平台会员', amount: 150, target: '招商主卡' }
      ]
    },
    savingsCalculated: 4990.00, // 11250 + 2460 - 8720 = 4990
    actualTransfers: [
      {
        id: 't_202608_1',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '招商银行 (固定消费主卡7827)',
        toAccountId: 'acc_cmb_main',
        amount: 8750.00,
        description: '转入招商 = 储蓄分配(4990) + 固定消费(6220) - 招商余额(2460) = ¥8,750',
        completed: true
      },
      {
        id: 't_202608_2',
        fromAccountName: '招商银行 (固定消费主卡7827)',
        fromAccountId: 'acc_cmb_main',
        toAccountName: '招商银行 (电子卡/车贷储蓄5903)',
        toAccountId: 'acc_cmb_virtual',
        amount: 4990.00,
        description: '从招商主卡转入电子卡核心储蓄账户 = ¥4,990',
        completed: true
      },
      {
        id: 't_202608_3',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '中信银行 (日常消费卡8362)',
        toAccountId: 'acc_citic_daily',
        amount: 2500.00,
        description: '转入中信日常消费限额 = 预算(2500) - 当前余额(0) = ¥2,500',
        completed: true
      }
    ],
    overbudgetItems: [
      { name: '水果便利店采购', amount: 48, account: '中信卡', date: '08-16', note: '日常零食水果' }
    ],
    notes: '8月18号复盘：本月工资11250到账，扣除日常预算2500与固定支出6220后，净锁定储蓄4990元转入招商电子卡，三笔转账指令全部执行完毕！',
    createdAt: new Date('2026-08-18').getTime()
  },
  {
    id: 'snap_2026_07',
    month: '2026-07',
    reviewDate: '2026-07-18',
    salaryReceived: 11226.00,
    accountBalances: {
      abcSalary: 11226.00,
      cmbMain: 9711.00,
      citicDaily: 0.00,
      cmbVirtualSavings: 28560.00,
      wechat: 580.00,
      alipay: 360.00
    },
    plannedExpenses: {
      citicDailyLimit: 2500,
      cmbFixedExpenses: 6220,
      items: [
        { name: '中信日常限制消费 (吃饭1500+其他1000)', amount: 2500, target: '中信日常卡' },
        { name: '车贷', amount: 2900, target: '招商电子卡' },
        { name: '房租水电', amount: 1680, target: '招商主卡' },
        { name: '养老保险', amount: 1000, target: '招商主卡' },
        { name: '社保补充', amount: 330, target: '招商主卡' },
        { name: '父母保险', amount: 160, target: '招商主卡' },
        { name: '话费会员费', amount: 150, target: '招商主卡' }
      ]
    },
    savingsCalculated: 12217.00, // 11226 + 9711 + 0 - 8720 = 12217
    actualTransfers: [
      {
        id: 't_202607_1',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '招商银行 (固定消费主卡7827)',
        toAccountId: 'acc_cmb_main',
        amount: 8726.00, // 12217 + 6220 - 9711 = 8726
        description: '转入招商 = 储蓄分配(12217) + 固定消费(6220) - 招商余额(9711) = ¥8,726',
        completed: true
      },
      {
        id: 't_202607_2',
        fromAccountName: '招商银行 (固定消费主卡7827)',
        fromAccountId: 'acc_cmb_main',
        toAccountName: '招商银行 (电子卡/车贷储蓄5903)',
        toAccountId: 'acc_cmb_virtual',
        amount: 12217.00,
        description: '从招商主卡转入电子卡核心储蓄账户 = ¥12,217',
        completed: true
      },
      {
        id: 't_202607_3',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '中信银行 (日常消费卡8362)',
        toAccountId: 'acc_citic_daily',
        amount: 2420.00, // 2420 - 0 = 2420
        description: '转入中信日常消费限额 = 预算(2420) - 当前余额(0) = ¥2,420',
        completed: true
      }
    ],
    overbudgetItems: [
      { name: '拼一箱纸', amount: 33, account: '招商卡', date: '06-18', note: '日常用品超支' },
      { name: '打车去火车站', amount: 90, account: '招商卡', date: '06-19', note: '出行超支' },
      { name: '智谱 AI 算力会员', amount: 118, account: '招商卡', date: '07-05', note: '生产力工具支出' },
      { name: '生活费追加 (招商转中信)', amount: 500, account: '中信卡', date: '07-10', note: '餐饮生活费超出预算追加' }
    ],
    notes: '7月复盘：招商卡结余较多(9711元)，储蓄创纪录达12217元；上月超支有返还入账(停车费400+违章清分500+提现1100)。',
    createdAt: new Date('2026-07-18').getTime()
  },
  {
    id: 'snap_2026_06',
    month: '2026-06',
    reviewDate: '2026-06-17',
    salaryReceived: 11231.00,
    accountBalances: {
      abcSalary: 11231.00,
      cmbMain: 1551.00,
      citicDaily: 245.00,
      cmbVirtualSavings: 16343.00,
      wechat: 450.00,
      alipay: 280.00
    },
    plannedExpenses: {
      citicDailyLimit: 2500,
      cmbFixedExpenses: 6220,
      items: [
        { name: '中信日常限制消费', amount: 2500, target: '中信日常卡' },
        { name: '招商固定消费合计', amount: 6220, target: '招商主卡' }
      ]
    },
    savingsCalculated: 4307.00, // 11231 + 1551 + 245 - 8720 = 4307
    actualTransfers: [
      {
        id: 't_202606_1',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '招商银行 (固定消费主卡7827)',
        toAccountId: 'acc_cmb_main',
        amount: 8977.00, // 4307 + 6220 - 1550 = 8977
        description: '转入招商 = 储蓄(4307) + 固定消费(6220) - 招商余额(1551) = ¥8,977',
        completed: true
      },
      {
        id: 't_202606_2',
        fromAccountName: '招商银行 (固定消费主卡7827)',
        fromAccountId: 'acc_cmb_main',
        toAccountName: '招商银行 (电子卡/车贷储蓄5903)',
        toAccountId: 'acc_cmb_virtual',
        amount: 4307.00,
        description: '从招商主卡转入电子卡储蓄 = ¥4,307',
        completed: true
      },
      {
        id: 't_202606_3',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '中信银行 (日常消费卡8362)',
        toAccountId: 'acc_citic_daily',
        amount: 2252.00, // 2500 - 248 = 2252
        description: '转入中信日常消费限额 = 预算(2500) - 余额(248) = ¥2,252',
        completed: true
      }
    ],
    overbudgetItems: [
      { name: '拼一箱纸', amount: 33, account: '招商卡', date: '06-18' },
      { name: '打车火车站', amount: 90, account: '招商卡', date: '06-19' }
    ],
    notes: '6月复盘：分账顺利执行，储蓄4307元。',
    createdAt: new Date('2026-06-17').getTime()
  },
  {
    id: 'snap_2026_04',
    month: '2026-04',
    reviewDate: '2026-04-18',
    salaryReceived: 11200.00,
    accountBalances: {
      abcSalary: 11200.00,
      cmbMain: 814.00,
      citicDaily: 0.00,
      cmbVirtualSavings: 12036.00,
      wechat: 320.00,
      alipay: 190.00
    },
    plannedExpenses: {
      citicDailyLimit: 5043,
      cmbFixedExpenses: 2900,
      items: [
        { name: '吃饭', amount: 1500, target: '中信日常卡' },
        { name: '其他消费 (含父母保险158)', amount: 1000, target: '中信日常卡' },
        { name: '阳台改造专项 (实际存入263)', amount: 1000, target: '中信日常卡' },
        { name: '五一同学结婚礼金', amount: 600, target: '中信日常卡' },
        { name: '房租', amount: 1680, target: '中信日常卡' },
        { name: '车贷', amount: 2900, target: '招商电子卡' }
      ]
    },
    savingsCalculated: 4071.00, // 11200 + 814 - 7943 = 4071
    actualTransfers: [
      {
        id: 't_202604_1',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '招商银行 (固定消费主卡7827)',
        toAccountId: 'acc_cmb_main',
        amount: 6157.00,
        description: '转入招商 = 储蓄(4071) + 车贷(2900) - 招商余额(814) = ¥6,157',
        completed: true
      },
      {
        id: 't_202604_2',
        fromAccountName: '招商银行 (固定消费主卡7827)',
        fromAccountId: 'acc_cmb_main',
        toAccountName: '招商银行 (电子卡/车贷储蓄5903)',
        toAccountId: 'acc_cmb_virtual',
        amount: 4071.00,
        description: '转入招行储蓄卡 = ¥4,071',
        completed: true
      },
      {
        id: 't_202604_3',
        fromAccountName: '农业银行 (工资卡)',
        fromAccountId: 'acc_abc_salary',
        toAccountName: '中信银行 (日常消费卡8362)',
        toAccountId: 'acc_citic_daily',
        amount: 5043.00,
        description: '转入中信日常综合预算 = ¥5,043',
        completed: true
      }
    ],
    overbudgetItems: [
      { name: '车位租金', amount: 600, account: '招商卡', note: '车位续费' },
      { name: '沙发家具', amount: 380, account: '招商卡' },
      { name: '佳漾汇吃饭聚餐', amount: 233, account: '招商卡' },
      { name: '汽车空调滤芯', amount: 90, account: '招商卡' },
      { name: '车辆保养维护', amount: 258, account: '招商卡' },
      { name: '补胎应急', amount: 30, account: '招商卡' },
      { name: '微波炉家电', amount: 305, account: '招商卡' },
      { name: '露营设备', amount: 330, account: '招商卡' },
      { name: '阳台改造瓷砖/牛粪基质', amount: 449, account: '招商卡' },
      { name: '处理老爸违章', amount: 200, account: '中信卡' }
    ],
    notes: '4月超额支出较多(-2684元)，主要集中在阳台改造、车辆保养及家电换新，已在分账中计入调整。',
    createdAt: new Date('2026-04-18').getTime()
  }
];

// Pre-seeded transactions from user's WeChat statements & records
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 餐饮美食
  {
    id: 'tx_wx_001',
    date: '2026-08-16 12:45',
    type: 'expense',
    amount: 16.98,
    category: 'food',
    categoryLabel: '餐饮美食',
    counterparty: '包德欢手工水饺',
    description: '手工水饺午餐',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '450000038420260816124501',
    createdAt: new Date('2026-08-16 12:45').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_002',
    date: '2026-08-16 08:30',
    type: 'expense',
    amount: 7.00,
    category: 'food',
    categoryLabel: '餐饮美食',
    counterparty: '按时吃早饭',
    description: '豆浆包子早餐',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '531100022220260816083002',
    createdAt: new Date('2026-08-16 08:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_003',
    date: '2026-08-15 18:20',
    type: 'expense',
    amount: 34.00,
    category: 'food',
    categoryLabel: '餐饮美食',
    counterparty: '湘赣餐馆',
    description: '晚餐小炒肉盖饭',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '531100022220260815182003',
    createdAt: new Date('2026-08-15 18:20').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_004',
    date: '2026-08-15 11:15',
    type: 'expense',
    amount: 16.80,
    category: 'shopping',
    categoryLabel: '日常购物',
    counterparty: '广东美宜佳便利店',
    description: '饮料与日用品',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '450000031720260815111504',
    createdAt: new Date('2026-08-15 11:15').getTime(),
    source: 'wechat_import'
  },
  // 车辆充电与出行
  {
    id: 'tx_wx_005',
    date: '2026-08-14 21:10',
    type: 'expense',
    amount: 51.54,
    category: 'vehicle_daily',
    categoryLabel: '车辆充电',
    counterparty: '小桔充电',
    description: '快充服务费+电费 (粤BBT6645)',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '503006080420260814211005',
    createdAt: new Date('2026-08-14 21:10').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_006',
    date: '2026-08-14 09:20',
    type: 'expense',
    amount: 15.00,
    category: 'vehicle_daily',
    categoryLabel: '停车费用',
    counterparty: '捷停车',
    description: '双华工业区停车费',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '450000032520260814092006',
    createdAt: new Date('2026-08-14 09:20').getTime(),
    source: 'wechat_import'
  },
  // 云服务与科技
  {
    id: 'tx_wx_007',
    date: '2026-08-13 14:00',
    type: 'expense',
    amount: 48.70,
    category: 'digital_ai',
    categoryLabel: '数码科技',
    counterparty: '腾讯云费用',
    description: '云服务器与域名解析',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '530100033220260813140007',
    createdAt: new Date('2026-08-13 14:00').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_008',
    date: '2026-08-12 16:30',
    type: 'expense',
    amount: 120.00,
    category: 'digital_ai',
    categoryLabel: '数码科技',
    counterparty: '硅基流动 SiliconFlow',
    description: 'API 模型算力调用',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '530100033420260812163008',
    createdAt: new Date('2026-08-12 16:30').getTime(),
    source: 'wechat_import'
  },
  // 房租与固定开销
  {
    id: 'tx_wx_009',
    date: '2026-08-01 10:00',
    type: 'expense',
    amount: 1740.00,
    category: 'housing',
    categoryLabel: '房租水电',
    counterparty: '同方物业 / 对面楼房东',
    description: '8月房租1650 + 水电公摊90',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '450000038120260801100009',
    createdAt: new Date('2026-08-01 10:00').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_010',
    date: '2026-08-05 09:00',
    type: 'expense',
    amount: 2900.00,
    category: 'vehicle_loan',
    categoryLabel: '汽车车贷',
    counterparty: '招商银行汽车金融',
    description: '每月车贷自动还款',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    transactionId: '450000033420260805090010',
    createdAt: new Date('2026-08-05 09:00').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_011',
    date: '2026-08-05 10:00',
    type: 'expense',
    amount: 1000.00,
    category: 'pension',
    categoryLabel: '养老保险',
    counterparty: '自动个人养老金扣款',
    description: '8月固定养老金定投',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '530100033320260805100011',
    createdAt: new Date('2026-08-05 10:00').getTime(),
    source: 'wechat_import'
  },
  // 话费与日用
  {
    id: 'tx_wx_012',
    date: '2026-08-02 11:30',
    type: 'expense',
    amount: 100.00,
    category: 'telecom',
    categoryLabel: '话费充值',
    counterparty: '中国移动/电信手机充值',
    description: '手机话费充值 100元',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '531100022120260802113012',
    createdAt: new Date('2026-08-02 11:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_013',
    date: '2026-08-02 12:00',
    type: 'expense',
    amount: 50.00,
    category: 'telecom',
    categoryLabel: '平台会员',
    counterparty: '美团/网易云/腾讯视频会员',
    description: '月度联合会员订阅',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '530100033320260802120013',
    createdAt: new Date('2026-08-02 12:00').getTime(),
    source: 'wechat_import'
  },
  // 父母医保与保险
  {
    id: 'tx_wx_014',
    date: '2026-08-03 15:40',
    type: 'expense',
    amount: 159.00,
    category: 'parents',
    categoryLabel: '父母保障',
    counterparty: '湖北医保与孝感惠民保',
    description: '爸妈医保与惠民保扣费 (65+94)',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    transactionId: '531100022020260803154014',
    createdAt: new Date('2026-08-03 15:40').getTime(),
    source: 'wechat_import'
  },
  // 工资到账
  {
    id: 'tx_wx_015',
    date: '2026-08-15 09:30',
    type: 'income',
    amount: 11250.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '8月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    transactionId: '131106007220260815093015',
    createdAt: new Date('2026-08-15 09:30').getTime(),
    source: 'statement_import'
  },
  // 医疗门诊
  {
    id: 'tx_wx_016',
    date: '2026-08-10 10:15',
    type: 'expense',
    amount: 44.40,
    category: 'medical',
    categoryLabel: '医疗健康',
    counterparty: '深圳市宝安区人民医院',
    description: '病历预约挂号与药品',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '531100022120260810101516',
    createdAt: new Date('2026-08-10 10:15').getTime(),
    source: 'wechat_import'
  },
  // 8月其他日常流水
  {
    id: 'tx_wx_017',
    date: '2026-08-08 19:40',
    type: 'expense',
    amount: 302.71,
    category: 'shopping',
    categoryLabel: '日用百货',
    counterparty: '百佳华百货',
    description: '家居日用换季置办',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '420000314920260808194017',
    isOverBudget: true,
    overBudgetReason: '大额家居采购',
    createdAt: new Date('2026-08-08 19:40').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_018',
    date: '2026-08-07 18:30',
    type: 'expense',
    amount: 46.20,
    category: 'vehicle_daily',
    categoryLabel: '车辆充电',
    counterparty: '云快充充电站',
    description: '新能源汽车充电电费',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '420000314920260807183018',
    createdAt: new Date('2026-08-07 18:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_wx_019',
    date: '2026-08-04 12:15',
    type: 'expense',
    amount: 22.50,
    category: 'food',
    categoryLabel: '餐饮美食',
    counterparty: '真功夫快餐',
    description: '香菇鸡腿肉套餐午餐',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    transactionId: '420000314920260804121519',
    createdAt: new Date('2026-08-04 12:15').getTime(),
    source: 'wechat_import'
  },

  // ----------------------------------------------------
  // 7月份历史流水记录 (2026-07)
  // ----------------------------------------------------
  {
    id: 'tx_hist_202607_01',
    date: '2026-07-15 09:30',
    type: 'income',
    amount: 11226.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '7月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    transactionId: '131106007220260715093001',
    createdAt: new Date('2026-07-15 09:30').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202607_02',
    date: '2026-07-18 10:00',
    type: 'transfer',
    amount: 12217.00,
    category: 'transfer',
    categoryLabel: '分账储蓄',
    counterparty: '招商银行电子卡(5903)',
    description: '7月复盘日分账转入电子卡核心储蓄账户',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    createdAt: new Date('2026-07-18 10:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202607_03',
    date: '2026-07-10 14:20',
    type: 'expense',
    amount: 500.00,
    category: 'food',
    categoryLabel: '餐饮美食',
    counterparty: '中信生活费追加 (招商转中信)',
    description: '餐饮生活费超出预算追加',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    isOverBudget: true,
    overBudgetReason: '餐饮生活费超出预算追加',
    createdAt: new Date('2026-07-10 14:20').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202607_04',
    date: '2026-07-05 16:45',
    type: 'expense',
    amount: 118.00,
    category: 'digital_ai',
    categoryLabel: '数码科技',
    counterparty: '智谱 AI 算力会员',
    description: 'AI 生产力大模型年费会员',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '生产力工具支出',
    createdAt: new Date('2026-07-05 16:45').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202607_05',
    date: '2026-07-05 09:00',
    type: 'expense',
    amount: 2900.00,
    category: 'vehicle_loan',
    categoryLabel: '汽车车贷',
    counterparty: '招商银行汽车金融',
    description: '7月车贷自动还款',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    createdAt: new Date('2026-07-05 09:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202607_06',
    date: '2026-07-01 10:00',
    type: 'expense',
    amount: 1680.00,
    category: 'housing',
    categoryLabel: '房租水电',
    counterparty: '同方物业',
    description: '7月房租及水电管理费',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    createdAt: new Date('2026-07-01 10:00').getTime(),
    source: 'statement_import'
  },

  // ----------------------------------------------------
  // 6月份历史流水记录 (2026-06)
  // ----------------------------------------------------
  {
    id: 'tx_hist_202606_01',
    date: '2026-06-15 09:30',
    type: 'income',
    amount: 11231.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '6月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    transactionId: '131106007220260615093001',
    createdAt: new Date('2026-06-15 09:30').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202606_02',
    date: '2026-06-19 15:30',
    type: 'expense',
    amount: 90.00,
    category: 'vehicle_daily',
    categoryLabel: '出行打车',
    counterparty: '滴滴出行 / 打车去火车站',
    description: '出差打车去深圳北站',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '出行超支',
    createdAt: new Date('2026-06-19 15:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202606_03',
    date: '2026-06-18 11:20',
    type: 'expense',
    amount: 33.00,
    category: 'shopping',
    categoryLabel: '日用百货',
    counterparty: '京东拼购 / 拼一箱纸',
    description: '日常抽纸生活耗材采购',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '日常用品超支',
    createdAt: new Date('2026-06-18 11:20').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202606_04',
    date: '2026-06-17 10:00',
    type: 'transfer',
    amount: 4307.00,
    category: 'transfer',
    categoryLabel: '分账储蓄',
    counterparty: '招商银行电子卡(5903)',
    description: '6月复盘日分账转入电子卡核心储蓄账户',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    createdAt: new Date('2026-06-17 10:00').getTime(),
    source: 'statement_import'
  },

  // ----------------------------------------------------
  // 4月份历史流水记录 (2026-04)
  // ----------------------------------------------------
  {
    id: 'tx_hist_202604_01',
    date: '2026-04-15 09:30',
    type: 'income',
    amount: 11200.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '4月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    transactionId: '131106007220260415093001',
    createdAt: new Date('2026-04-15 09:30').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202604_02',
    date: '2026-04-12 14:00',
    type: 'expense',
    amount: 600.00,
    category: 'vehicle_daily',
    categoryLabel: '车位租金',
    counterparty: '物业车位租赁中心',
    description: '地下车位月租费',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '车位续费',
    createdAt: new Date('2026-04-12 14:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202604_03',
    date: '2026-04-10 18:30',
    type: 'expense',
    amount: 449.00,
    category: 'shopping',
    categoryLabel: '家居装饰',
    counterparty: '淘宝网阳台园艺专营店',
    description: '阳台改造瓷砖/牛粪基质',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '阳台改造超支',
    createdAt: new Date('2026-04-10 18:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202604_04',
    date: '2026-04-08 10:20',
    type: 'expense',
    amount: 258.00,
    category: 'vehicle_daily',
    categoryLabel: '车辆保养',
    counterparty: '途虎养车工场店',
    description: '车辆基础保养维护与机油更换',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    isOverBudget: true,
    overBudgetReason: '车辆保养超支',
    createdAt: new Date('2026-04-08 10:20').getTime(),
    source: 'wechat_import'
  },
  // ----------------------------------------------------
  // 5月份历史流水记录 (2026-05)
  // ----------------------------------------------------
  {
    id: 'tx_hist_202605_01',
    date: '2026-05-15 09:30',
    type: 'income',
    amount: 11210.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '5月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代发',
    fundingAccountText: '农业银行(6163)',
    transactionId: '131106007220260515093001',
    createdAt: new Date('2026-05-15 09:30').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202605_02',
    date: '2026-05-05 09:00',
    type: 'expense',
    amount: 2900.00,
    category: 'vehicle_loan',
    categoryLabel: '汽车车贷',
    counterparty: '招商银行汽车金融',
    description: '5月车贷自动扣款',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代扣',
    fundingAccountText: '招商电子卡(5903)',
    createdAt: new Date('2026-05-05 09:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202605_03',
    date: '2026-05-01 10:00',
    type: 'expense',
    amount: 1680.00,
    category: 'housing',
    categoryLabel: '房租水电',
    counterparty: '同方物业',
    description: '5月房租及水电管理费',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代扣',
    fundingAccountText: '招商主卡(7827)',
    createdAt: new Date('2026-05-01 10:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202605_04',
    date: '2026-05-02 12:30',
    type: 'expense',
    amount: 600.00,
    category: 'gifts_human',
    categoryLabel: '人情往来',
    counterparty: '微信红包 - 同学结婚礼金',
    description: '五一高中同学结婚随礼',
    accountId: 'acc_citic_daily',
    paymentMethodText: '中信银行储蓄卡(8362)',
    gatewayChannel: 'wechat',
    gatewayChannelLabel: '微信支付',
    fundingAccountText: '中信银行储蓄卡(8362)',
    isOverBudget: true,
    overBudgetReason: '五一婚礼随礼',
    createdAt: new Date('2026-05-02 12:30').getTime(),
    source: 'wechat_import'
  },
  {
    id: 'tx_hist_202605_05',
    date: '2026-05-18 10:00',
    type: 'transfer',
    amount: 5120.00,
    category: 'transfer',
    categoryLabel: '分账储蓄',
    counterparty: '招商银行电子卡(5903)',
    description: '5月复盘日分账转入电子卡核心储蓄账户',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '网银转账',
    fundingAccountText: '招商电子卡(5903)',
    createdAt: new Date('2026-05-18 10:00').getTime(),
    source: 'statement_import'
  },

  // ----------------------------------------------------
  // 3月份历史流水记录 (2026-03)
  // ----------------------------------------------------
  {
    id: 'tx_hist_202603_01',
    date: '2026-03-15 09:30',
    type: 'income',
    amount: 11200.00,
    category: 'salary',
    categoryLabel: '工资薪酬',
    counterparty: '代发工资-某某科技有限公司',
    description: '3月份实发工资入账',
    accountId: 'acc_abc_salary',
    paymentMethodText: '农业银行储蓄卡(6163)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代发',
    fundingAccountText: '农业银行(6163)',
    transactionId: '131106007220260315093001',
    createdAt: new Date('2026-03-15 09:30').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202603_02',
    date: '2026-03-05 09:00',
    type: 'expense',
    amount: 2900.00,
    category: 'vehicle_loan',
    categoryLabel: '汽车车贷',
    counterparty: '招商银行汽车金融',
    description: '3月车贷扣款',
    accountId: 'acc_cmb_virtual',
    paymentMethodText: '招商银行电子卡(5903)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代扣',
    fundingAccountText: '招商电子卡(5903)',
    createdAt: new Date('2026-03-05 09:00').getTime(),
    source: 'statement_import'
  },
  {
    id: 'tx_hist_202603_03',
    date: '2026-03-01 10:00',
    type: 'expense',
    amount: 1680.00,
    category: 'housing',
    categoryLabel: '房租水电',
    counterparty: '同方物业',
    description: '3月房租及水电管理费',
    accountId: 'acc_cmb_main',
    paymentMethodText: '招商银行储蓄卡(7827)',
    gatewayChannel: 'bank_direct',
    gatewayChannelLabel: '银行代扣',
    fundingAccountText: '招商主卡(7827)',
    createdAt: new Date('2026-03-01 10:00').getTime(),
    source: 'statement_import'
  }
];

