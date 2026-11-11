# Rencana Frontend Uang Kas Kampus

Dokumen ini berisi rencana implementasi antarmuka transparansi dan pengelolaan kas kelas menggunakan Vue 3. Dokumen ini merupakan panduan pengerjaan; fitur-fitur di bawah belum dianggap selesai sebelum diimplementasikan dan diuji.

## Tujuan

- Menampilkan saldo kas dan daftar transaksi secara transparan.
- Menyediakan pencarian dan filter transaksi untuk pengguna publik.
- Memungkinkan bendahara menambah, mengubah, dan menghapus data kas melalui API.
- Menyediakan informasi rekening/e-wallet, QRIS, dan ketentuan pembayaran.
- Menyediakan antarmuka responsif untuk perangkat desktop maupun mobile.

## Teknologi

- Vue 3, Vite, dan Composition API
- `@tanstack/vue-query` untuk pengambilan data dan mutasi
- Axios untuk komunikasi HTTP
- Vue Router untuk navigasi
- Tailwind CSS untuk styling responsif
- `@tanstack/vue-table` atau tabel kustom dengan pencarian dan filter
- Pinia opsional; PIN bendahara hanya digunakan selama sesi dan tidak ditanamkan di aplikasi
- Vercel untuk deployment frontend

## Struktur Target

```text
frontend/
├── public/
│   ├── favicon.ico
│   └── qris.*                    # Gambar QRIS yang disediakan bendahara
├── src/
│   ├── api/
│   │   └── axios.js              # Konfigurasi Axios dan base URL API
│   ├── assets/
│   │   └── main.css              # Tailwind CSS dan style global
│   ├── components/
│   │   ├── Navbar.vue
│   │   ├── StatCards.vue
│   │   ├── KasTable.vue
│   │   └── KasFormModal.vue
│   ├── composables/
│   │   └── useKas.js             # Query dan mutation TanStack Query
│   ├── router/
│   │   └── index.js
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── AdminView.vue
│   │   └── InfoView.vue
│   ├── App.vue
│   └── main.js
├── .env.example                  # Contoh konfigurasi lokal tanpa rahasia
├── package.json
├── vercel.json                   # Fallback untuk rute Vue Router
└── README.md
```

## Menjalankan Secara Lokal

1. Pastikan API backend berjalan dan dapat diakses.
2. Salin `.env.example` menjadi `.env`, lalu isi `VITE_API_BASE_URL` dengan URL backend yang diakhiri `/api` (contoh lokal: `http://localhost:3000/api`).
3. Jalankan `npm install`, lalu `npm run dev`.
4. Buka URL lokal yang ditampilkan Vite.

Untuk menampilkan QRIS, letakkan gambar yang benar dari bendahara di `public/qris.png`. Detail rekening, nominal kas, dan periode pembayaran harus dikonfirmasi sebelum dipublikasikan; halaman info sengaja menampilkan arahan konfirmasi sampai data tersebut tersedia.

## Implementasi

Status implementasi frontend:

- [x] Proyek Vue 3 + Vite, Tailwind CSS, Vue Router, Axios, dan TanStack Vue Query.
- [x] Dashboard publik dengan ringkasan, pencarian, filter status, dan tabel.
- [x] Halaman bendahara dengan form tambah/edit dan konfirmasi hapus; PIN hanya disimpan selama halaman aktif.
- [x] Halaman informasi pembayaran dengan placeholder aman untuk detail rekening dan QRIS yang belum disediakan.
- [ ] Hubungkan ke backend aktif melalui `VITE_API_BASE_URL`, isi detail pembayaran/aset QRIS, lalu verifikasi dan deploy ke Vercel.

## Rencana Pengerjaan

### 1. Inisialisasi proyek

- [x] Siapkan proyek Vue 3 + Vite.
- [x] Pasang dan konfigurasi Tailwind CSS, Axios, Vue Router, dan `@tanstack/vue-query`.
- [x] Daftarkan `VueQueryPlugin` di `src/main.js`.
- [x] Buat router untuk `/`, `/admin`, dan `/info`.
- [x] Buat `.env.example` dengan variabel `VITE_API_BASE_URL`; jangan menyimpan kredensial atau PIN di repositori.

**Hasil:** aplikasi dapat dijalankan secara lokal dan navigasi dasar berfungsi.

### 2. Integrasi API dan state server

- [x] Konfigurasikan instance Axios di `src/api/axios.js` menggunakan `import.meta.env.VITE_API_BASE_URL`.
- [x] Buat query `['kas']` di `src/composables/useKas.js` untuk mengambil `GET /kas` dari base URL yang berakhiran `/api`.
- [x] Kirim pencarian dan status sebagai query parameter; ringkasan API tetap ditampilkan tanpa dipengaruhi filter.
- [x] Buat mutation Create (`POST`), Update (`PUT`), dan Delete (`DELETE`).
- [x] Sertakan header `x-admin-pin` pada setiap mutation.
- [x] Setelah mutation berhasil, invalidasi query `['kas']` agar tabel dan ringkasan diperbarui.
- [x] Tampilkan status loading dan pesan error secara jelas; jangan menganggap permintaan gagal sebagai sukses.

