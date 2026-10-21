/**
 * Ceylon Electricity Board (CEB) Power Cut & Grid Substation Dataset
 * Digitized from official Demand Management Schedules (October 19, 20, 21, 2026)
 */

export interface TimeSlot {
  slotIndex: number;
  label: string; // e.g. "04:30 p.m - 05:30 p.m"
  disconnectTime: string; // "Between 04:30 p.m & 05:00 p.m"
  restorationTime: string; // "Between 05:30 p.m & 06:00 p.m"
  duration: string; // "1 hour"
  startHour: number; // 16.5 (for live calculation)
  endHour: number; // 17.5
  group: number; // 1, 2, 3, or 4
}

export interface DaySchedule {
  date: string; // "2026-10-19"
  displayDate: string; // "19th October 2026"
  sinhalaDate: string; // "ඔක්තෝබර් 19, 2026"
  slots: TimeSlot[];
}

export interface FeederAllocation {
  group: number;
  feeders: string[];
}

export interface GridSubstation {
  id: string;
  name: string;
  displayName: string;
  sinhalaName?: string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  svgX: number;
  svgY: number;
  groupFeeders: FeederAllocation[];
  townAliases: string[];
}

// Projection parameters calibrated for high-precision Sri Lanka SVG rendering
const MIN_LAT = 5.75;
const MAX_LAT = 9.95;
const MIN_LON = 79.40;
const MAX_LON = 82.10;
const SVG_WIDTH = 460;
const SVG_HEIGHT = 700;
const PADDING = 35;

export function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  const x = PADDING + ((lng - MIN_LON) / (MAX_LON - MIN_LON)) * (SVG_WIDTH - 2 * PADDING);
  const y = PADDING + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (SVG_HEIGHT - 2 * PADDING);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export const DAY_SCHEDULES: Record<string, DaySchedule> = {
  "2026-10-19": {
    date: "2026-10-19",
    displayDate: "19th October 2026",
    sinhalaDate: "ඔක්තෝබර් 19, 2026",
    slots: [
      {
        slotIndex: 0,
        label: "04:30 p.m - 05:30 p.m",
        disconnectTime: "Between 04:30 p.m & 05:00 p.m",
        restorationTime: "Between 05:30 p.m & 06:00 p.m",
        duration: "1 hour",
        startHour: 16.5,
        endHour: 17.5,
        group: 1,
      },
      {
        slotIndex: 1,
        label: "05:30 p.m - 06:30 p.m",
        disconnectTime: "Between 05:30 p.m & 06:00 p.m",
        restorationTime: "Between 06:30 p.m & 07:00 p.m",
        duration: "1 hour",
        startHour: 17.5,
        endHour: 18.5,
        group: 2,
      },
      {
        slotIndex: 2,
        label: "06:30 p.m - 07:30 p.m",
        disconnectTime: "Between 06:30 p.m & 07:00 p.m",
        restorationTime: "Between 07:30 p.m & 08:00 p.m",
        duration: "1 hour",
        startHour: 18.5,
        endHour: 19.5,
        group: 3,
      },
      {
        slotIndex: 3,
        label: "07:30 p.m - 08:30 p.m",
        disconnectTime: "Between 07:30 p.m & 08:00 p.m",
        restorationTime: "Between 08:30 p.m & 09:00 p.m",
        duration: "1 hour",
        startHour: 19.5,
        endHour: 20.5,
        group: 4,
      },
    ],
  },
  "2026-10-20": {
    date: "2026-10-20",
    displayDate: "20th October 2026",
    sinhalaDate: "ඔක්තෝබර් 20, 2026",
    slots: [
      {
        slotIndex: 0,
        label: "04:30 p.m - 05:30 p.m",
        disconnectTime: "Between 04:30 p.m & 05:00 p.m",
        restorationTime: "Between 05:30 p.m & 06:00 p.m",
        duration: "1 hour",
        startHour: 16.5,
        endHour: 17.5,
        group: 4,
      },
      {
        slotIndex: 1,
        label: "05:30 p.m - 06:30 p.m",
        disconnectTime: "Between 05:30 p.m & 06:00 p.m",
        restorationTime: "Between 06:30 p.m & 07:00 p.m",
        duration: "1 hour",
        startHour: 17.5,
        endHour: 18.5,
        group: 1,
      },
      {
        slotIndex: 2,
        label: "06:30 p.m - 07:30 p.m",
        disconnectTime: "Between 06:30 p.m & 07:00 p.m",
        restorationTime: "Between 07:30 p.m & 08:00 p.m",
        duration: "1 hour",
        startHour: 18.5,
        endHour: 19.5,
        group: 2,
      },
      {
        slotIndex: 3,
        label: "07:30 p.m - 08:30 p.m",
        disconnectTime: "Between 07:30 p.m & 08:00 p.m",
        restorationTime: "Between 08:30 p.m & 09:00 p.m",
        duration: "1 hour",
        startHour: 19.5,
        endHour: 20.5,
        group: 3,
      },
    ],
  },
  "2026-10-21": {
    date: "2026-10-21",
    displayDate: "21st October 2026",
    sinhalaDate: "ඔක්තෝබර් 21, 2026",
    slots: [
      {
        slotIndex: 0,
        label: "04:30 p.m - 05:30 p.m",
        disconnectTime: "Between 04:30 p.m & 05:00 p.m",
        restorationTime: "Between 05:30 p.m & 06:00 p.m",
        duration: "1 hour",
        startHour: 16.5,
        endHour: 17.5,
        group: 3,
      },
      {
        slotIndex: 1,
        label: "05:30 p.m - 06:30 p.m",
        disconnectTime: "Between 05:30 p.m & 06:00 p.m",
        restorationTime: "Between 06:30 p.m & 07:00 p.m",
        duration: "1 hour",
        startHour: 17.5,
        endHour: 18.5,
        group: 4,
      },
      {
        slotIndex: 2,
        label: "06:30 p.m - 07:30 p.m",
        disconnectTime: "Between 06:30 p.m & 07:00 p.m",
        restorationTime: "Between 07:30 p.m & 08:00 p.m",
        duration: "1 hour",
        startHour: 18.5,
        endHour: 19.5,
        group: 1,
      },
      {
        slotIndex: 3,
        label: "07:30 p.m - 08:30 p.m",
        disconnectTime: "Between 07:30 p.m & 08:00 p.m",
        restorationTime: "Between 08:30 p.m & 09:00 p.m",
        duration: "1 hour",
        startHour: 19.5,
        endHour: 20.5,
        group: 2,
      },
    ],
  },
};

