// ==========================================
// 0. FUNGSI SALIN KE CLIPBOARD (COPY)
// ==========================================
function copyToClipboard(name, price) {
    const textToCopy = `${name} - Rp ${price}`;
    
    // Menggunakan API modern Clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Berhasil disalin: " + textToCopy);
        }).catch(err => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

// Fallback untuk browser lama
function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // Hindari scroll halaman
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
function filterBrand(brand) {
  const buttons = document.querySelectorAll('.filter-btn');
  const sections = document.querySelectorAll('.brand-section');

  buttons.forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }

  sections.forEach(sec => {
    if (brand === 'all' || sec.getAttribute('data-brand') === brand) {
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

// Cek tema yang tersimpan saat pertama kali halaman dimuat
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
            let sectionHasVisibleRows = false;
            
            // Cek apakah ini bagian promo card (berupa div tunggal)
            if (section.classList.contains("promo-card")) {
                const name = section.getAttribute("data-name") ? section.getAttribute("data-name").toLowerCase() : "";
                const price = parseInt(section.getAttribute("data-price"), 10) || 0;

                let matchesSearch = name.includes(keyword);
                let matchesPrice = checkPriceRange(price, priceCategory);

                if (matchesSearch && matchesPrice) {
                    section.style.display = "block";
                    sectionHasVisibleRows = true;
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

                // Sembunyikan seluruh card brand jika tidak ada baris yang cocok
                if (visibleRowsCount > 0) {
                    section.style.display = "block";
                    sectionHasVisibleRows = true;

                    // Logika Sorting Baris Tabel di dalam Brand Section
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

                        // Masukkan ulang baris yang sudah diurutkan ke kontainer tabel
                        rowArray.forEach(r => tableContainer.appendChild(r));
                    }
                } else {
                    section.style.display = "none";
                }
            }
        });

        // Tampilkan pesan jika kosong
        if (noProductMessage) {
            if (totalVisibleItems === 0) {
                noProductMessage.style.display = "block";
            } else {
                noProductMessage.style.display = "none";
            }
        }
    }

    function checkPriceRange(price, category) {
        if (category === "under3") return price < 3000000;
        if (category === "3to6") return price >= 3000000 && price <= 6000000;
        if (category === "above6") return price > 6000000;
        return true; // "all"
    }

    // Event Listener untuk input & dropdown
    if (searchInput) searchInput.addEventListener("input", applyFilterAndSearch);
    if (priceFilter) priceFilter.addEventListener("change", applyFilterAndSearch);
    if (sortOrder) sortOrder.addEventListener("change", applyFilterAndSearch);
});


// ==========================================
// 4. FITUR WISHLIST / TROLI SIDEBAR
// ==========================================

// Fungsi untuk menambah ke troli (Diperbaiki agar nilai harga disimpan utuh dalam angka murni)
function addToWishlist(name, price) {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];

    // Konversi price menjadi integer murni untuk menghindari masalah pemotongan string
    let cleanPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;

    // Cek duplikat berdasarkan nama item
    if (wishlist.some(item => item.name === name)) {
        alert(name + " sudah ada di dalam List Pilihan / troli!");
        return;
    }

    wishlist.push({ name: name, price: cleanPrice });
    localStorage.setItem('focus_wishlist', JSON.stringify(wishlist));
    
    alert("Berhasil menambahkan " + name + " ke troli!");
    updateWishlistUI();
}