**Hasil:** data dan ringkasan berasal dari API, dan perubahan data tercermin setelah mutation.

### 3. Dashboard publik (`/`)

- [x] Buat `StatCards.vue` untuk menampilkan `totalSaldo`, `totalLunas`, dan `totalBelumLunas` dari `summary`.
- [x] Buat pencarian berdasarkan nama atau NIM.
- [x] Buat filter status: Semua, Lunas, dan Belum Lunas.
- [x] Buat `KasTable.vue` untuk menampilkan data transaksi.
- [x] Gunakan badge status berwarna untuk membedakan Lunas dan Belum Lunas.
- [x] Pastikan tabel, kartu ringkasan, dan kontrol filter nyaman digunakan pada layar kecil.

**Hasil:** pengunjung dapat memahami ringkasan kas dan menemukan transaksi berdasarkan nama/NIM atau status.

### 4. Halaman pengelolaan bendahara (`/admin`)

- [x] Sediakan input PIN bendahara untuk digunakan pada header `x-admin-pin`.
- [x] Sediakan tombol **+ Catat Kas Baru** yang membuka `KasFormModal.vue`.
- [x] Validasi field wajib dan format nilai sebelum mengirim data.
- [x] Sediakan aksi Edit/Ubah Status pada setiap baris dan gunakan mutation Update.
- [x] Sediakan aksi Hapus dengan konfirmasi sebelum mutation Delete.
- [x] Tampilkan hasil sukses atau error dari operasi secara jelas.

**Hasil:** bendahara dapat membuat, mengubah, dan menghapus data melalui API.

### 5. Halaman informasi pembayaran (`/info`)

- [x] Siapkan tampilan informasi rekening/e-wallet, QRIS, dan ketentuan pembayaran; detail yang belum diberikan ditandai sebagai placeholder.
- [x] Pastikan informasi pembayaran tetap terbaca di perangkat mobile.

**Hasil:** pengguna dapat menemukan instruksi pembayaran yang benar dan mudah dibaca.

### 6. Verifikasi dan deployment

- [ ] Uji navigasi, tampilan responsif, loading/error/empty state, pencarian, dan filter.
- [ ] Uji operasi Create, Update, dan Delete terhadap backend yang sesuai.
- [ ] Pastikan permintaan mutation mengirim `x-admin-pin` dan data diperbarui setelah sukses.
- [ ] Build aplikasi untuk produksi dan perbaiki kegagalan build.
- [ ] Deploy frontend ke Vercel.
- [ ] Atur `VITE_API_BASE_URL` di Environment Variables Vercel menggunakan URL deployment backend yang berakhiran `/api`.
- [ ] Verifikasi integrasi pada deployment frontend dan pastikan konfigurasi environment tersedia saat build.

**Hasil:** frontend ter-deploy dan dapat berkomunikasi dengan backend production.

## Kontrak Integrasi Backend

Kontrak berikut harus dipertahankan saat menghubungkan frontend dengan backend.

| Method | Endpoint | Header wajib | Request body | Response sukses |
|---|---|---|---|---|
| `GET` | `/api/kas` | — | Tidak ada; query `?status=&search=` opsional | `{ success: true, summary: { totalSaldo, totalLunas, totalBelumLunas }, data: [...] }` |
| `POST` | `/api/kas` | `x-admin-pin` | `{ nim, nama, periode, nominal, status }` | `{ success: true, message: "...", data: {...} }` |
| `PUT` | `/api/kas/:id` | `x-admin-pin` | `{ status, nominal, ... }` | `{ success: true, message: "...", data: {...} }` |
| `DELETE` | `/api/kas/:id` | `x-admin-pin` | Tidak ada | `{ success: true, message: "Data kas berhasil dihapus" }` |

## Kriteria Selesai

- Ketiga rute (`/`, `/admin`, `/info`) dapat dibuka dan memiliki navigasi yang berfungsi.
- Dashboard menampilkan ringkasan dan tabel dari response API.
- Pencarian dan filter status menghasilkan daftar transaksi yang sesuai.
- Bendahara dapat menjalankan Create, Update, dan Delete dengan PIN pada header yang diwajibkan.
- Data dan ringkasan diperbarui setelah mutation berhasil.
- Loading, data kosong, dan error API ditangani dengan tampilan yang jelas.
- Layout dapat digunakan pada desktop dan mobile.
- Build produksi berhasil dan konfigurasi `VITE_API_BASE_URL` production benar.
