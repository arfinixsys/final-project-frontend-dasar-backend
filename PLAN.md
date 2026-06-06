Task Breakdown

---

**Task 1: Foundation — Types, Store, dan Routing Shell**

**Objective:** Mendirikan fondasi aplikasi: definisi types, Zustand store dengan persist, dan routing shell dengan bottom navigation.

**Implementation guidance:**
- Buat file `src/types/index.ts` berisi semua interface: `Habit`, `HabitCompletion`, `RecurrenceConfig`, `HabitCategory`, `MomentumStatus`, `BreakRisk`
- `RecurrenceConfig` adalah union type: `{ type: 'daily' } | { type: 'weekdays' } | { type: 'weekends' } | { type: 'specific_days', days: number[] } | { type: 'every_n_days', n: number } | { type: 'monthly', dayOfMonth: number }`
- `Habit` memiliki field: `id`, `name`, `emoji`, `color`, `category`, `recurrence`, `createdAt`, `archivedAt?`
- `HabitCompletion` memiliki field: `id`, `habitId`, `date` (format `YYYY-MM-DD`)
- Buat `src/store/useHabitStore.ts` dengan Zustand + persist middleware. State: `habits: Habit[]`, `completions: HabitCompletion[]`. Actions: `addHabit`, `updateHabit`, `archiveHabit`, `deleteHabit`, `toggleCompletion(habitId, date)`
- `toggleCompletion` cek apakah completion untuk habitId + date sudah ada — jika ya hapus (undo), jika tidak tambah
- Buat 4 halaman placeholder: `TodayPage`, `HabitsPage`, `StatsPage`, `HabitDetailPage`
- Buat `BottomNav` component dengan 3 tab (Today, Habits, Stats) — tab ke-4 (Habit Detail) diakses via navigasi dari Habits
- Setup routing di `App.tsx`: `/` → Today, `/habits` → Habits, `/stats` → Stats, `/habits/:id` → Detail
- Layout wrapper max-w-[430px] mx-auto, dark background `bg-gray-950`, full height

**Test requirements:**
- Buka app → terlihat bottom nav dengan 3 tab
- Klik tiap tab → navigasi berhasil
- Buka DevTools → localStorage key `habit-store` ada setelah app load

**Demo:** App bisa dijalankan, navigasi antar 4 halaman berfungsi, store ter-persist di localStorage.

---

**Task 2: Recurrence Engine — isDueOn dan Date Utils**

**Objective:** Membangun pure function `isDueOn(habit, date)` yang menjadi inti dari seluruh logika streak, analytics, dan today view.

**Implementation guidance:**
- Buat `src/lib/recurrence.ts`
- Fungsi utama: `isDueOn(habit: Habit, date: Date | string): boolean`
  - `daily` → selalu true
  - `weekdays` → getDay() 1–5
  - `weekends` → getDay() 0 atau 6
  - `specific_days` → getDay() ada di array days (0=Minggu, 6=Sabtu)
  - `every_n_days` → hitung selisih hari antara date dan `habit.createdAt`, jika `diff % n === 0` maka due
  - `monthly` → getDate() === dayOfMonth
- Buat `src/lib/dateUtils.ts`:
  - `toDateString(date: Date): string` → format `YYYY-MM-DD`
  - `parseDate(str: string): Date` → parse `YYYY-MM-DD` ke Date (tanpa timezone issue)
  - `getDaysAgo(n: number): Date` → hari ini minus n hari
  - `isSameDay(a: Date, b: Date): boolean`
  - `getDateRange(start: Date, end: Date): Date[]` → array tanggal dari start ke end inklusif
- Semua operasi date menggunakan local timezone (tidak UTC)

**Test requirements:**
- Unit test mental: habit `daily` → isDueOn selalu true; habit `weekdays` dengan tanggal Sabtu → false; `every_n_days n=3` di hari ke-6 dari createdAt → true; `monthly dayOfMonth=15` pada tanggal 15 → true
- Tambahkan beberapa habit seed data di store untuk testing (bisa di-hardcode sementara)

**Demo:** Dengan seed data, console.log isDueOn untuk beberapa habit + tanggal berbeda menunjukkan hasil yang benar.

