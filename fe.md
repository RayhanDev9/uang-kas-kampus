# 💻 Frontend UI/UX Architecture & Rules (`fe.md`)

Dokumen spesifikasi teknis antarmuka Vue 3, TanStack Query, dan Tailwind CSS untuk aplikasi **KasKita**, mencakup pengelolaan state multi-semester, tampilan pemasukan non-kas, riwayat transaksi, dan modul import/export Excel.

---

## 1. Arsitektur Komponen & State Management

> Status: **Selesai Diimplementasikan (Teruji `npm run build` sukses)**

```text
src/
├── composables/
│   ├── useKas.js             (Query & Mutation kas, diperbarui dengan parameter semesterId & importKas)
│   ├── useSemester.js        (Global state semester aktif, list semester, & switch semester)
│   ├── usePemasukanLain.js   (Query & Mutation pemasukan non-kas, saldo sisa, sponsor)
│   └── useHistory.js         (Query timeline log audit riwayat pembayaran)
├── components/
│   ├── Navbar.vue            (Disisipkan SemesterSwitcher & tombol pemicu HistoryDrawer)
│   ├── SemesterSwitcher.vue  (Dropdown pemilih semester aktif/arsip)
│   ├── StatCards.vue         (Breakdown Saldo Kas Mahasiswa + Pemasukan Non-Kas + Total Terkonsolidasi)
│   ├── KasTable.vue          (Dual view desktop table & mobile cards)
│   ├── KasFormModal.vue      (Modal input data kas mahasiswa)
│   ├── HistoryDrawer.vue     (Slide-over drawer timeline audit pembayaran)
│   └── KasImportModal.vue    (Modal drag-and-drop upload .xlsx/.csv & preview baris)
└── views/
    ├── DashboardView.vue     (Integrasi switcher semester, banner arsip, tombol export & history)
    ├── AdminView.vue         (Tab Kas Mahasiswa, Tab Pemasukan Non-Kas, Tab Kelola Semester, Export & Import)
    └── InfoView.vue          (Informasi transfer 1-click copy & QRIS preview)
```

---

## 2. Global State Semester (`useSemester.js`)

State semester diakses secara global di seluruh aplikasi:
1. **Penyimpanan**: Simpan `currentSemesterId` di `localStorage` agar pilihan semester tidak hilang saat halaman di-refresh.
2. **Sinkronisasi**:
   - Saat aplikasi pertama kali dimuat, panggil endpoint `GET /api/semesters/active`.
   - Jika `currentSemesterId` di `localStorage` kosong atau tidak valid, arahkan ke semester aktif secara otomatis.
3. **Penyegaran Data (*Cache Invalidation*)**:
   - Ketika pengguna mengganti semester melalui `SemesterSwitcher`, invalidate query TanStack Query (`queryClient.invalidateQueries(['kas', 'summary', 'history', 'pemasukanLain'])`) sehingga data di semua view langsung ter-update seketika (*reactive*).

---

## 3. Spesifikasi Fitur & Antarmuka

### A. Komponen `SemesterSwitcher.vue` (Di Header/Navbar)
- Tampilkan pill dropdown yang menampilkan nama semester saat ini (contoh: `"Semester Ganjil 2024/2025"`).
- Berikan label badge hijau `"Aktif"` pada semester yang sedang berjalan.
- Semester yang sudah lewat diberi label abu-abu `"Arsip"`.
- Jika pengguna memilih semester arsip, tampilkan banner peringatan di bagian atas dashboard:
  > ⚠️ *Anda sedang melihat data arsip Semester Genap 2023/2024. Status data ini hanya untuk ditinjau (Read-Only).*

---

### B. Pembaruan Kartu Ringkasan Saldo (`StatCards.vue`)
Rombak kartu ringkasan untuk menampilkan transparansi akumulasi kas kelas:

1. **Kartu 1 (Hero Gradient - Total Saldo Terkonsolidasi)**:
   - Menampilkan total uang kas kelas sebenarnya:
     $$\text{Total Saldo} = \text{Kas Mahasiswa Lunas} + \text{Pemasukan Lain}$$
   - Dilengkapi tooltip rincian: "Iuran Mhs: Rp 1.500.000 + Sisa Lalu & Lainnya: Rp 350.000".
2. **Kartu 2 (Kas Mahasiswa)**:
   - Menampilkan jumlah mahasiswa lunas vs target total mahasiswa.
   - Progress bar capaian target kas semester ini.
