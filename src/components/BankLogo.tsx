import React from 'react';

export interface BankLogoProps {
  bankCode?: string;
  bankName?: string;
  customLogoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBg?: boolean;
}

export interface BankPreset {
  code: string;
  name: string;
  color: string;
  fullName: string;
}

export const PRESET_BANKS: BankPreset[] = [
  { code: 'CITIC', name: '中信银行', fullName: '中信银行 (CITIC)', color: '#d62027' },
  { code: 'CMB', name: '招商银行', fullName: '招商银行 (CMB)', color: '#df0012' },
  { code: 'ABC', name: '农业银行', fullName: '中国农业银行 (ABC)', color: '#009072' },
  { code: 'ICBC', name: '工商银行', fullName: '中国工商银行 (ICBC)', color: '#c7000b' },
  { code: 'CCB', name: '建设银行', fullName: '中国建设银行 (CCB)', color: '#003b8e' },
  { code: 'BOC', name: '中国银行', fullName: '中国银行 (BOC)', color: '#b81c22' },
  { code: 'BOCOM', name: '交通银行', fullName: '交通银行 (BOCOM)', color: '#002d72' },
  { code: 'PSBC', name: '邮储银行', fullName: '中国邮政储蓄银行 (PSBC)', color: '#007f3d' },
  { code: 'SPDB', name: '浦发银行', fullName: '浦发银行 (SPDB)', color: '#002060' },
  { code: 'PINGAN', name: '平安银行', fullName: '平安银行 (PINGAN)', color: '#ea5404' },
  { code: 'CIB', name: '兴业银行', fullName: '兴业银行 (CIB)', color: '#004098' },
  { code: 'CMBC', name: '民生银行', fullName: '民生银行 (CMBC)', color: '#008476' },
  { code: 'WECHAT', name: '微信支付', fullName: '微信支付 (WeChat Pay)', color: '#07c160' },
  { code: 'ALIPAY', name: '支付宝', fullName: '支付宝 (Alipay)', color: '#1677ff' },
  { code: 'OTHER', name: '自定义/其他', fullName: '其他银行或金融账户', color: '#4f46e5' },
];

export function detectBankCode(bankName?: string, name?: string): string {
  const combined = `${bankName || ''} ${name || ''}`.toUpperCase();
  if (combined.includes('中信') || combined.includes('CITIC')) return 'CITIC';
  if (combined.includes('招商') || combined.includes('CMB') || combined.includes('一卡通')) return 'CMB';
  if (combined.includes('农业') || combined.includes('农行') || combined.includes('ABC')) return 'ABC';
  if (combined.includes('工商') || combined.includes('工行') || combined.includes('ICBC')) return 'ICBC';
  if (combined.includes('建设') || combined.includes('建行') || combined.includes('CCB')) return 'CCB';
  if (combined.includes('中国银行') || combined.includes('中行') || combined.includes('BOC')) return 'BOC';
  if (combined.includes('交通') || combined.includes('交行') || combined.includes('BOCOM')) return 'BOCOM';
  if (combined.includes('邮政') || combined.includes('邮储') || combined.includes('PSBC')) return 'PSBC';
  if (combined.includes('浦发') || combined.includes('SPDB')) return 'SPDB';
  if (combined.includes('平安') || combined.includes('PINGAN')) return 'PINGAN';
  if (combined.includes('兴业') || combined.includes('CIB')) return 'CIB';
  if (combined.includes('民生') || combined.includes('CMBC')) return 'CMBC';
  if (combined.includes('微信') || combined.includes('WECHAT')) return 'WECHAT';
  if (combined.includes('支付宝') || combined.includes('ALIPAY')) return 'ALIPAY';
  return 'OTHER';
}

