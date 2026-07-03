import Svg, { Circle, Rect, Line, Path } from 'react-native-svg';

// 触感ごとのアイコン。filled=trueで塗り(選択中)、falseで線(非選択)
export default function FeelIcon({ name, filled, color = '#000', size = 28 }) {
  const p = { width: size, height: size, viewBox: '0 0 28 28' };
  const st = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const F = filled ? color : 'none';
  const wh = 'rgba(255,255,255,0.85)';

  if (name === 'puchi') return (
    <Svg {...p}>
      <Circle cx="9.5" cy="9.5" r="4.6" {...st} fill={F} />
      <Circle cx="19" cy="10.5" r="4.6" {...st} fill={F} />
      <Circle cx="9" cy="19.5" r="4.6" {...st} fill={F} />
      <Circle cx="18.7" cy="19.7" r="4.6" stroke={color} strokeWidth="2"
        fill={filled ? 'rgba(0,0,0,0.18)' : 'none'} strokeDasharray={filled ? '' : '2.4 2.4'} />
      {filled && <Circle cx="8.1" cy="8.1" r="1.2" fill={wh} />}
      {filled && <Circle cx="17.6" cy="9.1" r="1.2" fill={wh} />}
    </Svg>
  );

  if (name === 'puni') return (
    <Svg {...p}>
      <Path {...st} fill={F}
        d="M14 4.4C19.6 4.4 24 8.2 24 13.2C24 19.4 20 23.6 14 23.6C8 23.6 4 19.8 4 14C4 8.6 8.6 4.4 14 4.4Z" />
      <Path d="M9.4 9.2C10.8 7.6 12.6 7.4 13.4 8.4"
        stroke={filled ? wh : color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Svg>
  );

  if (name === 'tatami') return (
    <Svg {...p}>
      <Rect x="3.5" y="6" width="21" height="16" rx="2.4" {...st} fill={F} />
      <Line x1="3.5" y1="10" x2="24.5" y2="10" stroke={filled ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
      <Line x1="3.5" y1="18" x2="24.5" y2="18" stroke={filled ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
      {[9, 14, 19].map((x) => (
        <Line key={x} x1={x} y1="12" x2={x} y2="16" stroke={filled ? 'rgba(255,255,255,0.5)' : color} strokeWidth="1.4" />
      ))}
    </Svg>
  );

  if (name === 'mizu') return (
    <Svg {...p}>
      <Path {...st} fill={F}
        d="M14 3.5C14 3.5 21 11 21 15.4C21 19.4 17.9 22.2 14 22.2C10.1 22.2 7 19.4 7 15.4C7 11 14 3.5 14 3.5Z" />
      {filled && <Path d="M11.4 14.4C11.4 12.6 12.4 11.2 13.6 10.6"
        stroke={wh} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </Svg>
  );

  return null;
}
