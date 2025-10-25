/* game-block.js
   Phiên bản: Đã chỉnh sửa
   - Layout cố định 320x640 (game canvas)
   - Luôn ẩn header/footer
   - Luôn hiển thị điều khiển mobile
   - Xóa logic responsive (xoay màn hình, resize)
   - Thêm tính năng Điểm cao nhất (Best Score)
   - THÊM: Xem trước mảnh ghép tiếp theo
   - THÊM: Viền game rõ ràng hơn
   - THÊM: Đảm bảo fullscreen trên mobile
*/

// ---------------- helpers (UI detection) ----------------
// Các hàm này đã bị xóa trong phiên bản trước, tiếp tục giữ nguyên.

// ---------------- audio (WebAudio) ----------------
const AudioEngine = (function () {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  let enabled = true;

  function beep(type = 'sine', freq = 440, duration = 0.06, gain = 0.06) {
    if (!enabled) return;
    // Đảm bảo AudioContext đang hoạt động
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
  }

  return {
    playDrop() { beep('sine', 520, 0.03, 0.04); },
    playRotate() { beep('square', 720, 0.05, 0.05); },
    playClear() { beep('sawtooth', 320, 0.15, 0.08); },
    playGameOver() { beep('sine', 160, 0.4, 0.12); },
    toggle() { enabled = !enabled; return enabled; },
    enabled() { return enabled; }
  };
})();

// ---------------- Canvas + sizing ----------------
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const nextPieceCtx = nextPieceCanvas.getContext('2d');

let DPR = window.devicePixelRatio || 1;

const COLS = 10;
const ROWS = 20;
let cellSize = 32; // Sẽ được tính toán dựa trên kích thước canvas 320px
let nextPieceCellSize = 24; // Kích thước cell cho canvas next piece

function resizeCanvasToDesired(wpx, hpx) {
  const w = Math.floor(wpx);
  const h = Math.floor(hpx);
  DPR = window.devicePixelRatio || 1;
  
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  cellSize = Math.floor(Math.min(w / COLS, h / ROWS));

  // Cài đặt kích thước cho nextPieceCanvas
  const nextW = 128; // Kích thước width cố định trong HTML
  const nextH = 128; // Kích thước height cố định trong HTML
  nextPieceCanvas.style.width = nextW + 'px';
  nextPieceCanvas.style.height = nextH + 'px';
  nextPieceCanvas.width = Math.floor(nextW * DPR);
  nextPieceCanvas.height = Math.floor(nextH * DPR);
  nextPieceCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nextPieceCellSize = Math.floor(Math.min(nextW / 4, nextH / 4)); // Giả định mảnh ghép max 4x4
}

// ---------------- game state ----------------
const COLORS = ['#e74c3c','#f39c12','#27ae60','#3498db','#9b59b6','#16a085','#f1c40f'];
const SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  L: [[1,0],[1,0],[1,1]],
  J: [[0,1],[0,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]]
};

let board = [];
function newBoard(){
  board = Array.from({length: ROWS}, ()=> Array(COLS).fill(0));
}

// piece helpers
function cloneShape(shape){ return shape.map(r=>r.slice()); }
function rotateShape(shape){
  const h = shape.length, w = shape[0].length;
  const res = Array.from({length: w}, ()=> Array(h).fill(0));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) res[x][h-1-y]=shape[y][x];
  return res;
}

function getRandomPiece(){
  const types = Object.keys(SHAPES);
  const t = types[Math.floor(Math.random()*types.length)];
  const shape = cloneShape(SHAPES[t]);
  return { shape, x: Math.floor((COLS - shape[0].length)/2), y: 0, color: COLORS[Math.floor(Math.random()*COLORS.length)] };
}

function spawnPiece(){
  if (!nextPiece) { // Lần đầu tiên, tạo cả current và next
    current = getRandomPiece();
    nextPiece = getRandomPiece();
  } else { // Các lần sau, nextPiece trở thành current
    current = nextPiece;
    nextPiece = getRandomPiece();
  }
  drawNextPiece(nextPiece); // Vẽ mảnh ghép tiếp theo
}

let current = null;
let nextPiece = null;
let dropInterval = 700; // ms
let dropCounter = 0;
let lastTime = 0;
let score = 0;
let level = 1;
let isPaused = false;
let isGameOver = false;
let bestScore = 0;

function collideAt(posX,posY, shape) {
  for(let y=0;y<shape.length;y++) for(let x=0;x<shape[y].length;x++){
    if(!shape[y][x]) continue;
    const bx = posX + x;
    const by = posY + y;
    if(bx < 0 || bx >= COLS || by >= ROWS) return true;
    if(by>=0 && board[by][bx]) return true;
  }
  return false;
}

