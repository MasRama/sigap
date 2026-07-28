# SIGAP — Transformasi Starter Kit ke Aplikasi Sekolah

> **Brief:** Platform sekolah digital untuk kehadiran siswa, jurnal mengajar guru, dan nilai akademik. Sistem memastikan guru benar-benar hadir di sekolah saat mengisi data (anti-kecurangan via kamera + lokasi).

## Catatan Awal

- `.git` lama sudah dihapus dan repository baru diinisialisasi di branch `main`.
- Starter kit: Nara (ultimate-express + Svelte 5 + Inertia.js + better-sqlite3 + Tailwind v4).
- Semua teks user-facing dan identitas visual diubah dari `Nara` menjadi `SIGAP`.
- **Warna awal: biru langit (sky blue)**. Warna dijadikan token terpusat agar bisa diubah nanti.

---

## 0. Design Read & Arah Visual

**Reading this as:** A trust-first, calm school management product for teachers, parents, and school staff, with a soft-structural / sky-blue visual language, leaning toward Svelte 5 + Tailwind v4 + airy card-based UI.

- **Vibe archetype:** Soft Structuralism (silver-grey/white background, bold grotesk headings, airy floating cards, soft ambient shadows).
- **Layout archetype:** Asymmetrical Bento for dashboards; editorial split for landing/public pages.
- **Dials:** `DESIGN_VARIANCE 5` | `MOTION_INTENSITY 4` | `VISUAL_DENSITY 5`.
- **Primary accent:** sky blue (Tailwind `sky-500` / `#0ea5e9`, with 50–950 scale).
- **Fonts:** Replace Inter with Plus Jakarta Sans or DM Sans for body; keep Space Grotesk for headings. Avoid banned fonts (Inter, Roboto, Open Sans).
- **Motion:** custom cubic-bezier (`cubic-bezier(0.32, 0.72, 0, 1)`), entry fade-up, staggered nav, magnetic buttons.
- **No generic AI defaults:** no purple gradients, no dark-mesh heroes, no equal 3-column feature cards.

---

## API & Inertia Contract (Wajib Starter Pattern)

> Semua halaman frontend adalah **Inertia pages** (`res.inertia()`). Semua operasi data masuk/keluar lewat **axios + `api()` wrapper**. Tidak boleh ada route page yang mereturn `jsonSuccess/jsonError`, tidak boleh ada route data yang mereturn `res.inertia()`.

### Page Routes
- `GET` untuk halaman selalu merender Svelte via `res.inertia('pageName', { initialProps })`.
- Contoh: `studentsPage`, `teachersPage`, `dashboardPage`, `teacherSchedulePage`.
- Initial props berisi metadata/permissions saja (tidak wajib membawa seluruh list; list di-load via data endpoint).

### Data Routes
- `GET /xxx/data` → `listXxx` (json).
- `POST /xxx` → `addXxx` (json).
- `PUT /xxx/:id` → `editXxx` (json).
- `DELETE /xxx/:id` atau `DELETE /xxx` → `removeXxx` (json).
- Semua data handler return `jsonSuccess`, `jsonCreated`, `jsonError`, `jsonValidationError`, atau `jsonServerError`.

### Frontend Pages
- Ambil data list/detail dari data endpoint:
  ```ts
  const result = await api(() => axios.get('/students/data'), { showSuccessToast: false });
  if (result.success) students = result.data;
  ```
- Mutasi data:
  ```ts
  const result = await api(() => axios.post('/students', payload));
  if (result.success) router.visit('/students', { preserveScroll: true });
  ```
- **Dilarang:** `router.post/put/patch/delete`, `fetch()` tanpa `api()`, `window.location` untuk navigasi internal.

### File Upload / Kamera
- Foto selfie tetap dikirim via `api(() => axios.post('/teacher/confirm', formData))` (FormData multipart).
- Setelah sukses, navigasi ke halaman berikutnya dengan `router.visit('/teacher/journal')`.

---

## 1. Branding & Konfigurasi Warna — `65e548e`