3. **Kartu 3 (Pemasukan Non-Kas)**:
   - Menampilkan total pemasukan di luar iuran mahasiswa.
   - Dilengkapi badge kategori terbesar (misal: `"Sisa Semester Lalu: Rp 300.000"`).

---

### C. Drawer Timeline Riwayat Pembayaran (`HistoryDrawer.vue`)
Menampilkan log mutasi kas secara kronologis tanpa mengganggu tampilan tabel utama:
- Dibuka dengan menekan tombol **"Riwayat Kas"** pada Navbar atau Dashboard.
- Menggunakan animasi *slide-in* dari sisi kanan layar dengan backdrop blur.
- **Elemen Tiap Baris Log**:
  - Avatar / inisial mahasiswa.
  - Teks deskripsi aksi: `"Budi Santoso diubah menjadi Lunas oleh Bendahara"`.
  - Nominal mutasi uang (berwarna hijau untuk pemasukan).
  - Waktu relatif human-readable (misal: `"15 menit yang lalu"`, `"Kemarin, 14:20"`).
  - Kolom pencarian instan di dalam drawer untuk mencari riwayat berdasarkan Nama atau NIM.

---

### D. Manajemen Pemasukan Lain di Ruang Bendahara (`AdminView.vue`)
Menambahkan tab navigasi di halaman Admin:
1. **Tab 1: Iuran Mahasiswa**:
   - Pengelolaan data kas per mahasiswa (tambah, edit, hapus) seperti yang sudah berjalan.
   - Tombol **Export Excel** dan **Import Excel/CSV**.
2. **Tab 2: Pemasukan Non-Kas**:
   - Formulir pencatatan uang masuk:
     - Judul pemasukan (misal: *"Sisa Kas Semester Lalu"*).
     - Pilihan kategori (dropdown: *Sisa Semester Lalu*, *Sponsor*, *Dana Usaha*, *Donasi*, *Lainnya*).
     - Nominal (Rp) dan tanggal masuk.
     - Catatan / keterangan tambahan.
   - Tabel daftar pemasukan lain dengan opsi hapus (memerlukan PIN bendahara).
3. **Tab 3: Kelola Semester**:
   - Formulir pembuatan semester baru.
   - Tombol "Jadikan Semester Aktif" dengan konfirmasi aman.

---

### E. Modul Export & Import File Excel (`KasImportModal.vue`)

#### 1. Tombol Export Excel
- Terdapat tombol **"Export ke Excel (.xlsx)"** di Dashboard dan Ruang Bendahara.
- Saat diklik, trigger langsung unduhan file dari backend:
  `window.open('/api/kas/export?semesterId=' + currentSemesterId + '&format=xlsx')`.
- File yang diunduh langsung siap dicetak atau dilaporkan ke dosen/wali kelas.

#### 2. Modal Import Data Excel / CSV
Modal komprehensif untuk memudahkan bendahara memasukkan data banyak mahasiswa sekaligus:
1. **Unduh Template**: Tautan tombol *"Unduh Format Template Excel"* agar bendahara tidak salah memasukkan nama kolom.
2. **Area Drag-and-Drop**: Pengguna dapat menarik file `.xlsx` atau `.csv` ke dalam kotak upload atau memilih file dari komputer.
3. **Client-Side Pre-parsing & Preview**:
   - Menggunakan pustaka ringan di browser untuk membaca preview 5 baris pertama file yang dipilih sebelum dikirim ke server.
   - Menampilkan total baris data yang ditemukan.
4. **Input PIN & Eksekusi**:
   - Masukkan PIN bendahara untuk otorisasi batch import.
   - Tampilkan progress loading saat upload berjalan.
   - Tampilkan laporan hasil: *"Berhasil mengimpor 35 data kas mahasiswa."*

---

## 4. Aturan Desain & Pengalaman Pengguna (UX Rules)

1. **Zero Layout Shifts**: Semua state loading tabel, cards, dan drawer wajib menggunakan komponen *shimmer skeleton* yang presisi.
2. **Feedback Toast Instan**: Operasi simpan, update status, dan import wajib memunculkan floating toast notifikasi sukses/gagal di pojok kanan bawah.
3. **Ergonomi Layar HP**:
   - Dropdown semester dan tombol export/import tetap mudah diakses pada layar HP (min touch target: 44x44px).
   - Tampilan tabel tetap mempertahankan dual-view (tabel di layar $\ge$ 768px, *stacked cards* di layar $<$ 768px).