function mergePiece(){
  const sh = current.shape;
  for(let y=0;y<sh.length;y++) for(let x=0;x<sh[y].length;x++){
    if(sh[y][x] && current.y+y>=0) board[current.y+y][current.x+x] = current.color;
  }
}

function clearLines(){
  let cleared = 0;
  for(let y=ROWS-1; y>=0; y--){
    if(board[y].every(cell => cell !== 0)){
      board.splice(y,1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++; // re-check same index after splice
    }
  }
  if(cleared>0){
    score += cleared * 100 * level;
    dropInterval = Math.max(120, 700 - (level-1)*60);
    AudioEngine.playClear();
    level = 1 + Math.floor(score / 500);
    updateHud();
  }
}

function resetGame(){
  newBoard();
  score = 0;
  level = 1;
  dropInterval = 700;
  current = null; // reset current và nextPiece để spawnPiece tạo lại từ đầu
  nextPiece = null; 
  spawnPiece(); // Tạo mảnh ghép đầu tiên và tiếp theo
  isGameOver = false;
  isPaused = false;
  
  bestScore = localStorage.getItem('blockBestScore') || 0;
  
  updateHud();
  overlayHide();
}

function updateHud(){
  const sc = document.getElementById('score');
  const lv = document.getElementById('level');
  const bs = document.getElementById('best-score');
  if(sc) sc.textContent = 'Điểm: ' + score;
  if(lv) lv.textContent = 'Mức: ' + level;
  if(bs) bs.textContent = 'Cao nhất: ' + bestScore;
}

// ---------------- drawing ----------------
function drawCell(ctxObj, x, y, color, size){
  ctxObj.fillStyle = color;
  const pad = Math.max(1, Math.floor(size*0.06));
  ctxObj.fillRect(x*size+pad, y*size+pad, size-pad*2, size-pad*2);
  ctxObj.strokeStyle = 'rgba(255,255,255,0.06)';
  ctxObj.strokeRect(x*size+pad, y*size+pad, size-pad*2, size-pad*2);
}

function drawPieceObj(ctxObj, p, offsetX=0, offsetY=0, size){
  const sh = p.shape;
  for(let y=0;y<sh.length;y++) for(let x=0;x<sh[y].length;x++){
    if(sh[y][x]){
      drawCell(ctxObj, offsetX + x, offsetY + y, p.color, size);
    }
  }
}

function drawGrid(){
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const val = board[r][c];
      if(val){
        drawCell(ctx, c, r, val, cellSize);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c*cellSize, r*cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawNextPiece(piece){
  const nextW = nextPieceCanvas.width / DPR;
  const nextH = nextPieceCanvas.height / DPR;
  nextPieceCtx.clearRect(0,0,nextW,nextH);
  nextPieceCtx.fillStyle = '#333';
  nextPieceCtx.fillRect(0,0,nextW,nextH);
  
  if (piece) {
    // Căn giữa mảnh ghép trong khung xem trước
    const shapeW = piece.shape[0].length;
    const shapeH = piece.shape.length;
    const startX = Math.floor((nextW / nextPieceCellSize - shapeW) / 2);
    const startY = Math.floor((nextH / nextPieceCellSize - shapeH) / 2);
    drawPieceObj(nextPieceCtx, piece, startX, startY, nextPieceCellSize);
  }
}

function render(){
  ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);
  drawGrid();
  if(current) drawPieceObj(ctx, current, 0, 0, cellSize);
}

// ---------------- game loop ----------------
function update(time = 0){
  if(isPaused || isGameOver){ lastTime = time; requestAnimationFrame(update); return; }
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if(dropCounter > dropInterval){
    pieceDrop();
    dropCounter = 0;
  }
  render();
  requestAnimationFrame(update);
}

function pieceDrop(){
  current.y++;
  if(collideAt(current.x, current.y, current.shape)){
    current.y--;
    mergePiece();
    clearLines();
    spawnPiece(); // Spawn next piece (đã chuyển nextPiece thành current)
    if(collideAt(current.x,current.y,current.shape)){
      isGameOver = true;
      AudioEngine.playGameOver();

      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('blockBestScore', bestScore);
      }
      
      overlayShowGameOver();
    }
  } else {
    AudioEngine.playDrop();
  }
  updateHud();
}

// ---------------- controls ----------------
function moveLeft(){
  current.x--;
  if(collideAt(current.x, current.y, current.shape)) current.x++;
}
function moveRight(){
  current.x++;
  if(collideAt(current.x, current.y, current.shape)) current.x--;
}
function softDrop(){
  pieceDrop();
}
function hardDrop(){
  while(!collideAt(current.x, current.y+1, current.shape)){
    current.y++;
    score += 2; // Điểm thưởng khi hard drop
  }
  pieceDrop();
}
function rotatePiece(){
  const old = current.shape;
  const rotated = rotateShape(old);
  current.shape = rotated;
  if(collideAt(current.x, current.y, current.shape)){
    // Xử lý va chạm khi xoay - thử di chuyển ngang
    let offset = 1;
    let success = false;
    while(offset < 3) { // thử 2 lần sang trái/phải
      current.x += offset;
      if (!collideAt(current.x, current.y, current.shape)) { success = true; break; }
      current.x -= offset * 2; // thử bên kia
      if (!collideAt(current.x, current.y, current.shape)) { success = true; break; }
      current.x += offset; // quay lại vị trí ban đầu
      offset++;
    }
    if (!success) { // Nếu vẫn va chạm, quay lại hình cũ
      current.shape = old;
    }
  } else {
    AudioEngine.playRotate();
  }
  updateHud();
}

// Keyboard
document.addEventListener('keydown', (e)=>{
  if(isGameOver) return;
  if(e.key === 'ArrowLeft') { moveLeft(); e.preventDefault(); }
  else if(e.key === 'ArrowRight') { moveRight(); e.preventDefault(); }
  else if(e.key === 'ArrowDown') { softDrop(); e.preventDefault(); }
  else if(e.key === 'ArrowUp' || e.key === ' ') { rotatePiece(); e.preventDefault(); } // ' ' cho hard drop thay vì xoay
  else if(e.key.toLowerCase()==='p') { togglePause(); }
});

// Buttons (touch)
document.getElementById('btn-left')?.addEventListener('pointerdown', (e)=>{ e.preventDefault(); moveLeft(); });
document.getElementById('btn-right')?.addEventListener('pointerdown', (e)=>{ e.preventDefault(); moveRight(); });
document.getElementById('btn-down')?.addEventListener('pointerdown', (e)=>{ e.preventDefault(); softDrop(); });
document.getElementById('btn-rotate')?.addEventListener('pointerdown', (e)=>{ e.preventDefault(); rotatePiece(); });
document.getElementById('btn-reset')?.addEventListener('click', ()=>{ resetGame(); });
document.getElementById('btn-pause')?.addEventListener('click', ()=>{ togglePause(); });

// HUD top buttons
document.getElementById('btn-exit')?.addEventListener('click', ()=>{ window.history.back(); });
document.getElementById('btn-fullscreen')?.addEventListener('click', async ()=>{
  if (!document.fullscreenElement) {
    try { await document.documentElement.requestFullscreen(); } catch(e){ console.error("Error entering fullscreen:", e); }
  } else {
    try { await document.exitFullscreen(); } catch(e){ console.error("Error exiting fullscreen:", e); }
  }
});
document.getElementById('btn-sound')?.addEventListener('click', ()=>{
  const enabled = AudioEngine.toggle();
  document.getElementById('btn-sound').textContent = enabled ? '🔊' : '🔈';
});

// overlay actions
function overlayShowGameOver(){
  const ov = document.getElementById('overlay');
  if(ov){
    ov.classList.remove('hidden');
    document.getElementById('overlay-title').textContent = 'Game Over';
    document.getElementById('overlay-score').textContent = 'Điểm: ' + score;
    document.getElementById('overlay-best-score').textContent = 'Cao nhất: ' + bestScore;
  }
}
function overlayHide(){
  const ov = document.getElementById('overlay');
  if(ov) ov.classList.add('hidden');
}
document.getElementById('overlay-restart')?.addEventListener('click', ()=>{ resetGame(); overlayHide(); });
document.getElementById('overlay-back')?.addEventListener('click', ()=>{ window.history.back(); });

// pause
function togglePause(){
  isPaused = !isPaused;
  const btn = document.getElementById('btn-pause');
  if(btn) btn.textContent = isPaused ? '▶️ Tiếp tục' : '⏯️ Tạm dừng';
}

// ---------------- init ----------------
function init(){
  const headerPh = document.getElementById('header-placeholder');
  const footerPh = document.getElementById('footer-placeholder');
  if (headerPh) headerPh.style.display = 'none';
  if (footerPh) footerPh.style.display = 'none';
  document.body.classList.add('noscroll');

  resizeCanvasToDesired(320, 640);
  
  // Khởi tạo điểm cao nhất trước khi reset game
  bestScore = localStorage.getItem('blockBestScore') || 0;
  
  newBoard();
  spawnPiece(); // Lần đầu gọi sẽ tạo current và nextPiece
  resetGame(); // reset lại game và score, nhưng vẫn giữ nextPiece đã tạo
  updateHud();
  requestAnimationFrame(update);
}

/* ensure user interaction to resume AudioContext on some mobile browsers */
window.addEventListener('pointerdown', function resumeAudio(){
  if (typeof window.AudioContext !== 'undefined' && AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
    AudioEngine.ctx.resume().then(() => {
      console.log('AudioContext resumed!');
    }).catch(e => console.error("Error resuming AudioContext", e));
  }
  window.removeEventListener('pointerdown', resumeAudio);
});

init();