---

**Task 3: Today View — Daily Check-in Page**

**Objective:** Halaman utama yang menampilkan habit due hari ini, progress bar, dan toggle completion.

**Implementation guidance:**
- Di `TodayPage`, ambil `habits` (filter: tidak archived), `completions`, `toggleCompletion` dari store
- Filter habits yang `isDueOn(habit, today)`
- Hitung `doneCount` = completions hari ini untuk habits yang due
- **Header**: nama hari (e.g., "Monday") dan tanggal lengkap (e.g., "June 2, 2026")
- **Progress bar**: `doneCount / totalDue * 100%`, dengan teks "X of Y done". Jika semua done, warna bar berubah ke green. Animasi width dengan CSS transition
- **Habit Card**: tampilkan emoji + nama + warna aksen di sisi kiri card (4px border-left berwarna sesuai `habit.color`). Tombol centang di kanan (circle button, jika done: filled dengan warna habit, ada checkmark)
- Habit yang done → geser ke bawah list (sort: undone dulu, done kemudian), nama dengan `line-through opacity-50`
- Tap tombol centang → `toggleCompletion(habitId, today)`
- **Empty state**: jika `habits.length === 0` → tampilkan "No habits yet" dengan tombol "Add your first habit" yang navigasi ke `/habits`
- **Break Risk highlight**: habit dengan break risk `High` mendapat subtle red glow/border (kalkulasi di task 6)

**Test requirements:**
- Tambah habit daily → muncul di Today
- Centang habit → pindah ke bawah, ada strikethrough
- Centang ulang → kembali ke atas, strikethrough hilang
- Progress bar bergerak sesuai jumlah yang dicentang

**Demo:** Today view fungsional — bisa check/uncheck habit, progress bar animasi, sorting bekerja.

---

**Task 4: Habit Form — Add & Edit Modal**

**Objective:** Modal form untuk membuat dan mengedit habit dengan semua field yang diperlukan.

**Implementation guidance:**
- Buat `src/components/HabitForm.tsx` sebagai modal (fixed overlay, slide-up dari bawah)
- **Field Nama**: text input, required
- **Field Emoji**: grid 6 kolom, ~24 emoji dikelompokkan per kategori (Health: 🏃💪🥗💧😴🧘, Productivity: 📚✍️💻📊⏰🎯, Mindfulness: 🧠💭🌱🌿☕🙏, Learning: 📖🎨🎵🔬💡🌍, Other: ⭐🏆🎮🛒🐾🔑). Satu emoji terpilih sekaligus (default: ⭐)
- **Field Warna**: 8 swatch preset — gunakan warna-warna dark-friendly: `#ef4444` (red), `#f97316` (orange), `#eab308` (yellow), `#22c55e` (green), `#06b6d4` (cyan), `#6366f1` (indigo), `#ec4899` (pink), `#a855f7` (purple). Dot kecil yang bisa diklik, selected state dengan ring
- **Field Kategori**: dropdown atau segmented control — Health, Productivity, Mindfulness, Learning, Other
- **Field Recurrence**: segmented control atau select untuk pilih type, lalu conditional field:
  - `specific_days` → toggle button S M T W T F S, minimal 1 harus dipilih
  - `every_n_days` → number input 2–30
  - `monthly` → number input 1–28
- Submit → `addHabit` atau `updateHabit`, tutup modal
- Validasi: nama tidak boleh kosong, specific_days minimal 1 hari
- Saat edit, form diisi dengan data habit yang ada

**Test requirements:**
- Buka modal Add → isi nama dan submit → habit muncul di store
- Buka modal Edit → data habit ter-pre-fill
- Submit tanpa nama → ada error message
- Pilih `specific_days` tanpa pilih hari → tidak bisa submit

**Demo:** Form modal bisa add dan edit habit dengan semua recurrence type.

---

**Task 5: Habits Management Page**

**Objective:** Halaman daftar habit aktif dengan opsi per-habit dan navigasi ke detail.

