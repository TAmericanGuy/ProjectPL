export default function BaysStack({ bays }) {
  return (
    <div className="bays-stack">
      {bays.map((bay) => (
        <div
          key={bay.id}
          className={`bay-card bay-card--${bay.type}`}
        >
          <span>{bay.name}</span>
        </div>
      ))}
    </div>
  );
}