export const CEB_NOTICE_INFO = {
  titleEn: "Demand Management Schedule - Ceylon Electricity Board",
  titleSi: "විදුලි ඉල්ලුම කළමනාකරණ කාලසටහන",
  causeEn:
    "In the event CEB is compelled to take demand management measures due to insufficient generation resulting from unavailability of Lakvijaya Power Station caused by a blackout, measures are limited to the schedule above.",
  causeSi:
    "ලක්විජය විදුලි බලාගාරය අක්‍රිය වීම හේතුවෙන්, විදුලි ජනනය සීමා කෙරෙන අවස්ථාවලදී විදුලි ඉල්ලුම කළමනාකරණ ක්‍රියාමාර්ග ගැනීම ඉහත දැක්වෙන කාලසටහන පරිදි වේ.",
  noteEn:
    "Note: The amount of demand management capacity assigned to a group might be changed depending on demand, available generation capacity and weather conditions. Interruption and restoration times may vary within 30 minutes.",
  noteSi:
    "සටහන: කිසියම් කණ්ඩයක් යටතේ ඇති විදුලි ඉල්ලුම කළමනාකරණ ධාරිතාව, නියමිත වේලාවේ පවතින විදුලි ඉල්ලුම, ජනන ධාරිතාව සහ කාලගුණ තත්ත්වය අනුව වෙනස් වීමට ඉඩ ඇත. විදුලි විසන්ධි සහ යථා තත්ත්වයට පත් වන වේලාවන් මිනිත්තු 30ක් ඇතුළත වෙනස් විය හැක.",
};

// Raw GSS specifications with Lat/Long, Feeder allocation per Group, and Town Aliases
interface RawGSS {
  name: string;
  displayName: string;
  sinhalaName: string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  groups: {
    1?: string[];
    2?: string[];
    3?: string[];
    4?: string[];
  };
  townAliases: string[];
}