**Implementation guidance:**
- Di `HabitsPage`, tampilkan list habit yang tidak archived
- Tombol FAB (Floating Action Button) "+" di pojok kanan bawah → buka `HabitForm` modal dalam mode add
- Setiap row habit: emoji + nama + kategori badge + recurrence summary + streak badge
- **Recurrence summary**: fungsi `recurrenceSummary(recurrence): string`
  - `daily` → "Every day"
  - `weekdays` → "Weekdays"
  - `weekends` → "Weekends"
  - `specific_days` → singkatan hari (e.g., "Mon Wed Fri")
  - `every_n_days` → "Every 3 days"
  - `monthly` → "Monthly on 15th"
- **Streak badge**: angka current streak dengan ikon api 🔥
- Tap row → navigasi ke `/habits/:id`
- Kebab menu (⋮) per row → pilihan Edit (buka modal dengan data habit), Archive, Delete
- Archive → confirm dialog "Archive this habit? It will be hidden from all views."
- Delete → confirm dialog "Delete permanently? This cannot be undone." (lebih agresif)
- Empty state jika belum ada habit

**Test requirements:**
- Add habit → muncul di list
- Tap row → navigasi ke detail
- Tap Edit → modal terbuka dengan data ter-pre-fill
- Archive → habit hilang dari list
- Delete → habit hilang dari list dan completions terkait terhapus dari store

**Demo:** Habits page bisa manage (add, edit, archive, delete) habit lengkap dengan konfirmasi.

---

**Task 6: Streak Engine & Analytics Core**

**Objective:** Membangun semua kalkulasi analytics deterministik sebagai pure functions.

**Implementation guidance:**
- Buat `src/lib/analytics.ts`

**`calculateStreak(habit, completions, today)`:**
- Ambil semua tanggal due dari `createdAt` sampai hari ini menggunakan `isDueOn`
- Iterasi mundur dari hari ini (atau kemarin): hitung berapa hari due berturut-turut yang ada completion-nya
- Streak putus saat menemukan hari due yang tidak ada di completions
- Return `{ current: number, longest: number }`

**`calculateConsistencyScore(habit, completions, today)`:**
- Ambil 30 hari terakhir, filter yang due saja
- Hitung weighted sum: hari paling recent dapat bobot lebih tinggi (linear weight, hari ke-1 = bobot 30, hari ke-30 = bobot 1)
- `score = Σ(done_i × weight_i) / Σ(weight_i) × 100`, dibulatkan ke integer

**`calculateMomentum(habit, completions, today)`:**
- Hitung completion rate 7 hari terakhir (dari kemarin mundur): `recentRate`
- Hitung completion rate 7 hari sebelumnya (hari ke-8 sampai hari ke-14 ke belakang): `prevRate`
- Jika `recentRate > prevRate + 0.1` → `Rising`; `recentRate < prevRate - 0.1` → `Falling`; sisanya → `Steady`

**`calculateBreakRisk(habit, completions, today)`:**
- Faktor 1: apakah hari ini (today) sudah done → jika done, mengurangi risk
- Faktor 2: completion rate 7 hari terakhir
- Faktor 3: completion rate historis untuk hari-dalam-seminggu yang sama dengan besok
- Hitung skor 0–1, mapping ke `Low` (< 0.35), `Medium` (0.35–0.65), `High` (> 0.65)

**`getBestDayOfWeek(habit, completions)`:**
- Untuk setiap hari (0–6), hitung completion rate: completions pada hari itu / total due pada hari itu
- Return nama hari dengan rate tertinggi (minimum 3 data poin untuk valid, otherwise null)

**`calculateHabitCorrelation(habitA, habitB, completions)`:**
- Ambil union semua tanggal di mana habitA atau habitB due
- Hitung Jaccard: `|A ∩ B| / |A ∪ B|` di mana A = tanggal habitA done, B = tanggal habitB done
- Return similarity score 0–1

**`getCorrelatedHabits(habit, allHabits, completions)`:**
- Hitung correlation habit ini dengan semua habit aktif lain
- Filter yang score > 0.4, sort descending, ambil max 3
- Return array `{ habit, score }`

