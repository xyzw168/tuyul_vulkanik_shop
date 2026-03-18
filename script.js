/**
 * TUYUL VULKANIK Website JavaScript
 * Fungsionalitas: Multi-Game (Coin & Runner), Smooth Scroll, 
 * WhatsApp Automation, dan Sistem Diskon 50%.
 */

let score = 0;
let quizScore = 0;
let gameActive = false;
let gameLoop;
let isDiscountApplied = false;
let selectedMode = ''; // 'coin' atau 'runner'

document.addEventListener('DOMContentLoaded', () => {
    console.log("Website TUYUL VULKANIK - Arcade Mode Ready.");
    
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 
    setupGameControls();
});
function startQuiz() {
    quizScore = 0; // Reset skor setiap mulai baru
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'block';
    loadQuestion(0);
}
function loadQuestion(index) {
    // 1. Cek jika soal sudah habis
    if (index >= quizData.length) {
        alert("🔥 TOTAL SKOR QUIZ: " + quizScore);
        
        if (quizScore >= 90) { // Syarat lulus misal minimal skor 70
            alert("Selamat! Kamu lulus ujian TuyOul. Diskon Aktif!");
            applyDiscount();
            showWin();
        } else {
            alert("Skor kamu kurang dari 90. Coba lagi ya!");
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
            if (i === data.correct) {
                // Skor otomatis: 100 dibagi total soal (100/10 = 10 poin per soal)
                quizScore += (100 / quizData.length); 
                loadQuestion(index + 1);
            } else { 
                alert("Salah! Jawaban yang benar adalah: " + data.a[data.correct]);
                alert("Skor Akhir: " + quizScore);
                backToMenu(); 
            }
        };
        optionsDiv.appendChild(btn);
    });
}
// --- 1. NAVIGASI & VISUAL ---
function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function highlightActiveProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() { this.classList.add('hover-js'); });
        card.addEventListener('mouseleave', function() { this.classList.remove('hover-js'); });
    });
}

// --- 2. SISTEM MENU & KONTROL GAME ---
function selectGame(mode) {
    selectedMode = mode;
    gameActive = false;
    clearTimeout(gameLoop);
    
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-window').style.display = 'block';
    // TAMBAHKAN INI: Pastikan jendela quiz tertutup saat masuk ke mode game visual
    document.getElementById('quiz-window').style.display = 'none'; 
    
    const jumpBtn = document.getElementById('virtual-jump-btn');
    const player = document.getElementById('player');

    // Reset posisi dan class agar tidak terbawa dari mode sebelumnya
    player.style.top = ""; 
    player.style.bottom = "10px";

    if(mode === 'runner') {
        player.innerHTML = '<img src="maskot-tuyul.png" class="tuyul-sprite">'; 
        player.className = 'player-runner';
        player.style.left = "50px"; 
        if(jumpBtn) { 
            jumpBtn.style.display = 'inline-block'; 
            jumpBtn.innerText = "JUMP!"; 
        }
    } else if(mode === 'flappy') {
        player.innerHTML = '🦇'; 
        player.className = 'player-flappy';
        player.style.left = "80px";
        player.style.top = "200px"; 
        if(jumpBtn) { 
            jumpBtn.style.display = 'inline-block'; 
            jumpBtn.innerText = "FLY!"; 
        }
    } else { // Mode Coin
        player.innerHTML = '💰';
        player.className = 'player-coin';
        player.style.left = "50%";
        if(jumpBtn) jumpBtn.style.display = 'none';
    }
}
// --- SISTEM NAVIGASI BALIK KE MENU ---
function backToMenu() {
    // 1. Matikan status game dan hentikan semua loop/timer
    gameActive = false;
    clearTimeout(gameLoop);
    
    // 2. Bersihkan semua objek game yang masih ada di layar (koin, api, pipa, bom)
    document.querySelectorAll('.coin, .obstacle, .pipe, .bomb').forEach(el => el.remove());
    
    // 3. Reset tampilan visual Player ke posisi aman
    const player = document.getElementById('player');
    player.className = ''; 
    player.style.top = ""; 
    player.style.bottom = "10px";
    
    // 4. Sembunyikan jendela Game dan jendela Quiz
    document.getElementById('game-window').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'none';
    
    // 5. Munculkan kembali Menu Utama
    document.getElementById('game-menu').style.display = 'block';
    
    // 6. Reset skor biar gak numpuk ke game berikutnya
    score = 0;
    document.getElementById('score').innerText = "Skor: 0";
    
    console.log("Kembali ke Menu Utama - Sistem Reset.");
}