const RAW_SUBSTATIONS: RawGSS[] = [
  {
    name: "Ambalangoda",
    displayName: "Ambalangoda",
    sinhalaName: "අම්බලන්ගොඩ",
    district: "Galle",
    province: "Southern",
    lat: 6.236,
    lng: 80.054,
    groups: {
      1: ["1", "2", "3", "5"],
      4: ["6", "7 (G1)", "G2"],
    },
    townAliases: ["Balapitiya", "Ahungalla", "Kosgoda", "Uragaha", "Meetiyagoda", "Batapola"],
  },
  {
    name: "Ampara",
    displayName: "Ampara",
    sinhalaName: "අම්පාර",
    district: "Ampara",
    province: "Eastern",
    lat: 7.291,
    lng: 81.672,
    groups: {
      2: ["1", "2", "6", "7", "8", "9"],
      3: ["3", "4", "5", "10"],
    },
    townAliases: ["Kalmunai", "Sammanthurai", "Akkaraipattu", "Pottuvil", "Uhana", "Damana", "Inginiyagala"],
  },
  {
    name: "Aniyakanda",
    displayName: "Aniyakanda",
    sinhalaName: "ඇනියකන්ද",
    district: "Gampaha",
    province: "Western",
    lat: 7.026,
    lng: 79.912,
    groups: {
      2: ["3", "4", "6", "7"],
      3: ["1", "5"],
    },
    townAliases: ["Kandana", "Ragama", "Ja-Ela", "Batuwatta", "Nagoda", "Narammala Road"],
  },
  {
    name: "Anuradhapura",
    displayName: "Anuradhapura (Old)",
    sinhalaName: "අනුරාධපුර",
    district: "Anuradhapura",
    province: "North Central",
    lat: 8.335,
    lng: 80.404,
    groups: {
      2: ["1", "2", "9"],
      3: ["6", "7", "8"],
    },
    townAliases: ["Sacred City", "Anuradhapura Town", "Mihintale", "Rambewa", "Medawachchiya"],
  },
  {
    name: "New Anuradhapura",
    displayName: "New Anuradhapura",
    sinhalaName: "නව අනුරාධපුර",
    district: "Anuradhapura",
    province: "North Central",
    lat: 8.358,
    lng: 80.428,
    groups: {
      2: ["4", "6"],
      3: ["5", "7"],
    },
    townAliases: ["New Town", "Stage 1", "Stage 2", "Kekirawa Road", "Airport Road"],
  },
  {
    name: "Athurugiriya",
    displayName: "Athurugiriya",
    sinhalaName: "අතුරුගිරිය",
    district: "Colombo",
    province: "Western",
    lat: 6.878,
    lng: 79.998,
    groups: {
      1: ["1", "2", "3", "4", "6"],
      4: ["5"],
    },
    townAliases: ["Malabe", "Kaduwela", "Hokandara", "Habarakada", "Godagama", "Millennium City"],
  },
  {
    name: "Badulla",
    displayName: "Badulla",
    sinhalaName: "බදුල්ල",
    district: "Badulla",
    province: "Uva",
    lat: 6.993,
    lng: 81.055,
    groups: {
      2: ["1", "3", "4", "6"],
      3: ["5", "7", "8"],
    },
    townAliases: ["Bandarawela", "Hali Ela", "Ella", "Passara", "Welimada", "Demodara"],
  },
  {
    name: "Balangoda",
    displayName: "Balangoda",
    sinhalaName: "බලන්ගොඩ",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    lat: 6.649,
    lng: 80.701,
    groups: {
      1: ["2", "3", "4", "5", "6", "7", "8", "10"],
      4: ["1"],
    },
    townAliases: ["Opanayake", "Imbulpe", "Pambahinna", "Belihuloya", "Kaltota"],
  },
  {
    name: "Beliatta",
    displayName: "Beliatta",
    sinhalaName: "බෙලිඅත්ත",
    district: "Hambantota",
    province: "Southern",
    lat: 6.042,
    lng: 80.724,
    groups: {
      1: ["2", "3"],
      4: ["1", "4", "5", "6", "7", "8"],
    },
    townAliases: ["Tangalle", "Walasmulla", "Hakmana", "Katuwana", "Netolpitiya"],
  },
  {
    name: "Biyagama",
    displayName: "Biyagama",
    sinhalaName: "බියගම",
    district: "Gampaha",
    province: "Western",
    lat: 6.938,
    lng: 79.982,
    groups: {
      2: ["7", "12", "14"],
      3: ["10", "11"],
    },
    townAliases: ["Delgoda", "Malwana", "BOI Free Trade Zone", "Pattivila", "Pekka"],
  },
  {
    name: "Bolawatta",
    displayName: "Bolawatta",
    sinhalaName: "බෝලවත්ත",
    district: "Puttalam",
    province: "North Western",
    lat: 7.285,
    lng: 79.875,
    groups: {
      2: ["4", "5", "7"],
      3: ["2", "3", "8", "10"],
    },
    townAliases: ["Kochchikade", "Waikkal", "Negombo North", "Katuneriya", "Wennappuwa"],
  },
  {
    name: "Chilaw",
    displayName: "Chilaw",
    sinhalaName: "හලාවත",
    district: "Puttalam",
    province: "North Western",
    lat: 7.575,
    lng: 79.795,
    groups: {
      2: ["3", "12"],
      3: ["2", "5", "8", "9"],
    },
    townAliases: ["Madampe", "Marawila", "Nattandiya", "Bangadeniya", "Mahawewa"],
  },
  {
    name: "Chunnakam",
    displayName: "Chunnakam",
    sinhalaName: "චුන්නාකම්",
    district: "Jaffna",
    province: "Northern",
    lat: 9.744,
    lng: 80.031,
    groups: {
      2: ["12"],
      3: ["6", "7", "8", "9", "10", "11"],
    },
    townAliases: ["Jaffna", "Nallur", "Point Pedro", "Tellippalai", "Kankesanthurai", "Chavakachcheri", "Kopay"],
  },
  {
    name: "Dehiwala",
    displayName: "Dehiwala",
    sinhalaName: "දෙහිවල",
    district: "Colombo",
    province: "Western",
    lat: 6.852,
    lng: 79.866,
    groups: {
      2: ["3"],
      3: ["6", "7", "8"],
    },
    townAliases: ["Mount Lavinia", "Nedimala", "Kawdana", "Kohuwala", "Kalubowila", "Attidiya"],
  },
  {
    name: "Deniyaya",
    displayName: "Deniyaya",
    sinhalaName: "දෙනියාය",
    district: "Matara",
    province: "Southern",
    lat: 6.342,
    lng: 80.561,
    groups: {
      1: ["1"],
      4: ["3", "4", "G1", "G2"],
    },
    townAliases: ["Morawaka", "Kotapola", "Sinharaja", "Uragaha", "Akuressa North"],
  },
  {
    name: "Embilipitiya",
    displayName: "Embilipitiya",
    sinhalaName: "ඇඹිලිපිටිය",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    lat: 6.341,
    lng: 80.851,
    groups: {
      1: ["5", "7", "8"],
      4: ["1", "4", "6"],
    },
    townAliases: ["Middeniya", "Chandrika Wewa", "Sooriyawewa", "Thanamalwila border", "Panamure"],
  },
  {
    name: "Habarana",
    displayName: "Habarana",
    sinhalaName: "හබරණ",
    district: "Anuradhapura",
    province: "North Central",
    lat: 8.036,
    lng: 80.751,
    groups: {
      1: ["1", "6"],
      4: ["3", "5", "7"],
    },
    townAliases: ["Sigiriya", "Dambulla", "Kekirawa", "Minneriya", "Gal Oya Junction"],
  },
  {
    name: "Hambantota",
    displayName: "Hambantota",
    sinhalaName: "හම්බන්තොට",
    district: "Hambantota",
    province: "Southern",
    lat: 6.124,
    lng: 81.118,
    groups: {
      1: ["5", "11"],
      4: ["4", "6", "8"],
    },
    townAliases: ["Ambalantota", "Mirijjawila", "Port City", "Magampura", "Ranna", "Bundala"],
  },
  {
    name: "Horana",
    displayName: "Horana",
    sinhalaName: "හොරණ",
    district: "Kalutara",
    province: "Western",
    lat: 6.721,
    lng: 80.063,
    groups: {
      1: ["2", "3", "12"],
      4: ["7"],
    },
    townAliases: ["Ingiriya", "Pokunuwita", "Bandaragama", "Bulathsinhala", "Govinna"],
  },
  {
    name: "Kalutara",
    displayName: "Kalutara",
    sinhalaName: "කළුතර",
    district: "Kalutara",
    province: "Western",
    lat: 6.585,
    lng: 79.961,
    groups: {
      1: ["3", "6", "7"],
      4: ["4", "5", "8"],
    },
    townAliases: ["Nagoda", "Katukurunda", "Payagala", "Wadduwa South", "Dodangoda"],
  },
  {
    name: "Kappalthurai",
    displayName: "Kappalthurai (Kappalthure)",
    sinhalaName: "කප්පල්තුරෙයි",
    district: "Trincomalee",
    province: "Eastern",
    lat: 8.528,
    lng: 81.184,
    groups: {
      2: ["3"],
      3: ["4"],
    },
    townAliases: ["Kappalthure", "China Bay", "Trincomalee South", "Kinniya", "Clappenburg", "Muttur Highway"],
  },
  {
    name: "Katunayaka",
    displayName: "Katunayaka",
    sinhalaName: "කටුනායක",
    district: "Gampaha",
    province: "Western",
    lat: 7.168,
    lng: 79.889,
    groups: {
      2: ["1"],
    },
    townAliases: ["BIA Airport", "Seeduwa", "Free Trade Zone", "18th Mile Post", "Liyanagemulla"],
  },
  {
    name: "Kegalle",
    displayName: "Kegalle (Kegalla)",
    sinhalaName: "කෑගල්ල",
    district: "Kegalle",
    province: "Sabaragamuwa",
    lat: 7.252,
    lng: 80.346,
    groups: {
      1: ["2", "7", "4"],
      4: ["1", "6", "8"],
    },
    townAliases: ["Kegalla", "Mawanella", "Rambukkana", "Nelundeniya", "Galigamuwa", "Hemmathagama"],
  },
  {
    name: "Kelaniya",
    displayName: "Kelaniya",
    sinhalaName: "කැලණිය",
    district: "Gampaha",
    province: "Western",
    lat: 6.962,
    lng: 79.924,
    groups: {
      2: ["2", "5"],
      3: ["1", "3", "4"],
    },
    townAliases: ["Peliyagoda", "Kiribathgoda", "Dalugama", "Hunupitiya", "Thorana Junction"],
  },
  {
    name: "Kerawalapitiya",
    displayName: "Kerawalapitiya",
    sinhalaName: "කෙරවලපිටිය",
    district: "Gampaha",
    province: "Western",
    lat: 6.994,
    lng: 79.884,
    groups: {
      2: ["1", "2"],
      3: ["8"],
    },
    townAliases: ["Wattala", "Hendala", "Mabola", "Elakanda", "Hunupitiya North"],
  },
  {
    name: "Kesbewa",
    displayName: "Kesbewa",
    sinhalaName: "කැස්බෑව",
    district: "Colombo",
    province: "Western",
    lat: 6.782,
    lng: 79.953,
    groups: {
      1: ["1"],
      4: ["3"],
    },
    townAliases: ["Piliyandala", "Kahathuduwa", "Polgasowita", "Madapatha", "Dampe"],
  },
  {
    name: "Kilinochchi",
    displayName: "Kilinochchi",
    sinhalaName: "කිලිනොච්චිය",
    district: "Kilinochchi",
    province: "Northern",
    lat: 9.385,
    lng: 80.402,
    groups: {
      2: ["3", "6", "8"],
      3: ["1", "2", "4"],
    },
    townAliases: ["Paranthan", "Poonakary", "Iranamadu", "Dharmapuram", "Elephant Pass"],
  },
  {
    name: "Kiribathkumbura",
    displayName: "Kiribathkumbura",
    sinhalaName: "කිරිබත්කුඹුර",
    district: "Kandy",
    province: "Central",
    lat: 7.272,
    lng: 80.592,
    groups: {
      1: ["2", "4", "6", "7", "9", "11"],
      4: ["1", "3", "5", "8", "12"],
    },
    townAliases: ["Kandy City", "Peradeniya", "Pilimathalawa", "Kadugannawa", "Gelioya", "Gatambe"],
  },
  {
    name: "Kolonnawa",
    displayName: "Kolonnawa (Old & GIS)",
    sinhalaName: "කොලොන්නාව",
    district: "Colombo",
    province: "Western",
    lat: 6.932,
    lng: 79.885,
    groups: {
      2: ["17", "18", "8 (Kolonnawa old)"],
      3: ["6 (Kolonnawa GIS)"],
    },
    townAliases: ["Kolonnawa old", "Kolonnawa GIS", "Wellampitiya", "Sedawatta", "Grandpass", "Dematagoda", "Orugodawatta"],
  },
  {
    name: "Kosgama",
    displayName: "Kosgama",
    sinhalaName: "කොස්ගම",
    district: "Colombo",
    province: "Western",
    lat: 6.921,
    lng: 80.182,
    groups: {
      1: ["2", "3", "6"],
      4: ["1", "5"],
    },
    townAliases: ["Avissawella", "Puwakpitiya", "Hanwella", "Kaluaggala", "Salawa"],
  },
  {
    name: "Kotugoda",
    displayName: "Kotugoda",
    sinhalaName: "කොටුගොඩ",
    district: "Gampaha",
    province: "Western",
    lat: 7.124,
    lng: 79.971,
    groups: {
      2: ["6", "9", "10", "11", "12", "13"],
      3: ["1", "3", "8"],
    },
    townAliases: ["Minuwangoda", "Ekala", "Raddoluwa", "Udugampola", "Gampaha West"],
  },
  {
    name: "Kurunegala",
    displayName: "Kurunegala",
    sinhalaName: "කුරුණෑගල",
    district: "Kurunegala",
    province: "North Western",
    lat: 7.485,
    lng: 80.364,
    groups: {
      1: ["2", "8", "10"],
    },
    townAliases: ["Mawathagama", "Polgahawela", "Narammala", "Wariyapola", "Ibbagamuwa", "Mallawapitiya"],
  },
  {
    name: "Mahiyanganaya",
    displayName: "Mahiyanganaya",
    sinhalaName: "මහියංගනය",
    district: "Badulla",
    province: "Uva",
    lat: 7.324,
    lng: 81.002,
    groups: {
      2: ["2", "8"],
      3: ["1"],
    },
    townAliases: ["Dehiattakandiya", "Girandurukotte", "Hasalaka", "Minipe", "Mapakada"],
  },
  {
    name: "Maho",
    displayName: "Maho",
    sinhalaName: "මාහෝ",
    district: "Kurunegala",
    province: "North Western",
    lat: 7.821,
    lng: 80.274,
    groups: {
      2: ["1", "3"],
    },
    townAliases: ["Yapahuwa", "Galgamuwa", "Nikaweratiya", "Ambanpola", "Balalla"],
  },
  {
    name: "Maliboda",
    displayName: "Maliboda",
    sinhalaName: "මලිබොඩ",
    district: "Kegalle",
    province: "Sabaragamuwa",
    lat: 6.932,
    lng: 80.381,
    groups: {
      1: ["2"],
    },
    townAliases: ["Deraniyagala", "Dehiowita", "Noori", "Magala"],
  },
  {
    name: "Mannar",
    displayName: "Mannar",
    sinhalaName: "මන්නාරම",
    district: "Mannar",
    province: "Northern",
    lat: 8.981,
    lng: 79.914,
    groups: {
      2: ["1"],
      3: ["2", "4"],
    },
    townAliases: ["Thalaimannar", "Pesalai", "Murunkan", "Madhu Road", "Nanattan"],
  },
  {
    name: "Matara",
    displayName: "Matara",
    sinhalaName: "මාතර",
    district: "Matara",
    province: "Southern",
    lat: 5.952,
    lng: 80.543,
    groups: {
      1: ["2", "3", "7", "8", "10", "11"],
      4: ["4", "6", "9", "12"],
    },
    townAliases: ["Weligama", "Mirissa", "Devinuwara (Dondra)", "Dikwella", "Kekanadurra", "Akuressa"],
  },
  {
    name: "Mathugama",
    displayName: "Mathugama",
    sinhalaName: "මතුගම",
    district: "Kalutara",
    province: "Western",
    lat: 6.524,
    lng: 80.121,
    groups: {
      1: ["2", "3", "6", "7"],
      4: ["5", "8", "10"],
    },
    townAliases: ["Agalawatte", "Aluthgama", "Beruwala", "Neboda", "Baduraliya", "Meegahatenna"],
  },
  {
    name: "Monaragala",
    displayName: "Monaragala",
    sinhalaName: "මොනරාගල",
    district: "Monaragala",
    province: "Uva",
    lat: 6.874,
    lng: 81.351,
    groups: {
      3: ["1", "8"],
    },
    townAliases: ["Wellawaya", "Buttala", "Bibile", "Kataragama", "Medagama"],
  },
  {
    name: "Naula",
    displayName: "Naula",
    sinhalaName: "නාවුල",
    district: "Matale",
    province: "Central",
    lat: 7.712,
    lng: 80.653,
    groups: {
      1: ["2", "3", "7"],
      4: ["6"],
    },
    townAliases: ["Dambulla South", "Galewela", "Nalanda", "Bowatenna", "Kongahawela"],
  },
  {
    name: "Nawalapitiya",
    displayName: "Nawalapitiya",
    sinhalaName: "නාවලපිටිය",
    district: "Kandy",
    province: "Central",
    lat: 7.052,
    lng: 80.534,
    groups: {
      1: ["1", "6", "7", "8"],
      4: ["2", "5"],
    },
    townAliases: ["Gampola", "Ulapane", "Kotmale", "Pussellawa", "Helboda"],
  },
  {
    name: "New Galle",
    displayName: "New Galle",
    sinhalaName: "නව ගාල්ල",
    district: "Galle",
    province: "Southern",
    lat: 6.054,
    lng: 80.221,
    groups: {
      1: ["1", "3", "8", "11"],
      4: ["2", "5", "6", "7", "9"],
    },
    townAliases: ["Galle Fort", "Karapitiya", "Unawatuna", "Hikkaduwa", "Koggala", "Baddegama"],
  },
  {
    name: "Nuwara_Eliya",
    displayName: "Nuwara Eliya",
    sinhalaName: "නුවරඑළිය",
    district: "Nuwara Eliya",
    province: "Central",
    lat: 6.974,
    lng: 80.778,
    groups: {
      2: ["1", "3"],
      3: ["2", "8"],
    },
    townAliases: ["Nanu Oya", "Hakgala", "Talawakele", "Lindula", "Ambewela"],
  },
  {
    name: "Pallekele",
    displayName: "Pallekele",
    sinhalaName: "පල්ලෙකැලේ",
    district: "Kandy",
    province: "Central",
    lat: 7.284,
    lng: 80.702,
    groups: {
      1: ["1", "10"],
      4: ["9", "11"],
    },
    townAliases: ["Kundasale", "Digana", "Menikhinna", "Teldeniya", "Victoria", "Balagolla"],
  },
  {
    name: "Panadura",
    displayName: "Panadura",
    sinhalaName: "පානදුර",
    district: "Kalutara",
    province: "Western",
    lat: 6.712,
    lng: 79.911,
    groups: {
      1: ["1", "2", "8", "9"],
      4: ["3", "6", "7"],
    },
    townAliases: ["Wadduwa", "Morontuduwa", "Bekalgama", "Walana", "Gorakana"],
  },
  {
    name: "Pannala",
    displayName: "Pannala",
    sinhalaName: "පන්නල",
    district: "Kurunegala",
    province: "North Western",
    lat: 7.332,
    lng: 80.024,
    groups: {
      2: ["4", "5"],
      3: ["2"],
    },
    townAliases: ["Giriulla", "Kuliyapitiya", "Dankotuwa", "Makandura", "Sandalankawa"],
  },
  {
    name: "Pannipitiya",
    displayName: "Pannipitiya",
    sinhalaName: "පන්නිපිටිය",
    district: "Colombo",
    province: "Western",
    lat: 6.851,
    lng: 79.962,
    groups: {
      2: ["1", "2", "9"],
      3: ["8", "12"],
    },
    townAliases: ["Maharagama", "Kottawa", "Homagama", "Rukmalgama", "Mattegoda"],
  },
  {
    name: "Polonnaruwa",
    displayName: "Polonnaruwa",
    sinhalaName: "පොළොන්නරුව",
    district: "Polonnaruwa",
    province: "North Central",
    lat: 7.941,
    lng: 81.004,
    groups: {
      1: ["1"],
      4: ["4", "8"],
    },
    townAliases: ["Kaduruwela", "Hingurakgoda", "Medirigiriya", "Giritale", "Manampitiya"],
  },
  {
    name: "Puttalam",
    displayName: "Puttalam",
    sinhalaName: "පුත්තලම",
    district: "Puttalam",
    province: "North Western",
    lat: 8.032,
    lng: 79.831,
    groups: {
      2: ["4", "7"],
    },
    townAliases: ["Anamaduwa", "Kalpitiya", "Wanathawilluwa", "Norochcholai", "Palavi"],
  },
  {
    name: "Ragala",
    displayName: "Ragala",
    sinhalaName: "රාගල",
    district: "Nuwara Eliya",
    province: "Central",
    lat: 7.012,
    lng: 80.894,
    groups: {
      1: ["8"],
      4: ["1", "2"],
    },
    townAliases: ["Walapane", "Kandapola", "Halgranoya", "Maturata", "Brookside"],
  },
  {
    name: "Ratmalana",
    displayName: "Ratmalana",
    sinhalaName: "රත්මලාන",
    district: "Colombo",
    province: "Western",
    lat: 6.821,
    lng: 79.873,
    groups: {
      2: ["2", "7", "9"],
      3: ["3", "4", "5"],
    },
    townAliases: ["Moratuwa", "Angulana", "Rawathawatte", "Ratmalana Airport", "Borupana", "Katubedda"],
  },
  {
    name: "Ratnapura",
    displayName: "Ratnapura",
    sinhalaName: "රත්නපුර",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    lat: 6.685,
    lng: 80.404,
    groups: {
      1: ["1", "3", "4", "6", "8"],
      4: ["2", "5", "7"],
    },
    townAliases: ["Kuruwita", "Pelmadulla", "Kahawatta", "Tirwanaketiya", "Hidellana"],
  },
  {
    name: "Sapugaskanda",
    displayName: "Sapugaskanda",
    sinhalaName: "සපුගස්කන්ද",
    district: "Gampaha",
    province: "Western",
    lat: 6.974,
    lng: 79.951,
    groups: {
      2: ["0", "3", "4", "9"],
      3: ["7", "8", "11"],
    },
    townAliases: ["Makola", "Kadawatha", "Heiyanthuduwa", "Kirillawala", "Mawaramandiya"],
  },
  {
    name: "Seethawaka",
    displayName: "Seethawaka",
    sinhalaName: "සීතාවක",
    district: "Colombo",
    province: "Western",
    lat: 6.953,
    lng: 80.222,
    groups: {
      1: ["1", "5"],
      4: ["8"],
    },
    townAliases: ["Avissawella Industrial Zone", "Dehiowita", "Karawanella", "Talduwa"],
  },
  {
    name: "Sri_Jpura",
    displayName: "Sri Jayawardenepura",
    sinhalaName: "ශ්‍රී ජයවර්ධනපුර",
    district: "Colombo",
    province: "Western",
    lat: 6.898,
    lng: 79.914,
    groups: {
      2: ["2", "3", "9"],
      3: ["1", "4", "8"],
    },
    townAliases: ["Kotte", "Battaramulla", "Rajagiriya", "Nawala", "Nugegoda", "Thalawathugoda", "Parliament"],
  },
  {
    name: "SUB A",
    displayName: "Substation A (Colombo Fort)",
    sinhalaName: "කොළඹ කොටුව (Sub A)",
    district: "Colombo",
    province: "Western",
    lat: 6.938,
    lng: 79.845,
    groups: {
      2: ["A-5"],
    },
    townAliases: ["Colombo Fort", "Galle Face", "Pettah", "World Trade Center", "York Street"],
  },
  {
    name: "SUB C",
    displayName: "Substation C (Colombo Central)",
    sinhalaName: "කොළඹ මධ්‍යම (Sub C)",
    district: "Colombo",
    province: "Western",
    lat: 6.924,
    lng: 79.852,
    groups: {
      2: ["C-1", "C-3", "C-4"],
      3: ["C-09", "C-10", "C-15"],
    },
    townAliases: ["Kollupitiya", "Slave Island", "Kompanna Veediya", "Union Place", "Vauxhall Street"],
  },
  {
    name: "SUB I",
    displayName: "Substation I (Colombo South)",
    sinhalaName: "කොළඹ දකුණ (Sub I)",
    district: "Colombo",
    province: "Western",
    lat: 6.904,
    lng: 79.856,
    groups: {
      2: ["I-5", "I-7"],
      3: ["I-8", "I-11", "I-15", "I-17", "I-1", "I-13"],
    },
    townAliases: ["Bambalapitiya", "Havelock City", "Wellawatte", "Kirulapone", "Thimbirigasyaya"],
  },
  {
    name: "Sub M",
    displayName: "Substation M (Colombo East)",
    sinhalaName: "කොළඹ නැගෙනහිර (Sub M)",
    district: "Colombo",
    province: "Western",
    lat: 6.918,
    lng: 79.872,
    groups: {
      3: ["M-2", "M-13"],
    },
    townAliases: ["Borella", "Torrington", "Cinnamon Gardens", "Ward Place", "Castle Street"],
  },
  {
    name: "Sub N",
    displayName: "Substation N (Maradana)",
    sinhalaName: "මරදාන (Sub N)",
    district: "Colombo",
    province: "Western",
    lat: 6.929,
    lng: 79.864,
    groups: {
      3: ["N-8", "N-9", "N-10", "N-18"],
    },
    townAliases: ["Maradana", "Panchikawatte", "Dean's Road", "National Hospital", "Maligawatta"],
  },
  {
    name: "Thulhiriya",
    displayName: "Thulhiriya",
    sinhalaName: "තුල්හිරිය",
    district: "Kegalle",
    province: "Sabaragamuwa",
    lat: 7.221,
    lng: 80.203,
    groups: {
      1: ["5", "6"],
      4: ["2", "3", "4", "8", "9"],
    },
    townAliases: ["Warakapola", "Alawwa", "Ambepussa", "Pasyala", "Mirigama East"],
  },
  {
    name: "Trincomalee",
    displayName: "Trincomalee",
    sinhalaName: "ත්‍රිකුණාමලය",
    district: "Trincomalee",
    province: "Eastern",
    lat: 8.575,
    lng: 81.231,
    groups: {
      2: ["1", "2"],
      3: ["3", "5", "6"],
    },
    townAliases: ["Trincomalee Town", "Nilaveli", "Uppuveli", "Fort Frederick", "Kanniya"],
  },
  {
    name: "Ukuwela",
    displayName: "Ukuwela",
    sinhalaName: "උකුවෙල",
    district: "Matale",
    province: "Central",
    lat: 7.422,
    lng: 80.623,
    groups: {
      1: ["1", "2", "5", "9"],
      4: ["3", "4", "6", "8", "11", "12"],
    },
    townAliases: ["Matale Town", "Aluvihare", "Rattota", "Palapathwela", "Kaudaulle"],
  },
  {
    name: "Valachchenai",
    displayName: "Valachchenai",
    sinhalaName: "වාලච්චේන",
    district: "Batticaloa",
    province: "Eastern",
    lat: 7.924,
    lng: 81.532,
    groups: {
      1: ["2", "4"],
    },
    townAliases: ["Vakarai", "Kalkudah", "Pasikudah", "Oddamavadi", "Kiran"],
  },
  {
    name: "Vavunathivu",
    displayName: "Vavunathivu",
    sinhalaName: "වවුනතිව්",
    district: "Batticaloa",
    province: "Eastern",
    lat: 7.712,
    lng: 81.674,
    groups: {
      2: ["7"],
      3: ["1", "2", "5"],
    },
    townAliases: ["Batticaloa Town", "Kattankudy", "Eravur", "Kokkadichcholai", "Chenkalady"],
  },
  {
    name: "Vavuniya",
    displayName: "Vavuniya",
    sinhalaName: "වවුනියාව",
    district: "Vavuniya",
    province: "Northern",
    lat: 8.753,
    lng: 80.501,
    groups: {
      2: ["1", "3", "6"],
      3: ["2", "4", "5"],
    },
    townAliases: ["Vavuniya Town", "Nedunkeni", "Cheddikulam", "Omanthai", "Poovarasankulam"],
  },
  {
    name: "Veyangoda",
    displayName: "Veyangoda",
    sinhalaName: "වේයන්ගොඩ",
    district: "Gampaha",
    province: "Western",
    lat: 7.152,
    lng: 80.061,
    groups: {
      2: ["6", "10"],
    },
    townAliases: ["Nittambuwa", "Mirigama", "Attanagalla", "Wathupitiwala", "Yakkala"],
  },
  {
    name: "Wewelwatta",
    displayName: "Wewelwatta",
    sinhalaName: "වෑවැල්වත්ත",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    lat: 6.671,
    lng: 80.548,
    groups: {
      1: ["1", "2", "5", "6", "7"],
    },
    townAliases: ["Balangoda Valley", "Rassagala", "Madampe Estate"],
  },
  {
    name: "Wimalasurendra",
    displayName: "Wimalasurendra",
    sinhalaName: "විමලසුරේන්ද්‍ර",
    district: "Nuwara Eliya",
    province: "Central",
    lat: 6.912,
    lng: 80.521,
    groups: {
      1: ["4", "6", "7"],
    },
    townAliases: ["Norton Bridge", "Maskeliya", "Hatton", "Laxapana", "Ginigathhena"],
  },
];