**`generateWeeklyInsight(habit, completions, today)`:**
- Template kondisional:
  - Streak > 7 + momentum Rising → "You're on a {streak}-day streak and getting stronger!"
  - Streak > 7 + momentum Steady → "Strong {streak}-day streak — keep the consistency."
  - Momentum Rising + consistency > 70 → "Great momentum this week with {score}% consistency."
  - Momentum Falling + consistency < 40 → "Consistency dipped to {score}% — time to refocus."
  - Best day valid → "You tend to do best on {bestDay}s."
  - Default → "Complete today's habit to build your streak."

**Test requirements:**
- Verifikasi secara manual: habit daily dengan 7 hari completion berturut-turut → current streak = 7
- Habit dengan beberapa hari missed di tengah → longest streak akurat
- `every_n_days` habit: hanya hari-hari yang due dihitung untuk streak

**Demo:** Console.log output analytics untuk seed data menunjukkan nilai yang masuk akal.

---

**Task 7: Habit Detail View**

**Objective:** Panel detail per-habit dengan semua stat, visualisasi mini calendar, dan weekly bar chart.

**Implementation guidance:**
- Di `HabitDetailPage`, ambil `habitId` dari params, fetch habit dari store
- Jika habit tidak ditemukan → redirect ke `/habits`
- **Header**: emoji besar, nama habit, warna sebagai accent. Tombol back kiri atas
- **Stat Cards Row** (horizontal scroll atau 2×2 grid): Current Streak 🔥, Longest Streak 🏆, Consistency Score 📊, Total Done ✓
- **Badges row**: Momentum badge (Rising ↑ / Falling ↓ / Steady →, warna hijau/merah/abu), Break Risk badge (Low/Medium/High, warna hijau/kuning/merah)
- **Best Day**: "Best day: Wednesday" atau "Not enough data"
- **Weekly Insight**: italic text, 1 kalimat
- **Correlation section**: jika ada, tampilkan "Often done together with: [emoji nama] [emoji nama]"

**Mini Calendar:**
- Grid 7 kolom untuk bulan ini
- Blank cell untuk hari sebelum tanggal 1 di bulan ini
- Setiap hari: circle berwarna jika done (warna habit), abu jika due tapi missed, blank/very subtle jika not due
- Hari ini di-highlight dengan ring
- Hari lampau bisa di-tap → `toggleCompletion(habitId, date)` (retroactive check)
- Hari depan disabled (tidak bisa di-tap)

**Weekly Bar Chart:**
- SVG, 8 minggu terakhir (W1 = paling lama, W8 = paling baru)
- Bar height proporsional terhadap completion rate minggu itu (0–100%)
- Bar color = warna habit, opacity lebih rendah untuk minggu lama
- Label W1–W8 di bawah bar, angka persentase di atas bar (atau tooltip)
- Jika 0 data, bar height 0

**Danger Zone:**
- Section paling bawah dengan border merah subtle
- Tombol "Archive Habit" dan "Delete Habit" dengan confirm dialog (sama seperti di task 5)
- Setelah archive/delete → navigate back ke `/habits`

**Test requirements:**
- Buka detail habit yang punya completions → semua stat terisi dengan benar
- Mini calendar: tap hari lampau → circle berubah, tap lagi → hilang
- Bar chart terlihat untuk habit dengan beberapa minggu data

**Demo:** Habit detail menampilkan semua stat, mini calendar interaktif, dan bar chart yang akurat.

---

**Task 8: Heatmap Component**

**Objective:** Membangun komponen heatmap 16 minggu dengan pure CSS Grid — tidak ada library.

**Implementation guidance:**
- Buat `src/components/Heatmap.tsx`
- Props: `habits: Habit[]`, `completions: HabitCompletion[]`
- Hitung grid: 16 minggu ke belakang dari hari ini, 7 hari per minggu (Senin–Minggu)
- Untuk setiap hari, tentukan state:
  - **Not Due**: tidak ada habit yang due hari itu di antara semua habit aktif → warna `bg-gray-900`
  - **Missed**: ada habit due, tapi 0 yang done → warna `bg-red-900/60`
  - **Partial**: ada yang done tapi tidak semua → warna berdasarkan ratio (25% = `bg-emerald-900`, 50% = `bg-emerald-700`, 75% = `bg-emerald-500`)
  - **Complete**: semua habit due hari itu done → warna `bg-emerald-400`
