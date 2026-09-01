/** Shared helpers for the seed scripts. */

export type Tri = { en: string; si: string; ta: string };

export const tri = (en: string, si: string, ta: string): Tri => ({ en, si, ta });

/** Expands a tri-lingual value into the `xxxEn` / `xxxSi` / `xxxTa` columns. */
export function t3<P extends string>(prefix: P, value: Tri) {
  return {
    [`${prefix}En`]: value.en,
    [`${prefix}Si`]: value.si,
    [`${prefix}Ta`]: value.ta,
  } as Record<`${P}En` | `${P}Si` | `${P}Ta`, string>;
}

/** Deterministic RNG so reseeding produces identical demo data. */
export function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function pickFrom<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

export function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function daysAgo(days: number, hour = 10) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

export function daysAhead(days: number, hour = 9) {
  return daysAgo(-days, hour);
}

export function monthsBack(count: number) {
  const now = new Date();
  const out: { year: number; month: number }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

/** Wraps paragraphs and headings into the HTML consumed by `.prose-hla`. */
export function html(blocks: (string | string[])[]) {
  return blocks
    .map((block) => {
      if (Array.isArray(block)) {
        return `<ul>${block.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      }
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith("> ")) return `<blockquote><p>${block.slice(2)}</p></blockquote>`;
      return `<p>${block}</p>`;
    })
    .join("\n");
}

export const SINHALA_NAMES = [
  ["Kamal Perera", "K. Perera"],
  ["Nimal Fernando", "N. Fernando"],
  ["Sunethra Jayawardena", "S. Jayawardena"],
  ["Ranjith Silva", "R. Silva"],
  ["Chamari Gunasekara", "C. Gunasekara"],
  ["Dhammika Bandara", "D. Bandara"],
  ["Malini Wickramasinghe", "M. Wickramasinghe"],
  ["Ajith Rajapaksha", "A. Rajapaksha"],
  ["Thilini Dissanayake", "T. Dissanayake"],
  ["Saman Kumara", "S. Kumara"],
  ["Nadeesha Herath", "N. Herath"],
  ["Rohana Weerasinghe", "R. Weerasinghe"],
  ["Kumudini Senanayake", "K. Senanayake"],
  ["Pradeep Ratnayake", "P. Ratnayake"],
  ["Anoma Ekanayake", "A. Ekanayake"],
  ["Chandana Amarasinghe", "C. Amarasinghe"],
  ["Iresha Madushani", "I. Madushani"],
  ["Buddhika Pathirana", "B. Pathirana"],
  ["Wasantha Kodithuwakku", "W. Kodithuwakku"],
  ["Sandya Liyanage", "S. Liyanage"],
  ["Gayan Wijesuriya", "G. Wijesuriya"],
  ["Priyantha Dias", "P. Dias"],
  ["Hasitha Munasinghe", "H. Munasinghe"],
  ["Upeksha Karunaratne", "U. Karunaratne"],
] as const;

export const TAMIL_NAMES = [
  ["Kumaran Selvarajah", "K. Selvarajah"],
  ["Vasanthi Ramanathan", "V. Ramanathan"],
  ["Arun Thillainathan", "A. Thillainathan"],
  ["Meena Sivakumar", "M. Sivakumar"],
  ["Rajan Ponnambalam", "R. Ponnambalam"],
  ["Nirmala Chandran", "N. Chandran"],
  ["Suresh Balasubramaniam", "S. Balasubramaniam"],
  ["Kavitha Nadarajah", "K. Nadarajah"],
  ["Mohan Rasiah", "M. Rasiah"],
  ["Latha Jeyaseelan", "L. Jeyaseelan"],
  ["Thevan Arumugam", "T. Arumugam"],
  ["Shanthi Kandasamy", "S. Kandasamy"],
] as const;

export const MUSLIM_NAMES = [
  ["Mohamed Rizwan", "M. Rizwan"],
  ["Fathima Nazreen", "F. Nazreen"],
  ["Ahamed Nishad", "A. Nishad"],
  ["Rukshana Hameed", "R. Hameed"],
  ["Imran Jaleel", "I. Jaleel"],
  ["Zahra Munavvar", "Z. Munavvar"],
] as const;

export const ALL_NAMES = [...SINHALA_NAMES, ...TAMIL_NAMES, ...MUSLIM_NAMES];

export const CITY_BY_DISTRICT: Record<string, string[]> = {
  Colombo: ["Nugegoda", "Dehiwala", "Kotte", "Maharagama", "Homagama", "Kolonnawa"],
  Gampaha: ["Negombo", "Ja-Ela", "Kelaniya", "Minuwangoda", "Wattala"],
  Kalutara: ["Panadura", "Horana", "Beruwala", "Matugama"],
  Kandy: ["Peradeniya", "Katugastota", "Gampola", "Nawalapitiya"],
  Galle: ["Hikkaduwa", "Ambalangoda", "Karapitiya", "Elpitiya"],
  Matara: ["Weligama", "Akuressa", "Dickwella"],
  Kurunegala: ["Kuliyapitiya", "Narammala", "Polgahawela"],
  Jaffna: ["Nallur", "Chavakachcheri", "Point Pedro"],
  Batticaloa: ["Kattankudy", "Eravur", "Valaichchenai"],
  Anuradhapura: ["Kekirawa", "Thambuttegama"],
  Badulla: ["Bandarawela", "Haputale", "Welimada"],
  Ratnapura: ["Balangoda", "Embilipitiya", "Pelmadulla"],
  Trincomalee: ["Kinniya", "Kantale"],
  Ampara: ["Kalmunai", "Akkaraipattu"],
  "Nuwara Eliya": ["Hatton", "Talawakele"],
};

export const OCCUPATIONS = [
  "Teacher",
  "Government officer",
  "Three-wheel driver",
  "Nurse",
  "Shop owner",
  "Farmer",
  "Bank officer",
  "Carpenter",
  "Garment worker",
  "Retired",
  "Accountant",
  "Mason",
  "Tailor",
  "Fisherman",
  "Software engineer",
  "Security officer",
];

export const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