// Build fully hydrated GridSubstation list using unified geographic projection
// aligned with the 93-point Sri Lanka coastline and district boundaries.
export const GRID_SUBSTATIONS: GridSubstation[] = (() => {
  const placed: Array<{ x: number; y: number }> = [];

  return RAW_SUBSTATIONS.map((raw) => {
    let { x, y } = projectCoordinates(raw.lat, raw.lng);

    // Ensure closely spaced urban substations (e.g., Colombo SUB A/C/I/M/N) are clearly separated
    for (let attempt = 0; attempt < 10; attempt++) {
      const collision = placed.find((p) => Math.hypot(p.x - x, p.y - y) < 5.5);
      if (!collision) break;
      const angle = (attempt * Math.PI) / 4;
      x = Math.round((x + Math.cos(angle) * 5.6) * 10) / 10;
      y = Math.round((y + Math.sin(angle) * 5.6) * 10) / 10;
    }
    placed.push({ x, y });

    const groupFeeders: FeederAllocation[] = [];
    ([1, 2, 3, 4] as const).forEach((grp) => {
      const list = raw.groups[grp];
      if (list && list.length > 0) {
        groupFeeders.push({
          group: grp,
          feeders: list,
        });
      }
    });

    return {
      id: raw.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: raw.name,
      displayName: raw.displayName,
      sinhalaName: raw.sinhalaName,
      district: raw.district,
      province: raw.province,
      lat: raw.lat,
      lng: raw.lng,
      svgX: x,
      svgY: y,
      groupFeeders,
      townAliases: raw.townAliases,
    };
  });
})();

