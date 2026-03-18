/**
 * TUYUL VULKANIK Website JavaScript
 * Fungsionalitas utama: Smooth Scroll, Efek Hover/Sentuh, dan Otomatisasi Order WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Website TUYUL VULKANIK telah dimuat sepenuhnya.");
    
    // Panggil semua fungsi utama
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 
});

// -----------------------------------------------------------------
// 1. Smooth Scroll untuk Navigasi Internal
// -----------------------------------------------------------------
function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href').length > 1 && this.getAttribute('href') !== '#') {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// -----------------------------------------------------------------
// 2. Efek Visual Saat Mengarahkan Mouse/Sentuh ke Kartu Produk
// -----------------------------------------------------------------
function highlightActiveProductCards() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        // Efek untuk Sentuhan (Mobile/Tablet)
        card.addEventListener('touchstart', function() {
            this.classList.add('is-active');
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('is-active');
            }, 500); 
        });
        
        // Efek untuk Kursor (Desktop)
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-js');
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-js');
        });
    });
}

// -----------------------------------------------------------------
// 3. Otomatisasi Pesan Order WhatsApp (dengan Kode Produk)
// -----------------------------------------------------------------
function setupWhatsAppOrdering() {
    // Target spesifik tombol Order yang ada di kartu produk
    const orderButtons = document.querySelectorAll('.product-card .btn-secondary'); 
    
    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.href.includes('wa.me')) {
                e.preventDefault(); 
                
                const card = button.closest('.product-card');
                
                if (card) {
                    const namaProduk = card.querySelector('.product-title').innerText;
                    const kodeProduk = card.querySelector('.product-code').innerText;
                    const hargaProduk = card.querySelector('.price').innerText;
                    
                    const waBaseUrl = button.href.split('?')[0]; 
                    
                    // Pesan yang akan diisi otomatis di WhatsApp (lebih detail)
                    const pesan = encodeURIComponent(
                        `🌋 Order TUYUL VULKANIK 🌋\n\n` +
                        `Halo, saya ingin memesan produk berikut:\n` +
                        `*Produk:* ${namaProduk}\n` +
                        `*Kode:* ${kodeProduk}\n` +
                        `*Harga:* ${hargaProduk}\n` +
                        `*Jumlah:* [Mohon isi jumlah pesanan Anda di sini]\n\n` +
                        `Mohon informasikan total dan metode pembayarannya. Terima kasih!`
                    );
                    
                    const newWaLink = `${waBaseUrl}?text=${pesan}`;
                    
                    window.open(newWaLink, '_blank');
                    
                } else {
                    console.error("Kesalahan: Tombol Order tidak ditemukan di dalam elemen .product-card.");
                    window.open(button.href, '_blank'); 
                }
            }
        });
    });
}
