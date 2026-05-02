const cv = document.getElementById("c");
const cx = cv.getContext('2d');
const W = 720, H = 440;
const PX = 48, PY = 36, PW = 624, PH = 368;
const GH = 96, GW = 14;
const GY = H / 2 - GH / 2;

let running = false;
let sp = 0, sc = 0, tLeft = 120;
let ticker = null;
let celebT = 0, celebMsg = '';
let lastKickT = 0;

const keys = {}

let P, B, CPU;

document.addEventListener('keydown', e=> {
    keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
        doKick();
    }
});

document.addEventListener('keyup', e=> {
    keys[e.code] = false;
});

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

function cap(obj, max) {
    const s = Math.hypot(obj.vx, obj.vy);
    if (s > max) {
        obj.vx = (obj.vx / s) * max;
        obj.vy = (obj.vy / s) * max;
    }
}

function reset() {
    P = { x: PX + PW * 0.22, y: H / 2, vx: 0, vy: 0 };
    B = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    CPU = [
        { x: PX + PW * 0.52, y: H / 2 - 65 },
        { x: PX + PW * 0.52, y: H / 2 + 65 },
        { x: PX + PW * 0.72, y: H / 2 },
        { x: PX + PW * 0.90, y: H / 2 },
    ];
}

function updPlayer() {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1

    const len = Math.hypot(dx, dy);
    if (len > 0) { dx /= len; dy /= len; }

    const spd = (keys['ShiftLeft'] || keys['ShiftRight']) ? 5.5 : 3.5;
    P.x = clamp(P.x + dx * spd, PX + 13, PX + PW - 13);
    P.y = clamp(P.y + dy * spd, PY + 13, PY + PH - 13);

    const bx = B.x - P.x, by = B.y - P.y, bd = Math.hypot(bx, by);
    if (bd < 23 && bd > 0) {
        B.vx += (bx / bd) * 2.2;
        B.vy += (by / bd) * 2.2;
        cap(B, 13);
    }
}

function doKick() {
    if (!running) return;
    const now = Date.now();
    if (now - lastKickT < 250) return;
    lastKickT = now;

    const bx = B.x - P.x, by = B.y - P.y, bd = Math.hypot(bx, by);
    if (bd < 32) {
        const ang = Math.atan2(by, bx);
        B.vx = Math.cos(ang) * 12;
        B.vy = Math.sin(ang) * 12;
        B.vx += (PX + PW - B.x) / 70;
        B.vy += (H / 2 - B.y) / 140;
        cap(B, 15);
    }
}

function updCPU() {
    CPU.forEach((a, i) => {
        let tx, ty;

        if (i === 3) {
            tx = PX + PW - 22;
            ty = clamp(B.y, GY + 14, GY + GH - 14);
        } else {
            tx = B.x - 10;
            ty = B.y + (i === 0 ? -18 : i === 1 ? 18 : 0);
        }

        const ddx = tx - a.x, ddy = ty - a.y, dd = Math.hypot(ddx, ddy);
        const spd = i === 3 ? 2.2 : 2.7;
        if (dd > 1) {
            a.x += (ddx / dd) * spd;
            a.y += (ddy / dd) * spd;
        }
        a.x = clamp(a.x, PX + 13, PX + PW - 13);
        a.y = clamp(a.y, PY + 13, PY + PH - 13);

        const bx = B.x - a.x, by = B.y - a.y, bd = Math.hypot(bx, by);
        if (bd < 23 && bd > 0) {
            B.vx += (bx / bd) * 2.0;
            B.vy += (by / bd) * 2.0;
            B.vx += (PX - B.x) / 300;
            B.vy += (H / 2 - B.y) / 300;
            cap(B, 12);
        }
    });
}

function updBall() {
    B.vx *= 0.974;
    B.vy *= 0.974;
    if (Math.abs(B.vx) < 0.04) B.vx = 0;
    if (Math.abs(B.vy) < 0.04) B.vy = 0;
    B.x += B.vx;
    B.y += B.vy;

    if (B.x - 8 < PX) {
        if (B.y > GY && B.y < GY + GH) {
            sc++;
            document.getElementById('sc').textContent = sc;
            celebMsg = 'BOT GOAAAL!';
            celebT = 140;
            reset();
            return;
        }
        B.x = PX + 8;
        B.vx = Math.abs(B.vx) * 0.6;
    }
    if (B.x + 8 > PX + PW) {
        if (B.y > GY && B.y < GY + GH) {
            sp++;
            document.getElementById('sp').textContent = sp;
            celebMsg = 'GOAAAAL!'
            celebT = 140;
            reset();
            return;
        }
        B.x = PX + PW - 8;
        B.vx = -Math.abs(B.vx) * 0.6;
    }
    if (B.y - 8 < PY) {
        B.y = PY + 8;
        B.vy = Math.abs(B.vy) * 0.6;
    }
    if (B.y + 8 > PY + PH) {
        B.y = PY + PH - 8;
        B.vy = -Math.abs(B.vy) * 0.6;
    }
}

function tick() {
    if (!running) return;
    tLeft--;
    if (tLeft <= 0) {tLeft = 0; endGame(); }
    const m = Math.floor(tLeft / 60);
    const s = String(tLeft % 60).padStart(2, '0');
    document.getElementById('timer').style.color = '#ff4444';
}

