// =================================================================
// SMART LABEL STUDIO - GENERAL AUTOMATION ENGINE
// =================================================================

const PIXELS_PER_CM = 37.8;

const CONFIG_A3_PLUS = {
  sheetWidthCm: 32,
  sheetHeightCm: 48,
  printableWidthCm: 31,
  printableHeightCm: 47,
  bleedCm: 0.5
};

let currentConfig = {
  widthCm: 15,
  heightCm: 7,
  shape: 'persegi'
};

window.onload = function() {
  updateUkuranKanvas();
};

function togglePanelAI() {
  const panel = document.getElementById('ai-sidebar');
  panel.classList.toggle('active');
}

function updateUkuranKanvas() {
  const lebarInput = parseFloat(document.getElementById('input-lebar').value) || 10;
  const tinggiInput = parseFloat(document.getElementById('input-tinggi').value) || 5;

  currentConfig.widthCm = lebarInput;
  currentConfig.heightCm = tinggiInput;

  const canvas = document.getElementById('label-canvas');
  canvas.style.width = `${lebarInput * PIXELS_PER_CM}px`;
  canvas.style.height = `${tinggiInput * PIXELS_PER_CM}px`;
}

function updateBentukKanvas() {
  const bentuk = document.getElementById('select-bentuk').value;
  const canvas = document.getElementById('label-canvas');
  
  currentConfig.shape = bentuk;
  canvas.className = `canvas-preview ${bentuk}`;
}

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

  if (window.innerWidth <= 768) {
    document.getElementById('ai-sidebar').classList.add('active');
  }
}

// 7. SIMULASI VISUAL NESTING CETAK A3+
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
    ? { orientasi: 'Lansekap (Diputar 90°)', total: totalB, baris: barisB, kolom: kolomB, rotasi: true }
    : { orientasi: 'Potret (Standar)', total: totalA, baris: barisA, kolom: kolomA, rotasi: false };

  const efisiensi = ((hasilTerbaik.total * currentConfig.widthCm * currentConfig.heightCm) / (32 * 48) * 100).toFixed(1);

  panelNesting.innerHTML = `
    <div class="ai-card info">
      <b>Estimasi Kertas A3+:</b><br>
      • Posisi: <b>${hasilTerbaik.orientasi}</b><br>
      • Hasil: <b>${hasilTerbaik.total} pcs / lembar</b><br>
      • Susunan: <b>${hasilTerbaik.baris} Baris x ${hasilTerbaik.kolom} Kolom</b><br>
      • Efisiensi Bahan: <b>${efisiensi}% terpakai</b>
    </div>
  `;

  // Render Simulasi Lembar Cetak Visual di Modal Popup
  renderVisualA3Sheet(hasilTerbaik);

  // Buka Modal Pop-up Visual A3+
  document.getElementById('modal-a3').classList.add('active');
}

// Render Visual Potongan Label di Atas Lembar A3+
function renderVisualA3Sheet(dataLayout) {
  const sheet = document.getElementById('a3-sheet');
  const summaryText = document.getElementById('a3-summary-info');
  sheet.innerHTML = '';

  summaryText.innerHTML = `Hasil Layout: ${dataLayout.total} pcs label (${dataLayout.baris} baris x ${dataLayout.kolom} kolom) di lembar A3+`;

  // Skala Visual 1cm = 8px
  const itemWidth = (dataLayout.rotasi ? currentConfig.heightCm : currentConfig.widthCm) * 8;
  const itemHeight = (dataLayout.rotasi ? currentConfig.widthCm : currentConfig.heightCm) * 8;

  for (let i = 0; i < dataLayout.total; i++) {
    const item = document.createElement('div');
    item.className = 'nest-item';
    item.style.width = `${itemWidth}px`;
    item.style.height = `${itemHeight}px`;
    sheet.appendChild(item);
  }
}

function tutupModalA3() {
  document.getElementById('modal-a3').classList.remove('active');
}

function buatElemenBisaDigeser(elemen) {
  let posX = 0, posY = 0, awalX = 0, awalY = 0;

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
