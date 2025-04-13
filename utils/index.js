const neptuDina = {
  Minggu: 5,
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
};

const neptuPasaran = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };

const neptuSaptawara = {
  Minggu: 1,
  Senin: 2,
  Selasa: 3,
  Rabu: 4,
  Kamis: 5,
  Jumat: 6,
  Sabtu: 7,
};

export function getWeton(birthDate) {
  try {
    let date;
    if (
      typeof birthDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
    ) {
      date = new Date(`${birthDate}T12:00:00Z`); // Use noon UTC
    } else if (birthDate instanceof Date) {
      // Ensure we use UTC parts of the passed Date object if needed
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, "0");
      const day = String(birthDate.getDate()).padStart(2, "0");
      date = new Date(
        `<span class="math-inline">\{year\}\-</span>{month}-${day}T12:00:00Z`
      );
    } else {
      throw new Error(
        "Invalid Date Input type/format. Use YYYY-MM-DD string or Date object."
      );
    }

    if (isNaN(date.getTime())) {
      throw new Error("Invalid Date Input value");
    }

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const dayOfMonth = date.getUTCDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn =
      dayOfMonth +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    const pasaranIndex = jdn % 5;
    const pasaranNames = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    const pasaran = pasaranNames[pasaranIndex];

    const dayIndex = date.getUTCDay();
    const namaHari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const nameDay = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const hari = namaHari[dayIndex];
    const day = nameDay[dayIndex];

    const dayNept = neptuDina[hari];
    const pasaranNept = neptuPasaran[pasaran];

    if (dayNept === undefined || pasaranNept === undefined) {
      throw new Error(
        "Neptu calculation failed for derived day/pasaran names."
      );
    }
    const totalNeptu = dayNept + pasaranNept;

    return {
      dina: hari,
      dina_en: day,
      pasaran: pasaran,
      neptu_dina: dayNept,
      neptu_pasaran: pasaranNept,
      total_neptu: totalNeptu,
      weton: `${hari} ${pasaran}`,
      weton_en: `${day} ${pasaran}`,
    };
  } catch (error) {
    console.error("Error in getWeton function:", error);
    return null;
  }
}

export function getWuku(birthDate) {
  try {
    let date;
    if (
      typeof birthDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
    ) {
      date = new Date(`${birthDate}T12:00:00Z`); // Use noon UTC
    } else if (birthDate instanceof Date) {
      // Ensure we use UTC parts of the passed Date object if needed
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, "0");
      const day = String(birthDate.getDate()).padStart(2, "0");
      date = new Date(
        `<span class="math-inline">\{year\}\-</span>{month}-${day}T12:00:00Z`
      );
    } else {
      throw new Error(
        "Invalid Date Input type/format. Use YYYY-MM-DD string or Date object."
      );
    }

    if (isNaN(date.getTime())) {
      throw new Error("Invalid Date Input value");
    }

    const wukuNames = [
      "Sinta",
      "Landep",
      "Wukir",
      "Kurantil",
      "Tolu",
      "Gumbreg",
      "Warigalit",
      "Warigagung",
      "Julungwangi",
      "Sungsang",
      "Galungan",
      "Kuningan",
      "Langkir",
      "Mandasiya",
      "Julungpujut",
      "Pahang",
      "Kuruwelut",
      "Marakeh",
      "Tambir",
      "Medangkungan",
      "Maktal",
      "Wuye",
      "Manahil",
      "Prangbakat",
      "Bala",
      "Wugu",
      "Wayang",
      "Kulawu",
      "Dukut",
      "Watugunung",
    ];

    const namaHari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const nameSadwara = [
      "Mawulu",
      "Tungle",
      "Aryang",
      "Wurukung",
      "Paningron",
      "Uwas",
      "Mawulu",
    ];

    const nameHastawara = [
      "Uma",
      "Sri",
      "Indra",
      "Guru",
      "Yama",
      "Rudra",
      "Brama",
      "Kala",
      "Uma",
    ];

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const dayOfMonth = date.getUTCDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn =
      dayOfMonth +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    //wuku calculation
    const wuku_index = (Math.floor((jdn - 6) / 7) + 10) % 30;
    const wuku = wukuNames[wuku_index];

    //saptawara for wuku
    const dayIndex = date.getUTCDay();
    const hari = namaHari[dayIndex];
    const neptu_saptawara = neptuSaptawara[hari];

    //angka pakuwon calculation
    const pakuwon_number = wuku_index * 7 + neptu_saptawara;

    //sadwara calculation
    const sadwara_index = pakuwon_number % 6;
    const sadwara = nameSadwara[sadwara_index];

    //hastawara calculation
    let hastawara_index;

    if (pakuwon_number > 72) {
      hastawara_index = pakuwon_number % 8;
    } else {
      hastawara_index = (pakuwon_number + 2) % 8;
    }
    const hastawara = nameHastawara[hastawara_index];

    return {
      wuku_bilangan: wuku_index + 1,
      wuku: wuku,
      sadwara: sadwara,
      hastawara: hastawara,
      pakuwon: pakuwon_number,
    };
  } catch (error) {
    console.error("Error in getWuku function:", error);
    return null;
  }
}
