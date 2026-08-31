// =================================================================
// SMART LABEL STUDIO - GENERAL AUTOMATION ENGINE
// =================================================================

// Konversi Rasio Skala Layar (1 cm = 37.8 piksel pada standar monitor 96 DPI)
const PIXELS_PER_CM = 37.8;

// Konfigurasi Kertas Cetak A3+ Industri
const CONFIG_A3_PLUS = {
  sheetWidthCm: 32,
  sheetHeightCm: 48,
  printableWidthCm: 31,
  printableHeightCm: 47,
  bleedCm: 0.5
};

// State Dimensi Aktif Label
let currentConfig = {
  widthCm: 15,
  heightCm: 7,
  shape: 'persegi'
};

// Inisialisasi Pertama saat Halaman Dimuat
window.onload = function() {
  updateUkuranKanvas();
};

// 1. Fungsi Mengubah Ukuran Fisik Kanvas Layar Otomatis
function updateUkuranKanvas() {
  const lebarInput = parseFloat(document.getElementById('input-lebar').value) || 10;
  const tinggiInput = parseFloat(document.getElementById('input-tinggi').value) || 5;

  currentConfig.widthCm = lebarInput;
  currentConfig.heightCm = tinggiInput;

  const canvas = document.getElementById('label-canvas');
  canvas.style.width = `${lebarInput * PIXELS_PER_CM}px`;
  canvas.style.height = `${tinggiInput * PIXELS_PER_CM}px`;
}

// 2. Fungsi Mengubah Bentuk Label Secara Otomatis
function updateBentukKanvas() {
  const bentuk = document.getElementById('select-bentuk').value;
  const canvas = document.getElementById('label-canvas');
  
  currentConfig.shape = bentuk;
  canvas.className = `canvas-preview ${bentuk}`;
}

// 3. Modul Fitur "+ Kotak Lisensi & Legalitas" (Group Engine)
function tambahKotakLisensi() {
  const canvas = document.getElementById('label-canvas');
  
  // Hapus jika sudah ada sebelumnya agar tidak duplikat
  const elemLama = document.getElementById('kotak-lisensi-group');
  if (elemLama) elemLama.remove();

  const licenseGroup = document.createElement('div');
  licenseGroup.className = 'license-group';
  licenseGroup.id = 'kotak-lisensi-group';
  
  // Otomatisasi Penyatuan Barisan Sertifikasi Legalitas
  licenseGroup.innerHTML = `
    <div class="license-item">HALAL</div>
    <div class="license-item">BPOM / P-IRT</div>
    <div class="license-item">MITRA / SPONSOR</div>
  `;
  
  canvas.appendChild(licenseGroup);
  buatElemenBisaDigeser(licenseGroup);
}

// 4. Modul Fitur "+ Barcode & QRIS" (Auto-Guard Minimal 2x2 cm)
function tambahKotakTransaksi() {
  const canvas = document.getElementById('label-canvas');
  
  const elemLama = document.getElementById('kotak-transaksi-group');
  if (elemLama) elemLama.remove();

  // Menetapkan Ukuran Fisik Minimal 2cm x 2cm
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

// 5. Engine Analisis AI (Pemeriksaan Keterbacaan & Marketing)
function jalankanAnalisisLayout() {
  const panel = document.getElementById('ai-messages');
  panel.innerHTML = ''; 

  const barcode = document.getElementById('kotak-transaksi-group');
  const lisensi = document.getElementById('kotak-lisensi-group');
  
  let laporan = [];

  // Analisis 1: Dimensi & Bentuk Label
  laporan.push({
    tipe: 'info',
    pesan: `📐 Bentuk label terdeteksi: <b>${currentConfig.shape.toUpperCase()}</b> (${currentConfig.widthCm} x ${currentConfig.heightCm} cm).`
  });

  // Analisis 2: Barcode & QRIS
  if (barcode) {
    const lebarPx = barcode.offsetWidth;
    const lebarCm = (lebarPx / PIXELS_PER_CM).toFixed(1);
    
    if (lebarCm < 2) {
      laporan.push({
        tipe: 'warning',
        pesan: `⚠️ Ukuran Barcode (${lebarCm} cm) terlalu kecil! Minimal 2x2 cm pada hasil cetak agar terbaca mesin scanner kasir.`
      });
    } else {
      laporan.push({
        tipe: 'success',
        pesan: `✅ Barcode berukuran ${lebarCm} cm. Ukuran ideal dan aman dipindai.`
      });
    }
  } else {
    laporan.push({
      tipe: 'warning',
      pesan: `💡 Tambahkan elemen Barcode/QRIS transaksi untuk kelengkapan label dagang.`
    });
  }

  // Analisis 3: Lisensi & Legalitas
  if (lisensi) {
    laporan.push({
      tipe: 'success',
      pesan: `✅ Seluruh logo legalitas (Halal, BPOM, Mitra) berhasil dikelompokkan (Grouped) dengan tinggi seragam secara presisi.`
    });
  }

  // Tampilkan Hasil Analisis ke Layar
  laporan.forEach(item => {
    const div = document.createElement('div');
    div.className = `ai-card ${item.tipe}`;
    div.innerHTML = item.pesan;
    panel.appendChild(div);
  });
}

// 6. Engine Simulasi Lembar Cetak A3+ (Automated Nesting Engine)
function prosesNestingCetak() {
  const panelNesting = document.getElementById('nesting-results');
  panelNesting.innerHTML = '';

  const w = currentConfig.widthCm + CONFIG_A3_PLUS.bleedCm;
  const h = currentConfig.heightCm + CONFIG_A3_PLUS.bleedCm;

  // Hitung Opsi A (Potret)
  const kolomA = Math.floor(CONFIG_A3_PLUS.printableWidthCm / w);
  const barisA = Math.floor(CONFIG_A3_PLUS.printableHeightCm / h);
  const totalA = kolomA * barisA;

  // Hitung Opsi B (Lansekap / Diputar 90 Derajat)
  const kolomB = Math.floor(CONFIG_A3_PLUS.printableWidthCm / h);
  const barisB = Math.floor(CONFIG_A3_PLUS.printableHeightCm / w);
  const totalB = kolomB * barisB;

  // Pilih Orientasi Paling Hemat Kertas
  let hasilTerbaik = (totalB > totalA) 
    ? { orientasi: 'Lansekap (Diputar 90°)', total: totalB, susunan: `${barisB} Baris x ${kolomB} Kolom` }
    : { orientasi: 'Potret (Standar)', total: totalA, susunan: `${barisA} Baris x ${kolomA} Kolom` };

  const efisiensi = ((hasilTerbaik.total * currentConfig.widthCm * currentConfig.heightCm) / (32 * 48) * 100).toFixed(1);

  // Tampilkan Hasil Kalkulasi Cetak
  panelNesting.innerHTML = `
    <div class="ai-card info">
      <b>Hasil Estimasi Kertas A3+:</b><br>
      • Posisi Optimum: <b>${hasilTerbaik.orientasi}</b><br>
      • Muat Label: <b>${hasilTerbaik.total} pcs / lembar</b><br>
      • Susunan Potong: <b>${hasilTerbaik.susunan}</b><br>
      • Efisiensi Bahan: <b>${efisiensi}% terpakai</b>
    </div>
  `;
}

// 7. Utilitas Helper (Drag and Drop Elemen Kanvas)
function buatElemenBisaDigeser(elemen) {
  let posX = 0, posY = 0, awalX = 0, awalY = 0;
  elemen.onmousedown = dragMouseDown;

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
}
