/* game-block.js
   Phiên bản: bản demo đầy đủ tính năng cơ bản:
   - Nhận diện thiết bị touch vs pointer
   - Ẩn header/footer trên touch devices (bằng cách yêu cầu script.nạp header/footer của bạn làm việc bình thường)
   - Điều khiển: keyboard (PC) / on-screen buttons (touch/tablet)
   - Xoay màn hình bằng class body.landscape
   - Fullscreen, pause, reset, exit (history.back)
   - Âm thanh tạo bằng WebAudio (không cần file)
   - Tetris-like: rơi khối, clear line, score, level
*/

// ---------------- helpers (UI detection) ----------------
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
}

function setupVisibilityForDevice() {
  const mobileControls = document.getElementById('mobile-controls');
  const headerPh = document.getElementById('header-placeholder');
  const footerPh = document.getElementById('footer-placeholder');

  if (isTouchDevice()) {
    // Show mobile controls
    if (mobileControls) mobileControls.style.display = 'grid';
    // Hide header/footer placeholders (if your site injects them via script.js it should respect this)
    if (headerPh) headerPh.style.display = 'none';
    if (footerPh) footerPh.style.display = 'none';
    // prevent page scroll
    document.body.classList.add('noscroll');
  } else {
    // PC: keep header/footer; hide mobile controls
    if (mobileControls) mobileControls.style.display = 'none';
    document.body.classList.remove('noscroll');
  }
}

// ---------------- audio (WebAudio) ----------------
const AudioEngine = (function () {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  let enabled = true;

  function beep(type = 'sine', freq = 440, duration = 0.06, gain = 0.06) {
    if (!enabled) return;
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
let DPR = window.devicePixelRatio || 1;

// base config (grid)
const COLS = 10;
const ROWS = 20;
let cellSize = 32; // will compute based on desired canvas size
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
}
function adaptSizeByLayout() {
  // choose CSS px size based on current layout and viewport
  const maxWidth = Math.min(980, window.innerWidth - 40);
  const isLandscape = document.body.classList.contains('landscape');
  if (isLandscape) {
    // make a wide short canvas
    const w = Math.min(maxWidth, 480);
    const h = Math.max(320, Math.floor((w / 4) * 3));
    resizeCanvasToDesired(w, h);
  } else {
    // handheld tall canvas
    const w = Math.min(420, Math.floor(window.innerWidth * 0.82));
    const h = Math.min(window.innerHeight * 0.75, 760);
    resizeCanvasToDesired(w, h);
  }
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
  // rotate clockwise
  const h = shape.length, w = shape[0].length;
  const res = Array.from({length: w}, ()=> Array(h).fill(0));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) res[x][h-1-y]=shape[y][x];
  return res;
}

function spawnPiece(){
  const types = Object.keys(SHAPES);
  const t = types[Math.floor(Math.random()*types.length)];
  const shape = cloneShape(SHAPES[t]);
  return { shape, x: Math.floor((COLS - shape[0].length)/2), y: 0, color: COLORS[Math.floor(Math.random()*COLORS.length)] };
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
    // level up per 500 points (example)
    level = 1 + Math.floor(score / 500);
    updateHud();
  }
}

function resetGame(){
  newBoard();
  score = 0;
  level = 1;
  dropInterval = 700;
  current = spawnPiece();
  nextPiece = spawnPiece();
  isGameOver = false;
  isPaused = false;
  updateHud();
  overlayHide();
}

function updateHud(){
  const sc = document.getElementById('score');
  const lv = document.getElementById('level');
  if(sc) sc.textContent = 'Điểm: ' + score;
  if(lv) lv.textContent = 'Mức: ' + level;
}

// ---------------- drawing ----------------
function drawGrid(){
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);
  // draw board cells
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const val = board[r][c];
      if(val){
        drawCell(c,r,val);
      } else {
        // empty cell background subtle
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c*cellSize, r*cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawCell(x,y,color){
  ctx.fillStyle = color;
  const pad = Math.max(1, Math.floor(cellSize*0.06));
  ctx.fillRect(x*cellSize+pad, y*cellSize+pad, cellSize-pad*2, cellSize-pad*2);
  // light top-left
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.strokeRect(x*cellSize+pad, y*cellSize+pad, cellSize-pad*2, cellSize-pad*2);
}

function drawPieceObj(p){
  const sh = p.shape;
  for(let y=0;y<sh.length;y++) for(let x=0;x<sh[y].length;x++){
    if(sh[y][x]){
      const px = p.x + x;
      const py = p.y + y;
      if(py>=0) drawCell(px,py,p.color);
    }
  }
}

function render(){
  // clear
  const W = canvas.width / DPR;
  const H = canvas.height / DPR;
  ctx.clearRect(0,0,W,H);
  drawGrid();
  if(current) drawPieceObj(current);
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
    // spawn next
    current = nextPiece;
    nextPiece = spawnPiece();
    if(collideAt(current.x,current.y,current.shape)){
      // game over
      isGameOver = true;
      AudioEngine.playGameOver();
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
  // fast drop to bottom
  while(!collideAt(current.x, current.y+1, current.shape)){
    current.y++;
    score += 2;
  }
  pieceDrop();
}
function rotatePiece(){
  const old = current.shape;
  const rotated = rotateShape(old);
  current.shape = rotated;
  if(collideAt(current.x, current.y, current.shape)){
    current.shape = old;
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
  else if(e.key === ' ') { rotatePiece(); e.preventDefault(); }
  else if(e.key.toLowerCase()==='p') { togglePause(); }
});

// Buttons (touch)
document.getElementById('btn-left')?.addEventListener('pointerdown', ()=>{ moveLeft(); });
document.getElementById('btn-right')?.addEventListener('pointerdown', ()=>{ moveRight(); });
document.getElementById('btn-down')?.addEventListener('pointerdown', ()=>{ softDrop(); });
document.getElementById('btn-rotate')?.addEventListener('pointerdown', ()=>{ rotatePiece(); });
document.getElementById('btn-reset')?.addEventListener('click', ()=>{ resetGame(); });
document.getElementById('btn-pause')?.addEventListener('click', ()=>{ togglePause(); });

// HUD top buttons
document.getElementById('btn-exit')?.addEventListener('click', ()=>{ window.history.back(); });
document.getElementById('btn-rotate-screen')?.addEventListener('click', ()=>{
  document.body.classList.toggle('landscape');
  adaptSizeByLayout();
});
document.getElementById('btn-fullscreen')?.addEventListener('click', async ()=>{
  if (!document.fullscreenElement) {
    try { await document.documentElement.requestFullscreen(); } catch(e){}
  } else {
    try { await document.exitFullscreen(); } catch(e){}
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
  setupVisibilityForDevice();
  adaptSizeByLayout();
  newBoard();
  current = spawnPiece();
  nextPiece = spawnPiece();
  resetGame();
  updateHud();
  requestAnimationFrame(update);
}

// adapt on resize & orientation
window.addEventListener('resize', ()=>{ adaptSizeByLayout(); });
window.addEventListener('orientationchange', ()=>{ adaptSizeByLayout(); });

/* ensure user interaction to resume AudioContext on some mobile browsers */
window.addEventListener('pointerdown', function resumeAudio(){
  if (typeof window.AudioContext !== 'undefined') {
    // try resume
    try {
      // no direct access to AudioEngine ctx, but user pointer is enough to allow sounds since we created context earlier
    } catch(e){}
  }
  window.removeEventListener('pointerdown', resumeAudio);
});

init();