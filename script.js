/**
 * TUYUL VULKANIK - OFFICIAL ARCADE SCRIPT (OPTIMIZED FOR 1000 PTS)
 */

let score = 0;
let quizScore = 0;
let gameActive = false;
let gameLoop;
let isDiscountApplied = false;
let selectedMode = ''; 

document.addEventListener('DOMContentLoaded', () => {
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 
    setupGameControls();
});

// --- 1. DATA KUIS ---
const quizData = [
    { q: "Semua TuyOul suka abu vulkanik. Sebagian penghuni kawah bukan TuyOul. Kesimpulannya?", a: ["Semua penghuni kawah suka abu", "Sebagian penghuni kawah suka abu", "Ada penghuni kawah yang bukan TuyOul"], correct: 2 },
    { q: "Jika stok TuyOul melimpah, maka harga diskon. Saat ini harga tidak diskon. Maka...", a: ["Stok TuyOul tidak melimpah", "Stok TuyOul sangat banyak", "Pembeli tidak mau beli"], correct: 0 },
    { q: "Pola Bilangan: 2, 4, 7, 12, 19, ... Berapakah angka selanjutnya?", a: ["28", "30", "31"], correct: 1 },
    { q: "Semua produk Vulkanik awet. Botol ini adalah produk Vulkanik. Jadi...", a: ["Botol ini mungkin awet", "Botol ini pasti awet", "Semua botol awet"], correct: 1 },
    { q: "Jika TuyOul rajin belajar, maka ia pintar. Jika TuyOul pintar, maka ia menang kuis. Kesimpulannya?", a: ["Jika TuyOul rajin belajar, maka ia menang kuis", "TuyOul menang kuis karena rajin", "Hanya TuyOul pintar yang rajin belajar"], correct: 0 },
    { q: "Pola Huruf: B, D, G, K, ... Huruf apakah selanjutnya?", a: ["N", "O", "P"], correct: 2 },
    { q: "Lima TuyOul (A, B, C, D, E) antre koin. A di depan B. C di belakang D. E tepat di depan A. Siapa yang paling depan?", a: ["E", "A", "D"], correct: 0 },
    { q: "Sebagian TuyOul memakai topi. Semua yang memakai topi terlihat keren. Maka...", a: ["Semua TuyOul terlihat keren", "Sebagian TuyOul terlihat keren", "TuyOul yang tidak memakai topi tidak keren"], correct: 1 },
    { q: "Pola Bilangan: 100, 95, 85, 70, 50, ... Berapakah angka selanjutnya?", a: ["25", "30", "20"], correct: 0 },
    { q: "Jika hari ini hujan, TuyOul berteduh. Hari ini TuyOul tidak berteduh. Maka...", a: ["Hari ini cerah", "Hari ini tidak hujan", "Kawah sedang penuh"], correct: 1 }
];

function startQuiz() {
    quizScore = 0;
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'block';
    loadQuestion(0);
}

function loadQuestion(index) {
    if (index >= quizData.length) {
        if (quizScore >= 70) {
            alert("🔥 Skor: " + quizScore + ". Lulus Seleksi! Diskon Aktif!");
            applyDiscount();
            showWin();
        } else {
            alert("Skor " + quizScore + ". Belum cukup sakti!");
            backToMenu();
        }
        return;
    }
    const data = quizData[index];
    document.getElementById('quiz-question').innerText = `Pertanyaan ${index + 1}: ${data.q}`;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    data.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === data.correct) { quizScore += 10; loadQuestion(index + 1); }
            else { alert("Salah!"); backToMenu(); }
        };
        optionsDiv.appendChild(btn);
    });
}

// --- 2. NAVIGASI ---
function selectGame(mode) {
    selectedMode = mode;
    gameActive = false;
    clearTimeout(gameLoop);
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-window').style.display = 'block';
    const jumpBtn = document.getElementById('virtual-jump-btn');
    const player = document.getElementById('player');
    player.innerHTML = '<img src="maskot-tuyul.png" class="tuyul-sprite">'; 
    player.style.bottom = "10px";
    player.style.top = "";

    if(mode === 'runner') {
        player.className = 'player-runner';
        jumpBtn.style.display = 'inline-block';
    } else if(mode === 'flappy') {
        player.className = 'player-flappy';
        player.style.top = "200px";
        jumpBtn.style.display = 'inline-block';
    } else {
        player.className = 'player-coin';
        jumpBtn.style.display = 'none';
    }
}

