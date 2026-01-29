export default function BaysStack({
  bays,
  assignments,
  vehiclesById,
  onOpenBay,
}) {
  return (
    <div className="bays-stack">
      {bays.map((bay) => {
        const vehicles = Array.from({ length: bay.capacity }, (_, index) => {
          const number = index + 1;
          const spotId = `BAY-${bay.id}-${number}`;
          const vehicleId = assignments[spotId];
          return vehicleId ? vehiclesById[vehicleId] : null;
        }).filter(Boolean);

        return (
          <button
            key={bay.id}
            type="button"
            className={`bay-card bay-card--${bay.type}`}
            onClick={() => onOpenBay(bay.id)}
          >
            <div className="bay-card-title">{bay.name}</div>
            <div className="bay-card-meta">
              <span>{vehicles.length} vehicles</span>
              <span>{bay.capacity} capacity</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
