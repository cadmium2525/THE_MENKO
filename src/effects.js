// Shared presentation clock: visuals, impact audio and scoring use the same time.
export const SAW_DURATION = 1100;
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