export const BankLogo: React.FC<BankLogoProps> = ({
  bankCode,
  bankName,
  customLogoUrl,
  className = '',
  size = 'md',
  showBg = true
}) => {
  // If custom uploaded photo/image exists, display it compressed and rounded
  if (customLogoUrl) {
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-11 h-11',
      xl: 'w-14 h-14'
    }[size];

    return (
      <div className={`relative overflow-hidden rounded-xl bg-slate-900 border border-slate-700/80 shrink-0 flex items-center justify-center shadow ${sizeClasses} ${className}`}>
        <img
          src={customLogoUrl}
          alt={bankName || '银行图标'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const effectiveCode = bankCode || detectBankCode(bankName);

  const dimension = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56
  }[size];

  const sizeClass = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  }[size];

  switch (effectiveCode) {
    // 1. 中信银行 (China CITIC Bank) - Iconic Red & White circular branch lantern coin
    case 'CITIC':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#d62027' }}>
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            {/* Authentic CITIC round branch emblem */}
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="7" fill="none" />
            <path
              d="M 50 14 L 50 86 M 14 50 L 86 50 M 24 24 L 76 76 M 76 24 L 24 76"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="16" fill="#d62027" stroke="white" strokeWidth="6" />
            <circle cx="50" cy="50" r="6" fill="white" />
          </svg>
        </div>
      );

    // 2. 招商银行 (China Merchants Bank) - Iconic CMB Red with authentic flame/geometric M
    case 'CMB':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#df0012' }}>
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            {/* Authentic CMB M logo flame ribbons */}
            <path
              d="M 22 25 C 22 25 38 18 45 42 C 48 52 50 68 50 78 C 50 68 52 52 55 42 C 62 18 78 25 78 25 C 78 25 64 48 57 68 C 52 82 50 85 50 85 C 50 85 48 82 43 68 C 36 48 22 25 22 25 Z"
              fill="white"
            />
            <circle cx="50" cy="24" r="7" fill="white" />
          </svg>
        </div>
      );

    // 3. 中国农业银行 (Agricultural Bank of China) - Authentic Green coin with wheat ears
    case 'ABC':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#009072' }}>
          <svg viewBox="0 0 100 100" className="w-[74%] h-[74%]" fill="none">
            {/* Authentic ABC outer circle and stylized wheat ears + coin core */}
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="6.5" fill="none" />
            {/* Center square/circle coin aperture */}
            <rect x="36" y="36" width="28" height="28" fill="white" rx="3" />
            <rect x="42" y="42" width="16" height="16" fill="#009072" />
            {/* Wheat spike leaves left & right */}
            <path d="M 50 8 L 50 36 M 50 64 L 50 92" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <path d="M 8 50 L 36 50 M 64 50 L 92 50" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <path d="M 22 22 L 38 38 M 62 62 L 78 78" stroke="white" strokeWidth="5" strokeLinecap="round" />
            <path d="M 78 22 L 62 38 M 38 62 L 22 78" stroke="white" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 4. 中国工商银行 (ICBC) - Official Red circular coin with classic "工"
    case 'ICBC':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#c7000b' }}>
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="7" fill="none" />
            {/* ICBC "工" structure */}
            <path d="M 26 30 L 74 30 M 26 70 L 74 70 M 50 30 L 50 70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="40" y="42" width="20" height="16" fill="#c7000b" />
          </svg>
        </div>
      );

    // 5. 中国建设银行 (CCB) - Official Deep Blue with double C
    case 'CCB':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#003b8e' }}>
          <svg viewBox="0 0 100 100" className="w-[74%] h-[74%]" fill="none">
            <path
              d="M 68 20 C 40 16 20 34 20 50 C 20 66 40 84 68 80 C 78 78 82 72 82 72 C 82 72 74 76 66 74 C 46 70 32 58 32 50 C 32 42 46 30 66 26 C 74 24 82 28 82 28 C 82 28 78 22 68 20 Z"
              fill="white"
            />
            <path
              d="M 64 34 C 48 32 38 42 38 50 C 38 58 48 68 64 66 C 72 64 74 60 74 60 C 74 60 68 62 62 61 C 52 58 46 52 46 50 C 46 48 52 42 62 39 C 68 38 74 40 74 40 C 74 40 72 36 64 34 Z"
              fill="#003b8e"
            />
          </svg>
        </div>
      );

    // 6. 中国银行 (BOC) - Official Red round coin with ribbons
    case 'BOC':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#b81c22' }}>
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="7" fill="none" />
            <rect x="36" y="36" width="28" height="28" stroke="white" strokeWidth="6" fill="none" />
            <path d="M 50 8 L 50 36 M 50 64 L 50 92" stroke="white" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 8 50 L 36 50 M 64 50 L 92 50" stroke="white" strokeWidth="6.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 7. 微信支付 (WeChat Pay) - Official Green speech bubbles
    case 'WECHAT':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#07c160' }}>
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]" fill="none">
            {/* Big bubble */}
            <path
              d="M 44 24 C 28 24 16 34 16 46 C 16 53 20 60 27 64 L 24 74 L 35 69 C 38 70 41 70 44 70 C 45 70 46 70 47 70 C 46 68 45 65 45 62 C 45 51 55 42 68 42 C 70 42 72 42 74 43 C 73 32 60 24 44 24 Z"
              fill="white"
            />
            {/* Big bubble eyes */}
            <circle cx="30" cy="40" r="3.5" fill="#07c160" />
            <circle cx="48" cy="40" r="3.5" fill="#07c160" />
            {/* Small bubble */}
            <path
              d="M 68 46 C 56 46 47 54 47 64 C 47 70 51 76 57 79 L 54 86 L 64 82 C 65 83 67 83 68 83 C 80 83 89 75 89 64 C 89 54 80 46 68 46 Z"
              fill="white"
            />
            {/* Small bubble eyes */}
            <circle cx="60" cy="58" r="2.8" fill="#07c160" />
            <circle cx="76" cy="58" r="2.8" fill="#07c160" />
          </svg>
        </div>
      );

    // 8. 支付宝 (Alipay) - Official Blue with authentic "支"
    case 'ALIPAY':
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: '#1677ff' }}>
          <svg viewBox="0 0 100 100" className="w-[70%] h-[70%]" fill="none">
            <path
              d="M 22 28 L 78 28 M 50 16 L 50 28 M 28 42 L 72 42 M 50 42 C 50 56 46 66 30 76 M 46 60 C 56 68 70 78 78 82 M 42 42 C 44 54 48 66 66 66 C 76 66 82 58 82 48"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    // 9. Default / Generic Bank Card
    default:
      return (
        <div className={`shrink-0 rounded-xl overflow-hidden shadow flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-blue-500 text-white ${sizeClass} ${className}`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <circle cx="7" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>
      );
  }
};
