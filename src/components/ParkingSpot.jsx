// src/components/ParkingSpot.jsx
export default function ParkingSpot({ spot, occupied, onToggle }) {
  const className = `parking-spot${
    occupied ? " parking-spot--occupied" : ""
  }`;

  return (
    <div className={className} onClick={onToggle}>
      {spot.number}
    </div>
  );
}
