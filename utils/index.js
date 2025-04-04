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
      namaHari: hari,
      dayName: day,
      pasaranName: pasaran,
      dayNeptu: dayNept,
      pasaranNeptu: pasaranNept,
      totalNeptu: totalNeptu,
      weton: `${hari} ${pasaran}`,
      weton_en: `${day} ${pasaran}`,
    };
  } catch (error) {
    console.error("Error in getWeton function:", error);
    return null;
  }
}
