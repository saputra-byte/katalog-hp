// ==========================================
// 0. FUNGSI SALIN KE CLIPBOARD (COPY)
// ==========================================
function copyToClipboard(name, price) {
    const textToCopy = `${name} - Rp ${price}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Berhasil disalin: " + textToCopy);
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        alert("Berhasil disalin: " + text);
    } catch (err) {
        alert("Gagal menyalin teks.");
    }
    document.body.removeChild(textarea);
}

// ==========================================
// 1. EFEK FILTER BRAND
// ==========================================
function filterBrand(brand, evt) {
  const buttons = document.querySelectorAll('.filter-btn');
  const sections = document.querySelectorAll('.brand-section');

  // Hapus class active dari semua tombol
  buttons.forEach(btn => btn.classList.remove('active'));

  // Tambahkan class active ke tombol yang diklik
  const currentTarget = evt ? (evt.currentTarget || evt.target) : window.event?.target;
  if (currentTarget) {
    currentTarget.classList.add('active');
  }

  // Tampilkan / Sembunyikan section sesuai data-brand
  sections.forEach(sec => {
    const secBrand = sec.getAttribute('data-brand');
    if (brand === 'all' || secBrand === brand) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });
}

// ==========================================
// 2. EFEK DARK / LIGHT MODE
// ==========================================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  body.classList.toggle('dark-mode');
  
  if (body.classList.contains('dark-mode')) {
    if (themeIcon) themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    if (themeIcon) themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

// Cek tema tersimpan saat muat halaman
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.textContent = '☀️';
  }
});

// ==========================================
// 3. FITUR PENCARIAN, FILTER HARGA, & SORTING
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const priceFilter = document.getElementById("priceFilter");
    const sortOrder = document.getElementById("sortOrder");
    const noProductMessage = document.getElementById("noProductMessage");

    function applyFilterAndSearch() {
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const priceCategory = priceFilter ? priceFilter.value : "all";
        const sortType = sortOrder ? sortOrder.value : "default";

        const brandSections = document.querySelectorAll(".brand-section");
        let totalVisibleItems = 0;

        brandSections.forEach(section => {
            // Cek promo card (berupa card div)
            if (section.classList.contains("promo-card")) {
                const name = section.getAttribute("data-name") ? section.getAttribute("data-name").toLowerCase() : "";
                const price = parseInt(section.getAttribute("data-price"), 10) || 0;

                let matchesSearch = name.includes(keyword);
                let matchesPrice = checkPriceRange(price, priceCategory);

                if (matchesSearch && matchesPrice) {
                    section.style.display = "block";
                    totalVisibleItems++;
                } else {
                    section.style.display = "none";
                }
            } else {
                // Berupa tabel brand biasa
                const rows = section.querySelectorAll("tr[data-item-name]");
                let visibleRowsCount = 0;

                rows.forEach(row => {
                    const itemName = row.getAttribute("data-item-name") ? row.getAttribute("data-item-name").toLowerCase() : "";
                    const itemPrice = parseInt(row.getAttribute("data-item-price"), 10) || 0;

                    let matchesSearch = itemName.includes(keyword);
                    let matchesPrice = checkPriceRange(itemPrice, priceCategory);

                    if (matchesSearch && matchesPrice) {
                        row.style.display = "";
                        visibleRowsCount++;
                        totalVisibleItems++;
                    } else {
                        row.style.display = "none";
                    }
                });

                if (visibleRowsCount > 0) {
                    section.style.display = "block";

                    // Logika Sorting Baris Tabel
                    if (sortType !== "default") {
                        const tableContainer = section.querySelector("tbody") || section.querySelector("table");
                        const rowArray = Array.from(rows).filter(r => r.style.display !== "none");

                        rowArray.sort((a, b) => {
                            const pA = parseInt(a.getAttribute("data-item-price"), 10) || 0;
                            const pB = parseInt(b.getAttribute("data-item-price"), 10) || 0;

                            if (sortType === "low-high") return pA - pB;
                            if (sortType === "high-low") return pB - pA;
                            return 0;
                        });

                        rowArray.forEach(r => tableContainer.appendChild(r));
                    }
                } else {
                    section.style.display = "none";
                }
            }
        });

        // Tampilkan pesan kosong jika produk tidak ada
        if (noProductMessage) {
            noProductMessage.style.display = (totalVisibleItems === 0) ? "block" : "none";
        }
    }

    function checkPriceRange(price, category) {
        if (category === "under3") return price < 3000000;
        if (category === "3to6") return price >= 3000000 && price <= 6000000;
        if (category === "above6") return price > 6000000;
        return true;
    }

    if (searchInput) searchInput.addEventListener("input", applyFilterAndSearch);
    if (priceFilter) priceFilter.addEventListener("change", applyFilterAndSearch);
    if (sortOrder) sortOrder.addEventListener("change", applyFilterAndSearch);
});

// ==========================================
// 4. FITUR WISHLIST / TROLI SIDEBAR
// ==========================================
function addToWishlist(name, price) {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];
    let cleanPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;

    if (wishlist.some(item => item.name === name)) {
        alert(name + " sudah ada di dalam Troli!");
        return;
    }

    wishlist.push({ name: name, price: cleanPrice });
    localStorage.setItem('focus_wishlist', JSON.stringify(wishlist));
    
    alert("Berhasil menambahkan " + name + " ke troli!");
    updateWishlistUI();
}

function updateWishlistUI() {
    const container = document.getElementById('wishlist-items');
    const countElement = document.getElementById('wishlist-count');
    const countSidebar = document.getElementById('wishlist-count-sidebar');
    const wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];

    if (countElement) countElement.textContent = `(${wishlist.length})`;
    if (countSidebar) countSidebar.textContent = `(${wishlist.length})`;

    if (container) {
        container.innerHTML = '';
        if (wishlist.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; font-size:0.88rem; padding:25px 0;">Troli kamu masih kosong</p>';
            return;
        }

        wishlist.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.padding = "12px 6px";
            div.style.borderBottom = "1px solid #e2e8f0";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.fontSize = "0.88rem";
            
            let formattedPrice = Number(item.price).toLocaleString('id-ID');

            div.innerHTML = `
                <div>
                    <strong style="display:block; margin-bottom:3px;">${item.name}</strong>
                    <span style="color: #16a34a; font-weight: bold;">Rp ${formattedPrice}</span>
                </div>
                <span style="color:#ef4444; cursor:pointer; font-weight:bold; padding: 4px 8px; font-size: 1.2rem;" onclick="removeFromWishlist(${index})" title="Hapus">&times;</span>
            `;
            container.appendChild(div);
        });
    }
}

function removeFromWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];
    wishlist.splice(index, 1);
    localStorage.setItem('focus_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

function sendWishlistToWA() {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];
    if (wishlist.length === 0) {
        alert("Troli masih kosong!");
        return;
    }

    let message = "Halo Admin *FOCUS CELL*, saya mau tanya/pesan produk berikut ya:%0A%0A";
    let totalPrice = 0;

    wishlist.forEach((item, index) => {
        let formattedPrice = Number(item.price).toLocaleString('id-ID');
        message += `${index + 1}. *${item.name}*%0A   Harga: Rp ${formattedPrice}%0A`;
        totalPrice += Number(item.price);
    });

    let formattedTotal = totalPrice.toLocaleString('id-ID');
    message += `%0A-----------------------------------%0A`;
    message += `*Estimasi Total: Rp ${formattedTotal}*%0A%0A`;
    message += `Mohon infonya untuk stok dan cara pemesanannya ya min. Terima kasih!`;

    // Ganti nomor WA Admin tujuan di sini
    const phone = "6283820415743"; 
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

function toggleWishlist() {
    const sidebar = document.getElementById('wishlist-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateWishlistUI();
});

// ==========================================
// 5. AUTO-CLOSE SIDEBAR SAAT KLIK DI LUAR
// ==========================================
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('wishlist-sidebar');
    const wishlistBtn = document.querySelector('.wishlist-trigger');

    if (!sidebar || !wishlistBtn) return;

    const isOpen = sidebar.classList.contains('active');

    if (isOpen && !sidebar.contains(event.target) && !wishlistBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});