- [x] **1.1** Buat file konfigurasi tema terpusat:
  - `resources/config/theme.ts` — source of truth untuk token HSL/RGB.
  - `resources/config/theme.css` — `:root` CSS variables untuk light & `.dark`, primary sky blue, semantik surface/foreground.
- [x] **1.2** Ganti semua referensi `Nara` → `SIGAP` di:
  - `package.json` (name, description, author opsional).
  - `resources/inertia.html` (title, meta).
  - `resources/Components/Header.svelte` (logo + nama).
  - `resources/Pages/landing.svelte` (semua copy).
  - `resources/Pages/auth/*.svelte` (heading, tombol, footer).
  - `app/config/constants.ts` / `env.ts` (jika ada brand references).
  - `README.md` dan `AGENTS.md` root.
- [x] **1.3** Update `resources/index.css`:
  - Hapus `@import` Inter.
  - Impor Plus Jakarta Sans & Space Grotesk (self-host via Google Fonts atau local files).
  - Ganti `--primary` ke sky blue (`200 90% 55%` / `#38bdf8` atau `205 80% 55%`).
  - Pastikan dark mode mengikuti theme config.
- [x] **1.4** Buat logo/icon komponen baru `resources/Components/SigapIcon.svelte` (ganti `NaraIcon.svelte`).
- [x] **1.5** Perbarui `resources/Components/Button.svelte`, `Badge.svelte`, `Input.svelte` agar menggunakan `cn` + theme tokens dan `data-slot` convention tetap terjaga.

---

## 2. Database Schema (Migrations) — `03d88bc`

Semua id `TEXT PRIMARY KEY` UUID, timestamp `INTEGER`, FK `ON DELETE CASCADE`.

- [x] **2.1** `academic_years` — `id`, `name`, `start_at`, `end_at`, `is_active`.
- [x] **2.2** `classes` — `id`, `name`, `grade`, `academic_year_id`.
- [x] **2.3** `subjects` — `id`, `name`, `code`.
- [x] **2.4** `students` — `id`, `nis`, `name`, `class_id`, `parent_user_id`, `phone`, `address`, `created_at`, `updated_at`.
- [x] **2.5** `teachers` — `id`, `user_id`, `employee_id`, `phone`, `created_at`, `updated_at`.
- [x] **2.6** `parents` — `id`, `user_id`, `phone`, `address`, `created_at`, `updated_at`.
- [x] **2.7** `teacher_subjects` — junction `teacher_id`, `subject_id`, `academic_year_id`.
- [x] **2.8** `class_subjects` — junction `class_id`, `subject_id`, `teacher_id`, `academic_year_id`.
- [x] **2.9** `schedules` — `id`, `class_id`, `subject_id`, `teacher_user_id`, `day_of_week`, `start_time`, `end_time`, `academic_year_id`, `created_at`, `updated_at`. Index: `class_id`, `teacher_user_id`, `day_of_week`.
- [x] **2.10** `school_locations` — `id`, `name`, `latitude`, `longitude`, `radius_meters`, `is_active`, `created_at`.
- [x] **2.11** `teacher_confirmations` — `id`, `schedule_id`, `teacher_user_id`, `photo_url`, `latitude`, `longitude`, `distance_meters`, `is_inside_school`, `confirmed_at`, `created_at`.
- [x] **2.12** `journals` — `id`, `schedule_id`, `teacher_confirmation_id`, `date`, `material`, `created_at`, `updated_at`.
- [x] **2.13** `student_attendance` — `id`, `student_id`, `schedule_id`, `journal_id`, `status` (present/sick/leave/absent), `created_at`, `updated_at`.
- [x] **2.14** `grades` — `id`, `student_id`, `subject_id`, `class_id`, `type` (task/daily_quiz/midterm/final), `score`, `date`, `teacher_user_id`, `created_at`, `updated_at`.
- [x] **2.15** Update `users` table (via migration baru):
  - Hapus kolom `membership_date` jika tidak dipakai.
  - Tambah `phone`, `is_active` jika diperlukan.
