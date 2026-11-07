// Shared presentation clock: visuals, impact audio and scoring use the same time.
export const SAW_DURATION = 1100;
export function windPresentation(wind) {
 const tier=wind>=105?5:wind>=95?4:wind>=85?3:wind>=65?2:wind>=40?1:0;
 return [
  {tier:0,name:'ふわり、そよ風',reaction:'綿毛',description:'綿毛まで、ふわり。'},
  {tier:1,name:'ひっくり返る突風',reaction:'傘',description:'となりの傘が、ひっくり返った。'},
  {tier:2,name:'超暴風',reaction:'カツラ',description:'おっさんのカツラまで、飛んでった！'},
  {tier:3,name:'伝説の紙嵐',reaction:'雲',description:'雲まで、まっぷたつ。'},
  {tier:4,name:'街じゅう大暴風',reaction:'木々',description:'木々がしなり、葉っぱが舞い上がる！'},
  {tier:5,name:'天空メンコ旋風',reaction:'天空の渦',description:'空いっぱいに、巨大な風の渦！'}
 ][tier];
}
export function windDuration(wind,reduced=false){return reduced?950:wind>=105?5000:wind>=95?4200:3200;}
export function windCaption(wind,time){return wind>=105&&time>3600?'天空メンコ旋風!!':wind>=95&&time>2900?'街じゅう大暴風！':wind>=85&&time>2450?'雲まで、まっぷたつ！':wind>=65&&time>1500?'あっ！ カツラ！':windPresentation(wind).name;}
export function impactFrame(ms, reduced = false) {
  const t = Math.max(0, ms);
  if (reduced) return { phase: t < 140 ? 'fall' : 'release', flight: Math.min(1, t / 140), landed: t >= 140, age: Math.max(0, t - 140), simulation: Math.max(0, t - 140) };
  if (t < 150) return { phase: 'fall', flight: t / 150 * .78, landed: false, age: 0, simulation: 0 };
  if (t < 470) return { phase: 'slow', flight: .78 + (t - 150) / 320 * .22, landed: false, age: 0, simulation: 0 };
  if (t < 600) return { phase: 'stop', flight: 1, landed: true, age: t - 470, simulation: 0 };
  return { phase: t < 1000 ? 'slow-release' : 'release', flight: 1, landed: true, age: t - 470, simulation: t < 1000 ? (t - 600) * .3 : 120 + (t - 1000) * 1.45 };
}

// Draw only the ink into a transparent layer. Erasing reveals the original art,
// never deletes the entire stroke or punches a hole through the cardboard.
export function paintInk(ctx, strokes) {
  for (const stroke of strokes) {
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    stroke.points.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p.x, p.y));
    if (stroke.points.length === 1) { const p = stroke.points[0]; ctx.lineTo(p.x + .001, p.y); }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}
