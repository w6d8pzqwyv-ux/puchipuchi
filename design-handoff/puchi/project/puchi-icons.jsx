// puchi-icons.jsx — 触感シンボルアイコン
// FeelIcon: name(puchi|puni|tatami|mizu|chiku|zara|sazanami) × variant(line|fill)
// すべて 28x28 viewBox / color で着色。手描き寄りの丸みで昭和レトロに。
function FeelIcon({ name, variant = 'line', color = 'currentColor', size = 28 }) {
  const fill = variant === 'fill';
  const sw = 2;
  const common = {
    width: size, height: size, viewBox: '0 0 28 28',
    fill: 'none', stroke: color, strokeWidth: sw,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };

  if (name === 'puchi') {
    // プチプチ：4粒の泡。塗りでは1粒だけ「潰れた」凹みに
    return (
      <svg {...common}>
        <circle cx="9.5" cy="9.5" r="4.6" fill={fill ? color : 'none'} />
        <circle cx="19" cy="10.5" r="4.6" fill={fill ? color : 'none'} />
        <circle cx="9" cy="19.5" r="4.6" fill={fill ? color : 'none'} />
        {/* 潰れた1粒 */}
        <circle cx="18.7" cy="19.7" r="4.6"
          fill={fill ? 'rgba(0,0,0,0.18)' : 'none'}
          stroke={color} strokeDasharray={fill ? '0' : '2.4 2.4'} />
        {fill && <circle cx="8.1" cy="8.1" r="1.2" fill="rgba(255,255,255,0.85)" stroke="none" />}
        {fill && <circle cx="17.6" cy="9.1" r="1.2" fill="rgba(255,255,255,0.85)" stroke="none" />}
      </svg>
    );
  }

  if (name === 'puni') {
    // ぷに：むにっと潰れた柔らかい塊＋ハイライト
    return (
      <svg {...common}>
        <path d="M14 4.4
                 C19.6 4.4 24 8.2 24 13.2
                 C24 19.4 20 23.6 14 23.6
                 C8 23.6 4 19.8 4 14
                 C4 8.6 8.6 4.4 14 4.4 Z"
          fill={fill ? color : 'none'} />
        <path d="M9.4 9.2 C10.8 7.6 12.6 7.4 13.4 8.4"
          stroke={fill ? 'rgba(255,255,255,0.85)' : color} strokeWidth="2.2" />
      </svg>
    );
  }

  if (name === 'tatami') {
    // 畳：へり付きの織り目マット
    return (
      <svg {...common}>
        <rect x="3.5" y="6" width="21" height="16" rx="2.4" fill={fill ? color : 'none'} />
        {/* へり(上下) */}
        <line x1="3.5" y1="10" x2="24.5" y2="10"
          stroke={fill ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
        <line x1="3.5" y1="18" x2="24.5" y2="18"
          stroke={fill ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
        {/* 織り目 */}
        <line x1="9" y1="12" x2="9" y2="16"
          stroke={fill ? 'rgba(255,255,255,0.5)' : color} strokeWidth="1.4" />
        <line x1="14" y1="12" x2="14" y2="16"
          stroke={fill ? 'rgba(255,255,255,0.5)' : color} strokeWidth="1.4" />
        <line x1="19" y1="12" x2="19" y2="16"
          stroke={fill ? 'rgba(255,255,255,0.5)' : color} strokeWidth="1.4" />
      </svg>
    );
  }

  if (name === 'mizu') {
    // みず：しずく＋さざ波
    return (
      <svg {...common}>
        <path d="M14 3.5 C14 3.5 21 11 21 15.4 C21 19.4 17.9 22.2 14 22.2
                 C10.1 22.2 7 19.4 7 15.4 C7 11 14 3.5 14 3.5 Z"
          fill={fill ? color : 'none'} />
        {fill && <path d="M11.4 14.4 C11.4 12.6 12.4 11.2 13.6 10.6"
          stroke="rgba(255,255,255,0.85)" strokeWidth="2" />}
      </svg>
    );
  }

  if (name === 'chiku') {
    // チクチク：とげの放射(将来)
    return (
      <svg {...common}>
        <circle cx="14" cy="14" r="4" fill={fill ? color : 'none'} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (Math.PI / 4) * i;
          const x1 = 14 + Math.cos(a) * 6, y1 = 14 + Math.sin(a) * 6;
          const x2 = 14 + Math.cos(a) * 10.5, y2 = 14 + Math.sin(a) * 10.5;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.9" />;
        })}
      </svg>
    );
  }

  if (name === 'zara') {
    // ザラザラ：粒だった面(将来)
    return (
      <svg {...common}>
        <rect x="4" y="4" width="20" height="20" rx="4" fill={fill ? color : 'none'} />
        {[[9,9],[14,8],[19,10],[8,14],[14,14],[20,15],[10,19],[15,20],[19,19]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.05"
            fill={fill ? 'rgba(255,255,255,0.8)' : color} stroke="none" />
        ))}
      </svg>
    );
  }

  if (name === 'sazanami') {
    // さざ波：重なる波(将来)
    return (
      <svg {...common}>
        {[8, 14, 20].map((y, i) => (
          <path key={i}
            d={`M4 ${y} q3.3 -3 6.6 0 t6.6 0 t6.6 0`}
            strokeWidth="1.9" />
        ))}
      </svg>
    );
  }

  return null;
}

window.FeelIcon = FeelIcon;