function endGame() {
    running = false;
    clearInterval(ticker);
    const ov = document.getElementById('overlay');
    let title, col;
    if (sp > sc) {
        title = 'YOU WIN!'; 
        col = '#e8c84a';
    }
    else if (sc > sp) {
        title = 'THE BOT WINS!'; 
        col = '#ff5555';
    }
    else {
        title = 'DRAW';
        col = '#aaa'
    }
    ov.innerHTML = `
    <h2 style="color:${col}">${title}</h2>
    <div style="font-size:50px;font-weight:900;margin:8px 0">${sp} - ${sc}</div>
    <p style="color:#666">FULL TIME</p>
    <button onclick="startGame()">PLAY AGAIN</button>
    `;
    ov.style.display = 'flex';
}

function startGame() {
    sp = 0; sc = 0; tLeft = 120; celebT = 0;
    document.getElementById('sp').textContent = '0';
    document.getElementById('sc').textContent = '0';
    document.getElementById('timer').textContent = '2:00';
    document.getElementById('timer').style.color = '#aaa';
    reset();
    document.getElementById('overlay').style.display = 'none';
    running = true;
    clearInterval(ticker);
    ticker = setInterval(tick, 1000);
}

function drawPitch() {
    cx.fillStyle = '#2d8040';
    cx.fillRect(0, 0, W, H);

    for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) {
            cx.fillStyle = 'rgba(0,0,0,0.07)';
            cx.fillRect(PX + i * (PW / 8), PY, PW / 8, PH);
        }
    }

    cx.strokeStyle = 'rgba(255,255,255,0.9)';
    cx.lineWidth = 2.5;
    cx.strokeRect(PX, PY, PW, PH);

    cx.beginPath();
    cx.moveTo(W / 2, PY);
    cx.lineTo(W / 2, PY + PH);
    cx.stroke();

    cx.beginPath();
    cx.arc(W / 2, H / 2, 55, 0, Math.PI * 2);
    cx.stroke();

    cx.fillStyle = 'rgba(255,255,255,0.9)';
    cx.beginPath();
    cx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);
    cx.fill();

    cx.lineWidth = 2;
    cx.strokeRect(PX, H / 2 - 85, 90, 170);
    cx.stokeRect(PX + PW - 90, H / 2 - 85, 90, 170);

    cx.fillStyle = 'rgba(255,255,255,0.28)';
    cx.fillRect(PX - GW, GY, GW, GH);
    cx.fillRect(PX + PW, GY, GW, GH);
    cx.strokeStyle = '#fff';
    cx.lineWidth = 2.5;
    cx.strokeRect(PX - GW, GY, GW, GH);
    cx.strokeRect(PX + PW, GY, GW, GH);

    cx.strokeStyle = 'rgba(255,255,255,0.28)';
    cx.lineWidth = 0.6;
    for (let i = 1; i < 5; i++) {
        const ny = GY + i * (GH / 5);
        cx.beginPath();
        cx.moveTo(PX - GW, ny);
        cx.lineTo(PX, ny);
        cx.stroke();
        cxbeginPath();
        cx.moveTo(PX + PW, ny);
        cx.lineTo(PX + PW + GW, ny);
        cx.stroke();
    }
}

function drawAgent(x, y, outerColor, innerColor, label) {
    const R = 13;
    cx.fillStyle = 'rgba(0,0,0,0.35)';
    cx.beginPath();
    cx.ellipse(x + 2, y + 6, R * 0.88, R * 0.36, 0, 0, Math.PI * 2);
    cx.fill();

    cx.fillStyle = outerColor;
    cx.beginPath();
    cx.arc(x, y, R, 0, Math.PI * 2);
    cx.fill();

    cx.strokeStyle = 'rgba(0,0,0,0.6)';
    cx.lineWidth = 1.8;
    cx.beginPath();
    cx.arc(x, y, R, 0, Math.PI * 2);
    cx.stroke();

    cx.fillStyle = innerColor;
    cx.beginPath();
    cx.arc(x, y, R * 0.56, 0, Math.PI * 2);
    cx.fill();

    cx.fillStyle = '#fff';
    cx.font = 'bold 8px Courier New';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(label, x, y);
}

function drawBall() {
    const r = 8;

    cx.fillStyle = 'rgba(0,0,0,0.32)';
    cx.beginPath();
    cx.ellipse(B.x + 2, B.y + 5, r * 0.85, r * 0.35, 0, 0, Math.PI * 2);
    cx.fill();

    cx.fillStyle = '#f5f5f5';
    cx.beginPath();
    cx.arc(B.x, B.y, r, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = '#bbb';
    cx.lineWidth = 0.5;
    cx.stroke();

    cx.fillStyle = '#1a1a1a';
    cx.beginPath();
    cx.arc(B.x, B.y, r * 0.35, 0, Math.PI * 2);
    cx.fill();

    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        cx.fillStyle = '#222';
        cx.beginPath();
        cx.arc(B.x + Math.cos(a) * r * 0.62, B.y + Math.sin(a) * r * 0.62, r * 0.22, 0, Math.PI * 2);
        cx.fill();
    }

    cx.fillStyle = 'rgba(255,255,255,0.72)';
    cx.beginPath();
    cx.arc(B.x - r * 0.3, B.y - r * 0.32, r * 0.22, 0, Math.PI * 2);
    cx.fill();
}

function drawCelebration() {
    if (celebT <= 0) return;
    cx.
}