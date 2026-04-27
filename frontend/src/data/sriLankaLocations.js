/**
 * Sri Lanka provinces (9), districts (25), and curated town / road hints for checkout UX.
 * District names match common English administrative usage.
 */

export const PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
];

/** @type {Record<string, string[]>} */
export const DISTRICTS_BY_PROVINCE = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle'],
};

export const ALL_DISTRICTS = Object.values(DISTRICTS_BY_PROVINCE).flat();

const _byLen = [...ALL_DISTRICTS].sort((a, b) => b.length - a.length);

/** Major towns / cities per district (not exhaustive; users can still type freely). */
export const TOWNS_BY_DISTRICT = {
  Colombo: [
    'Colombo',
    'Colombo 01',
    'Colombo 02',
    'Colombo 03',
    'Colombo 04',
    'Colombo 05',
    'Colombo 06',
    'Colombo 07',
    'Colombo 08',
    'Dehiwala',
    'Mount Lavinia',
    'Moratuwa',
    'Sri Jayawardenapura Kotte',
    'Battaramulla',
    'Rajagiriya',
    'Maharagama',
    'Nugegoda',
    'Kohuwala',
    'Wellawatte',
    'Bambalapitiya',
    'Kollupitiya',
    'Pettah',
  ],
  Gampaha: [
    'Gampaha',
    'Negombo',
    'Ja-Ela',
    'Katunayake',
    'Seeduwa',
    'Kelaniya',
    'Kadawatha',
    'Ragama',
    'Wattala',
    'Minuwangoda',
    'Divulapitiya',
    'Mirigama',
  ],
  Kalutara: ['Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Bandaragama', 'Mathugama', 'Bulathsinhala'],
  Kandy: ['Kandy', 'Peradeniya', 'Gampola', 'Katugastota', 'Kundasale', 'Gelioya', 'Akurana', 'Nawalapitiya'],
  Matale: ['Matale', 'Dambulla', 'Galewela', 'Ukuwela', 'Rattota', 'Palapathwela'],
  'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Talawakelle', 'Ginigathena', 'Maskeliya', 'Lindula'],
  Galle: ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Elpitiya', 'Baddegama', 'Unawatuna', 'Ahangama'],
  Matara: ['Matara', 'Weligama', 'Dickwella', 'Akuressa', 'Hakmana', 'Kamburupitiya'],
  Hambantota: ['Hambantota', 'Tissamaharama', 'Tangalle', 'Beliatta', 'Ambalantota'],
  Jaffna: ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Karainagar', 'Nallur', 'Kopay', 'Chunnakam'],
  Kilinochchi: ['Kilinochchi', 'Pallai', 'Paranthan'],
  Mannar: ['Mannar', 'Nanattan', 'Pesalai'],
  Vavuniya: ['Vavuniya', 'Nedunkeni'],
  Mullaitivu: ['Mullaitivu', 'Oddusuddan', 'Puthukudiyiruppu'],
  Trincomalee: ['Trincomalee', 'Kinniya', 'Kuchchaveli', 'Mutur'],
  Batticaloa: ['Batticaloa', 'Kattankudy', 'Eravur', 'Valaichchenai'],
  Ampara: ['Ampara', 'Kalmunai', 'Sammanthurai', 'Akkaraipattu', 'Pottuvil', 'Arugam Bay'],
  Kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Polgahawela', 'Pannala', 'Mawathagama'],
  Puttalam: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila', 'Dankotuwa', 'Anamaduwa'],
  Anuradhapura: ['Anuradhapura', 'Kekirawa', 'Medawachchiya', 'Galenbindunuwewa', 'Mihintale'],
  Polonnaruwa: ['Polonnaruwa', 'Hingurakgoda', 'Medirigiriya', 'Kaduruwela'],
  Badulla: ['Badulla', 'Bandarawela', 'Ella', 'Haputale', 'Welimada', 'Passara'],
  Monaragala: ['Monaragala', 'Wellawaya', 'Bibile', 'Buttala', 'Kataragama'],
  Ratnapura: ['Ratnapura', 'Balangoda', 'Kuruwita', 'Kalawana', 'Embilipitiya'],
  Kegalle: ['Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana', 'Galigamuwa'],
};

/** Shown as datalist hints for street (users type full address). */
export const STREET_ROAD_HINTS = [
  'Main Road',
  'Station Road',
  'Temple Road',
  'Church Road',
  'School Lane',
  'First Lane',
  'Second Lane',
  'Cross Street',
  'Galle Road',
  'Kandy Road',
  'High Level Road',
  'Baseline Road',
  'Duplication Road',
  'Marine Drive',
  'St Sebastian Mawatha',
  'KKS Road',
  'Point Pedro Road',
];

const PROVINCE_LOOKUP = new Map();
for (const p of PROVINCES) {
  PROVINCE_LOOKUP.set(p.toLowerCase(), p);
  PROVINCE_LOOKUP.set(p.replace(/\s+Province$/i, '').trim().toLowerCase(), p);
}

/** District name -> province */
const DISTRICT_TO_PROVINCE = new Map();
for (const [prov, list] of Object.entries(DISTRICTS_BY_PROVINCE)) {
  for (const d of list) {
    DISTRICT_TO_PROVINCE.set(d, prov);
  }
}

export function getDistrictsForProvince(province) {
  if (!province) return [];
  return DISTRICTS_BY_PROVINCE[province] || [];
}

export function getProvinceForDistrict(districtName) {
  const d = normalizeSriLankaDistrict(districtName);
  if (!d) return '';
  return DISTRICT_TO_PROVINCE.get(d) || '';
}

export function normalizeSriLankaProvince(input) {
  if (input == null || typeof input !== 'string') return '';
  const t = input.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  const lower = t.toLowerCase();
  if (PROVINCE_LOOKUP.has(lower)) return PROVINCE_LOOKUP.get(lower);
  for (const p of PROVINCES) {
    if (lower === p.toLowerCase()) return p;
    const short = p.replace(/\s+Province$/i, '').toLowerCase();
    if (lower === short) return p;
  }
  return '';
}

export function normalizeSriLankaDistrict(input) {
  if (input == null || typeof input !== 'string') return '';
  let t = input.trim().replace(/\s+district$/i, '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  const tl = t.toLowerCase();
  for (const d of _byLen) {
    if (tl === d.toLowerCase()) return d;
  }
  for (const d of _byLen) {
    const dl = d.toLowerCase();
    if (tl.includes(dl) || dl.includes(tl)) return d;
  }
  return '';
}

/**
 * Merge reverse-geocode fields into shipping state; normalizes district/province to official names when possible.
 * @param {object} prev Previous shipping object
 * @param {object} data API response
 * @param {(v: unknown, p: string) => string} pick
 */
export function applyReverseGeocodeShipping(prev, data, pick) {
  const rawDistrict = pick(data?.district, prev.district);
  const rawState = pick(data?.state, pick(data?.province, prev.state));
  const districtNorm = normalizeSriLankaDistrict(rawDistrict) || String(rawDistrict || '').trim();
  const provFromDistrict = getProvinceForDistrict(districtNorm);
  const stateNorm = normalizeSriLankaProvince(rawState) || String(rawState || '').trim();
  const state = provFromDistrict || stateNorm;

  return {
    ...prev,
    street: pick(data?.street, prev.street),
    city: pick(data?.city, prev.city),
    district: districtNorm,
    state,
    zip: pick(data?.zip, prev.zip),
    country: pick(data?.country, prev.country) || prev.country,
  };
}