- [x] **2.16** Roles & permissions baru untuk SIGAP:
  - `admin`, `headmaster`, `teacher`, `parent`.
  - Permissions: `students.*`, `teachers.*`, `parents.*`, `classes.*`, `subjects.*`, `schedules.*`, `journals.*`, `grades.*`, `attendance.*`, `confirmations.*`, `school_locations.*`, `academic_years.*`.

---

## 3. Backend Types & Validators — `5952213`

- [x] **3.1** Perbarui `app/types/models.ts`:
  - Tambah interface: `AcademicYear`, `Class`, `Subject`, `Student`, `Teacher`, `Parent`, `Schedule`, `SchoolLocation`, `TeacherConfirmation`, `Journal`, `StudentAttendance`, `Grade`.
- [x] **3.2** Perbarui `app/types/shared.ts` untuk tipe-tipe response frontend.
- [x] **3.3** Buat Zod schemas di `app/validators/schemas.ts` untuk setiap fitur:
  - `AcademicYearSchema`, `ClassSchema`, `SubjectSchema`, `StudentSchema`, `TeacherSchema`, `ParentSchema`, `ScheduleSchema`, `SchoolLocationSchema`, `JournalSchema`, `GradeSchema`, `StudentAttendanceSchema`.
- [x] **3.4** Tambah helper `zodToErrors` tetap dipakai.

---

## 4. Backend Queries — `f9b0f4a`

- [x] **4.1** `app/queries/academicYears.ts` — CRUD & aktifkan tahun ajaran.
- [x] **4.2** `app/queries/classes.ts` — CRUD, cari by grade/academic year.
- [x] **4.3** `app/queries/subjects.ts` — CRUD, cari by code.
- [x] **4.4** `app/queries/students.ts` — CRUD, search by NIS/name, by class, by parent, pagination.
- [x] **4.5** `app/queries/teachers.ts` — CRUD, find by user_id, assign subjects.
- [x] **4.6** `app/queries/parents.ts` — CRUD, find children.
- [x] **4.7** `app/queries/schedules.ts` — CRUD, find today's schedule by teacher, by class, by day.
- [x] **4.8** `app/queries/schoolLocations.ts` — CRUD, get active location.
- [x] **4.9** `app/queries/teacherConfirmations.ts` — create, find by teacher/date, find outside flags for headmaster.
- [x] **4.10** `app/queries/journals.ts` — CRUD, find by schedule/date, with attendance.
- [x] **4.11** `app/queries/studentAttendance.ts` — CRUD bulk by journal, stats.
- [x] **4.12** `app/queries/grades.ts` — CRUD bulk by class/subject/type, stats.
- [x] **4.13** `app/queries/stats.ts` — aggregate queries untuk dashboard:
  - attendance trend (by class / by date),
  - average score (by class / subject),
  - teachers with outside confirmations.
- [x] **4.14** Update `app/queries/index.ts` barrel exports.

---

## 5. Backend Services — `[commit-id]`