function startAction() {
    if(gameActive) return;
    score = 0;
    gameActive = true;
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('voucher-popup').style.display = 'none';
    
    // Bersihkan sisa objek game lama
    document.querySelectorAll('.coin, .obstacle, .pipe').forEach(el => el.remove());

    if(selectedMode === 'coin') {
        spawnCoin();
    } else if(selectedMode === 'runner') {
        spawnObstacle();
    } else if(selectedMode === 'flappy') {
        startFlappyLogic(); // Panggil fungsi khusus flappy
    }
}

// --- 3. LOGIKA GAME KOIN (DIREVISI: LEBIH SULIT) ---
function spawnCoin() {
    if (!gameActive || selectedMode !== 'coin') return;
    
    const board = document.getElementById('game-board');
    const coin = document.createElement('div');
    coin.className = 'coin';
    
    // 20% Muncul Bom untuk mempersulit game
    const isBomb = Math.random() < 0.2;
    coin.innerHTML = isBomb ? '💣' : '💰';
    
    coin.style.left = Math.random() * (board.offsetWidth - 40) + 'px';
    coin.style.top = '-40px';
    board.appendChild(coin);

    // Speed meningkat seiring skor
    let fallSpeed = 5 + (score / 25); 

    let fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); coin.remove(); return; }
        
        let top = parseInt(coin.style.top);
        const player = document.getElementById('player');
        
        // Deteksi Tangkap (Menggunakan posisi relatif yang lebih akurat)
        const pLeft = player.offsetLeft;
        const cLeft = coin.offsetLeft;

        if (top > 330 && top < 380 && Math.abs(cLeft - pLeft) < 45) {
            if(isBomb) {
                score = Math.max(0, score - 20);
                board.classList.add('shake-effect');
                setTimeout(() => board.classList.remove('shake-effect'), 300);
            } else {
                score += 10;
            }
            
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(fall);
            coin.remove();
        } else if (top > 400) {
            clearInterval(fall);
            coin.remove();
        } else {
            coin.style.top = (top + fallSpeed) + 'px';
        }
    }, 20);

    // Delay spawn makin cepat
    gameLoop = setTimeout(spawnCoin, Math.max(300, 900 - score * 5));
}

// --- 4. LOGIKA GAME RUNNER ---
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
        
        pos -= (7 + score/50);
        obs.style.left = pos + 'px';

        const player = document.getElementById('player');
        let pBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
        
        if (pos < 90 && pos > 40 && pBottom < 50) {
            gameActive = false;
            alert("Yah! TuyOul-mu kena api. Skor akhir: " + score);
            backToMenu();
            clearInterval(move);
            obs.remove();
        }

        if (pos < -50) {
            score += 10;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(move);
            obs.remove();
        }
    }, 20);

    gameLoop = setTimeout(spawnObstacle, Math.random() * (1800 - 800) + 800);
}

// --- 5. KONTROL INPUT (MOUSE, TOUCH, KEYBOARD) ---
function setupGameControls() {
    const board = document.getElementById('game-board');

    // 1. Kontrol Geser (Mouse & Touch) - KHUSUS KOIN
    const moveHandler = (e) => {
        if (!gameActive || selectedMode !== 'coin') return;
        const rect = board.getBoundingClientRect();
        let x = (e.type === 'touchmove') ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const player = document.getElementById('player');
        
        if (x > 25 && x < rect.width - 25) {
            player.style.left = (x - 25) + 'px'; // Center player to cursor
        }
    };

    board.addEventListener('mousemove', moveHandler);
    board.addEventListener('touchmove', moveHandler, { passive: false });

    // 2. Tombol Loncat Virtual (Muncul di Game Runner)
    if (!document.getElementById('virtual-jump-btn')) {
        const jumpBtn = document.createElement('button');
        jumpBtn.id = 'virtual-jump-btn';
        jumpBtn.innerText = 'JUMP!';
        jumpBtn.style.display = 'none';
        // Cari container kontrol (biasanya di bawah game board)
        const controlContainer = document.querySelector('.game-controls') || board.parentNode;
        controlContainer.appendChild(jumpBtn);
        
        jumpBtn.addEventListener('click', doJump);
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            doJump();
        });
    }

    // 3. Kontrol Keyboard
    window.addEventListener("keydown", (e) => {
        if(!gameActive) return;
        if (e.code === "Space") doJump();
        
        if (selectedMode === 'coin') {
            const player = document.getElementById('player');
            let left = player.offsetLeft;
            if(e.key === "ArrowLeft" && left > 20) player.style.left = (left - 30) + "px";
            if(e.key === "ArrowRight" && left < 330) player.style.left = (left + 30) + "px";
        }
    });
}

