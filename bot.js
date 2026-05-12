// Iris Moon Garden – optional auto-play bot
// Activated / deactivated by the "🤖 Auto Play" button.
(function () {
  let botActive = false;

  // ── pathfinding ─────────────────────────────────────────────────────────────

  function tileBlocked(tx, ty) {
    if (isWall(tx, ty)) return true;
    if (state.door && !state.hasKey && state.door.x === tx && state.door.y === ty) return true;
    return false;
  }

  function bfs(sx, sy, gx, gy) {
    if (sx === gx && sy === gy) return [];
    const startKey = `${sx},${sy}`;
    const parent   = new Map();
    const visited  = new Set([startKey]);
    const queue    = [[sx, sy]];
    while (queue.length) {
      const [cx, cy] = queue.shift();
      for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nx = cx+dx, ny = cy+dy;
        const nk = `${nx},${ny}`;
        if (visited.has(nk) || tileBlocked(nx, ny)) continue;
        visited.add(nk);
        parent.set(nk, `${cx},${cy}`);
        if (nx === gx && ny === gy) {
          const path = [];
          for (let k = nk; k !== startKey; k = parent.get(k))
            path.unshift(k.split(',').map(Number));
          return path;
        }
        queue.push([nx, ny]);
      }
    }
    return null;
  }

  function shadowBlocking(tx, ty) {
    const cx = tx + 0.5, cy = ty + 0.5;
    return state.shadows.some(s => Math.hypot(s.x - cx, s.y - cy) < 1.05);
  }

  function pickTarget() {
    if (state.key && !state.key.collected)
      return [Math.floor(state.key.x), Math.floor(state.key.y)];
    const heartsToUse = state.heartPickups.filter(h => !h.collected);
    if (hearts < 2 && heartsToUse.length) {
      const h = heartsToUse.reduce((a, b) =>
        Math.hypot(a.x - state.player.x, a.y - state.player.y) <=
        Math.hypot(b.x - state.player.x, b.y - state.player.y) ? a : b);
      return [Math.floor(h.x), Math.floor(h.y)];
    }
    const rem = state.seeds.filter(s => !s.collected);
    if (rem.length) {
      const s = rem.reduce((a, b) =>
        Math.hypot(a.x - state.player.x, a.y - state.player.y) <=
        Math.hypot(b.x - state.player.x, b.y - state.player.y) ? a : b);
      return [Math.floor(s.x), Math.floor(s.y)];
    }
    return [Math.floor(state.exit.x), Math.floor(state.exit.y)];
  }

  // ── tick ────────────────────────────────────────────────────────────────────

  function tick() {
    if (!botActive) return;
    keys.clear();
    if (!running || paused) return;

    const { x: px, y: py } = state.player;
    const [curTX, curTY]   = [Math.floor(px), Math.floor(py)];
    const [goalTX, goalTY] = pickTarget();
    const path = bfs(curTX, curTY, goalTX, goalTY);
    if (!path || path.length === 0) return;

    const [nx, ny] = path[0];
    if (shadowBlocking(nx, ny)) return;

    const T = 0.12;
    if (nx + 0.5 - px >  T) keys.add('arrowright');
    if (nx + 0.5 - px < -T) keys.add('arrowleft');
    if (ny + 0.5 - py >  T) keys.add('arrowdown');
    if (ny + 0.5 - py < -T) keys.add('arrowup');
  }

  // ── button ──────────────────────────────────────────────────────────────────

  const btn = document.getElementById('botBtn');

  function syncButton() {
    if (!btn) return;
    btn.textContent = botActive ? '🙋 Manual' : '🤖 Auto Play';
    btn.style.background   = botActive ? '#4a7c59' : '';
    btn.style.color        = botActive ? '#fff'    : '';
    btn.style.borderColor  = botActive ? '#4a7c59' : '';
  }

  if (btn) {
    btn.addEventListener('click', () => {
      botActive = !botActive;
      if (!botActive) keys.clear();
      syncButton();
      if (botActive && !running && !els.overlay.classList.contains('hidden'))
        els.start.click();
    });
    syncButton();
    setInterval(tick, 50);
  }
})();
