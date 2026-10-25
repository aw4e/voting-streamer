# Vote Donasi ⚡

Proyek gabut-gabutan buat bantu streamer ngitung donasi pas voting game. Ada yang donasi 10 ribu? Ketik `10ribu`, Enter, selesai. Nggak usah ngitung nol satu-satu.

**Demo:** https://voting-streamer.vercel.app

## Bisa apa aja

- **Ketik nominal seenaknya**, nggak perlu ribet nulis nol:

  | Ketik | Jadi |
  |---|---|
  | `10ribu`, `10rb`, `10k` | Rp 10.000 |
  | `1jt`, `1juta`, `1,5jt` | Rp 1.000.000 / 1.500.000 |
  | `2jt500rb` | Rp 2.500.000 |
  | `132131`, `Rp 10.000` | Rp 132.131 / 10.000 |
  | `-10rb` | kurangi Rp 10.000 |

- **Semua mata uang.** `5 dolar`, `10 ringgit`, `1000 yen`, `5 sgd`, `€5`, `2 baht thailand`, dan 150-an lainnya. Kurs live dari internet, otomatis diperbarui tiap 15 menit. Tanpa kode mata uang berarti Rupiah.
- **Bagi persen ke beberapa game.** `50rb 80% ke a 20% ke b`. Nama game boleh disingkat atau pakai nomor urut (`80% 1 20% 2`). Total persen harus 100%.
- **Timer tutup voting.** Isi menit, klik Mulai, kalau waktunya habis input terkunci dan pemenang muncul.
- **Undo** (donasi persenan dibatalkan sekaligus), reset, ↑/↓ buat ganti game aktif.
- Data tersimpan di browser (localStorage), jadi aman kalau tab ke-refresh.

## Jalanin lokal

```bash
npm install
npm run dev      # buka http://localhost:5173
npm test         # tes parser nominal dan persenan
npm run build
```

## Teknologi

React 19, TypeScript, Vite, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com). Dideploy di Vercel.

## Catatan

- Data **per browser**, nggak ada server. Buka di dua perangkat berarti dua data terpisah (antar tab di browser yang sama sinkron).
- Kurs dari [currency-api](https://github.com/fawazahmed0/exchange-api), cadangan [open.er-api.com](https://open.er-api.com). Sumber gratis, update harian, jadi bukan kurs per detik. Jangan dipakai buat transaksi beneran.

Dibuat iseng. Kalau ada bug, namanya juga gabut.