- Layout: CSS Grid dengan `grid-cols-16` (kustomisasi Tailwind atau inline style), baris = hari (1=Mon, 7=Sun)
- Label hari di kiri: Mon, Wed, Fri (row 1, 3, 5)
- Label bulan di atas: muncul di kolom pertama tiap bulan baru (cek apakah minggu itu mengandung hari pertama bulan baru)
- Setiap cell: 16px × 16px, rounded-sm, gap 2px
- **Tooltip on hover**: absolute div yang tampil di dekat cell saat hover, konten: "Jan 15 · 3 of 5 done" atau "Jan 15 · Not due"
- Scroll horizontal jika layar < 430px, tapi usahakan fit

**Test requirements:**
- Dengan seed data, heatmap menampilkan warna berbeda untuk hari yang done vs missed vs not due
- Tooltip muncul dan akurat
- Label bulan tampil di posisi yang benar

**Demo:** Heatmap terlihat dan fungsional dengan seed data, tooltip bekerja.

---

**Task 9: Stats Page**

**Objective:** Halaman analitik agregat yang menggabungkan heatmap dan ringkasan per-habit.

**Implementation guidance:**
- Di `StatsPage`:
- **Overall completion rate badge**: hitung total completions / total due dalam 30 hari terakhir di semua habit aktif → tampilkan sebagai big number, e.g., "73% overall"
- **Heatmap**: gunakan `Heatmap` component dari task 8 (lebar penuh)
- **Per-habit list**: untuk setiap habit aktif, tampilkan row:
  - Emoji + nama (kiri)
  - Current streak badge 🔥N
  - Consistency score progress bar kecil (0–100, warna sesuai habit)
  - Momentum badge (Rising/Falling/Steady)
  - Weekly insight text di bawah (collapsible atau always visible, pilih yang lebih clean)
- Sort list: berdasarkan consistency score descending (habit paling konsisten di atas)
- Empty state jika tidak ada habit

**Test requirements:**
- Stats page menampilkan overall rate yang akurat
- Setiap habit di list menampilkan data yang sama persis dengan yang ada di Habit Detail
- Heatmap terintegarsi

**Demo:** Stats page terlihat lengkap — overall badge, heatmap, dan list per-habit dengan data akurat.

---

**Task 10: Polish, Dark Theme & Mobile UX**

**Objective:** Finalisasi visual: dark theme konsisten, animasi, empty states, dan mobile UX yang solid.

**Implementation guidance:**
- **Global dark theme**: background `bg-gray-950`, card `bg-gray-900`, border `border-gray-800`, text primary `text-gray-50`, text secondary `text-gray-400`
- **Warna aksen habit**: implementasi CSS custom property atau inline style `--habit-color` di setiap komponen yang butuh warna habit
- **Animasi**:
  - Habit card check → scale bounce kecil (Tailwind `active:scale-95`)
  - Progress bar → `transition-all duration-300`
  - Modal slide-up → `translate-y` transition
  - Bottom nav active tab → scale + color transition
- **Empty states**: setiap halaman punya empty state yang informatif dan punya CTA
- **Loading/skeleton**: karena semua data lokal, ini tidak diperlukan — tapi pastikan tidak ada flash of unstyled content
- **Tombol konfirmasi dialog**: gunakan `<dialog>` HTML native atau custom overlay, bukan `window.confirm`
- **Keyboard & accessibility**: semua tombol punya `aria-label`, dialog punya focus trap
- **Bottom nav safe area**: tambah `pb-safe` atau padding bawah untuk device dengan home indicator
- Review semua halaman di viewport 390px lebar (iPhone-size)

**Test requirements:**
- Semua halaman terlihat benar di lebar 390px
- Tidak ada overflow horizontal yang tidak disengaja
- Semua dialog konfirmasi berfungsi
- Animasi berjalan smooth

**Demo:** App terlihat polished dan mobile-friendly end-to-end. Semua fitur dari Task 1–9 berfungsi terintegrasi penuh.
