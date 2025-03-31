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
  const date = new Date(birthDate);

  // Calculate Julian Day Number (JDN)
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 1 + 12 * a - 3;
  const jdn =
    date.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Determine Pasaran (0 = Legi, 1 = Pahing, 2 = Pon, 3 = Wage, 4 = Kliwon)
  const pasaranIndex = jdn % 5;
  const pasaranNames = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const pasaran = pasaranNames[pasaranIndex];

  // Determine Day of the Week (0 = Minggu, 1 = Senin, etc.)
  const dayIndex = date.getDay();
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const day = dayNames[dayIndex];

  // Define Neptu values
  const dayNeptuValues = {
    Minggu: 5,
    Senin: 4,
    Selasa: 3,
    Rabu: 7,
    Kamis: 8,
    Jumat: 6,
    Sabtu: 9,
  };

  const pasaranNeptuValues = {
    Legi: 5,
    Pahing: 9,
    Pon: 7,
    Wage: 4,
    Kliwon: 8,
  };

  // Calculate Neptu
  const dayNeptu = dayNeptuValues[day];
  const pasaranNeptu = pasaranNeptuValues[pasaran];
  const neptu = dayNeptu + pasaranNeptu;

  // Return Weton and Neptu
  return {
    weton: `${day} ${pasaran}`,
    neptu: neptu,
    day: day,
    pasaran: pasaran,
    dayNeptu: dayNeptu,
    pasaranNeptu: pasaranNeptu,
  };
}
