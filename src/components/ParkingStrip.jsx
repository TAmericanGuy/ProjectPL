import ParkingSpot from "./ParkingSpot";

export default function ParkingStrip({
  area,
  assignments,
  vehiclesById,
  availability,
  onSelectSpot,
  selectedSpotId,
  getStatusColor,
}) {
  const total = area.rows * area.spotsPerRow;
  const { occupied, free } = availability[area.id] ?? {
    occupied: 0,
    free: total,
  };

  const rows = Array.from({ length: area.rows }, (_, rowIndex) => {
    const spots = Array.from({ length: area.spotsPerRow }, (_, spotIndex) => {
      const number = rowIndex * area.spotsPerRow + spotIndex + 1;
      const spotId = `${area.id}-${number}`;
      const vehicleId = assignments[spotId];
      const vehicle = vehicleId ? vehiclesById[vehicleId] : null;

      return {
        number,
        spotId,
        vehicle,
      };
    });

    return spots;
  });

  return (
    <section className="parking-strip">
      <header className="parking-strip-header">
        <div>
          <h2>{area.name}</h2>
          <span className="parking-column-code">Code {area.code}</span>
        </div>
        <div className="parking-column-stats">
          <span>{occupied} occupied</span>
          <span>{free} open</span>
        </div>
      </header>
      <div className="parking-strip-list">
        {rows.map((row, index) => (
          <div
            className="parking-row"
            key={`${area.id}-row-${index}`}
            style={{ "--spots-per-row": area.spotsPerRow }}
          >
            {row.map((spot) => (
              <ParkingSpot
                key={spot.spotId}
                spot={spot}
                vehicle={spot.vehicle}
                statusColor={spot.vehicle ? getStatusColor(spot.vehicle) : null}
                onSelect={() => onSelectSpot(spot.spotId)}
                isSelected={selectedSpotId === spot.spotId}
              />
            ))}
          </div>
        ))}
      </div>
      <footer className="parking-column-footer">
        <span>{total} total spots</span>
      </footer>
    </section>
  );
}
