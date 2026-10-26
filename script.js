// =====================================================
// Bengkel Motor Sinar Jaya - script.js
// Disusun oleh: Akrom Taufiqurrozak (A12.2025.07419)
//
// Fitur:
// 1. Menu hamburger (mobile)
// 2. Efek scroll: header, menu aktif, tombol ke atas
// 3. Filter kategori layanan
// 4. Kalkulator estimasi biaya
// 5. Form booking Bootstrap 5.3.8: validasi, tiket, tabel riwayat
// 6. FAQ accordion
// 7. Tahun otomatis di footer
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---------- 1. Menu Hamburger (mobile) ----------
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav__link");

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  // Tutup menu setelah salah satu link diklik
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- 2. Efek saat halaman di-scroll ----------
  const header = document.querySelector(".header");
  const toTop = document.getElementById("toTop");
  const sections = document.querySelectorAll("main section[id]");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 400);

    // Tandai menu sesuai section yang sedang terlihat
    sections.forEach((sec) => {
      const top = sec.offsetTop - 100;
      const bottom = top + sec.offsetHeight;
      if (y >= top && y < bottom) {
        navLinks.forEach((l) => l.classList.remove("active"));
        const active = document.querySelector(`.nav__link[href="#${sec.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- 3. Filter Kategori Layanan ----------
  const filterBtns = document.querySelectorAll(".filter__btn");
  const cards = document.querySelectorAll(".service-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const kategori = btn.dataset.filter;
      cards.forEach((card) => {
        const cocok = kategori === "semua" || card.dataset.category === kategori;
        card.classList.toggle("hidden", !cocok);
      });
    });
  });

  // ---------- 4. Kalkulator Estimasi Biaya ----------
  const estimateForm = document.getElementById("estimateForm");
  const motorType = document.getElementById("motorType");
  const checkboxes = estimateForm.querySelectorAll('input[type="checkbox"]');
  const totalPrice = document.getElementById("totalPrice");

  const formatRupiah = (angka) => "Rp" + Math.round(angka).toLocaleString("id-ID");

  function hitungTotal() {
    let subtotal = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) subtotal += Number(cb.value);
    });
    const total = subtotal * Number(motorType.value);
    totalPrice.textContent = formatRupiah(total);
  }

  // Setiap ada perubahan (checkbox / dropdown), total dihitung ulang
  estimateForm.addEventListener("change", hitungTotal);

  // ---------- 5. Form Booking (Bootstrap) ----------
  const bookingForm = document.getElementById("bookingForm");
  const ticket = document.getElementById("ticket");
  const historyBody = document.getElementById("historyBody");
  const jumlahBooking = document.getElementById("jumlahBooking");
  const inputTanggal = document.getElementById("tanggal");
  const radioMetode = document.querySelectorAll('input[name="metode"]');
  const infoPanggilan = document.getElementById("infoPanggilan");
  let nomorUrut = 0;

  // Tanggal minimal = hari ini (pakai tanggal lokal, bukan UTC)
  const now = new Date();
  const hariIni = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  inputTanggal.min = hariIni;

  // Radio: tampilkan info biaya tambahan jika memilih servis panggilan
  radioMetode.forEach((radio) => {
    radio.addEventListener("change", () => {
      infoPanggilan.classList.toggle("d-none", radio.value !== "Servis Panggilan");
    });
  });

  // Menampilkan / menghapus pesan error memakai kelas Bootstrap
  // (is-invalid = border merah, is-valid = border hijau)
  function setError(input, errorId, pesan) {
    const error = document.getElementById(errorId);
    error.textContent = pesan;
    input.classList.toggle("is-invalid", pesan !== "");
    input.classList.toggle("is-valid", pesan === "");
    return pesan === "";
  }

  // Hapus tanda error ketika pengguna mulai memperbaiki isian
  bookingForm.querySelectorAll(".form-control, .form-select").forEach((el) => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
  });

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault(); // cegah halaman reload

    // Ambil elemen & nilai input
    const elNama = document.getElementById("nama");
    const elTelp = document.getElementById("telp");
    const elPlat = document.getElementById("plat");
    const elMerek = document.getElementById("merek");
    const elLayanan = document.getElementById("jenisLayanan");
    const elAlamat = document.getElementById("alamat");
    const metodeDipilih = document.querySelector('input[name="metode"]:checked');

    const nama = elNama.value.trim();
    const telp = elTelp.value.trim();
    const plat = elPlat.value.trim().toUpperCase();
    const merek = elMerek.value;
    const layanan = elLayanan.value;
    const tanggal = inputTanggal.value;
    const alamat = elAlamat.value.trim();
    const keluhan = document.getElementById("keluhan").value.trim();

    // Validasi radio (tidak memakai setError karena bentuknya grup)
    const errMetode = document.getElementById("errMetode");
    errMetode.textContent = metodeDipilih ? "" : "Pilih salah satu metode servis.";
    errMetode.classList.toggle("d-block", !metodeDipilih);

    // Validasi semua input, hasilnya true jika semua benar
    const valid = [
      setError(elNama, "errNama", nama.length < 3 ? "Nama minimal 3 karakter." : ""),
      setError(elTelp, "errTelp", !/^08\d{8,11}$/.test(telp) ? "Nomor harus diawali 08 dan berisi 10–13 digit angka." : ""),
      setError(elPlat, "errPlat", plat === "" ? "Nomor polisi wajib diisi." : ""),
      setError(elMerek, "errMerek", merek === "" ? "Pilih merek motor." : ""),
      setError(elLayanan, "errLayanan", layanan === "" ? "Pilih jenis layanan." : ""),
      setError(inputTanggal, "errTanggal", tanggal === "" || tanggal < hariIni ? "Pilih tanggal mulai hari ini." : ""),
      setError(elAlamat, "errAlamat", alamat.length < 10 ? "Alamat minimal 10 karakter." : ""),
      Boolean(metodeDipilih),
    ].every(Boolean);

    if (!valid) return;

    // Data booking
    nomorUrut++;
    const noAntre = "SJ-" + String(Math.floor(Math.random() * 9000) + 1000);
    const tglFormat = new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const metode = metodeDipilih.value;

    // --- Manipulasi DOM 1: membuat isi tiket ---
    ticket.innerHTML = "";
    const judul = document.createElement("h3");
    judul.textContent = "✅ Booking Berhasil!";
    const nomor = document.createElement("p");
    nomor.className = "ticket__number";
    nomor.textContent = noAntre;

    const dl = document.createElement("dl");
    const data = [
      ["Nama", nama],
      ["No. WhatsApp", telp],
      ["Nomor Polisi", plat],
      ["Motor", merek],
      ["Layanan", layanan],
      ["Metode", metode],
      ["Tanggal", tglFormat],
      ["Alamat", alamat],
      ["Keluhan", keluhan || "-"],
    ];
    data.forEach(([label, nilai]) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = nilai;
      dl.append(dt, dd);
    });

    ticket.append(judul, nomor, dl);
    ticket.classList.remove("d-none");

    // --- Manipulasi DOM 2: menambah baris ke tabel riwayat ---
    const emptyRow = document.getElementById("emptyRow");
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement("tr");
    tr.className = "new-row";
    [nomorUrut, noAntre, nama, `${merek} (${plat})`, layanan, metode, tanggal]
      .forEach((isi) => {
        const td = document.createElement("td");
        td.textContent = isi;
        tr.appendChild(td);
      });
    historyBody.appendChild(tr);
    jumlahBooking.textContent = nomorUrut;

    // Kosongkan form
    resetForm();
    ticket.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // Mengembalikan form ke kondisi awal (tanpa tanda valid/invalid)
  function resetForm() {
    bookingForm.reset();
    bookingForm.querySelectorAll(".is-valid, .is-invalid").forEach((el) => {
      el.classList.remove("is-valid", "is-invalid");
    });
    document.getElementById("errMetode").classList.remove("d-block");
    infoPanggilan.classList.add("d-none");
  }

  document.getElementById("btnReset").addEventListener("click", (e) => {
    e.preventDefault();
    resetForm();
  });

  // ---------- 6. FAQ Accordion ----------
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const head = item.querySelector(".faq-item__head");
    const body = item.querySelector(".faq-item__body");

    head.addEventListener("click", () => {
      const sedangBuka = item.classList.contains("open");

      // Tutup semua item terlebih dahulu
      faqItems.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-item__body").style.maxHeight = null;
        other.querySelector(".faq-item__head").setAttribute("aria-expanded", "false");
      });

      // Buka item yang diklik (jika sebelumnya tertutup)
      if (!sedangBuka) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  // ---------- 7. Tahun otomatis di footer ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});
