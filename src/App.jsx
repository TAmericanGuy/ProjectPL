// src/App.jsx
import { useMemo, useState } from "react";
import "./styles.css";
import YardMap from "./components/YardMap";
import { areas, getAreaTotalSpots } from "./parkingData";

export default function App() {
  // mapa de spots ocupados: { "AREA_A-1": true, "AREA_B-23": true, ... }
  const [occupied, setOccupied] = useState({});

  const toggleSpot = (areaId, spotNumber) => {
    const id = `${areaId}-${spotNumber}`;
    setOccupied((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // estatísticas por área: total, ocupados, livres
  const availabilityByArea = useMemo(() => {
    const result = {};

    Object.values(areas).forEach((area) => {
      const total = getAreaTotalSpots(area);
      let used = 0;

      for (let i = 1; i <= total; i++) {
        const key = `${area.id}-${i}`;
        if (occupied[key]) used += 1;
      }

      result[area.id] = {
        total,
        occupied: used,
        free: total - used,
      };
    });

    return result;
  }, [occupied]);

  const totalSpots = useMemo(
    () =>
      Object.values(areas).reduce(
        (sum, area) => sum + getAreaTotalSpots(area),
        0
      ),
    []
  );

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>YARD PARKING MAP</h1>
        <span>{totalSpots} spots total</span>
      </header>

      <main className="app-main">
        <YardMap
          occupied={occupied}
          onToggleSpot={toggleSpot}
          availabilityByArea={availabilityByArea}
        />
      </main>
    </div>
  );
}
