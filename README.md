# Library Loan API

REST API sederhana untuk layanan pencatatan peminjaman buku perpustakaan. API ini mencatat peminjaman buku oleh anggota, mendukung operasi CRUD (Create, Read, Update, Delete), serta filter data melalui query string (contoh: `GET /loans?status=Terlambat`).

## Deskripsi & Tujuan Proyek

Proyek ini dibuat untuk mengimplementasikan arsitektur RESTful API menggunakan Node.js dan Express.js dengan Supabase (PostgreSQL) sebagai database. Kode dipisah ke dalam model, controller, dan router agar terstruktur, serta menggunakan environment variable agar siap di-deploy ke Vercel.

**Stack:** Node.js, Express.js, Supabase, Vercel

## Struktur Data / Schema

Tabel `loans`:

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key, dibuat otomatis |
| member_name | text | Nama anggota (wajib) |
| member_id | text | ID/nomor anggota (wajib) |
| book_title | text | Judul buku (wajib) |
| loan_date | date | Tanggal pinjam (default hari ini) |
| due_date | date | Tanggal jatuh tempo (wajib) |
| return_date | date | Tanggal kembali (boleh kosong) |
| status | text | `Dipinjam`, `Dikembalikan`, atau `Terlambat` (default `Dipinjam`) |
| created_at | timestamptz | Waktu data dibuat |

SQL pembuatan tabel:

```sql
create table loans (
  id uuid primary key default gen_random_uuid(),
  member_name text not null,
  member_id text not null,
  book_title text not null,
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  status text not null default 'Dipinjam'
    check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  created_at timestamptz not null default now()
);

alter table loans disable row level security;
grant all on table loans to anon, authenticated, service_role;
```

## Daftar Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/loans` | Ambil semua data peminjaman |
| GET | `/loans?status=Terlambat` | Filter berdasarkan status |
| GET | `/loans/:id` | Ambil satu data peminjaman |
| POST | `/loans` | Tambah data peminjaman |
| PUT | `/loans/:id` | Ubah data peminjaman |
| DELETE | `/loans/:id` | Hapus data peminjaman |

Filter query yang didukung (bisa dikombinasikan): `status`, `member_id`, `member_name`, `book_title`.
Contoh: `GET /loans?status=Dipinjam&member_name=budi`

## Contoh Request & Response

### 1. GET /loans?status=Terlambat

Response `200 OK`:
```json
{
  "count": 1,
  "data": [
    {
      "id": "a99b9ccf-18ba-4d80-a26a-71397bc608e1",
      "member_name": "Budi Santoso",
      "member_id": "A001",
      "book_title": "Laskar Pelangi",
      "loan_date": "2026-09-01",
      "due_date": "2026-09-08",
      "return_date": null,
      "status": "Terlambat",
      "created_at": "2026-10-10T03:00:00.000Z"
    }
  ]
}
```

### 2. POST /loans

Request body:
```json
{
  "member_name": "Rina Kusuma",
  "member_id": "A004",
  "book_title": "Atomic Habits",
  "due_date": "2026-10-24"
}
```

Response `201 Created`:
```json
{
  "id": "5ac0f46f-75a2-436b-9d88-e64e6390597c",
  "member_name": "Rina Kusuma",
  "member_id": "A004",
  "book_title": "Atomic Habits",
  "loan_date": "2026-10-10",
  "due_date": "2026-10-24",
  "return_date": null,
  "status": "Dipinjam",
  "created_at": "2026-10-10T03:10:00.000Z"
}
```

### 3. PUT /loans/:id

Request body:
```json
{
  "status": "Dikembalikan"
}
```

Response `200 OK`: data peminjaman terbaru, `status` menjadi `Dikembalikan` dan `return_date` terisi otomatis dengan tanggal hari ini jika tidak dikirim.

### 4. DELETE /loans/:id

Response `200 OK`:
```json
{
  "message": "Data peminjaman berhasil dihapus",
  "data": { "id": "5ac0f46f-75a2-436b-9d88-e64e6390597c" }
}
```

### Contoh Error

- `400 Bad Request`: `{ "error": "Field 'member_name' wajib diisi" }`
- `404 Not Found`: `{ "error": "Data peminjaman tidak ditemukan" }`

## Instalasi & Menjalankan Lokal

1. Clone repository
```bash
   git clone https://github.com/trinitypakpahan/Library-loan-API.git
   cd <NAMA-REPO>
```
2. Install dependencies
```bash
   npm install
```
3. Buat project di [Supabase](https://supabase.com/), lalu jalankan SQL pada bagian Struktur Data di SQL Editor.
4. Buat file `.env` di root project:
```
   SUPABASE_URL=isi_project_url_supabase
SUPABASE_KEY=isi_anon_public_key_supabase
PORT=3000
```
5. Jalankan server
```bash
   npm run dev
```
   atau mode produksi:
```bash
   npm start
```
6. Akses `http://localhost:3000/loans`

## Deployment

API sudah di-deploy ke Vercel dan dapat diakses publik di:

https://library-loan-iyslpoft0-trinitypakpahans-projects.vercel.app/

Contoh: `<LINK-VERCEL>/loans?status=Terlambat`
