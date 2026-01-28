import { useMemo, useState } from "react";
import "./styles.css";
import YardMap from "./components/YardMap";
import {
  activityLogs,
  areas,
  clients,
  serviceTypes,
  spotAssignments,
  statusPalette,
  TOTAL_SPOTS,
  vehicles,
} from "./parkingData";

const statusOptions = ["All", ...Object.keys(statusPalette)];

export default function App() {
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    area: "All",
    client: "All",
    serviceType: "All",
    scheduledOnly: false,
  });

  const vehiclesById = useMemo(
    () =>
      vehicles.reduce((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {}),
    []
  );

  const availabilityByArea = useMemo(() => {
    const result = {};

    Object.values(areas).forEach((area) => {
      const total = area.rows * area.spotsPerRow;
      const occupied = Object.keys(spotAssignments).filter((spotId) =>
        spotId.startsWith(`${area.id}-`)
      ).length;

      result[area.id] = {
        total,
        occupied,
        free: total - occupied,
      };
    });

    return result;
  }, []);

  const totalOccupied = useMemo(
    () => Object.keys(spotAssignments).length,
    []
  );

  const getClientName = (clientId) =>
    clients.find((client) => client.id === clientId)?.name ?? "Unknown";

  const getPrimaryStatus = (vehicle) => {
    if (!vehicle) return "Available";
    if (vehicle.bodyStatus !== "Completed") {
      return vehicle.bodyStatus;
    }
    if (vehicle.mechanicalStatus !== "Completed") {
      return vehicle.mechanicalStatus;
    }
    return "Completed";
  };

  const getStatusColor = (vehicle) =>
    statusPalette[getPrimaryStatus(vehicle)] ?? "#1f2937";

  const selectedVehicle = selectedSpotId
    ? vehiclesById[spotAssignments[selectedSpotId]]
    : null;

  const areaOptions = [
    "All",
    ...Object.values(areas).map((area) => area.name),
    "Scheduled",
  ];

  const clientOptions = ["All", ...clients.map((client) => client.name)];
  const serviceOptions = ["All", ...serviceTypes];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchTerm = filters.search.trim().toLowerCase();
      const statusMatches =
        filters.status === "All" ||
        vehicle.bodyStatus === filters.status ||
        vehicle.mechanicalStatus === filters.status;
      const clientMatches =
        filters.client === "All" ||
        getClientName(vehicle.clientId) === filters.client;
      const serviceMatches =
        filters.serviceType === "All" ||
        vehicle.serviceType === filters.serviceType;
      const areaName = vehicle.currentSpotId
        ? areas[vehicle.currentSpotId.split("-")[0]]?.name
        : "Scheduled";
      const areaMatches =
        filters.area === "All" || areaName === filters.area;

      const searchMatches =
        !searchTerm ||
        vehicle.vinFull.toLowerCase().includes(searchTerm) ||
        vehicle.vinLast8.toLowerCase().includes(searchTerm) ||
        vehicle.id.toLowerCase().includes(searchTerm);

      const scheduleMatches =
        !filters.scheduledOnly ||
        (vehicle.esdDate && !vehicle.currentSpotId);

      return (
        statusMatches &&
        clientMatches &&
        serviceMatches &&
        areaMatches &&
        searchMatches &&
        scheduleMatches
      );
    });
  }, [filters]);

  const scheduledVehicles = vehicles.filter(
    (vehicle) => vehicle.esdDate && !vehicle.currentSpotId
  );

  const statusSummary = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      const status = getPrimaryStatus(vehicle);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">AutoBody Operations</p>
          <h1>Vehicle Parking Management</h1>
        </div>
        <div className="app-header-actions">
          <div className="app-user">
            <span className="app-user-role">Admin</span>
            <strong>Alex Rivera</strong>
          </div>
          <button className="primary-btn" type="button">
            + New Vehicle Intake
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="app-map">
          <YardMap
            assignments={spotAssignments}
            vehiclesById={vehiclesById}
            availabilityByArea={availabilityByArea}
            onSelectSpot={setSelectedSpotId}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
          />
        </section>

        <aside className="app-side">
          <section className="panel dashboard">
            <div className="panel-header">
              <h2>Dashboard Overview</h2>
              <span>Live snapshot</span>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Spots</p>
                <strong>{TOTAL_SPOTS}</strong>
              </div>
              <div className="stat-card">
                <p>Occupied</p>
                <strong>{totalOccupied}</strong>
              </div>
              <div className="stat-card">
                <p>Vehicles On Site</p>
                <strong>{vehicles.length - scheduledVehicles.length}</strong>
              </div>
              <div className="stat-card">
                <p>ESD Scheduled</p>
                <strong>{scheduledVehicles.length}</strong>
              </div>
            </div>
            <div className="status-summary">
              {Object.entries(statusSummary).map(([status, count]) => (
                <div className="status-summary-row" key={status}>
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel filters">
            <div className="panel-header">
              <h2>Filters</h2>
              <span>VIN, client, status</span>
            </div>
            <div className="form-grid">
              <label>
                Search VIN / ID
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search by VIN or ID"
                />
              </label>
              <label>
                Status
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Area
                <select
                  value={filters.area}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      area: event.target.value,
                    }))
                  }
                >
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Client
                <select
                  value={filters.client}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      client: event.target.value,
                    }))
                  }
                >
                  {clientOptions.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Service Type
                <select
                  value={filters.serviceType}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      serviceType: event.target.value,
                    }))
                  }
                >
                  {serviceOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.scheduledOnly}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    scheduledOnly: event.target.checked,
                  }))
                }
              />
              Show ESD scheduled only
            </label>
          </section>

          <section className="panel selected-vehicle">
            <div className="panel-header">
              <h2>Selected Vehicle</h2>
              <span>{selectedSpotId ?? "No spot selected"}</span>
            </div>
            {selectedVehicle ? (
              <div className="selected-vehicle-body">
                <div className="vehicle-highlight">
                  <div>
                    <p className="vehicle-id">{selectedVehicle.id}</p>
                    <p className="vehicle-client">
                      {getClientName(selectedVehicle.clientId)}
                    </p>
                  </div>
                  <span
                    className="status-chip"
                    style={{
                      background: getStatusColor(selectedVehicle),
                    }}
                  >
                    {getPrimaryStatus(selectedVehicle)}
                  </span>
                </div>
                <div className="vehicle-meta">
                  <div>
                    <span>VIN</span>
                    <strong>{selectedVehicle.vinFull}</strong>
                  </div>
                  <div>
                    <span>Entry</span>
                    <strong>{selectedVehicle.entryDate}</strong>
                  </div>
                  <div>
                    <span>Service</span>
                    <strong>{selectedVehicle.serviceType}</strong>
                  </div>
                  <div>
                    <span>Body Status</span>
                    <strong>{selectedVehicle.bodyStatus}</strong>
                  </div>
                  <div>
                    <span>Mechanical Status</span>
                    <strong>{selectedVehicle.mechanicalStatus}</strong>
                  </div>
                </div>
                <div className="notes">
                  <h3>Logbook</h3>
                  {selectedVehicle.notes.map((note) => (
                    <div className="note" key={note.id}>
                      <span>{note.timestamp}</span>
                      <strong>{note.user}</strong>
                      <p>{note.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-state">
                Select a parking spot to review vehicle details and logbook
                entries.
              </p>
            )}
          </section>

          <section className="panel schedule">
            <div className="panel-header">
              <h2>ESD Schedule</h2>
              <span>Upcoming arrivals</span>
            </div>
            <div className="schedule-list">
              {scheduledVehicles.map((vehicle) => (
                <div className="schedule-card" key={vehicle.id}>
                  <div>
                    <strong>{vehicle.id}</strong>
                    <p>{getClientName(vehicle.clientId)}</p>
                  </div>
                  <div>
                    <span>ESD</span>
                    <strong>{vehicle.esdDate}</strong>
                  </div>
                </div>
              ))}
              {scheduledVehicles.length === 0 && (
                <p className="empty-state">No vehicles scheduled.</p>
              )}
            </div>
          </section>

          <section className="panel activity">
            <div className="panel-header">
              <h2>Activity Log</h2>
              <span>Audit trail</span>
            </div>
            <div className="activity-list">
              {activityLogs.map((log) => (
                <div className="activity-item" key={log.id}>
                  <div>
                    <strong>{log.action}</strong>
                    <p>{log.entity}</p>
                  </div>
                  <div className="activity-meta">
                    <span>{log.user}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <section className="panel table-panel">
        <div className="panel-header">
          <h2>Vehicle Register</h2>
          <span>{filteredVehicles.length} records</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>VIN</th>
                <th>Area</th>
                <th>Service Type</th>
                <th>Body Status</th>
                <th>Mechanical Status</th>
                <th>Entry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => {
                const areaName = vehicle.currentSpotId
                  ? areas[vehicle.currentSpotId.split("-")[0]]?.name
                  : "Scheduled";
                return (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td>{getClientName(vehicle.clientId)}</td>
                    <td>
                      {vehicle.vinLast8}
                      <span className="muted">{vehicle.vinFull}</span>
                    </td>
                    <td>{areaName}</td>
                    <td>{vehicle.serviceType}</td>
                    <td>{vehicle.bodyStatus}</td>
                    <td>{vehicle.mechanicalStatus}</td>
                    <td>{vehicle.entryDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
