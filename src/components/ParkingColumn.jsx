// src/components/YardMap.jsx
import { areas, bays } from "../parkingData";
import ParkingColumn from "./ParkingColumn";
import BaysStack from "./BaysStack";
import ParkingStrip from "./ParkingStrip";

export default function YardMap({ occupied, onToggleSpot, availabilityByArea }) {
  return (
    <div className="yard-wrapper">
      {/* LINHA PRINCIPAL (topo do pátio) */}
      <div className="yard-top-row">
        {/* BLOCO ESQUERDO: A + rua + B */}
        <div className="yard-left-group">
          <ParkingColumn
            area={areas.AREA_A}
            occupied={occupied}
            onToggleSpot={onToggleSpot}
            availability={availabilityByArea}
          />

          <div className="yard-road-vertical" />

          <ParkingColumn
            area={areas.AREA_B}
            occupied={occupied}
            onToggleSpot={onToggleSpot}
            availability={availabilityByArea}
          />
        </div>

        {/* BLOCO MEIO: Pavement P + rua + Bays */}
        <div className="yard-middle-group">
          <ParkingColumn
            area={areas.PAVEMENT_P}
            occupied={occupied}
            onToggleSpot={onToggleSpot}
            availability={availabilityByArea}
          />

          <div className="yard-road-vertical" />

          <BaysStack bays={bays} />
        </div>

        {/* BLOCO DIREITO: PA + Detail */}
        <div className="yard-right-group">
          <ParkingColumn
            area={areas.PAVE_PA}
            occupied={occupied}
            onToggleSpot={onToggleSpot}
            availability={availabilityByArea}
          />

          <div className="detail-card">
            <span>DETAIL AREA</span>
          </div>
        </div>
      </div>

      {/* RUA HORIZONTAL ENTRE TOPO E ÁREA C */}
      <div className="yard-road-horizontal" />

      {/* LINHA DE BAIXO: ÁREA C ALINHADA COM BLOCO ESQUERDO */}
      <div className="yard-bottom-row">
        <div className="yard-left-group area-c-strip">
          <ParkingStrip
            area={areas.AREA_C}
            occupied={occupied}
            onToggleSpot={onToggleSpot}
            availability={availabilityByArea}
          />
        </div>
      </div>
    </div>
  );
}
