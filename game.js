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

