export const areas = {
  AREA_A: {
    id: "AREA_A",
    name: "AREA A",
    color: "#facc15",
    rows: 36,
    spotsPerRow: 3,
  },
  AREA_B: {
    id: "AREA_B",
    name: "AREA B",
    color: "#fb923c",
    rows: 36,
    spotsPerRow: 3,
  },
  PAVEMENT_P: {
    id: "P",
    name: "PAVEMENT AREA (P)",
    color: "#38bdf8",
    rows: 36,
    spotsPerRow: 2, // <-- só 2 carros por fileira
  },
  PAVE_PA: {
    id: "PA",
    name: "PAVE AREA (PA)",
    color: "#facc15",
    rows: 30,
    spotsPerRow: 5,
  },
  AREA_C: {
    id: "AREA_C",
    name: "AREA C",     
    color: "#e879f9",
    rows: 2,
    spotsPerRow: 10,     
  },
};

// Bays (sem vagas por enquanto)
export const bays = [
  { id: "BODY", name: "BODY AREA", type: "body" },
  { id: "PAINT", name: "PAINT AREA", type: "paint" },
  { id: "MECHANIC", name: "MECHANIC AREA", type: "mechanic" },
];

export const getAreaTotalSpots = (area) =>
  area.rows * area.spotsPerRow;

export const TOTAL_SPOTS = Object.values(areas).reduce(
  (sum, area) => sum + getAreaTotalSpots(area),
  0
);