// Group color definitions matching the civic dark palette
export const GROUP_COLORS: Record<number, {
  name: string;
  badge: string;
  border: string;
  hex: string;
  bgRgba: string;
  dotColor: string;
  description: string;
}> = {
  1: {
    name: "Group 01",
    badge: "text-amber-300 bg-amber-950/40 border-amber-500/40",
    border: "border-amber-500",
    hex: "#F59E0B",
    bgRgba: "rgba(245, 158, 11, 0.2)",
    dotColor: "bg-amber-400",
    description: "Ambalangoda, Athurugiriya, Balangoda, Matara, Kiribathkumbura & more",
  },
  2: {
    name: "Group 02",
    badge: "text-sky-300 bg-sky-950/40 border-sky-500/40",
    border: "border-sky-500",
    hex: "#0EA5E9",
    bgRgba: "rgba(14, 165, 233, 0.2)",
    dotColor: "bg-sky-400",
    description: "Ampara, Badulla, Dehiwala, Kelaniya, Ratmalana, Sri J'pura & more",
  },
  3: {
    name: "Group 03",
    badge: "text-purple-300 bg-purple-950/40 border-purple-500/40",
    border: "border-purple-500",
    hex: "#A855F7",
    bgRgba: "rgba(168, 85, 247, 0.2)",
    dotColor: "bg-purple-400",
    description: "Chunnakam, Colombo Central, Dehiwala, Mannar, Nuwara Eliya & more",
  },
  4: {
    name: "Group 04",
    badge: "text-rose-300 bg-rose-950/40 border-rose-500/40",
    border: "border-rose-500",
    hex: "#F43F5E",
    bgRgba: "rgba(244, 63, 94, 0.2)",
    dotColor: "bg-rose-400",
    description: "Beliatta, Deniyaya, Hambantota, Kegalle, New Galle, Polonnaruwa & more",
  },
};

