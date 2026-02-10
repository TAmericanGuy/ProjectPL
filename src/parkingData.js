export const statusPalette = {
  "New Intake": "#38bdf8",
  "Estimate In Progress": "#facc15",
  "Waiting on Parts": "#fb923c",
  "In Progress": "#4ade80",
  "Supplement Requested": "#a855f7",
  Completed: "#9ca3af",
  "Work Denied": "#f87171",
};

export const serviceTypes = [
  "Body & Mechanical",
  "Bodywork Only",
  "Mechanical Only",
];

export const areas = {
  AREA_A: {
    id: "AREA_A",
    name: "AREA A",
    code: "A",
    rows: 40,
    spotsPerRow: 3,
  },
  AREA_B: {
    id: "AREA_B",
    name: "AREA B",
    code: "B",
    rows: 40,
    spotsPerRow: 3,
  },
  PAVEMENT_P: {
    id: "PAVEMENT_P",
    name: "PAVEMENT AREA",
    code: "P",
    rows: 36,
    spotsPerRow: 2,
  },
  PAVE_PA: {
    id: "PAVE_PA",
    name: "PAVE AREA",
    code: "PA",
    rows: 40,
    spotsPerRow: 6,
  },
  AREA_C: {
    id: "AREA_C",
    name: "AREA C",
    code: "C",
    rows: 2,
    spotsPerRow: 10,
  },
};

export const bays = [
  { id: "BODY", name: "BODY AREA", type: "body", capacity: 8 },
  { id: "PAINT", name: "PAINT AREA", type: "paint", capacity: 8 },
  { id: "MECHANIC", name: "MECHANIC AREA", type: "mechanic", capacity: 8 },
];

export const clients = [
  { id: "CL-100", name: "Miranda Fleet Services" },
  { id: "CL-200", name: "North Ridge Rentals" },
  { id: "CL-300", name: "Violet Logistics" },
  { id: "CL-400", name: "Everline Insurance" },
  { id: "CL-500", name: "Oakside Automotive" },
];