function doJump() {
    if (!gameActive) return;
    const player = document.getElementById('player');

    if (selectedMode === 'runner') {
        if (!player.classList.contains("jump-animation")) {
            player.classList.add("jump-animation");
            setTimeout(() => player.classList.remove("jump-animation"), 500);
        }
    } else if (selectedMode === 'flappy') {
        let top = parseInt(player.style.top) || 200;
        // Loncat ke atas 60px
        player.style.top = Math.max(0, top - 60) + 'px';
    }
}
function showWin() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.getElementById('voucher-popup').style.display = 'block';
}

// --- 6. DISKON & WHATSAPP ---
function applyDiscount() {
    isDiscountApplied = true;
    document.getElementById('voucher-popup').style.display = 'none';
    
    const priceElements = document.querySelectorAll('.display-price');
    priceElements.forEach(el => {
        const originalValue = parseInt(el.getAttribute('data-original'));
        const discountedValue = originalValue * 0.5;
        
        el.style.textDecoration = "line-through";
        el.style.color = "#888";
        
        if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('new-price')) {
            const newPriceTag = document.createElement('span');
            newPriceTag.className = 'new-price';
            newPriceTag.style.color = "#ff5722";
            newPriceTag.style.fontWeight = "bold";
            newPriceTag.innerText = " Rp " + discountedValue.toLocaleString('id-ID');
            el.parentNode.insertBefore(newPriceTag, el.nextSibling);
        }
    });
    alert("🔥 MANTAP! Diskon 50% Berhasil Diklaim.");
}

