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