export const vehicles = [
  {
    id: "VH-2041",
    clientId: "CL-100",
    vinFull: "1HGCM82633A123456",
    vinLast8: "A123456",
    entryDate: "2024-04-19",
    serviceType: "Body & Mechanical",
    bodyStatus: "In Progress",
    mechanicalStatus: "Estimate In Progress",
    esdDate: null,
    currentSpotId: "AREA_A-2",
    notes: [
      {
        id: "NOTE-01",
        timestamp: "2024-04-20 09:15",
        user: "Ava Lewis",
        message: "Supplement requested for rear bumper replacement.",
      },
      {
        id: "NOTE-02",
        timestamp: "2024-04-22 14:05",
        user: "Jonas Reed",
        message: "Waiting on parts confirmation from vendor.",
      },
    ],
  },
  {
    id: "VH-2042",
    clientId: "CL-200",
    vinFull: "2C4RC1BG4NR220781",
    vinLast8: "R220781",
    entryDate: "2024-04-18",
    serviceType: "Bodywork Only",
    bodyStatus: "Waiting on Parts",
    mechanicalStatus: "Completed",
    esdDate: null,
    currentSpotId: "AREA_B-5",
    notes: [
      {
        id: "NOTE-03",
        timestamp: "2024-04-19 11:45",
        user: "Mara Kim",
        message: "Ordered door panel; ETA 04/26.",
      },
    ],
  },
  {
    id: "VH-2043",
    clientId: "CL-300",
    vinFull: "1FTFW1E56MFA09231",
    vinLast8: "FA09231",
    entryDate: "2024-04-21",
    serviceType: "Mechanical Only",
    bodyStatus: "Completed",
    mechanicalStatus: "In Progress",
    esdDate: null,
    currentSpotId: "PAVEMENT_P-7",
    notes: [
      {
        id: "NOTE-04",
        timestamp: "2024-04-22 08:10",
        user: "Drew Patel",
        message: "Diagnostics complete. Replacing alternator.",
      },
    ],
  },
  {
    id: "VH-2044",
    clientId: "CL-400",
    vinFull: "3N1AB7AP8HY231909",
    vinLast8: "Y231909",
    entryDate: "2024-04-15",
    serviceType: "Body & Mechanical",
    bodyStatus: "Completed",
    mechanicalStatus: "Completed",
    esdDate: null,
    currentSpotId: "PAVE_PA-12",
    notes: [
      {
        id: "NOTE-05",
        timestamp: "2024-04-18 16:55",
        user: "Ava Lewis",
        message: "Final QC completed. Ready for pickup.",
      },
    ],
  },
  {
    id: "VH-2045",
    clientId: "CL-500",
    vinFull: "5N1AZ2MH9FN022334",
    vinLast8: "N022334",
    entryDate: "2024-04-23",
    serviceType: "Bodywork Only",
    bodyStatus: "New Intake",
    mechanicalStatus: "New Intake",
    esdDate: "2024-04-28",
    currentSpotId: null,
    notes: [
      {
        id: "NOTE-06",
        timestamp: "2024-04-23 13:20",
        user: "Logan Hart",
        message: "Scheduled tow from client lot.",
      },
    ],
  },
  {
    id: "VH-2046",
    clientId: "CL-100",
    vinFull: "JHMZF1C65BS039991",
    vinLast8: "S039991",
    entryDate: "2024-04-17",
    serviceType: "Mechanical Only",
    bodyStatus: "Work Denied",
    mechanicalStatus: "Supplement Requested",
    esdDate: null,
    currentSpotId: "AREA_C-8",
    notes: [
      {
        id: "NOTE-07",
        timestamp: "2024-04-17 10:05",
        user: "Mara Kim",
        message: "Customer declined body repair. Mechanical approval pending.",
      },
    ],
  },
  {
    id: "VH-2047",
    clientId: "CL-200",
    vinFull: "2T3WFREV6GW439812",
    vinLast8: "W439812",
    entryDate: "2024-04-20",
    serviceType: "Bodywork Only",
    bodyStatus: "In Progress",
    mechanicalStatus: "New Intake",
    esdDate: null,
    currentSpotId: "BAY-BODY-2",
    notes: [
      {
        id: "NOTE-08",
        timestamp: "2024-04-21 13:30",
        user: "Jonas Reed",
        message: "Body bay assigned for dent repair.",
      },
    ],
  },
  {
    id: "VH-2048",
    clientId: "CL-300",
    vinFull: "5TDDZRFH7FS124905",
    vinLast8: "S124905",
    entryDate: "2024-04-22",
    serviceType: "Bodywork Only",
    bodyStatus: "Estimate In Progress",
    mechanicalStatus: "New Intake",
    esdDate: null,
    currentSpotId: "BAY-PAINT-5",
    notes: [
      {
        id: "NOTE-09",
        timestamp: "2024-04-22 15:12",
        user: "Ava Lewis",
        message: "Paint bay prep started.",
      },
    ],
  },
  {
    id: "VH-2049",
    clientId: "CL-400",
    vinFull: "1C4RJFBG9FC678210",
    vinLast8: "C678210",
    entryDate: "2024-04-24",
    serviceType: "Mechanical Only",
    bodyStatus: "New Intake",
    mechanicalStatus: "In Progress",
    esdDate: null,
    currentSpotId: "BAY-MECHANIC-3",
    notes: [
      {
        id: "NOTE-10",
        timestamp: "2024-04-24 09:40",
        user: "Drew Patel",
        message: "Diagnostics underway in mechanic bay.",
      },
    ],
  },
];

export const activityLogs = [
  {
    id: "ACT-3001",
    timestamp: "2024-04-23 17:32",
    user: "Ava Lewis",
    action: "Updated body status to In Progress",
    entity: "VH-2041",
  },
  {
    id: "ACT-3002",
    timestamp: "2024-04-23 16:10",
    user: "Drew Patel",
    action: "Moved vehicle to PAVEMENT AREA spot 7",
    entity: "VH-2043",
  },
  {
    id: "ACT-3003",
    timestamp: "2024-04-23 15:20",
    user: "Mara Kim",
    action: "Logged note for VH-2042",
    entity: "VH-2042",
  },
  {
    id: "ACT-3004",
    timestamp: "2024-04-22 18:05",
    user: "Logan Hart",
    action: "Created ESD schedule for VH-2045",
    entity: "VH-2045",
  },
];

export const spotAssignments = {
  "AREA_A-2": "VH-2041",
  "AREA_B-5": "VH-2042",
  "PAVEMENT_P-7": "VH-2043",
  "PAVE_PA-12": "VH-2044",
  "AREA_C-8": "VH-2046",
  "BAY-BODY-2": "VH-2047",
  "BAY-PAINT-5": "VH-2048",
  "BAY-MECHANIC-3": "VH-2049",
};

export const getAreaTotalSpots = (area) => area.rows * area.spotsPerRow;

export const TOTAL_SPOTS = Object.values(areas).reduce(
  (sum, area) => sum + getAreaTotalSpots(area),
  0
);
