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

const namePancasuda = [
  {
    name: "Pati",
    neptu: 5,
    meaning: "Death",
    description:
      "Pati is generally considered the most unfavorable outcome. Its interpretation often extends beyond literal death to encompass significant loss, endings, separation, severe hardship, financial ruin, or major life disruptions. It signifies a path potentially marked by considerable struggle or misfortune. Due to its negative connotations, this designation is often actively avoided when selecting auspicious dates for important life events like marriage, moving house, or starting a business, as the aim is to mitigate potential risks.",
  },
  {
    name: "Sri",
    neptu: 1,
    meaning: "Prosper",
    description:
      "Sri signifies prosperity, abundance, and good fortune, particularly concerning sustenance and livelihood. It suggests a life path where finding rezeki (sustenance, fortune) comes relatively easily, potentially indicating success in agriculture, trade, or consistent income streams. It represents overall well-being and material comfort.",
  },
  {
    name: "Lungguh",
    neptu: 2,
    meaning: "Sitting",
    description:
      "Lungguh signifies status, dignity, respect, and honor within the community. Individuals with this designation are believed to have the potential to achieve a respected position, gain authority, or be elevated in rank. Their words may carry weight, and they are likely to be esteemed by others.",
  },
  {
    name: "Gedhong",
    neptu: 3,
    meaning: "Building",
    description:
      "Gedhong points towards wealth, particularly in the form of material possessions and property. It suggests a potential for accumulating assets, achieving financial security, owning significant property, or living a life of material comfort and abundance.",
  },
  {
    name: "Lara",
    neptu: 4,
    meaning: "Pain",
    description:
      "This designation indicates a potential predisposition towards facing challenges, obstacles, illness, suffering, or periods of misfortune. It doesn't necessarily predict constant illness but suggests that health issues or significant life trials might be recurring themes or potential vulnerabilities. It is often interpreted as a sign to be cautious and mindful of health and well-being.",
  },
];

const nameLaku = [
  {
    name: "Lakuning Bumi",
    meaning: "Conduct of Earth",
    neptu: 7,
    description:
      "Individuals with this Laku are characterized by a nature resembling the Earth. They are often generous, forgiving, patient, and protective of others. They can be nurturing and soft-hearted, making them suitable protectors for family or those in need. However, like the earth, they can be formidable when angered. They are typically diligent workers, resilient in facing disappointment, tidy, but may also hold grudges.",
  },
  {
    name: "Lakuning Geni",
    meaning: "Conduct of Fire",
    neptu: 8,
    description:
      "This Laku signifies a fiery nature. Individuals tend to be temperamental, easily angered, and may hold onto resentment, with emotions that can erupt suddenly. They generally dislike being ordered around and are often firm, assertive, or even perceived as cruel.",
  },
  {
    name: "Lakuning Angin",
    meaning: "Conduct of Wind",
    neptu: 9,
    description:
      "People with this Laku are like the wind. They can be charming and adept at winning people over, but also frightening when angered. They might lack strong personal convictions and be easily swayed by others, yet they are often agile and potentially resistant to negative influences or manipulations. They tend to care about their surroundings.",
  },
  {
    name: "Lakuning Pandita Sakti",
    meaning: "Conduct of Powerful Hermit",
    neptu: 10,
    description:
      "Like a powerful, secluded hermit. This suggests a reserved or introverted nature. Individuals may often experience hardship, austerity, or lack, finding their desires difficult to achieve.",
  },
  {
    name: "Aras Tuding",
    meaning: "Pointing Finger Nature",
    neptu: 11,
    description:
      "Having a nature likened, perhaps metaphorically, to a demon or disruptive spirit. Often considered unsuitable for leadership roles due to indecisiveness and difficulty in making firm choices. This individuals also often singled out, chosen, or perhaps blamed for things. They may also possess bravery in making significant decisions and are unafraid of risks.",
  },
  {
    name: "Aras Kembang",
    meaning: "Flower Essence",
    neptu: 12,
    description:
      "Possessing a nature like a Flower. Individuals are often charming, captivating, and attractive, particularly to the opposite sex. They carry an aura of authority or dignity. They tend to love peace, often yield to avoid conflict, and are generally obedient and diligent workers.",
  },
  {
    name: "Lakuning Lintang",
    meaning: "Conduct of Star",
    neptu: 13,
    description:
      "Having a nature like a Star. They can be sensitive or weak-hearted, prone to loneliness and suffering, and may find it difficult to settle in one place or job. Alternatively, they possess remarkable charm, enjoy adventure, dislike being the center of attention, yet remain influential.",
  },
  {
    name: "Lakuning Bulan",
    meaning: "Conduct of Moon",
    neptu: 14,
    description:
      "Possessing a nature like the Moon. Individuals are sympathetic, highly charming, and generally pleasant. They act as a source of light, comfort, or calm for those around them. They are good listeners, offer positive advice, and are often intelligent yet humble.",
  },
  {
    name: "Lakuning Matahari",
    meaning: "Conduct of Sun",
    neptu: 15,
    description:
      "Having a nature like the Sun. Individuals are seen as bright, authoritative, and enlightening",
  },
  {
    name: "Lakuning Banyu",
    meaning: "Conduct of Water",
    neptu: 16,
    description:
      "Possessing a nature like Water. Calm, tends to flow downwards (perhaps indicating practicality or humility), intuitively knows where fortune lies, and plans carefully.",
  },
  {
    name: "Lakuning Gunung",
    meaning: "Conduct of Mountain",
    neptu: 17,
    description:
      "Having a nature like a Mountain. Individuals tend to be quiet, obedient, and kind-hearted, but potentially slow in action, which can sometimes be disadvantageous.",
  },
  {
    name: "Lakuning Paripurna",
    meaning: "Perfect Conduct",
    neptu: 18,
    description:
      "Representing perfect or complete conduct. Individuals may be dominant and potentially selfish, strongly disliking rejection or opposition, and possessing strong leadership qualities but can also exhibit a fiery temper.",
  },
];

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
    console.log(namePancasuda);

    //pancasuda
    const pancasudaNeptu = totalNeptu % 5;
    const pancasuda = namePancasuda[pancasudaNeptu];
    const laku = nameLaku[totalNeptu - 7];

    return {
      dina: hari,
      dina_en: day,
      pasaran: pasaran,
      neptu_dina: dayNept,
      neptu_pasaran: pasaranNept,
      total_neptu: totalNeptu,
      weton: `${hari} ${pasaran}`,
      weton_en: `${day} ${pasaran}`,
      pancasuda: pancasuda,
      laku: laku,
      // pancasudaNeptu: pancasudaNeptu,
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
