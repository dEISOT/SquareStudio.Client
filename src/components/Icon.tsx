interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, stroke = 1.6, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flex: '0 0 auto', ...style },
  };

  switch (name) {
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'cart':
      return <svg {...common}><path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.4L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':
      return <svg {...common}><path d="M5 12h14"/></svg>;
    case 'close':
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12 5 5L20 7"/></svg>;
    case 'wifi':
      return <svg {...common}><path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19.5" r="0.8" fill="currentColor"/></svg>;
    case 'chev':
      return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case 'arrow':
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'back':
      return <svg {...common}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case 'time':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'cancel':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>;
    case 'sparkle':
      return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>;
    case 'note':
      return <svg {...common}><path d="M4 5h16M4 10h16M4 15h10"/></svg>;
    case 'chair':
      return <svg {...common}><path d="M6 11V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5"/><path d="M4 11h16l-1 4H5z"/><path d="M7 15v5M17 15v5"/></svg>;
    case 'star':
      return <svg {...common}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:
      return null;
  }
}
