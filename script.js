/**
 * TUYUL VULKANIK Website JavaScript
 * Fungsionalitas: Smooth Scroll, Efek Hover, WhatsApp Automation, 
 * Mini Game Vulkanik, dan Sistem Klaim Diskon 50%.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Website TUYUL VULKANIK telah dimuat sepenuhnya.");
    
    // Inisialisasi Fungsi Bawaan
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 

    // Inisialisasi Kontrol Game
    setupGameControls();
});

// -----------------------------------------------------------------
// 1. Smooth Scroll & Efek Visual (Fungsi Asli)
// -----------------------------------------------------------------
function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href').length > 1 && this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function highlightActiveProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('touchstart', function() { this.classList.add('is-active'); });
        card.addEventListener('touchend', function() { 
            setTimeout(() => { this.classList.remove('is-active'); }, 500); 
        });
        card.addEventListener('mouseenter', function() { this.classList.add('hover-js'); });
        card.addEventListener('mouseleave', function() { this.classList.remove('hover-js'); });
    });
}

// -----------------------------------------------------------------
// 2. MINI GAME: KOIN VULKANIK
// -----------------------------------------------------------------
let score = 0;
let gameActive = false;
let gameLoop;
let isDiscountApplied = false;

function setupGameControls() {
    const board = document.getElementById('game-board');
    if (!board) return;

    const moveHandler = (e) => {
        if (!gameActive) return;
        const rect = board.getBoundingClientRect();
        let x = (e.type === 'touchmove') ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        
        const player = document.getElementById('player');
        // Memastikan player tetap di dalam kotak
        if (x > 30 && x < rect.width - 30) {
            player.style.left = (x - 30) + 'px';
        }
    };

    board.addEventListener('mousemove', moveHandler);
    board.addEventListener('touchmove', moveHandler, { passive: false });
}

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => console.log("Audio play blocked by browser"));
    }
}

function startGame() {
    score = 0;
    gameActive = true;
    document.getElementById('voucher-popup').style.display = 'none';
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('game-board').style.display = 'block';
    document.getElementById('start-btn').innerText = "ULANGI GAME";
    
    // Bersihkan koin lama
    document.querySelectorAll('.coin').forEach(c => c.remove());
    spawnCoin();
}

function spawnCoin() {
    if (!gameActive) return;
    
    const board = document.getElementById('game-board');
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.innerHTML = '💰';
    coin.style.position = 'absolute';
    coin.style.left = Math.random() * (board.offsetWidth - 40) + 'px';
    coin.style.top = '-40px';
    board.appendChild(coin);

    let speed = 4 + (score / 50); 
    
    let fallInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(fallInterval);
            coin.remove();
            return;
        }

        let top = parseInt(coin.style.top);
        if (top > 350) {
            const player = document.getElementById('player');
            const pLeft = parseInt(player.style.left || (board.offsetWidth/2 - 30));
            const cLeft = parseInt(coin.style.left);
            
            // Deteksi Tabrakan
            if (cLeft >= pLeft - 25 && cLeft <= pLeft + 45) {
                score += 10;
                document.getElementById('score').innerText = "Skor: " + score;
                playSound('sfx-coin');
                
                if (score >= 100 && !isDiscountApplied) {
                    showVoucher();
                }
                clearInterval(fallInterval);
                coin.remove();
            } else if (top > 400) {
                playSound('sfx-vulkanik');
                clearInterval(fallInterval);
                coin.remove();
            } else {
                coin.style.top = (top + speed) + 'px';
            }
        } else {
            coin.style.top = (top + speed) + 'px';
        }
    }, 20);

    gameLoop = setTimeout(spawnCoin, Math.max(400, 1000 - score * 2)); 
}

function showVoucher() {
    gameActive = false; // Hentikan game sementara
    document.getElementById('voucher-popup').style.display = 'block';
}

// -----------------------------------------------------------------
// 3. SISTEM DISKON & UPDATE HARGA
// -----------------------------------------------------------------
function applyDiscount() {
    isDiscountApplied = true;
    document.getElementById('voucher-popup').style.display = 'none';
    
    const priceElements = document.querySelectorAll('.display-price');
    
    priceElements.forEach(el => {
        const originalValue = parseInt(el.getAttribute('data-original'));
        const discountedValue = originalValue * 0.5;
        
        // Format Rupiah
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(discountedValue);

        el.classList.add('discounted'); // CSS untuk coret harga lama
        
        // Cek jika span harga baru belum ada
        if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('new-price')) {
            const newPriceTag = document.createElement('span');
            newPriceTag.className = 'new-price';
            newPriceTag.innerText = " " + formattedPrice;
            el.parentNode.insertBefore(newPriceTag, el.nextSibling);
        }
    });

    alert("🔥 MANTAP! Diskon 50% Berhasil Diklaim. Harga koleksi sudah dipotong!");
}

// -----------------------------------------------------------------
// 4. OTOMATISASI WHATSAPP (Diperbarui dengan info diskon)
// -----------------------------------------------------------------
function setupWhatsAppOrdering() {
    const orderButtons = document.querySelectorAll('.product-card .btn-secondary'); 
    
    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.href.includes('wa.me')) {
                e.preventDefault(); 
                
                const card = button.closest('.product-card');
                if (card) {
                    const namaProduk = card.querySelector('.product-title').innerText;
                    const kodeProduk = card.querySelector('.product-code').innerText;
                    const hargaElemen = card.querySelector('.new-price') || card.querySelector('.display-price');
                    const hargaFinal = hargaElemen.innerText;
                    
                    const waBaseUrl = button.href.split('?')[0]; 
                    
                    const statusDiskon = isDiscountApplied ? "*SUDAH KLAIM DISKON 50%*" : "Harga Normal";
                    
                    const pesan = encodeURIComponent(
                        `🌋 Order TUYUL VULKANIK 🌋\n\n` +
                        `Halo, saya ingin memesan produk berikut:\n` +
                        `*Produk:* ${namaProduk}\n` +
                        `*Kode:* ${kodeProduk}\n` +
                        `*Harga:* ${hargaFinal} (${statusDiskon})\n\n` +
                        `Mohon informasikan metode pembayarannya. Terima kasih!`
                    );
                    
                    window.open(`${waBaseUrl}?text=${pesan}`, '_blank');
                }
            }
        });
    });
}
