/* Connect-4 → localhost board forwarder  (plain HTTP) */
(() => {
    console.log('[c4-inject] script loaded');
  // Build 6×7 array: 0 empty, 1 light, 2 dark
  const getBoard = () => {
    const board = Array.from({ length: 6 }, () => Array(7).fill(0));
    document.querySelectorAll('.grid-item').forEach(cell => {
      const cls = [...cell.classList].find(c => /^cell-\d-\d$/.test(c));
      if (!cls) return;
      const [, r, c] = cls.split('-').map(Number);      // 1-based in the DOM
      board[r - 1][c - 1] =
            cell.querySelector('.circle-light') ? 1 :
            cell.querySelector('.circle-dark')  ? 2 : 0;
    });
    return board;
  };

  // POST board to http://localhost:8000/board
  const sendBoard = async () => {
    const board = getBoard();
    if (board.flat().every(v => v === 0)) return;       // skip all-empty grids
    try {
      await fetch('http://localhost:8000/board', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ board })
      });
      console.log('↗ board sent');
    } catch (e) {
      console.error('↗ send error', e);
    }
  };

  // Observe changes under #connect4
  const root = document.getElementById('connect4');
  if (!root) return console.error('No #connect4 element found');
  new MutationObserver(sendBoard)
      .observe(root, { childList: true, subtree: true, attributes: true });

  sendBoard();   // initial push
})();

