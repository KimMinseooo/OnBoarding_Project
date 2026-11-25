// 화면 전체에서 쓰는 작은 아이콘 (외부 아이콘 라이브러리 없이)
const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'aria-hidden': true } as const;

export const IconRefresh = () => (
  <svg {...base} strokeWidth={2.2}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
  </svg>
);
export const IconCheck = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.6}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const IconSpark = () => (
  <svg {...base} strokeWidth={2.2}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
);
export const IconChevron = () => (
  <svg {...base} width={14} height={14} strokeWidth={2.5}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconWarn = () => (
  <svg {...base} width={18} height={18} stroke="#b45309" strokeWidth={2}>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 10v4M12 17.5v.5" />
  </svg>
);
export const Spinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="3" />
  </svg>
);
