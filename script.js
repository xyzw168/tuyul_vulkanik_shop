/**
 * TUYUL VULKANIK Website JavaScript
 * Fungsionalitas: Multi-Game (Coin & Runner), Smooth Scroll, 
 * WhatsApp Automation, dan Sistem Diskon 50%.
 */

let score = 0;
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
    
    // UI Switch
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-window').style.display = 'block';
    document.getElementById('voucher-popup').style.display = 'none';
    
    const jumpBtn = document.getElementById('virtual-jump-btn');
    const player = document.getElementById('player');
    
    // Reset Player Position
    player.style.left = "50%";
    player.style.bottom = "10px";

    if(mode === 'runner') {
        player.innerHTML = '🏃'; 
        player.className = 'player-runner';
        player.style.left = "50px";
        if(jumpBtn) jumpBtn.style.display = 'inline-block'; 
    } else {
        player.innerHTML = '🌋';
        player.className = 'player-coin';
        if(jumpBtn) jumpBtn.style.display = 'none';
    }
}

function backToMenu() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.querySelectorAll('.coin, .obstacle, .bomb').forEach(el => el.remove());
    document.getElementById('game-menu').style.display = 'block';
    document.getElementById('game-window').style.display = 'none';
}

function startAction() {
    if(gameActive) return;
    score = 0;
    gameActive = true;
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('voucher-popup').style.display = 'none';
    
    document.querySelectorAll('.coin, .obstacle').forEach(el => el.remove());

    if(selectedMode === 'coin') {
        spawnCoin();
    } else {
        spawnObstacle();
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
    if (!gameActive || selectedMode !== 'runner') return;
    const player = document.getElementById('player');
    if (!player.classList.contains("jump-animation")) {
        player.classList.add("jump-animation");
        setTimeout(() => player.classList.remove("jump-animation"), 500);
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
