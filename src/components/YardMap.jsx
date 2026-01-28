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
}) {
  return (
    <div className="yard-wrapper">
      <header className="yard-header">
        <div>
          <h2>Parking Layout</h2>
          <p>Drag & drop support coming soon. Click a spot to inspect details.</p>
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
        <div className="yard-left-group">
          <ParkingColumn
            area={areas.AREA_A}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />

          <div className="yard-road-vertical" />

          <ParkingColumn
            area={areas.AREA_B}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />
        </div>

        <div className="yard-middle-group">
          <ParkingColumn
            area={areas.PAVEMENT_P}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />

          <div className="yard-road-vertical" />

          <BaysStack bays={bays} />
        </div>

        <div className="yard-right-group">
          <ParkingColumn
            area={areas.PAVE_PA}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />

          <div className="detail-card">DETAIL BAY</div>
        </div>
      </div>

      <div className="yard-road-horizontal" />

      <div className="yard-bottom-row">
        <div className="yard-left-group area-c-strip">
          <ParkingStrip
            area={areas.AREA_C}
            assignments={assignments}
            vehiclesById={vehiclesById}
            availability={availabilityByArea}
            onSelectSpot={onSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />
        </div>
      </div>
    </div>
  );
}
