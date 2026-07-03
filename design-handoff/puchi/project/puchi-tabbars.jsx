// puchi-tabbars.jsx — タブバー3案 ＋ 広告トレイ(馴染ませ)
// 依存: window.FeelIcon
const FEELS = [
  { key: 'puchi', label: 'ぷち',   icon: 'puchi'  },
  { key: 'puni',  label: 'ぷに',   icon: 'puni'   },
  { key: 'tatami',label: 'たたみ', icon: 'tatami' },
  { key: 'mizu',  label: 'みず',   icon: 'mizu'   },
];

const tbFont = '"Zen Maru Gothic", system-ui, sans-serif';

// ───────── 案A : 縁側(生成り×木) バー ─────────
function TabBarA({ active = 'puchi' }) {
  return (
    <div className="paper-grain" style={{
      position: 'relative', background: 'var(--paper)',
      paddingTop: 9, paddingBottom: 20,
      borderTop: '2.5px solid var(--wood)',
      boxShadow: '0 -1px 0 rgba(255,255,255,.6) inset',
    }}>
      <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        {FEELS.map((f) => {
          const on = f.key === active;
          const col = on ? 'var(--ai)' : 'var(--sumi-soft)';
          return (
            <div key={f.key} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '7px 12px 6px', borderRadius: 16,
                background: on ? 'linear-gradient(180deg,#f8f1e0,#ece0c6)' : 'transparent',
                boxShadow: on ? 'inset 0 0 0 1px rgba(53,92,125,.18), 0 1px 2px rgba(61,56,46,.10)' : 'none',
                transition: 'all .2s',
              }}>
                <window.FeelIcon name={f.icon} variant={on ? 'fill' : 'line'} color={col} size={26} />
                <span style={{ fontFamily: tbFont, fontSize: 11.5, fontWeight: on ? 700 : 500, color: col, letterSpacing: .3 }}>{f.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 案B : 畳タイル バー ─────────
function TabBarB({ active = 'puchi' }) {
  return (
    <div className="paper-grain" style={{
      position: 'relative', background: 'var(--paper-2)',
      padding: '11px 12px 22px', borderTop: '3px solid var(--wood-dark)',
    }}>
      <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
        {FEELS.map((f) => {
          const on = f.key === active;
          return (
            <div key={f.key} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '9px 4px 8px', borderRadius: 14,
              background: on ? 'var(--ai)' : 'linear-gradient(180deg,#f4ecda,#e7dabf)',
              boxShadow: on
                ? 'inset 0 2px 5px rgba(0,0,0,.22)'
                : '0 1px 0 #fff inset, 0 2px 3px rgba(61,56,46,.14)',
              transition: 'all .2s',
            }}>
              <window.FeelIcon name={f.icon} variant="fill" color={on ? '#fff' : 'var(--wood-dark)'} size={24} />
              <span style={{ fontFamily: tbFont, fontSize: 11, fontWeight: 700, color: on ? '#fff' : 'var(--wood-dark)', letterSpacing: .3 }}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 案C : 浮遊カプセル(ミニマル) ─────────
function TabBarC({ active = 'puchi' }) {
  return (
    <div style={{ position: 'relative', background: 'transparent', padding: '10px 16px 18px' }}>
      <div className="paper-grain" style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(246,239,222,.92)', borderRadius: 999,
        padding: '10px 8px', backdropFilter: 'blur(6px)',
        boxShadow: '0 6px 18px rgba(61,56,46,.16), 0 0 0 1px rgba(154,118,80,.25), 0 1px 0 rgba(255,255,255,.7) inset',
      }}>
        {FEELS.map((f) => {
          const on = f.key === active;
          return (
            <div key={f.key} style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center', gap: 7,
              padding: on ? '7px 16px' : '7px 11px', borderRadius: 999,
              background: on ? 'var(--ai)' : 'transparent', transition: 'all .2s',
            }}>
              <window.FeelIcon name={f.icon} variant={on ? 'fill' : 'line'} color={on ? '#fff' : 'var(--sumi-soft)'} size={23} />
              {on && <span style={{ fontFamily: tbFont, fontSize: 12.5, fontWeight: 700, color: '#fff', letterSpacing: .3 }}>{f.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 広告トレイ : 白い枠をやめ、生成りの“盆”に置いて馴染ませる ─────────
function AdTray({ tone = 'paper' }) {
  return (
    <div style={{ padding: '8px 14px 6px', background: 'transparent' }}>
      <div style={{
        position: 'relative', borderRadius: 14, padding: 6,
        background: 'linear-gradient(180deg,#f4ecda,#e9ddc2)',
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 6px rgba(61,56,46,.10)',
        border: '1px solid rgba(154,118,80,.30)',
      }}>
        {/* ステッチ風の点線 */}
        <div style={{
          position: 'absolute', inset: 3, borderRadius: 11,
          border: '1.5px dashed rgba(154,118,80,.40)', pointerEvents: 'none',
        }} />
        {/* 角の小さな「広告」タグ */}
        <div style={{
          position: 'absolute', top: -8, left: 14, zIndex: 2,
          background: 'var(--wood)', color: '#f6efde',
          fontFamily: tbFont, fontSize: 9.5, fontWeight: 700, letterSpacing: 1,
          padding: '1.5px 8px', borderRadius: 7,
        }}>広告</div>
        {/* 広告本体(テスト広告のプレースホルダ) */}
        <div style={{
          height: 52, borderRadius: 9, background: '#fbfaf6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: 'inset 0 0 0 1px rgba(154,118,80,.12)',
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 9, background: '#4285F4' }} />
            <span style={{ width: 7, height: 7, borderRadius: 9, background: '#EA4335' }} />
            <span style={{ width: 7, height: 7, borderRadius: 9, background: '#FBBC05' }} />
          </div>
          <span style={{ fontFamily: '-apple-system, system-ui', fontSize: 12, color: '#9a9384', letterSpacing: .2 }}>テスト広告 320 × 100</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabBarA, TabBarB, TabBarC, AdTray, FEELS });
