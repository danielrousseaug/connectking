// ==UserScript==
// @name         Connect-4 board forwarder + AI hint
// @namespace    http://localhost
// @version      1.1
// @description  Sends each board to http://localhost:8000 and overlays the AI-suggested move.
// @match        https://papergames.io/*
// @updateURL   https://raw.githubusercontent.com/username/connectking/main/client/inject/tampermonkey.user.js
// @downloadURL https://raw.githubusercontent.com/username/connectking/main/client/inject/tampermonkey.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==


(function () {
  const log = (...a) => console.log('[c4-tm]', ...a);

  /* wait until #connect4 appears */
  function waitForBoard() {
    const root = document.getElementById('connect4');
    if (!root) { setTimeout(waitForBoard, 300); return; }
    log('board found, script active');
    init(root);
  }
  waitForBoard();

  /* -------------------------------------------------- */
  function init(root) {
    const rows = 6, cols = 7;

    const style = document.createElement('style');
    style.textContent = `.c4-suggest{position:absolute;inset:0;padding:0;margin:0;
                       width:100%;height:100%;pointer-events:none}`;
    document.head.appendChild(style);

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
      if (row === -1) return;            // column full

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

      /* POST board */
      await fetch('http://localhost:8000/board', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({board})
      });

      /* whose turn? */
      const p = board.flat().filter(v=>v).length % 2 ? 2 : 1;

      /* ask server for best move */
      const col = +await fetch(`http://localhost:8000/move?player=${p}`)
                           .then(r=>r.text());

      observer.disconnect();          // avoid feedback
      drawMarker(col, board);
      observer.observe(root, obsCfg);

      log('sent board → suggested', col);
    }

    handleChange();                   // initial push
  }
})();