- [x] **5.1** `app/services/Geolocation.ts` — helper Haversine distance, inside/outside radius.
- [x] **5.2** `app/services/CameraUpload.ts` — (opsional) wrapper untuk menyimpan foto konfirmasi ke `Storage`.
- [x] **5.3** Update `app/services/Storage.ts` jika diperlukan path baru untuk `confirmations/`.
- [x] **5.4** Update `app/services/Logger.ts` labels: `ganti nara references jika ada.

---

## 6. Backend Handlers

> Setiap resource memiliki **1 page handler** (Inertia) + **N data handler** (JSON). Contoh `students.ts`: `studentsPage` (res.inertia) + `listStudents`, `addStudent`, `editStudent`, `removeStudents` (json).

### Public & Auth
- [ ] **6.1** `app/handlers/school.ts` — `landingPage` (Inertia), public.
- [ ] **6.2** `app/handlers/auth.ts` — Inertia pages: `loginPage` | Data handlers: `submitLogin`, `logout`, `changePassword`. Register public **dihapus** (akun dibuat admin).

### Dashboard
- [ ] **6.3** `app/handlers/dashboard.ts`:
  - `dashboardPage` — role-aware Inertia page, kirim `role`, `quickLinks`.
  - `dashboardData` — json ringkasan per role:
    - teacher: jadwal hari ini, status konfirmasi.
    - parent: ringkasan anak.
    - headmaster: statistik sekolah.
    - admin: shortcut master data.

### Master Data (per file: 1 page + list/add/edit/remove)
- [ ] **6.4** `app/handlers/academicYears.ts` — `academicYearsPage` (Inertia) + `listAcademicYears`, `addAcademicYear`, `editAcademicYear`, `removeAcademicYear` (json).
- [ ] **6.5** `app/handlers/classes.ts` — `classesPage` + `listClasses`, `addClass`, `editClass`, `removeClass`.
- [ ] **6.6** `app/handlers/subjects.ts` — `subjectsPage` + `listSubjects`, `addSubject`, `editSubject`, `removeSubject`.
- [ ] **6.7** `app/handlers/students.ts` — `studentsPage` + `listStudents`, `addStudent`, `editStudent`, `removeStudents`. Import sederhana (opsional).
- [ ] **6.8** `app/handlers/teachers.ts` — `teachersPage` + `listTeachers`, `addTeacher`, `editTeacher`, `removeTeachers` + assign subjects.
- [ ] **6.9** `app/handlers/parents.ts` — `parentsPage` + `listParents`, `addParent`, `editParent`, `removeParents`.
- [ ] **6.10** `app/handlers/schedules.ts` — `schedulesPage` + `listSchedules`, `addSchedule`, `editSchedule`, `removeSchedules`.
- [ ] **6.11** `app/handlers/schoolLocations.ts` — `schoolLocationsPage` + `listSchoolLocations`, `addSchoolLocation`, `editSchoolLocation`, `removeSchoolLocation`, `setActiveSchoolLocation`.

### Teacher Flow
- [ ] **6.12** `app/handlers/teacherSchedule.ts`:
  - `teacherSchedulePage` (Inertia) — halaman jadwal hari ini.
  - `listTodaySchedules` (json) — jadwal aktif hari ini beserta status konfirmasi masing-masing.
- [ ] **6.13** `app/handlers/teacherConfirmations.ts`:
  - `submitConfirmation` (json) — menerima `photo` (multipart), `latitude`, `longitude`, `schedule_id`.
    - Validasi waktu: hanya bisa saat `start_time <= now <= end_time`.
    - Hitung jarak ke active school location; tetap sukses, set flag `is_inside_school` dan `distance_meters`.
    - Response hanya `jsonSuccess('Konfirmasi berhasil')` tanpa status lokasi.
- [ ] **6.14** `app/handlers/journals.ts`:
  - `journalsPage` (Inertia).
  - `listJournals` (json) — by teacher/date.
  - `createJournal` (json) — hanya bisa jika guru sudah konfirmasi untuk schedule tersebut; terima `material` + array `attendance`.
- [ ] **6.15** `app/handlers/grades.ts`:
  - `gradesPage` (Inertia) — form pilih kelas/mapel/jenis penilaian.
  - `listGrades` (json) — by class, subject, type.
  - `saveGrades` (json) — bulk insert/update nilai siswa.

### Parent
- [ ] **6.16** `app/handlers/parent.ts`:
  - `parentDashboardPage` (Inertia).
  - `parentDashboardData` (json) — ringkasan anak.
  - `childAttendanceData` (json) — riwayat kehadiran anak.
  - `childGradesData` (json) — nilai per mapel anak.

### Headmaster
- [ ] **6.17** `app/handlers/headmaster.ts`:
  - `headmasterDashboardPage` (Inertia).
  - `headmasterDashboardData` (json) — tren kehadiran sekolah, perbandingan nilai antar kelas.
  - `headmasterReportsPage` (Inertia) — laporan.
  - `listOutsideConfirmations` (json) — daftar guru yang konfirmasi dari luar sekolah.

### Aggregates
- [ ] **6.18** `app/handlers/attendance.ts` — data untuk laporan (json).
- [ ] **6.19** `app/handlers/reports.ts` — aggregate endpoint tambahan (json).
- [ ] **6.20** `app/handlers/index.ts` — update barrel exports.

---

## 7. Routes

> Semua route **page** return Inertia. Semua route **data** return JSON. Tidak ada `/api/data/*` catch-all; tiap resource punya route data spesifik.

- [ ] **7.1** Rewrite `routes/web.ts`:

  ```ts
  // Public
  Route.get('/', school.landingPage);
  Route.get('/login', auth.loginPage);
  Route.post('/login', strictRateLimit(), auth.submitLogin);
  Route.post('/logout', strictRateLimit(), auth.logout);

  // Dashboard (Inertia + data json)
  Route.get('/dashboard', [Auth], dashboard.dashboardPage);
  Route.get('/dashboard/data', [Auth], dashboard.dashboardData);

  // Master Data — page + data + crud
  Route.get('/academic-years', [Auth], academicYears.academicYearsPage);
  Route.get('/academic-years/data', [Auth], academicYears.listAcademicYears);
  Route.post('/academic-years', [Auth], academicYears.addAcademicYear);
  Route.put('/academic-years/:id', [Auth], academicYears.editAcademicYear);
  Route.delete('/academic-years/:id', [Auth], academicYears.removeAcademicYear);

  Route.get('/classes', [Auth], classes.classesPage);
  Route.get('/classes/data', [Auth], classes.listClasses);
  Route.post('/classes', [Auth], classes.addClass);
  Route.put('/classes/:id', [Auth], classes.editClass);
  Route.delete('/classes/:id', [Auth], classes.removeClass);

  Route.get('/subjects', [Auth], subjects.subjectsPage);
  Route.get('/subjects/data', [Auth], subjects.listSubjects);
  Route.post('/subjects', [Auth], subjects.addSubject);
  Route.put('/subjects/:id', [Auth], subjects.editSubject);
  Route.delete('/subjects/:id', [Auth], subjects.removeSubject);

  Route.get('/students', [Auth], students.studentsPage);
  Route.get('/students/data', [Auth], students.listStudents);
  Route.post('/students', [Auth], students.addStudent);
  Route.put('/students/:id', [Auth], students.editStudent);
  Route.delete('/students', [Auth], students.removeStudents);

  Route.get('/teachers', [Auth], teachers.teachersPage);
  Route.get('/teachers/data', [Auth], teachers.listTeachers);
  Route.post('/teachers', [Auth], teachers.addTeacher);
  Route.put('/teachers/:id', [Auth], teachers.editTeacher);
  Route.delete('/teachers', [Auth], teachers.removeTeachers);

  Route.get('/parents', [Auth], parents.parentsPage);
  Route.get('/parents/data', [Auth], parents.listParents);
  Route.post('/parents', [Auth], parents.addParent);
  Route.put('/parents/:id', [Auth], parents.editParent);
  Route.delete('/parents', [Auth], parents.removeParents);

  Route.get('/schedules', [Auth], schedules.schedulesPage);
  Route.get('/schedules/data', [Auth], schedules.listSchedules);
  Route.post('/schedules', [Auth], schedules.addSchedule);
  Route.put('/schedules/:id', [Auth], schedules.editSchedule);
  Route.delete('/schedules/:id', [Auth], schedules.removeSchedules);

  Route.get('/school-locations', [Auth], schoolLocations.schoolLocationsPage);
  Route.get('/school-locations/data', [Auth], schoolLocations.listSchoolLocations);
  Route.post('/school-locations', [Auth], schoolLocations.addSchoolLocation);
  Route.put('/school-locations/:id', [Auth], schoolLocations.editSchoolLocation);
  Route.delete('/school-locations/:id', [Auth], schoolLocations.removeSchoolLocation);

  // Teacher flow
  Route.get('/teacher/schedule', [Auth], teacherSchedule.teacherSchedulePage);
  Route.get('/teacher/schedule/data', [Auth], teacherSchedule.listTodaySchedules);
  Route.post('/teacher/confirm', [Auth, strictRateLimit(), uploadMiddleware], teacherConfirmations.submitConfirmation);

  Route.get('/teacher/journal', [Auth], journals.journalsPage);
  Route.get('/teacher/journal/data', [Auth], journals.listJournals);
  Route.post('/teacher/journal', [Auth], journals.createJournal);

  Route.get('/teacher/grades', [Auth], grades.gradesPage);
  Route.get('/teacher/grades/data', [Auth], grades.listGrades);
  Route.post('/teacher/grades', [Auth], grades.saveGrades);

  // Parent
  Route.get('/parent/dashboard', [Auth], parent.parentDashboardPage);
  Route.get('/parent/dashboard/data', [Auth], parent.parentDashboardData);
  Route.get('/parent/attendance', [Auth], parent.parentAttendancePage);
  Route.get('/parent/attendance/data', [Auth], parent.childAttendanceData);
  Route.get('/parent/grades', [Auth], parent.parentGradesPage);
  Route.get('/parent/grades/data', [Auth], parent.childGradesData);

  // Headmaster
  Route.get('/headmaster/dashboard', [Auth], headmaster.headmasterDashboardPage);
  Route.get('/headmaster/dashboard/data', [Auth], headmaster.headmasterDashboardData);
  Route.get('/headmaster/reports', [Auth], headmaster.headmasterReportsPage);
  Route.get('/headmaster/reports/data', [Auth], headmaster.listOutsideConfirmations);
  ```

- [ ] **7.2** Pastikan semua route protected dengan `Auth` middleware.
- [ ] **7.3** Terapkan `strictRateLimit()` pada login, konfirmasi, upload.

---

## 8. Frontend Foundation (Complete Rewrite)

- [ ] **8.1** `resources/app.ts` — inisialisasi Inertia + axios CSRF + toast.
- [ ] **8.2** `resources/index.css` — update dengan theme config, font baru, no Inter.
- [ ] **8.3** `resources/lib/api.ts` — tetap gunakan `api()` wrapper.
- [ ] **8.4** `resources/lib/toast.ts` — tetap gunakan `svelte-sonner`.
- [ ] **8.5** `resources/lib/utils.ts` — `cn()` tetap.
- [ ] **8.6** Buat `resources/lib/permissions.ts` — helper permission checks client-side.
- [ ] **8.7** `resources/types/index.ts` dan `forms.ts` — tambah tipe baru SIGAP.

---

## 9. Frontend Components (Complete Rewrite)

- [ ] **9.1** `resources/Components/SigapIcon.svelte` — logo lingkaran/sky icon.
- [ ] **9.2** `resources/Components/Header.svelte` — nav per role:
  - Teacher: Jadwal, Konfirmasi, Jurnal, Nilai.
  - Parent: Anak, Kehadiran, Nilai.
  - Headmaster: Dashboard, Laporan, Guru Luar.
  - Admin: Master Data, Monitoring.
- [ ] **9.3** `resources/Components/Button.svelte` — sky variants, rounded pills, button-in-button trailing icon.
- [ ] **9.4** `resources/Components/Badge.svelte` — status badge (hadir, sakit, izin, alpa; dalam/luar).
- [ ] **9.5** `resources/Components/Input.svelte`, `Label.svelte`, `Switch.svelte` — theme sky.
- [ ] **9.6** Buat `resources/Components/CameraCapture.svelte` — komponen kamera live + capture ke blob/base64, no file picker.
- [ ] **9.7** Buat `resources/Components/GeoButton.svelte` — tombol ambil lokasi dengan `navigator.geolocation`.
- [ ] **9.8** Buat `resources/Components/Modal.svelte`, `ConfirmDialog.svelte` reusable dengan Zag JS.
- [ ] **9.9** Buat `resources/Components/BentoCard.svelte` — kartu dashboard bento.
- [ ] **9.10** Buat `resources/Components/StatCard.svelte` — angka statistik.
- [ ] **9.11** Buat `resources/Components/DataTable.svelte` — tabel master data.
- [ ] **9.12** Update `resources/Components/Pagination.svelte`.

---

## 10. Frontend Pages (Complete Rewrite)

> Semua file di `resources/Pages/` adalah **Inertia pages**. Setiap page menerima initial props, lalu memuat list/detail lewat `api(() => axios.get('/xxx/data'))` (bukan langsung dari page props). Setelah mutasi, panggil `router.visit('/xxx', { preserveScroll: true })` untuk reload data.

### Public
- [ ] **10.1** `resources/Pages/landing.svelte` — hero SIGAP, fitur: anti-kecurangan kamera+lokasi, jurnal, nilai, pantau ortu, laporan kepala sekolah.
- [ ] **10.2** `resources/Pages/auth/login.svelte` — clean sky login, no register link.

### Dashboard (per role)
- [ ] **10.3** `resources/Pages/dashboard.svelte` — render kartu ringkasan sesuai role.
- [ ] **10.4** `resources/Pages/teacher/schedule.svelte` — jadwal hari ini, status waktu, tombol konfirmasi.
- [ ] **10.5** `resources/Pages/teacher/confirm.svelte` — UI kamera + ambil lokasi + submit.
- [ ] **10.6** `resources/Pages/teacher/journal.svelte` — form materi + checklist kehadiran siswa per kelas.
- [ ] **10.7** `resources/Pages/teacher/grades.svelte` — pilih kelas, mapel, jenis penilaian, isi nilai semua siswa.
- [ ] **10.8** `resources/Pages/parent/dashboard.svelte` — ringkasan anak: kehadiran %, rata-rata nilai.
- [ ] **10.9** `resources/Pages/parent/attendance.svelte` — riwayat kehadiran harian anak.
- [ ] **10.10** `resources/Pages/parent/grades.svelte` — nilai per mapel anak.
- [ ] **10.11** `resources/Pages/headmaster/dashboard.svelte` — tren kehadiran sekolah, perbandingan nilai antar kelas.
- [ ] **10.12** `resources/Pages/headmaster/reports.svelte` — daftar guru yang konfirmasi dari luar sekolah.

### Master Data (admin)
- [ ] **10.13** `resources/Pages/academicYears.svelte`.
- [ ] **10.14** `resources/Pages/classes.svelte`.
- [ ] **10.15** `resources/Pages/subjects.svelte`.
- [ ] **10.16** `resources/Pages/students.svelte`.
- [ ] **10.17** `resources/Pages/teachers.svelte`.
- [ ] **10.18** `resources/Pages/parents.svelte`.
- [ ] **10.19** `resources/Pages/schedules.svelte`.
- [ ] **10.20** `resources/Pages/schoolLocations.svelte`.

---

## 11. Camera & Geolocation Flow (Anti-Kecurangan)

- [ ] **11.1** Komponen kamera mengakses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })`.
- [ ] **11.2** Capture frame dari `<video>` ke `<canvas>`, convert ke `Blob`/`File`, kirim ke backend via `api(() => axios.post('/teacher/confirm', formData))` (multipart).
- [ ] **11.3** Tidak boleh ada input file upload untuk foto selfie.
- [ ] **11.4** `navigator.geolocation.getCurrentPosition()` di frontend, kirim `latitude` + `longitude`.
- [ ] **11.5** Backend hitung jarak ke `school_locations` aktif pakai Haversine.
- [ ] **11.6** Jika jarak > radius: tetap sukses, set `is_inside_school = false`, simpan `distance_meters`.
- [ ] **11.7** Validasi waktu: konfirmasi hanya boleh saat `start_time <= now <= end_time`.
- [ ] **11.8** Satu konfirmasi per schedule; journal baru bisa dibuka setelah konfirmasi berhasil.

---

## 12. RBAC & Seeds

- [ ] **12.1** Update `seeds/01_permissions.ts` — permission SIGAP baru.
- [ ] **12.2** Update `seeds/02_roles.ts` — roles: `admin`, `headmaster`, `teacher`, `parent`.
- [ ] **12.3** Update `seeds/03_admin.ts` — admin default `admin@sigap.id` / `admin123`.
- [ ] **12.4** (Opsional) `seeds/04_demo.ts` — data demo: 1 tahun ajaran, 2 kelas, 3 mapel, 10 siswa, 2 guru, 1 orang tua.

---

## 13. Testing & Verification

- [ ] **13.1** `npm run lint` — tsc --noEmit, perbaiki type errors.
- [ ] **13.2** `npm run lint:layers` — pastikan layer boundaries terjaga.
- [ ] **13.3** `npm run migrate:fresh` — rebuild schema + seed.
- [ ] **13.4** `npm run dev` — smoke test login & dashboard.
- [ ] **13.5** `npx vitest run tests/handlers/...` untuk setiap handler baru.
- [ ] **13.6** `npx vitest run tests/queries/...` untuk setiap query baru.
- [ ] **13.7** Tambah/ubah convention tests jika diperlukan.
- [ ] **13.8** Perbarui `tests/helpers/mocks.ts` jika ada type Nara yang berganti nama.

---

## 14. Dokumentasi & Project Health

- [ ] **14.1** Update `README.md` — deskripsi SIGAP, cara install, seed demo, role default.
- [ ] **14.2** Update `AGENTS.md` root — brand, warna, fitur domain, routing baru.
- [ ] **14.3** Buat ADR baru di `docs/decisions/` jika ada keputusan arsitektur signifikan (misal: `adr-camera-location-anti-fraud.md`).
- [ ] **14.4** Regenerate `CODEMAP.md` setelah struktur stabil: `npm run codemap`.
- [ ] **14.5** Perbarui `package.json` scripts/description.
- [ ] **14.6** Commit pertama ke git baru: `git add . && git commit -m "init: SIGAP sky-blue school management platform"`.

---

## 15. Nice-to-Have / Fase 2

- [ ] **15.1** Geocoding saat admin menentukan lokasi sekolah (OpenStreetMap / Nominatim).
- [ ] **15.2** Notifikasi laporan mingguan ke kepala sekolah via email (nodemailer).
- [ ] **15.3** Export PDF/Excel laporan kehadiran & nilai.
- [ ] **15.4** Multi-orang tua per siswa.
- [ ] **15.5** Riwayat absensi guru (selfie) thumbnail.
- [ ] **15.6** PWA / service worker untuk notifikasi jadwal.

---

## Rincian Theme Token (Sky Blue Default)

Isi awal `resources/config/theme.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 215 28% 17%;
  --card: 0 0% 100%;
  --card-foreground: 215 28% 17%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215 16% 46.9%;
  --primary: 199 89% 48%; /* sky-500 */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 215 28% 17%;
  --accent: 199 89% 48%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 199 89% 48%;
  --radius: 0.5rem;
}

.dark {
  --background: 215 28% 10%;
  --foreground: 210 20% 96%;
  --card: 215 28% 12%;
  --card-foreground: 210 20% 96%;
  --muted: 215 28% 16%;
  --muted-foreground: 215 16% 60%;
  --primary: 199 89% 55%;
  --primary-foreground: 215 28% 10%;
  --secondary: 215 28% 16%;
  --secondary-foreground: 210 20% 96%;
  --accent: 199 89% 55%;
  --accent-foreground: 215 28% 10%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 100%;
  --border: 215 28% 18%;
  --input: 215 28% 18%;
  --ring: 199 89% 55%;
}
```

> Mengganti warna di masa depan cukup edit file ini; semua komponen mengikuti token `primary`, `secondary`, `accent`, dsb.

---

## Estimasi Urutan Kerja

1. Branding + tema (1).
2. Schema database (2).
3. Types + validators (3).
4. Queries (4) → services (5).
5. Handlers (6) → routes (7).
6. Frontend components foundation (8) + components (9).
7. Pages (10).
8. Camera/geolocation flow (11) + integrasi teacher confirmation.
9. Seeds & RBAC (12).
10. Tests & verification (13).
11. Dokumentasi + git commit (14).