export type PowerState = "cut_active" | "cut_approaching" | "normal";

export interface SubstationStatus {
  state: PowerState;
  activeGroup?: number;
  activeSlot?: TimeSlot;
  minutesRemaining?: number;
  nextCutGroup?: number;
  nextCutSlot?: TimeSlot;
  minutesUntilCut?: number;
}

/**
 * Calculates real-time or simulated power status for a specific GSS
 */
export function getSubstationStatus(
  station: GridSubstation,
  dateStr: string,
  currentHourFloat: number
): SubstationStatus {
  const schedule = DAY_SCHEDULES[dateStr] || DAY_SCHEDULES["2026-10-19"];
  const stationGroups = new Set(station.groupFeeders.map((g) => g.group));

  // Check if any slot is currently active
  for (const slot of schedule.slots) {
    if (currentHourFloat >= slot.startHour && currentHourFloat < slot.endHour) {
      if (stationGroups.has(slot.group)) {
        const remainingMinutes = Math.round((slot.endHour - currentHourFloat) * 60);
        return {
          state: "cut_active",
          activeGroup: slot.group,
          activeSlot: slot,
          minutesRemaining: Math.max(1, remainingMinutes),
        };
      }
    }
  }

  // Check if upcoming cut is within 45 minutes
  for (const slot of schedule.slots) {
    if (currentHourFloat < slot.startHour) {
      const minutesUntil = Math.round((slot.startHour - currentHourFloat) * 60);
      if (minutesUntil <= 45 && stationGroups.has(slot.group)) {
        return {
          state: "cut_approaching",
          nextCutGroup: slot.group,
          nextCutSlot: slot,
          minutesUntilCut: minutesUntil,
        };
      }
    }
  }

  // Find next upcoming cut for the station today
  const futureSlot = schedule.slots.find(
    (s) => s.startHour > currentHourFloat && stationGroups.has(s.group)
  );

  return {
    state: "normal",
    nextCutGroup: futureSlot?.group,
    nextCutSlot: futureSlot,
    minutesUntilCut: futureSlot
      ? Math.round((futureSlot.startHour - currentHourFloat) * 60)
      : undefined,
  };
}

/**
 * Formats decimal hours (e.g. 17.5) to human 12-hour string (e.g. "05:30 PM")
 */
export function formatHourFloat(hourFloat: number): string {
  const hours = Math.floor(hourFloat);
  const minutes = Math.round((hourFloat - hours) * 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const padMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const padHr = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  return `${padHr}:${padMin} ${period}`;
}
