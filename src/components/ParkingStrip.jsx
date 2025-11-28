// src/components/ParkingStrip.jsx
import { useMemo } from "react";
import ParkingSpot from "./ParkingSpot";
import { getAreaTotalSpots } from "../parkingData";

export default function ParkingStrip({
  area,
  occupied,
  onToggleSpot,
  availability,
}) {
  const totalSpots = getAreaTotalSpots(area);

  const stats = availability?.[area.id];
  const headerRight = stats
    ? `${stats.total} spots / ${stats.free} available`
    : `${totalSpots} spots`;

  const rows = useMemo(() => {
    const result = [];

    for (let rowIndex = 0; rowIndex < area.rows; rowIndex++) {
      const rowSpots = [];

      for (let col = 0; col < area.spotsPerRow; col++) {
        const number = rowIndex * area.spotsPerRow + col + 1;
        if (number > totalSpots) break;

        rowSpots.push({
          id: `${area.id}-${number}`,
          number,
        });
      }

      result.push(rowSpots);
    }

    return result;
  }, [area.id, area.rows, area.spotsPerRow, totalSpots]);

  return (
    <section className="parking-strip">
      <div className="parking-strip-list">
        {rows.map((row, idx) => (
          <div
            key={`${area.id}-row-${idx}`}
            className="parking-row"
            style={{ "--spots-per-row": area.spotsPerRow }}
          >
            {row.map((spot) => {
              const spotId = `${area.id}-${spot.number}`;
              const isOccupied = !!occupied?.[spotId];

              return (
                <ParkingSpot
                  key={spot.id}
                  spot={spot}
                  occupied={isOccupied}
                  onToggle={
                    onToggleSpot
                      ? () => onToggleSpot(area.id, spot.number)
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      <header
        className="parking-strip-header"
        style={{ backgroundColor: area.color }}
      >
        <h2>{area.name}</h2>
        <span>{headerRight}</span>
      </header>
    </section>
  );
}
