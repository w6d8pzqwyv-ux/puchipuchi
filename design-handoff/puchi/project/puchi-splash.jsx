// puchi-splash.jsx — 起動画面 / ロゴ / パレット & 世界観ボード
const sFont = '"Zen Maru Gothic", system-ui, sans-serif';
const yFont = '"Yuji Syuku", serif';

// 「Puchi!」ワードマーク：!をアイコンの泡(水色)＋点で表現
function Wordmark({ scale = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 * scale }}>
      <span style={{ fontFamily: sFont, fontWeight: 900, fontSize: 58 * scale, color: 'var(--ai-deep)', letterSpacing: -1 }}>Puchi</span>
      {/* ! = 泡＋点 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 * scale, paddingBottom: 8 * scale }}>
        <div style={{
          width: 30 * scale, height: 30 * scale, borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 32%, #d9f0fb, #aeddf2 70%)',
          boxShadow: '0 2px 6px rgba(53,92,125,.30)', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '20%', left: '22%', width: '34%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,.9)', transform: 'rotate(-20deg)' }} />
        </div>
        <div style={{ width: 13 * scale, height: 13 * scale, borderRadius: '50%', background: '#aeddf2' }} />
      </div>
    </div>
  );
}

// 起動画面
function SplashScreen() {
  return (
    <div className="paper-grain" style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'radial-gradient(130% 90% at 50% 30%, #f6efde 0%, var(--paper) 60%, #e6d9bd 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* 背景の薄い泡 */}
      {[[14,20,38],[80,16,26],[86,66,46],[10,72,30]].map(([x,y,s],i)=>(
        <div key={i} style={{ position:'absolute', left:x+'%', top:y+'%', width:s, height:s, borderRadius:'50%', background:'rgba(174,221,242,.30)', border:'1px solid rgba(53,92,125,.10)' }} />
      ))}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Wordmark scale={1} />
        <div style={{ fontFamily: yFont, fontSize: 15, color: 'var(--sumi-soft)', letterSpacing: 3, marginTop: 14 }}>ふれて、ととのう。</div>
      </div>
      {/* マスコットが泡の陰から覗く(起動画面限定の登場) */}
      <img src="assets/character/peek.png" alt="" style={{
        position: 'absolute', bottom: -6, right: 18, width: 138, zIndex: 3,
        filter: 'drop-shadow(0 6px 10px rgba(61,56,46,.16))',
      }} />
    </div>
  );
}

// アプリアイコン展示
function AppIconBoard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 132, height: 132, borderRadius: 30, overflow: 'hidden',
        boxShadow: '0 12px 28px rgba(61,56,46,.22), 0 0 0 1px rgba(61,56,46,.08)',
      }}>
        <img src="assets/icon.png" alt="Puchi! icon" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
      <div style={{ fontFamily: sFont, fontSize: 13, fontWeight: 700, color: 'var(--sumi)' }}>Puchi!</div>
    </div>
  );
}

// パレット & 世界観ボード
function sw(c, label, sub) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 84 }}>
      <div style={{ height: 56, borderRadius: 12, background: c, boxShadow: 'inset 0 0 0 1px rgba(61,56,46,.10), 0 2px 5px rgba(61,56,46,.08)' }} />
      <div style={{ fontFamily: sFont, fontSize: 11.5, fontWeight: 700, color: 'var(--sumi)' }}>{label}</div>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'var(--sumi-soft)' }}>{sub}</div>
    </div>
  );
}
function group(title) {
  return <div style={{ fontFamily: sFont, fontSize: 13, fontWeight: 700, color: 'var(--wood-dark)', letterSpacing: 1, margin: '4px 0 2px' }}>{title}</div>;
}
function PaletteBoard() {
  return (
    <div className="paper-grain" style={{
      position: 'relative', width: 720, padding: 34, borderRadius: 22,
      background: 'var(--paper-3)', boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: yFont, fontSize: 26, color: 'var(--sumi)', marginBottom: 4 }}>昭和レトロ × 生成り</div>
        <p style={{ fontFamily: sFont, fontSize: 13.5, lineHeight: 1.7, color: 'var(--sumi-soft)', maxWidth: 560, margin: '0 0 22px' }}>
          アンカーは「たたみ」画面。<b style={{color:'var(--sumi)'}}>生成り(kinari)・若草・藍</b>の3色を家じゅうへ広げ、
          各触感は“同じ家の中の別の手触り”として並べる。クロームは生成りの木枠、アクセントはブランド紺と昭和藍を橋渡しする<b style={{color:'var(--ai)'}}>藍色</b>。
        </p>

        {group('生成り / 木 / 墨 ── 共通クローム')}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
          {sw('#efe6d2', '生成り', '#EFE6D2')}
          {sw('#e6d9bd', '深生成り', '#E6D9BD')}
          {sw('#9a7650', '木', '#9A7650')}
          {sw('#6e523a', '濃木', '#6E523A')}
          {sw('#3d382e', '墨', '#3D382E')}
        </div>

        {group('アクセント ── 藍 / 朱 / 若草')}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
          {sw('#355c7d', '藍(選択)', '#355C7D')}
          {sw('#c75d43', '朱', '#C75D43')}
          {sw('#93a86a', '若草', '#93A86A')}
          {sw('#23281f', 'へり', '#23281F')}
        </div>

        {group('各画面の地色 ── 退色トーンへ統一')}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
          {sw('#d3ddd9', 'ぷち', '#D3DDD9')}
          {sw('#f1e2db', 'ぷに', '#F1E2DB')}
          {sw('#e3dac4', 'たたみ', '#E3DAC4')}
          {sw('#2a4a5f', 'みず', '#2A4A5F')}
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', borderTop: '1px solid rgba(154,118,80,.25)', paddingTop: 18 }}>
          <div>
            <div style={{ fontFamily: sFont, fontWeight: 900, fontSize: 30, color: 'var(--sumi)' }}>ぷちぷち、ぷに</div>
            <div style={{ fontFamily: sFont, fontSize: 11.5, color: 'var(--sumi-soft)', marginTop: 2 }}>Zen Maru Gothic ── 丸ゴシック / 本文・UI</div>
          </div>
          <div>
            <div style={{ fontFamily: yFont, fontSize: 28, color: 'var(--sumi)' }}>ふれて、ととのう</div>
            <div style={{ fontFamily: sFont, fontSize: 11.5, color: 'var(--sumi-soft)', marginTop: 2 }}>Yuji Syuku ── 楷書 / ロゴ・差し色の和文</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, AppIconBoard, PaletteBoard, Wordmark });