function startAction() {
    if(gameActive) return;
    score = 0;
    gameActive = true;
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('voucher-popup').style.display = 'none';
    document.querySelectorAll('.coin, .obstacle, .pipe, .bomb').forEach(el => el.remove());

    if(selectedMode === 'coin') spawnCoin();
    else if(selectedMode === 'runner') spawnObstacle();
    else if(selectedMode === 'flappy') startFlappyLogic();
}

function backToMenu() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.getElementById('game-window').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
}

// --- 3. GAME LOGIC (TARGET 1000) ---
function spawnCoin() {
    if (!gameActive || selectedMode !== 'coin') return;
    const board = document.getElementById('game-board');
    const coin = document.createElement('div');
    const isBomb = Math.random() < 0.25;
    coin.className = isBomb ? 'coin bomb' : 'coin';
    coin.innerHTML = isBomb ? '💣' : '💰';
    coin.style.left = Math.random() * (board.offsetWidth - 40) + 'px';
    coin.style.top = '-50px';
    board.appendChild(coin);

    let fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); coin.remove(); return; }
        let top = parseInt(coin.style.top);
        const player = document.getElementById('player');
        
        // Cek Tabrakan
        if (top > 330 && top < 380 && Math.abs(coin.offsetLeft - player.offsetLeft) < 50) {
            if(isBomb) {
                score = Math.max(0, score - 50);
                board.classList.add('shake-effect');
                setTimeout(() => board.classList.remove('shake-effect'), 200);
            } else {
                score += 20; // Kasih 20 poin biar ke 1000 ga kelamaan
            }
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 1000) showWin();
            clearInterval(fall); coin.remove();
        } else if (top > 400) {
            clearInterval(fall); coin.remove();
        } else {
            // Speed scaling diatur agar tidak terlalu liar di skor tinggi
            coin.style.top = (top + 5 + (score/200)) + 'px';
        }
    }, 20);
    gameLoop = setTimeout(spawnCoin, Math.max(400, 800 - (score/5)));
}

// --- PERBAIKAN RUNNER (HITBOX LEBIH ADIL) ---
function spawnObstacle() {
    if (!gameActive || selectedMode !== 'runner') return;
    const board = document.getElementById('game-board');
    const obs = document.createElement('div');
    obs.className = 'obstacle';
    obs.innerHTML = '🔥';
    board.appendChild(obs);

    let pos = board.offsetWidth;
    let move = setInterval(() => {
        if (!gameActive) { clearInterval(move); obs.remove(); return; }
        
        // Kecepatan gerak rintangan
        pos -= (6 + (score/200)); 
        obs.style.left = pos + 'px';

        const player = document.getElementById('player');
        // Ambil posisi realtime dengan getBoundingClientRect untuk akurasi tinggi
        const pRect = player.getBoundingClientRect();
        const oRect = obs.getBoundingClientRect();

        // LOGIKA HITBOX (Dikecilkan 15px agar tidak gampang mati)
        const isColliding = (
            pRect.right - 15 > oRect.left + 15 && 
            pRect.left + 15 < oRect.right - 15 && 
            pRect.bottom - 5 > oRect.top + 5
        );

        if (isColliding) {
            gameOver("Waduh, TuyOul-mu kepanasan kena api!");
            clearInterval(move);
            obs.remove();
        } else if (pos < -50) {
            score += 25;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 1000) showWin();
            clearInterval(move);
            obs.remove();
        }
    }, 16); // 16ms = 60fps, lebih halus dari 20ms
    
    // Jarak antar api (Makin tinggi skor, makin sering muncul tapi ada batas minimal)
    let nextSpawn = Math.max(700, 1500 - (score/2));
    gameLoop = setTimeout(spawnObstacle, nextSpawn);
}

// --- JUMP YANG LEBIH RESPONSIF ---
function doJump() {
    if (!gameActive) return;
    const p = document.getElementById('player');
    
    if (selectedMode === 'runner') {
        if (!p.classList.contains("jump-animation")) {
            p.classList.add("jump-animation");
            // Durasi animasi di CSS harus pas (misal 0.5s)
            setTimeout(() => p.classList.remove("jump-animation"), 500);
        }
    } else if (selectedMode === 'flappy') {
        // Buat flappy lebih ringan
        let currentTop = parseInt(p.style.top) || 200;
        p.style.top = (currentTop - 65) + 'px';
    }
}

function startFlappyLogic() {
    const player = document.getElementById('player');
    let velocity = 0;
    let gravityInterval = setInterval(() => {
        if(!gameActive || selectedMode !== 'flappy') { clearInterval(gravityInterval); return; }
        velocity += 0.25;
        let top = parseInt(player.style.top) || 200;
        player.style.top = (top + velocity) + 'px';
        if(top > 375 || top < -20) { gameOver("Jatuh!"); clearInterval(gravityInterval); }
    }, 20);
    spawnPipe();
}

