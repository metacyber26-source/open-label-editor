// =================================================================
// SMART LABEL STUDIO - GENERAL AUTOMATION ENGINE
// =================================================================

// Konversi Skala Layar (1 cm = 37.8 px pada monitor 96 DPI)
const PIXELS_PER_CM = 37.8;

// Konfigurasi Kertas Cetak A3+
const CONFIG_A3_PLUS = {
  sheetWidthCm: 32,
  sheetHeightCm: 48,
  printableWidthCm: 31,
  printableHeightCm: 47,
  bleedCm: 0.5
};

// State Dimensi Aktif
let currentConfig = {
  widthCm: 15,
  heightCm: 7,
  shape: 'persegi'
};

// Inisialisasi Pertama
window.onload = function() {
  updateUkuranKanvas();
};

// 1. Fungsi Buka / Tutup Panel Info di Layar HP
function togglePanelAI() {
  const panel = document.getElementById('ai-sidebar');
  panel.classList.toggle('active');
}

// 2. Mengubah Ukuran Fisik Kanvas Layar Otomatis
function updateUkuranKanvas() {
  const lebarInput = parseFloat(document.getElementById('input-lebar').value) || 10;
  const tinggiInput = parseFloat(document.getElementById('input-tinggi').value) || 5;

  currentConfig.widthCm = lebarInput;
  currentConfig.heightCm = tinggiInput;

  const canvas = document.getElementById('label-canvas');
  canvas.style.width = `${lebarInput * PIXELS_PER_CM}px`;
  canvas.style.height = `${tinggiInput * PIXELS_PER_CM}px`;
}

// 3. Mengubah Bentuk Label
function updateBentukKanvas() {
  const bentuk = document.getElementById('select-bentuk').value;
  const canvas = document.getElementById('label-canvas');
  
  currentConfig.shape = bentuk;
  canvas.className = `canvas-preview ${bentuk}`;
}

// 4. Fitur "+ Kotak Lisensi"
function tambahKotakLisensi() {
  const canvas = document.getElementById('label-canvas');
  
  const elemLama = document.getElementById('kotak-lisensi-group');
  if (elemLama) elemLama.remove();

  const licenseGroup = document.createElement('div');
  licenseGroup.className = 'license-group';
  licenseGroup.id = 'kotak-lisensi-group';
  
  licenseGroup.innerHTML = `
    <div class="license-item">HALAL</div>
    <div class="license-item">BPOM / P-IRT</div>
    <div class="license-item">MITRA</div>
  `;
  
  canvas.appendChild(licenseGroup);
  buatElemenBisaDigeser(licenseGroup);
}

// 5. Fitur "+ Barcode" (Minimal 2x2 cm)
function tambahKotakTransaksi() {
  const canvas = document.getElementById('label-canvas');
  
  const elemLama = document.getElementById('kotak-transaksi-group');
  if (elemLama) elemLama.remove();

  const minPixels = 2 * PIXELS_PER_CM;
  
  const transGroup = document.createElement('div');
  transGroup.className = 'transaction-group';
  transGroup.id = 'kotak-transaksi-group';
  transGroup.style.width = `${minPixels}px`;
  transGroup.style.height = `${minPixels}px`;
  
  transGroup.innerHTML = `
    <span>[ BARCODE ]</span>
    <span style="font-size:7px; color:#16a34a; margin-top:2px;">Aman Scan</span>
  `;
  
  canvas.appendChild(transGroup);
  buatElemenBisaDigeser(transGroup);
}

