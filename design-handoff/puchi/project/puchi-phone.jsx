// puchi-phone.jsx — 実機スクショに寄せた軽量フォンシェル
// PhoneShell: 角丸ベゼル＋ステータスバー(時刻左/電波右)。中身はフルブリード。
function StatusBar({ dark = false, time = '16:36' }) {
  const c = dark ? '#fff' : '#3d382e';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 50, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', pointerEvents: 'none',
    }}>
      <span style={{
        fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 700,
        fontSize: 15, color: c, letterSpacing: .3, paddingTop: 6,
      }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="6.5" width="2.8" height="4.5" rx="0.6" fill={c}/>
          <rect x="4.2" y="4.3" width="2.8" height="6.7" rx="0.6" fill={c}/>
          <rect x="8.4" y="2.1" width="2.8" height="8.9" rx="0.6" fill={c}/>
          <rect x="12.6" y="0" width="2.8" height="11" rx="0.6" fill={c}/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path d="M8 2.9C10.1 2.9 12 3.7 13.4 5.1L14.4 4.1C12.7 2.4 10.5 1.4 8 1.4C5.5 1.4 3.3 2.4 1.6 4.1L2.6 5.1C4 3.7 5.9 2.9 8 2.9Z" fill={c}/>
          <path d="M8 6.2C9.3 6.2 10.4 6.7 11.2 7.5L12.2 6.5C11 5.4 9.6 4.7 8 4.7C6.4 4.7 5 5.4 3.8 6.5L4.8 7.5C5.6 6.7 6.7 6.2 8 6.2Z" fill={c}/>
          <circle cx="8" cy="9.6" r="1.4" fill={c}/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <svg width="25" height="12" viewBox="0 0 25 12">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.4" fill="none"/>
            <rect x="2" y="2" width="16" height="8" rx="1.6" fill={c}/>
            <path d="M23 3.8V8.2C23.7 7.9 24.2 7.3 24.2 6C24.2 5.6 23.7 4.1 23 3.8Z" fill={c} fillOpacity="0.45"/>
          </svg>
          <span style={{ fontFamily:'-apple-system, system-ui', fontSize: 10.5, fontWeight: 600, color: c, marginLeft: 1 }}>78</span>
        </div>
      </div>
    </div>
  );
}

function PhoneShell({ children, width = 320, height = 696, dark = false, time = '16:36', bg = '#000', label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width, height, borderRadius: 42, position: 'relative', overflow: 'hidden',
        background: bg,
        boxShadow: '0 30px 60px rgba(61,56,46,.20), 0 0 0 1px rgba(61,56,46,.10), inset 0 0 0 5px #1c1a16',
      }}>
        {/* ノッチ */}
        <div style={{
          position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)',
          width: 108, height: 26, borderRadius: 16, background: '#1c1a16', zIndex: 40,
        }} />
        <StatusBar dark={dark} time={time} />
        <div style={{ position: 'absolute', inset: 5, borderRadius: 38, overflow: 'hidden' }}>
          {children}
        </div>
        {/* ホームインジケータ */}
        <div style={{
          position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)',
          width: 116, height: 4.5, borderRadius: 100, zIndex: 45,
          background: dark ? 'rgba(255,255,255,.55)' : 'rgba(61,56,46,.30)',
        }} />
      </div>
      {label && <div style={{
        fontFamily: '"Zen Maru Gothic", system-ui', fontSize: 13, fontWeight: 700,
        color: '#837754', letterSpacing: .5,
      }}>{label}</div>}
    </div>
  );
}

window.PhoneShell = PhoneShell;
window.PuchiStatusBar = StatusBar;
