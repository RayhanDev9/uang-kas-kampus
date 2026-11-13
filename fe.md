# 💻 Frontend UI/UX Architecture & Rules (`fe.md`)

Dokumen spesifikasi teknis antarmuka Vue 3, TanStack Query, dan Tailwind CSS untuk aplikasi **KasKita**, mencakup pengelolaan state multi-semester, pemasukan non-kas, **pengeluaran kas (cash out / belanja kelas)**, riwayat transaksi, dan modul import/export Excel.

---

## 1. Arsitektur Komponen & State Management

```text
src/
├── composables/
│   ├── useKas.js             (Query & Mutation kas, diperbarui dengan parameter semesterId & importKas)
│   ├── useSemester.js        (Global state semester aktif, list semester, & switch semester)
│   ├── usePemasukanLain.js   (Query & Mutation pemasukan non-kas, saldo sisa, sponsor)
│   ├── usePengeluaran.js     (BARU: Query & Mutation belanja kelas / penarikan kas)
│   └── useHistory.js         (Query timeline log audit riwayat pembayaran & pengeluaran)
├── components/
│   ├── Navbar.vue            (Disisipkan SemesterSwitcher & tombol pemicu HistoryDrawer)
│   ├── SemesterSwitcher.vue  (Dropdown pemilih semester aktif/arsip)
│   ├── StatCards.vue         (Saldo Bersih Kas + Total Pemasukan + Total Pengeluaran)
│   ├── KasTable.vue          (Dual view desktop table dengan No. & mobile cards)
│   ├── KasFormModal.vue      (Modal input data kas mahasiswa)
│   ├── HistoryDrawer.vue     (Slide-over drawer timeline audit mutasi masuk & keluar)
│   └── KasImportModal.vue    (Modal drag-and-drop upload .xlsx/.csv & preview baris)
└── views/
    ├── DashboardView.vue     (Integrasi switcher semester, banner arsip, tombol export & history)
    ├── AdminView.vue         (Tab Kas, Tab Non-Kas, Tab Pengeluaran, Tab Semester, Export/Import)
    └── InfoView.vue          (Informasi transfer 1-click copy & QRIS preview)
```

---

## 2. Composable Pengeluaran (`src/composables/usePengeluaran.js`) — [BARU]

Mengelola pemanggilan API untuk pencatatan uang keluar:
* `pengeluaranQuery({ semesterId, search, kategori })`: Mengambil daftar belanja kelas dari `GET /api/pengeluaran`.
* `totalPengeluaran`: Nilai komputasi $\sum \text{nominal pengeluaran}$ pada semester aktif.
* `createPengeluaran({ payload, pin })`: Mutasi `POST /api/pengeluaran` dengan header `x-admin-pin`.
* `deletePengeluaran({ id, pin })`: Mutasi `DELETE /api/pengeluaran/:id` dengan header `x-admin-pin`.
* **Invalidasi Cache**: Saat pengeluaran ditambah atau dihapus, otomatis perbarui query `['pengeluaran']`, `['kas']`, dan `['history']`.

---

## 3. Spesifikasi UI Fitur Pengeluaran (Cash Out)

### A. Kartu Ringkasan Saldo Kas (`StatCards.vue`)
Diperbarui dengan kartu metrik uang keluar yang jelas dan transparan:

1. **Kartu 1 (Hero Gradient - Saldo Kas Riil / Bersih Saat Ini)**:
   - Menampilkan uang kas yang benar-benar masih ada di tangan bendahara:
     $$\text{Saldo Kas Bersih} = (\text{Kas Mahasiswa Lunas} + \text{Pemasukan Lain}) - \text{Total Pengeluaran}$$
   - Tooltip rincian: "Pemasukan: Rp X — Pengeluaran: Rp Y".
2. **Kartu 2 (Akumulasi Pemasukan)**:
   - Total seluruh dana yang pernah masuk (Iuran Mahasiswa + Sisa Semester Lalu/Sponsor).
   - Indikator persentase kepatuhan bayar mahasiswa.
3. **Kartu 3 (Total Pengeluaran / Belanja Kas)**:
   - Ditandai dengan warna aksen Rose/Amber yang elegan dan ikon `ArrowDownRight` atau `Receipt`.
   - Menampilkan total uang kas yang telah dibelanjakan.
   - Badge kategori belanja terbesar (misal: `"Akademik & Materi: Rp 120.000"`).

---

### B. Tab Pengeluaran Kas di Ruang Bendahara (`AdminView.vue`)
Menambahkan Tab baru: **"Pengeluaran (Belanja Kelas)"**:

1. **Formulir Penarikan / Pengeluaran Kas**:
   - **Judul Keperluan**: Input teks (contoh: *"Fotokopi Modul Praktikum"*, *"Beli Spidol & Kabel HDMI"*).
   - **Kategori**: Dropdown (*Akademik & Materi*, *Perlengkapan Kelas*, *Acara & Konsumsi*, *Sosial & Santunan*, *Lainnya*).
   - **Nominal (Rp)**: Validasi angka $\ge 1$. Tampilkan peringatan jika nominal melebihi sisa saldo kas yang ada.
   - **Tanggal Pengeluaran**: Date picker (default hari ini).
   - **Penanggung Jawab / Penerima Dana**: Input teks (contoh: *"Budi Santoso - Sie Perlengkapan"*).
   - **Keterangan / Catatan**: Detail keperluan belanja.
   - **Upload / URL Bukti Nota (Opsional)**: Tautan atau bukti foto nota pembelian.
2. **Tabel Daftar Belanja Kas**:
   - Kolom: `No`, `Keperluan / Judul`, `Kategori`, `Tanggal`, `Penanggung Jawab`, `Nominal (Rp)`, `Aksi (Hapus)`.
   - Total rekapitulasi belanja semester ini di bagian header tabel.

---

### C. Drawer Timeline Riwayat Kas (`HistoryDrawer.vue`)
- Setiap pencatatan pengeluaran baru akan muncul di timeline dengan:
  - Ikon **`ArrowDownRight` / `Receipt`** berlatar merah halus (`bg-rose-50 text-rose-700`).
  - Label: `"Pengeluaran Kas"`.
  - Judul: `"Fotokopi Modul Praktikum"` oleh *"Budi Santoso"*.
  - Nominal berwarna merah: `"- Rp 75.000"`.
  - Waktu pencatatan relatif (*"2 jam yang lalu"*).

---

## 4. Aturan Pengalaman Pengguna (UX Rules)

1. **Peringatan Kas Tidak Cukup (Deficit Warning)**:
   Jika bendahara menginput nominal belanja yang melebihi saldo kas yang tersedia, tampilkan pesan peringatan di form:
   > ⚠️ *Peringatan: Nominal belanja melebihi sisa saldo kas yang ada saat ini (Rp X).*
2. **Konfirmasi Hapus Pengeluaran**:
   Menghapus catatan belanja wajib melalui Modal Konfirmasi Kustom dan mengembalikan saldo kas secara reaktif seketika.
