import { neptuSaptawara, nameSaptawara } from "@/lib/saptawara";
import { namePancasuda } from "@/lib/pancasuda";
import { nameLaku } from "@/lib/laku";
import { nameRakam } from "@/lib/rakam";
import {
  neptuDina,
  neptuPasaran,
  watakHari,
  watakPasaran,
  watakTotalNeptu,
} from "@/lib/weton";
import { nameHastawara } from "@/lib/hastawara";
import { nameSadwara } from "@/lib/sadwara";

function getSaptawara(date) {
  try {
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

    const neptuDina = {
      Jumat: 1,
      Sabtu: 2,
      Minggu: 3,
      Senin: 4,
      Selasa: 5,
      Rabu: 6,
      Kamis: 7,
    };

    const neptuPasaran = {
      Kliwon: 1,
      Legi: 2,
      Pahing: 3,
      Pon: 4,
      Wage: 5,
    };

    const hari = namaHari[dayIndex];
    // const day = nameDay[dayIndex];

    const dayNept = neptuDina[hari];
    const pasaranNept = neptuPasaran[pasaran];

    if (dayNept === undefined || pasaranNept === undefined) {
      throw new Error(
        "Neptu calculation failed for derived day/pasaran names."
      );
    }
    const totalNeptu = dayNept + pasaranNept;
    const saptawaraNeptu = totalNeptu % 7;
    const saptawara = nameSaptawara[saptawaraNeptu];

    return saptawara;
  } catch (error) {
    console.error("Error in getWeton function:", error);
    return null;
  }
}

function getRakam(date) {
  try {
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

    const neptuDina = {
      Jumat: 1,
      Sabtu: 2,
      Minggu: 3,
      Senin: 4,
      Selasa: 5,
      Rabu: 6,
      Kamis: 7,
    };

    const neptuPasaran = {
      Kliwon: 1,
      Legi: 2,
      Pahing: 3,
      Pon: 4,
      Wage: 5,
    };

    const hari = namaHari[dayIndex];
    // const day = nameDay[dayIndex];

    const dayNept = neptuDina[hari];
    const pasaranNept = neptuPasaran[pasaran];

    if (dayNept === undefined || pasaranNept === undefined) {
      throw new Error(
        "Neptu calculation failed for derived day/pasaran names."
      );
    }

    const totalNeptu = dayNept + pasaranNept;
    const rakamNeptu = totalNeptu % 6;
    const rakam = nameRakam[rakamNeptu];

    return rakam;
  } catch (error) {
    console.error("Error in getWeton function:", error);
    return null;
  }
}

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

    const day_character = watakHari[dayIndex];
    const pasaran_character = watakPasaran[pasaranIndex];
    const neptu_character = watakTotalNeptu[totalNeptu - 7];

    console.log(day_character, pasaran_character, neptu_character);

    //pancasuda
    const pancasudaNeptu = totalNeptu % 5;
    const pancasuda = namePancasuda[pancasudaNeptu];

    const laku = nameLaku[totalNeptu - 7];

    const saptawara = getSaptawara(date);
    const rakam = getRakam(date);
    const hastawara = getHastawara(birthDate);
    const sadwara = getSadwara(birthDate);

    return {
      dina: hari,
      dina_en: day,
      day_character: day_character,
      pasaran: pasaran,
      pasaran_character: pasaran_character,
      neptu_dina: dayNept,
      neptu_pasaran: pasaranNept,
      total_neptu: totalNeptu,
      neptu_character: neptu_character,
      weton: `${hari} ${pasaran}`,
      weton_en: `${day} ${pasaran}`,
      pancasuda: pancasuda,
      sadwara: sadwara,
      saptawara: saptawara,
      hastawara: hastawara,
      rakam: rakam,
      laku: laku,
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
    const pawukon_number = wuku_index * 7 + neptu_saptawara;

    return {
      wuku_bilangan: wuku_index + 1,
      wuku: wuku,
      pawukon: pawukon_number,
    };
  } catch (error) {
    console.error("Error in getWuku function:", error);
    return null;
  }
}

const getSadwara = (birthDate) => {
  //sadwara calculation
  const wuku = getWuku(birthDate);
  const pawukon_number = wuku.pawukon;
  const sadwara_index = pawukon_number % 6;
  const sadwara = nameSadwara[sadwara_index];

  return sadwara;
};

const getHastawara = (birthDate) => {
  let hastawara_index;
  const wuku = getWuku(birthDate);
  const pawukon_number = wuku.pawukon;

  if (pawukon_number > 72) {
    hastawara_index = pawukon_number % 8;
  } else {
    hastawara_index = (pawukon_number + 2) % 8;
  }
  const hastawara = nameHastawara[hastawara_index];

  return hastawara;
};
