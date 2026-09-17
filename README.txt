WEDDING LUXURY — PUBLIC INVITATION + PRIVATE PHOTO MANAGER
============================================================

Konsep:
1. /            = undangan publik. Tidak perlu login.
2. /manage/     = halaman privat untuk upload/hapus foto.
3. /api/photos  = data foto publik, read-only.
4. /api/upload  = upload/hapus foto, wajib session admin.
5. /api/auth    = login/logout/status admin.

SLOT FOTO:
- groom
- bride
- photo01 ... photo06

KEAMANAN:
- Tombol upload TIDAK ada di halaman undangan publik.
- Upload diverifikasi di Cloudflare Pages Function, bukan hanya JavaScript.
- Login memakai cookie HttpOnly + Secure + SameSite=Strict.
- Session ditandatangani HMAC SHA-256 dan berlaku 12 jam.
- Foto publik hanya dapat dibaca; perubahan foto memerlukan login.

CLOUDFLARE PAGES + R2
=====================
1. Upload project ini ke GitHub dan hubungkan ke Cloudflare Pages.
2. Di Cloudflare Pages > Settings > Functions > R2 bucket bindings:
   buat binding dengan Variable name: PHOTOS
   lalu pilih R2 bucket yang akan dipakai.
3. Di Settings > Variables and Secrets, buat:
   ADMIN_USER       = username admin pilihan Anda
   ADMIN_PASSWORD   = password admin yang kuat
   SESSION_SECRET   = random secret panjang (minimal 32 karakter)
4. Redeploy project.
5. Buka https://DOMAIN-ANDA/manage/
6. Login memakai ADMIN_USER dan ADMIN_PASSWORD.

TIDAK PERLU membuat R2 public bucket. Foto disajikan melalui /api/photos/<slot>.

CONTOH SLOT:
- /api/photos/groom
- /api/photos/bride
- /api/photos/photo01
- ...
- /api/photos/photo06

PERILAKU UPLOAD:
- Setiap slot menyimpan 1 foto.
- Upload baru pada slot yang sama menggantikan foto lama.
- Maksimum 10 MB per file.
- JPG, PNG, WEBP diterima.
- Pengunjung biasa tetap bisa melihat foto tanpa login.

RSVP GOOGLE SHEETS
==================
Di assets/js/script.js, isi:
const RSVP_ENDPOINT = "URL_WEB_APP_GOOGLE_APPS_SCRIPT";

Contoh Apps Script:

const SHEET_NAME = 'RSVP';
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp','Nama','Kehadiran','Jumlah Tamu','Ucapan']);
  }
  const p = e.parameter;
  sheet.appendRow([new Date(), p.name || '', p.attendance || '', p.guests || '', p.message || '']);
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

Deploy Apps Script sebagai Web App, Execute as Me, dan akses sesuai kebutuhan.

MUSIK
======
Letakkan file MP3 di:
assets/music/Beautiful In White.mp3

FOTO DEFAULT
============
File SVG di assets/images adalah placeholder agar layout tidak rusak sebelum foto asli dimasukkan.
Untuk foto statis lokal, Anda dapat mengganti file placeholder atau mengubah src di index.html.

CATATAN
=======
Jangan simpan ADMIN_PASSWORD atau SESSION_SECRET di JavaScript frontend. Keduanya harus berada di Cloudflare Variables/Secrets.
