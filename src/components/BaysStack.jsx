export default function BaysStack({
  bays,
  assignments,
  vehiclesById,
  onSelectSpot,
  selectedSpotId,
  getStatusColor,
  filteredVehicleIds,
}) {
  return (
    <div className="bays-stack">
      {bays.map((bay) => {
        const spots = Array.from({ length: bay.capacity }, (_, index) => {
          const number = index + 1;
          const spotId = `BAY-${bay.id}-${number}`;
          const vehicleId = assignments[spotId];
          const vehicle = vehicleId ? vehiclesById[vehicleId] : null;
          const isFilteredOut =
            vehicle && filteredVehicleIds
              ? !filteredVehicleIds.has(vehicle.id)
              : false;

          return {
            number,
            spotId,
            vehicle,
            isFilteredOut,
          };
        });

        return (
          <div key={bay.id} className="bay-card-wrapper">
            <div className={`bay-card bay-card--${bay.type}`}>
              <span>{bay.name}</span>
            </div>
            <div className="bay-spots">
              {spots.map((spot) => (
                <button
                  key={spot.spotId}
                  type="button"
                className={`bay-spot${
                    spot.vehicle ? " bay-spot--occupied" : ""
                  }${spot.spotId === selectedSpotId ? " bay-spot--selected" : ""}`}
                  style={{
                    "--spot-color":
                      spot.vehicle && !spot.isFilteredOut
                        ? getStatusColor(spot.vehicle)
                        : "#111827",
                  }}
                  onClick={() => onSelectSpot(spot.spotId)}
                >
                  <span>{spot.number}</span>
                  <span>
                    {spot.vehicle
                      ? spot.isFilteredOut
                        ? "Occupied"
                        : spot.vehicle.vinLast8
                      : "Empty"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