function spawnPipe() {
    if (!gameActive || selectedMode !== 'flappy') return;
    const board = document.getElementById('game-board');
    const pipeHeight = Math.random() * 150 + 50;
    const pTop = document.createElement('div');
    const pBot = document.createElement('div');
    pTop.className = 'pipe'; pBot.className = 'pipe';
    pTop.style.height = pipeHeight + 'px'; pTop.style.top = '0';
    pBot.style.height = (board.offsetHeight - pipeHeight - 160) + 'px'; pBot.style.bottom = '0';
    pTop.style.left = board.offsetWidth + 'px'; pBot.style.left = board.offsetWidth + 'px';
    board.appendChild(pTop); board.appendChild(pBot);

    let moveP = setInterval(() => {
        if (!gameActive) { clearInterval(moveP); pTop.remove(); pBot.remove(); return; }
        let x = parseInt(pTop.style.left) - 4;
        pTop.style.left = x + 'px'; pBot.style.left = x + 'px';

        const pRect = document.getElementById('player').getBoundingClientRect();
        const tRect = pTop.getBoundingClientRect();
        const bRect = pBot.getBoundingClientRect();

        if ((pRect.right > tRect.left && pRect.left < tRect.right && pRect.top < tRect.bottom) ||
            (pRect.right > bRect.left && pRect.left < bRect.right && pRect.bottom > bRect.top)) {
            gameOver("Tabrak!"); clearInterval(moveP);
        }
        if (x < -60) {
            score += 50; // Flappy lebih susah, poin lebih besar
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 1000) showWin();
            clearInterval(moveP); pTop.remove(); pBot.remove();
        }
    }, 20);
    gameLoop = setTimeout(spawnPipe, 1800);
}

// --- 4. KONTROL ---
function setupGameControls() {
    const board = document.getElementById('game-board');
    const moveH = (e) => {
        if (!gameActive || selectedMode !== 'coin') return;
        const rect = board.getBoundingClientRect();
        let x = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - rect.left;
        if (x > 25 && x < rect.width - 25) document.getElementById('player').style.left = (x - 25) + 'px';
    };
    board.addEventListener('mousemove', moveH);
    board.addEventListener('touchmove', moveH, { passive: false });

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space") { e.preventDefault(); doJump(); }
    });
    
    // Virtual Button Support
    const btn = document.getElementById('virtual-jump-btn');
    if(btn) btn.onclick = doJump;
}

function doJump() {
    if (!gameActive) return;
    const p = document.getElementById('player');
    if (selectedMode === 'runner' && !p.classList.contains("jump-animation")) {
        p.classList.add("jump-animation");
        setTimeout(() => p.classList.remove("jump-animation"), 500);
    } else if (selectedMode === 'flappy') {
        let currentTop = parseInt(p.style.top);
        p.style.top = (currentTop - 60) + 'px';
    }
}

function gameOver(msg) {
    gameActive = false;
    alert("GAME OVER: " + msg);
    backToMenu();
}

function showWin() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.getElementById('voucher-popup').style.display = 'block';
}

function applyDiscount() {
    isDiscountApplied = true;
    document.querySelectorAll('.display-price').forEach(el => {
        const original = parseInt(el.getAttribute('data-original'));
        el.style.textDecoration = "line-through";
        el.style.color = "#888";
        if (!el.nextElementSibling?.classList.contains('new-price')) {
            const tag = document.createElement('span');
            tag.className = 'new-price';
            tag.innerText = " Rp " + (original * 0.5).toLocaleString('id-ID');
            el.parentNode.insertBefore(tag, el.nextSibling);
        }
    });
}

function setupWhatsAppOrdering() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-secondary')) {
            const card = e.target.closest('.product-card');
            const title = card.querySelector('.product-title').innerText;
            const price = card.querySelector('.new-price')?.innerText || card.querySelector('.display-price').innerText;
            const text = encodeURIComponent(`Order TuyOul Vulkanik\nProduk: ${title}\nHarga: ${price}`);
            window.open(`https://wa.me/6281804554719?text=${text}`, '_blank');
        }
    });
}

function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function highlightActiveProductCards() {
    document.querySelectorAll('.product-card').forEach(c => {
        c.onmouseenter = () => c.style.borderColor = '#ff5722';
        c.onmouseleave = () => c.style.borderColor = '#333';
    });
}