// Fungsi untuk memperbarui tampilan troli
function updateWishlistUI() {
    const container = document.getElementById('wishlist-items');
    const countElement = document.getElementById('wishlist-count');
    const wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];

    if (countElement) countElement.textContent = `(${wishlist.length})`;

    if (container) {
        container.innerHTML = '';
        if (wishlist.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; font-size:0.85rem; padding:15px;">Troli masih kosong</p>';
            return;
        }

        wishlist.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #ddd";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.fontSize = "0.85rem";
            
            // Format angka harga kembali menggunakan titik pemisah ribuan
            let formattedPrice = Number(item.price).toLocaleString('id-ID');

            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <span style="color: #1b5e20; font-weight: bold;">Rp ${formattedPrice}</span>
                </div>
                <span style="color:red; cursor:pointer; font-weight:bold; padding: 4px 8px; font-size: 1.1rem;" onclick="removeFromWishlist(${index})" title="Hapus">&times;</span>
            `;
            container.appendChild(div);
        });
    }
}

// Fungsi hapus item dari troli
function removeFromWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];
    wishlist.splice(index, 1);
    localStorage.setItem('focus_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Fungsi kirim ke WhatsApp
function sendWishlistToWA() {
    let wishlist = JSON.parse(localStorage.getItem('focus_wishlist')) || [];
    if (wishlist.length === 0) {
        alert("Troli masih kosong!");
        return;
    }

    let message = "Halo Admin, saya ingin menanyakan produk berikut:%0A";
    wishlist.forEach((item, index) => {
        let formattedPrice = Number(item.price).toLocaleString('id-ID');
        message += `${index + 1}. ${item.name} - Rp ${formattedPrice}%0A`;
    });

    // Sesuaikan nomor WhatsApp tujuan di sini (Format internasional tanpa tanda +)
    const phone = "628xxxxxxxxxx"; 
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Fungsi Toggle Buka/Tutup Sidebar Troli
function toggleWishlist() {
    const sidebar = document.getElementById('wishlist-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Jalankan update UI saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
    updateWishlistUI();
});


// ==========================================
// 5. FITUR AUTO-CLOSE SIDEBAR SAAT KLIK DI LUAR
// ==========================================
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('wishlist-sidebar');
    const wishlistBtn = document.querySelector('.wishlist-trigger');

    if (!sidebar || !wishlistBtn) return;

    // Cek apakah sidebar sedang terbuka
    const isOpen = sidebar.classList.contains('active');

    // Jika diklik di luar sidebar dan bukan di tombol troli, maka tutup sidebar
    if (isOpen && !sidebar.contains(event.target) && !wishlistBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

// ==========================================
// FUNGSI UNTUK FITUR BANDINGKAN (COMPARE)
// ==========================================

// 1. Fungsi untuk memperbarui angka pada tombol Bandingkan
function updateCompareCount() {
    const checkedBoxes = document.querySelectorAll('.compare-check:checked');
    const compareCountEl = document.getElementById('compare-count');
    if (compareCountEl) {
        compareCountEl.innerText = `(${checkedBoxes.length})`;
    }
}

// 2. Fungsi yang berjalan saat tombol "Bandingkan" diklik
function toggleCompare() {
    const checkedBoxes = document.querySelectorAll('.compare-check:checked');
    
    if (checkedBoxes.length === 0) {
        alert("Pilih minimal 1 atau 2 HP yang ingin dibandingkan dengan mencentang kotak di tabel terlebih dahulu!");
        return;
    }

    if (checkedBoxes.length > 3) {
        alert("Maksimal hanya dapat membandingkan 3 HP sekaligus!");
        return;
    }

    // Ambil data HP yang dicentang
    let comparisonList = [];
    checkedBoxes.forEach(cb => {
        let row = cb.closest('tr');
        let name = cb.value;
        let price = row ? row.cells[2].innerText : "-";
        
        comparisonList.innerHTML = ''; // placeholder
        comparisonList.push({ name, price });
    });

    // Tampilkan hasil perbandingan (bisa pakai alert sederhana atau modal kustom)
    let message = "⚖️ PERBANDINGAN HP PILIHAN:\n\n";
    comparisonList.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n   Harga: ${item.price}\n\n`;
    });
    
    alert(message);
}

// 3. Pasang event listener agar hitungan langsung update saat checkbox diklik
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('compare-check')) {
        // Batasi maksimal centang 3 item agar rapi
        const checkedBoxes = document.querySelectorAll('.compare-check:checked');
        if (checkedBoxes.length > 3) {
            alert("Maksimal pilih 3 HP untuk dibandingkan!");
            e.target.checked = false;
        }
        updateCompareCount();
    }
});