function setupWhatsAppOrdering() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-secondary')) {
            const card = e.target.closest('.product-card');
            if (!card) return;

            e.preventDefault();
            const namaProduk = card.querySelector('.product-title').innerText;
            const hargaFinal = card.querySelector('.new-price')?.innerText || card.querySelector('.display-price').innerText;
            const statusDiskon = isDiscountApplied ? "*SUDAH KLAIM DISKON 50%*" : "Harga Normal";
            
            const pesan = encodeURIComponent(
                `🌋 Order TUYUL VULKANIK 🌋\n\n` +
                `Produk: ${namaProduk}\n` +
                `Harga: ${hargaFinal}\n` +
                `Status: ${statusDiskon}\n\n` +
                `Mohon info pembayarannya!`
            );
            
            window.open(`https://wa.me/6281804554719?text=${pesan}`, '_blank');
        }
    });
}
// --- LOGIKA TUYOUL FLAPPY ---
function spawnPipe() {
    if (!gameActive || selectedMode !== 'flappy') return;

    const board = document.getElementById('game-board');
    const gap = 150; // Celah pipa
    const pipeWidth = 50;
    const minPipeHeight = 50;
    const pipeHeight = Math.random() * (board.offsetHeight - gap - (2 * minPipeHeight)) + minPipeHeight;

    // Pipa Atas
    const pipeTop = document.createElement('div');
    pipeTop.className = 'pipe';
    pipeTop.style.height = pipeHeight + 'px';
    pipeTop.style.top = '0';
    pipeTop.style.left = board.offsetWidth + 'px';
    board.appendChild(pipeTop);

    // Pipa Bawah
    const pipeBottom = document.createElement('div');
    pipeBottom.className = 'pipe';
    pipeBottom.style.height = (board.offsetHeight - pipeHeight - gap) + 'px';
    pipeBottom.style.bottom = '0';
    pipeBottom.style.left = board.offsetWidth + 'px';
    board.appendChild(pipeBottom);

    let pipeMove = setInterval(() => {
        if (!gameActive) { clearInterval(pipeMove); pipeTop.remove(); pipeBottom.remove(); return; }
        
        let x = parseInt(pipeTop.style.left);
        x -= 4;
        pipeTop.style.left = x + 'px';
        pipeBottom.style.left = x + 'px';

        // Hitbox Collision
        const player = document.getElementById('player');
        const pRect = player.getBoundingClientRect();
        const tRect = pipeTop.getBoundingClientRect();
        const bRect = pipeBottom.getBoundingClientRect();

        if (
            (pRect.right > tRect.left && pRect.left < tRect.right && pRect.top < tRect.bottom) ||
            (pRect.right > bRect.left && pRect.left < bRect.right && pRect.bottom > bRect.top)
        ) {
            gameOver("TuyOul nabrak pipa lava!");
            clearInterval(pipeMove);
        }

        if (x < -50) {
            score += 5; // Poin flappy lebih kecil per pipa
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 50) showWin(); // Skor 50 aja udah susah di flappy
            clearInterval(pipeMove);
            pipeTop.remove();
            pipeBottom.remove();
        }
    }, 20);

    gameLoop = setTimeout(spawnPipe, 1500);
}
function startFlappyLogic() {
    const player = document.getElementById('player');
    
    // Jalankan gravitasi
    let gravity = setInterval(() => {
        if(!gameActive || selectedMode !== 'flappy') { clearInterval(gravity); return; }
        
        let top = parseInt(player.style.top) || 200;
        player.style.top = (top + 4) + 'px'; // TuyOul jatuh perlahan
        
        // Batas bawah kawah
        if(top > 370) {
            gameOver("TuyOul jatuh ke lava!");
            clearInterval(gravity);
        }
    }, 25);

    spawnPipe();
}
// --- LOGIKA TUYOUL QUIZ ---
const quizData = [
    { 
        q: "Semua TuyOul suka abu vulkanik. Sebagian penghuni kawah bukan TuyOul. Kesimpulan yang paling tepat adalah...", 
        a: [
            "Semua penghuni kawah suka abu vulkanik", 
            "Sebagian penghuni kawah suka abu vulkanik", 
            "Ada penghuni kawah yang bukan TuyOul"
        ], 
        correct: 2 // Fokus pada subjek yang disebutkan di premis kedua
    },
    { 
        q: "Jika stok TuyOul melimpah, maka harga diskon. Saat ini harga tidak diskon. Kesimpulannya adalah...", 
        a: [
            "Stok TuyOul tidak melimpah", 
            "Stok TuyOul sangat banyak", 
            "Pembeli tidak mau beli"
        ], 
        correct: 0 // Modus Tollens: Jika P maka Q, ~Q maka ~P
    },
    { 
        q: "Pola Bilangan: 2, 4, 7, 11, 16, ... Berapakah angka selanjutnya?", 
        a: ["28", "22", "26"], 
        correct: 1 // Pola penambahan : +2, +3, +4, +5, +6
    },
    { 
        q: "Semua produk Vulkanik awet. Botol ini adalah produk Vulkanik. Jadi...", 
        a: [
            "Botol ini mungkin awet", 
            "Botol ini pasti awet", 
            "Semua botol awet"
        ], 
        correct: 1 // Silogisme kategorik standar
    },
    { 
        q: "Jika TuyOul rajin belajar, maka ia pintar. Jika TuyOul pintar, maka ia menang kuis. Kesimpulannya?", 
        a: [
            "Jika TuyOul rajin belajar, maka ia menang kuis", 
            "TuyOul menang kuis karena rajin", 
            "Hanya TuyOul pintar yang rajin belajar"
        ], 
        correct: 0 // Silogisme hipotetik (P->Q, Q->R, maka P->R)
    },
    { 
        q: "Pola Huruf: B, D, G, K, ... Huruf apakah selanjutnya?", 
        a: ["N", "O", "P"], 
        group: "Penalaran Analitik",
        correct: 2 // Loncat: +1 huruf (C), +2 huruf (E,F), +3 huruf (H,I,J), +4 huruf (L,M,N,O) -> P
    },
    { 
        q: "Lima TuyOul (A, B, C, D, E) antre koin. A di depan B. C di belakang D. E tepat di depan A. Siapa yang paling depan?", 
        a: ["E", "A", "D"], 
        correct: 0 // Urutan: E - A - B. D dan C tidak memengaruhi posisi E.
    },
    { 
        q: "Sebagian TuyOul memakai topi. Semua yang memakai topi terlihat keren. Maka...", 
        a: [
            "Semua TuyOul terlihat keren", 
            "Sebagian TuyOul terlihat keren", 
            "TuyOul yang tidak memakai topi tidak keren"
        ], 
        correct: 1 // Sebagian + Semua = Sebagian
    },
    { 
        q: "Pola Bilangan: 100, 95, 85, 70, 50, ... Berapakah angka selanjutnya?", 
        a: ["25", "30", "20"], 
        correct: 0 // Pola pengurangan: -5, -10, -15, -20, -25
    },
    { 
        q: "Jika hari ini hujan, TuyOul berteduh di kawah. Hari ini TuyOul tidak berteduh di kawah. Maka...", 
        a: [
            "Hari ini cerah", 
            "Hari ini tidak hujan", 
            "Kawah sedang penuh"
        ], 
        correct: 1 // Modus Tollens: Menyangkal akibat berarti menyangkal sebab.
    }
];

function startQuiz() {
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'block';
    loadQuestion(0);
}

function loadQuestion(index) {
    if (index >= quizData.length) {
        alert("Selamat! Kamu jenius. Ini diskon buat kamu!");
        showWin();
        return;
    }
    const data = quizData[index];
    document.getElementById('quiz-question').innerText = data.q;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    data.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === data.correct) loadQuestion(index + 1);
            else { alert("Salah! Belajar lagi ya."); backToMenu(); }
        };
        optionsDiv.appendChild(btn);
    });
}

// Fungsi bantu Game Over
function gameOver(msg) {
    gameActive = false;
    alert(msg);
    backToMenu();
}
