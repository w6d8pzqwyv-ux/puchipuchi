// puchi-screens.jsx — 4画面の“静止”リスキン(トーン統一)
// 各 *Bg は画面エリアいっぱい(width/height 100%)を埋める。

// ぷち：くすませた水色の地に、暖白の泡を敷き詰める
function PuchiBg() {
  const cells = Array.from({ length: 40 });
  return (
    <div className="paper-grain" style={{
      position: 'relative', width: '100%', height: '100%', background: 'var(--puchi-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', padding: '0 18px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6,
      }}>
        {cells.map((_, i) => (
          <div key={i} style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #fbfdfb, var(--puchi-cell))',
            border: '1px solid var(--puchi-rim)',
            boxShadow: '0 3px 5px rgba(70,90,80,.18), inset 0 -3px 5px rgba(120,140,130,.10)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ぷに：くすみ桜ピンクの地に、餅のような塊
function PuniBg() {
  return (
    <div className="paper-grain" style={{
      position: 'relative', width: '100%', height: '100%', background: 'var(--puni-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative', zIndex: 1, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 30%, #f3d3da 0%, var(--puni-blob) 55%, #dfa3af 100%)',
        border: '2px solid var(--puni-rim)',
        boxShadow: '0 14px 30px rgba(160,90,105,.18), inset 0 -10px 20px rgba(190,120,135,.20)',
      }}>
        <div style={{
          position: 'absolute', top: '16%', left: '20%', width: '30%', height: '17%',
          borderRadius: '50%', background: 'rgba(253,235,240,.85)', transform: 'rotate(-25deg)',
        }} />
      </div>
    </div>
  );
}

// たたみ：昭和の茶の間(=システムのアンカー)
const MATS = [
  { l: 0,     t: 0,  w: 66.66, h: 25, o: 'h' },
  { l: 66.66, t: 0,  w: 33.33, h: 50, o: 'v' },
  { l: 0,     t: 25, w: 33.33, h: 50, o: 'v' },
  { l: 33.33, t: 25, w: 33.33, h: 50, o: 'v' },
  { l: 66.66, t: 50, w: 33.33, h: 50, o: 'v' },
  { l: 0,     t: 75, w: 66.66, h: 25, o: 'h' },
];
function TatamiBg() {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', background: 'var(--tatami-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative', height: '76%', aspectRatio: '3 / 4',
        border: '5px solid var(--wood)', borderRadius: 2,
        boxShadow: '0 6px 16px rgba(61,56,46,.18)',
      }}>
        {MATS.map((m, i) => (
          <div key={i} style={{
            position: 'absolute', left: m.l + '%', top: m.t + '%', width: m.w + '%', height: m.h + '%',
            background: 'var(--matcha-deep)',
            padding: m.o === 'h' ? '5px 1px' : '1px 5px',
          }}>
            <div style={{
              width: '100%', height: '100%', overflow: 'hidden',
              background: 'var(--matcha)',
              backgroundImage: 'url(assets/tatami-tile.png)',
              backgroundSize: m.o === 'h' ? '34px 12px' : '12px 34px',
              backgroundRepeat: 'repeat',
            }} />
          </div>
        ))}
        {/* 小物 */}
        <img src="assets/showa/kotatsu.png" alt="" style={{ position: 'absolute', left: '8%', top: '31%', width: '80%', height: '48%', objectFit: 'contain', zIndex: 2 }} />
        <img src="assets/showa/tv.png" alt="" style={{ position: 'absolute', left: '35%', top: '3%', width: '30%', height: '21%', objectFit: 'contain', zIndex: 2 }} />
        <img src="assets/showa/cat.png" alt="" style={{ position: 'absolute', left: '64%', top: '60%', width: '25%', height: '17%', objectFit: 'contain', zIndex: 3 }} />
      </div>
    </div>
  );
}

// みず：藍染めの静かな深水＋さざ波
function MizuBg() {
  const ripples = [
    { x: 30, y: 32, r: 60, o: .5 },
    { x: 68, y: 52, r: 92, o: .35 },
    { x: 44, y: 70, r: 44, o: .55 },
    { x: 74, y: 24, r: 30, o: .6 },
  ];
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'radial-gradient(120% 80% at 50% 28%, #355d72 0%, var(--mizu-bg) 55%, #213b4d 100%)',
      overflow: 'hidden',
    }}>
      {ripples.map((rp, i) => (
        <div key={i} style={{
          position: 'absolute', left: rp.x + '%', top: rp.y + '%',
          width: rp.r, height: rp.r, marginLeft: -rp.r / 2, marginTop: -rp.r / 2,
          borderRadius: '50%', border: '2px solid var(--mizu-ripple)', opacity: rp.o,
        }} />
      ))}
      {ripples.slice(0, 2).map((rp, i) => (
        <div key={'b' + i} style={{
          position: 'absolute', left: rp.x + '%', top: rp.y + '%',
          width: rp.r * 1.7, height: rp.r * 1.7, marginLeft: -rp.r * .85, marginTop: -rp.r * .85,
          borderRadius: '50%', border: '1.5px solid var(--mizu-ripple)', opacity: rp.o * .5,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, { PuchiBg, PuniBg, TatamiBg, MizuBg });
