// ==UserScript==
// @name         Connect-4 board forwarder + AI hint + Auto-Play
// @namespace    http://localhost
// @version      2.0
// @description  Sends the board to http://localhost:8000, overlays the AI move, and (optionally) auto-plays it with a 1 s delay.
// @match        https://papergames.io/*
// @updateURL    https://raw.githubusercontent.com/username/connectking/main/client/inject/tampermonkey.user.js
// @downloadURL  https://raw.githubusercontent.com/username/connectking/main/client/inject/tampermonkey.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  const log = (...a) => console.log('[c4-tm]', ...a);

  /* wait until #connect4 appears */
  (function wait() {
    const root = document.getElementById('connect4');
    if (!root) { setTimeout(wait, 300); return; }
    log('board found, script active');
    init(root);
  })();

  /* -------------------------------------------------- */
  function init(root) {
    const rows = 6, cols = 7;

    /* ── my colour (1 = light, 2 = dark) ── */
    const MY = (() => {
      const youRow = document.querySelector('.game-players .you');
      if (youRow?.querySelector('.circle-light')) return 1;
      if (youRow?.querySelector('.circle-dark'))  return 2;
      return 1;
    })();

    /* ---- styles ---- */
    const style = document.createElement('style');
    style.textContent = `
      .c4-suggest{position:absolute;inset:0;width:100%;height:100%;
                  padding:0;margin:0;pointer-events:none}
      #c4-ap-toggle{
        position:fixed;top:8px;left:8px;z-index:9999;
        font:12px/16px sans-serif;background:#222;color:#fff;
        border:1px solid #888;border-radius:4px;padding:2px 6px;
        cursor:pointer;user-select:none
      }`;
    document.head.appendChild(style);

    /* ---- auto-play toggle UI ---- */
    let autoPlay = false;
    const btn = document.createElement('div');
    btn.id = 'c4-ap-toggle';
    const refreshLabel = () => btn.textContent = `AP: ${autoPlay ? 'ON' : 'OFF'}`;
    btn.onclick = () => { autoPlay = !autoPlay; refreshLabel(); };
    refreshLabel();
    document.body.appendChild(btn);

    /* ---- helpers ---- */
    const getBoard = () => {
      const b = Array.from({ length: rows }, () => Array(cols).fill(0));
      root.querySelectorAll('.grid-item').forEach(cell => {
        const cls = [...cell.classList].find(c => /^cell-\d-\d$/.test(c));
        if (!cls) return;
        const [, r, c] = cls.split('-').map(Number);
        b[r - 1][c - 1] =
              cell.querySelector('.circle-light') ? 1 :
              cell.querySelector('.circle-dark')  ? 2 : 0;
      });
      return b;
    };

    const clearMarker = () =>
      root.querySelectorAll('.c4-suggest').forEach(e => e.remove());

    const drawMarker = (col, b) => {
      clearMarker();
      let row = -1;
      for (let r = rows - 1; r >= 0; --r)
        if (b[r][col] === 0) { row = r; break; }
      if (row === -1) return;
      const cell = root.querySelector(`.cell-${row + 1}-${col + 1}`);
      if (!cell) return;
      const svg  = document.createElementNS('http://www.w3.org/2000/svg','svg');
      const cir  = document.createElementNS(svg.namespaceURI,'circle');
      svg.setAttribute('viewBox','0 0 100 100');
      svg.classList.add('c4-suggest');
      cir.setAttribute('cx',50); cir.setAttribute('cy',50);
      cir.setAttribute('r',50);  cir.setAttribute('fill','yellow');
      cir.setAttribute('fill-opacity','0.35');
      svg.appendChild(cir);
      cell.appendChild(svg);
    };

    /* play a move by dispatching a click on the topmost empty cell */
    const playMove = (col, board) => {
      for (let r = rows - 1; r >= 0; --r) {
        if (board[r][col] === 0) {
          const cell = root.querySelector(`.cell-${r + 1}-${col + 1}`);
          if (cell) cell.click();
          break;
        }
      }
    };

    /* ---- observe board mutations ---- */
    const obsCfg   = {childList:true,subtree:true};
    const observer = new MutationObserver(muts=>{
      if (muts.some(m=>[...m.addedNodes,...m.removedNodes]
                       .some(n=>n.classList?.contains?.('c4-suggest')))) return;
      handleChange();
    });
    observer.observe(root, obsCfg);

    async function handleChange() {
      const board = getBoard();
      if (board.flat().every(v=>v===0)) return;

      /* whose turn? */
      const turn = board.flat().filter(v=>v).length % 2 ? 2 : 1;

      /* hint only on my turn */
      if (turn !== MY) { clearMarker(); return; }

      /* send board */
      await fetch('http://localhost:8000/board', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({board})
      });

      /* get best move */
      const col = +await fetch(`http://localhost:8000/move?player=${turn}`)
                           .then(r=>r.text());

      observer.disconnect();          // silence self-mutation
      drawMarker(col, board);
      observer.observe(root, obsCfg);

      log('suggested', col, 'autoPlay:', autoPlay);

      /* autoplay after 1 s if enabled */
      if (autoPlay) {
        setTimeout(() => {
          playMove(col, board);
        }, 2500);
      }
    }

    handleChange();                   // initial push
  }
})();