// 6. Analisis AI Layout & Kelayakan
function jalankanAnalisisLayout() {
  const panel = document.getElementById('ai-messages');
  panel.innerHTML = ''; 

  const barcode = document.getElementById('kotak-transaksi-group');
  const lisensi = document.getElementById('kotak-lisensi-group');
  
  let laporan = [];

  laporan.push({
    tipe: 'info',
    pesan: `📐 Bentuk label: <b>${currentConfig.shape.toUpperCase()}</b> (${currentConfig.widthCm} x ${currentConfig.heightCm} cm).`
  });

  if (barcode) {
    const lebarPx = barcode.offsetWidth;
    const lebarCm = (lebarPx / PIXELS_PER_CM).toFixed(1);
    
    if (lebarCm < 2) {
      laporan.push({
        tipe: 'warning',
        pesan: `⚠️ Ukuran Barcode (${lebarCm} cm) terlalu kecil! Min 2x2 cm pada cetak.`
      });
    } else {
      laporan.push({
        tipe: 'success',
        pesan: `✅ Barcode (${lebarCm} cm) aman dipindai kasir.`
      });
    }
  } else {
    laporan.push({
      tipe: 'warning',
      pesan: `💡 Tambahkan elemen Barcode/QRIS transaksi.`
    });
  }

  if (lisensi) {
    laporan.push({
      tipe: 'success',
      pesan: `✅ Seluruh logo legalitas berhasil dikelompokkan dengan rapi.`
    });
  }

  laporan.forEach(item => {
    const div = document.createElement('div');
    div.className = `ai-card ${item.tipe}`;
    div.innerHTML = item.pesan;
    panel.appendChild(div);
  });

  // Jika di HP, otomatis buka panelnya saat tombol diklik
  if (window.innerWidth <= 768) {
    document.getElementById('ai-sidebar').classList.add('active');
  }
}

// 7. Estimasi Cetak Lembar A3+ (Nesting)
function prosesNestingCetak() {
  const panelNesting = document.getElementById('nesting-results');
  panelNesting.innerHTML = '';

  const w = currentConfig.widthCm + CONFIG_A3_PLUS.bleedCm;
  const h = currentConfig.heightCm + CONFIG_A3_PLUS.bleedCm;

  const kolomA = Math.floor(CONFIG_A3_PLUS.printableWidthCm / w);
  const barisA = Math.floor(CONFIG_A3_PLUS.printableHeightCm / h);
  const totalA = kolomA * barisA;

  const kolomB = Math.floor(CONFIG_A3_PLUS.printableWidthCm / h);
  const barisB = Math.floor(CONFIG_A3_PLUS.printableHeightCm / w);
  const totalB = kolomB * barisB;

  let hasilTerbaik = (totalB > totalA) 
    ? { orientasi: 'Lansekap (Diputar 90°)', total: totalB, susunan: `${barisB} Baris x ${kolomB} Kolom` }
    : { orientasi: 'Potret (Standar)', total: totalA, susunan: `${barisA} Baris x ${kolomA} Kolom` };

  const efisiensi = ((hasilTerbaik.total * currentConfig.widthCm * currentConfig.heightCm) / (32 * 48) * 100).toFixed(1);

  panelNesting.innerHTML = `
    <div class="ai-card info">
      <b>Estimasi Kertas A3+:</b><br>
      • Posisi: <b>${hasilTerbaik.orientasi}</b><br>
      • Hasil: <b>${hasilTerbaik.total} pcs / lembar</b><br>
      • Susunan: <b>${hasilTerbaik.susunan}</b><br>
      • Efisiensi Bahan: <b>${efisiensi}% terpakai</b>
    </div>
  `;

  // Jika di HP, otomatis buka panelnya saat tombol diklik
  if (window.innerWidth <= 768) {
    document.getElementById('ai-sidebar').classList.add('active');
  }
}

// 8. Fitur Geser Elemen (Drag & Drop)
function buatElemenBisaDigeser(elemen) {
  let posX = 0, posY = 0, awalX = 0, awalY = 0;

  // Mendukung Sentuhan Jari di HP (Touch) & Klik Mouse di PC
  elemen.onmousedown = dragMouseDown;
  elemen.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e.preventDefault();
    awalX = e.clientX;
    awalY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    posX = awalX - e.clientX;
    posY = awalY - e.clientY;
    awalX = e.clientX;
    awalY = e.clientY;
    elemen.style.top = (elemen.offsetTop - posY) + "px";
    elemen.style.left = (elemen.offsetLeft - posX) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function dragTouchStart(e) {
    let touch = e.touches[0];
    awalX = touch.clientX;
    awalY = touch.clientY;
    document.ontouchend = closeTouchElement;
    document.ontouchmove = touchDrag;
  }

  function touchDrag(e) {
    let touch = e.touches[0];
    posX = awalX - touch.clientX;
    posY = awalY - touch.clientY;
    awalX = touch.clientX;
    awalY = touch.clientY;
    elemen.style.top = (elemen.offsetTop - posY) + "px";
    elemen.style.left = (elemen.offsetLeft - posX) + "px";
  }

  function closeTouchElement() {
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}
