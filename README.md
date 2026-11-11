<div align="center">

# KasKita

### Transparansi kas kelas, lebih jelas dan mudah dipantau.

Aplikasi web untuk melihat ringkasan pembayaran kas dan membantu bendahara mengelola catatan transaksi kelas.

[![Vue 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest/docs/framework/vue/overview)
[![Axios](https://img.shields.io/badge/Axios-1-5a29e4?logo=axios&logoColor=white)](https://axios-http.com/)
[![Vue Router](https://img.shields.io/badge/Vue_Router-4-42b883?logo=vuedotjs&logoColor=white)](https://router.vuejs.org/)

</div>

## Tentang

KasKita menyediakan satu tempat untuk melihat saldo yang terkumpul, status pembayaran, dan catatan kas. Pengunjung dapat mencari data berdasarkan nama/NIM, sementara bendahara dapat mencatat, mengubah, dan menghapus transaksi melalui API.

## Aplikasi dan repositori

| Resource | Tautan |
|---|---|
| Backend API | [backend-uang-kas-kampus.vercel.app](https://backend-uang-kas-kampus.vercel.app/) |
| Source code backend | [RayhanDev9/backend-uang-kas-kampus](https://github.com/RayhanDev9/backend-uang-kas-kampus) |
| Source code frontend | [RayhanDev9/uang-kas-kampus](https://github.com/RayhanDev9/uang-kas-kampus) |

API kas: [`GET /api/kas`](https://backend-uang-kas-kampus.vercel.app/api/kas)

## Fitur

- Ringkasan saldo terkumpul, jumlah yang lunas, dan jumlah yang belum lunas.
- Tabel transaksi dengan pencarian nama/NIM dan filter status.
- Tampilan responsif; tabel memiliki area scroll sendiri pada layar kecil atau ketika data panjang.
- Halaman admin untuk menambah, mengubah, dan menghapus catatan kas.
- Informasi pembayaran dan QRIS. Detail rekening dan gambar QRIS perlu disediakan oleh bendahara.
- State loading, data kosong, dan error API.

## Teknologi

### Frontend

| Teknologi | Penggunaan |
|---|---|
| [Vue 3](https://vuejs.org/) | Antarmuka dan Composition API |
| [Vite](https://vite.dev/) | Development server dan build produksi |
| [Tailwind CSS](https://tailwindcss.com/) | Styling dan layout responsif |
| [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview) | Server state, query, mutation, dan invalidasi cache |
| [Axios](https://axios-http.com/) | HTTP client untuk Backend API |
| [Vue Router](https://router.vuejs.org/) | Navigasi halaman |
| JavaScript | Bahasa aplikasi frontend |

### Backend

Backend adalah proyek terpisah. Stack yang digunakan:

| Teknologi | Penggunaan |
|---|---|
| [Node.js](https://nodejs.org/) dan [Express](https://expressjs.com/) | Runtime dan REST API |
| [MongoDB](https://www.mongodb.com/) dan [Mongoose](https://mongoosejs.com/) | Database dan pemodelan data |
| [Vercel](https://vercel.com/) | Deployment API |

## Halaman

| Rute | Deskripsi |
|---|---|
| `/` | Dashboard publik, ringkasan, pencarian, filter, dan tabel |
| `/admin` | Pengelolaan data kas oleh bendahara |
| `/info` | Informasi pembayaran, QRIS, dan ketentuan |

## Menjalankan secara lokal

### Persyaratan

- Node.js 18 atau lebih baru
- npm
- Backend KasKita lokal atau akses ke Backend API production

### Instalasi

```bash
npm install
```

Salin `.env.example` menjadi `.env`. Untuk backend lokal, gunakan:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Jika ingin menggunakan backend production, ubah URL menjadi:

```env
VITE_API_BASE_URL=https://backend-uang-kas-kampus.vercel.app/api
```

Jalankan server pengembangan:

```bash
npm run dev
```

Buat dan tinjau build produksi:

```bash
npm run build
npm run preview
```

Jika `VITE_API_BASE_URL` tidak ditentukan, build production menggunakan Backend API KasKita di atas; mode development menggunakan `http://localhost:3000/api`.

## Konfigurasi deployment

Saat deploy frontend ke Vercel, atur `VITE_API_BASE_URL` pada **Project Settings → Environment Variables**:

```env
VITE_API_BASE_URL=https://backend-uang-kas-kampus.vercel.app/api
```

Kemudian lakukan redeploy. Vite membaca variabel `VITE_*` ketika build, sehingga perubahan environment tidak mengubah deployment yang sudah dibangun.

## Integrasi API

Base URL API harus berakhiran `/api`. Endpoint yang digunakan frontend:

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/kas` | Mengambil daftar, ringkasan, dan parameter filter `search`/`status` |
| `POST` | `/kas` | Membuat catatan kas; memerlukan header `x-admin-pin` |
| `PUT` | `/kas/:id` | Memperbarui catatan; memerlukan header `x-admin-pin` |
| `DELETE` | `/kas/:id` | Menghapus catatan; memerlukan header `x-admin-pin` |

Header PIN hanya dikirim saat bendahara melakukan perubahan. PIN tidak disimpan di source code atau local storage; pengguna memasukkannya di halaman admin. Perlindungan PIN sederhana ini bukan pengganti autentikasi sesi/token untuk aplikasi publik.

## Aset pembayaran

Untuk menampilkan QRIS, letakkan gambar yang benar dari bendahara di `public/qris.jpg` dan pastikan file tersebut disertakan dalam commit/deploy. Vite menyalin aset di direktori `public` ke hasil build. Informasi rekening, nominal, dan ketentuan pembayaran harus dikonfirmasi sebelum dipublikasikan.

## Keamanan konfigurasi

- Jangan commit `.env` atau rahasia.
- `.env.example` hanya berisi konfigurasi contoh yang aman.
- Gunakan `VITE_API_BASE_URL` hanya untuk alamat API publik; variabel `VITE_*` akan ikut terkirim ke browser.
- Simpan `ADMIN_PIN` dan `DATABASE_URL` hanya di konfigurasi environment backend.

## Lisensi

Belum ada lisensi open-source yang ditetapkan untuk repository ini.
