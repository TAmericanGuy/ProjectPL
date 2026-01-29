export default function ParkingSpot({
  spot,
  vehicle,
  statusColor,
  onSelect,
  isSelected,
  isFilteredOut,
}) {
  const className = [
    "parking-spot",
    vehicle ? "parking-spot--occupied" : "parking-spot--empty",
    isSelected ? "parking-spot--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      style={{ "--spot-color": statusColor || "#111827" }}
    >
      <span className="parking-spot-number">{spot.number}</span>
      {vehicle ? (
        <span className="parking-spot-status">
          {isFilteredOut ? "Occupied" : vehicle.vinLast8}
        </span>
      ) : (
        <span className="parking-spot-status parking-spot-status--empty">
          Empty
        </span>
      )}
    </button>
  );
}
