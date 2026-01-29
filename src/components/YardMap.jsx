import { areas, bays, statusPalette } from "../parkingData";
import ParkingColumn from "./ParkingColumn";
import BaysStack from "./BaysStack";
import ParkingStrip from "./ParkingStrip";

export default function YardMap({
  assignments,
  vehiclesById,
  availabilityByArea,
  onSelectSpot,
  selectedSpotId,
  getStatusColor,
  filteredVehicleIds,
  onOpenBay,
  totalOccupied,
  totalSpots,
}) {
  return (
    <div className="yard-wrapper">
      <header className="yard-header">
        <div>
          <h2>Yard Parking Map</h2>
          <p>
            {totalSpots} spots total / {totalSpots - totalOccupied} free /{" "}
            {totalOccupied} occupied
          </p>
        </div>
        <div className="status-legend">
          {Object.entries(statusPalette).map(([status, color]) => (
            <span key={status} className="status-pill">
              <span className="status-dot" style={{ background: color }} />
              {status}
            </span>
          ))}
        </div>
      </header>

      <div className="yard-top-row">
        <ParkingColumn
          area={areas.AREA_A}
          assignments={assignments}
          vehiclesById={vehiclesById}
          availability={availabilityByArea}
          onSelectSpot={onSelectSpot}
          selectedSpotId={selectedSpotId}
          getStatusColor={getStatusColor}
          filteredVehicleIds={filteredVehicleIds}
        />

        <ParkingColumn
          area={areas.AREA_B}
          assignments={assignments}
          vehiclesById={vehiclesById}
          availability={availabilityByArea}
          onSelectSpot={onSelectSpot}
          selectedSpotId={selectedSpotId}
          getStatusColor={getStatusColor}
          filteredVehicleIds={filteredVehicleIds}
        />

        <ParkingColumn
          area={areas.PAVEMENT_P}
          assignments={assignments}
          vehiclesById={vehiclesById}
          availability={availabilityByArea}
          onSelectSpot={onSelectSpot}
          selectedSpotId={selectedSpotId}
          getStatusColor={getStatusColor}
          filteredVehicleIds={filteredVehicleIds}
        />

        <div className="yard-bays-column">
          <BaysStack
            bays={bays}
            assignments={assignments}
            vehiclesById={vehiclesById}
            onOpenBay={onOpenBay}
          />
        </div>

        <div className="yard-right-stack">
          <ParkingColumn
            area={areas.PAVE_PA}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
            filteredVehicleIds={filteredVehicleIds}
          />
        </div>
      </div>

      <div className="yard-bottom-row">
        <div className="yard-bottom-left">
          <ParkingStrip
            area={areas.AREA_C}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
            filteredVehicleIds={filteredVehicleIds}
          />
        </div>
      </div>
    </div>
  );
}
