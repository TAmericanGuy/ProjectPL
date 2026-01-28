import { useMemo, useState } from "react";
import "./styles.css";
import YardMap from "./components/YardMap";
import {
  activityLogs,
  areas,
  clients,
  serviceTypes,
  spotAssignments as initialAssignments,
  statusPalette,
  TOTAL_SPOTS,
  vehicles as initialVehicles,
} from "./parkingData";

const statusOptions = ["All", ...Object.keys(statusPalette)];
const bodyStatusOptions = Object.keys(statusPalette);
const mechanicalStatusOptions = Object.keys(statusPalette);

const mockUsers = [
  {
    id: "USR-001",
    name: "Alex Rivera",
    email: "admin@example.com",
    password: "admin123",
    role: "Admin",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({
    email: "admin@example.com",
    password: "admin123",
    error: "",
  });

  const [vehicles, setVehicles] = useState(initialVehicles);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    area: "All",
    client: "All",
    serviceType: "All",
    scheduledOnly: false,
  });
  const [intakeForm, setIntakeForm] = useState({
    clientId: clients[0]?.id ?? "",
    vinFull: "",
    serviceType: serviceTypes[0],
    bodyStatus: bodyStatusOptions[0],
    mechanicalStatus: mechanicalStatusOptions[0],
    esdDate: "",
    spotId: "",
    notes: "",
  });

  const vehiclesById = useMemo(
    () =>
      vehicles.reduce((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {}),
    [vehicles]
  );

  const availabilityByArea = useMemo(() => {
    const result = {};

    Object.values(areas).forEach((area) => {
      const total = area.rows * area.spotsPerRow;
      const occupied = Object.keys(assignments).filter((spotId) =>
        spotId.startsWith(`${area.id}-`)
      ).length;

      result[area.id] = {
        total,
        occupied,
        free: total - occupied,
      };
    });

    return result;
  }, [assignments]);

  const totalOccupied = Object.keys(assignments).length;

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

  const handleSelectSpot = (spotId) => {
    setSelectedSpotId(spotId);
    const vehicleId = assignments[spotId];
    if (vehicleId) {
      setSelectedVehicle(vehiclesById[vehicleId]);
      setActiveModal("vehicle");
    }
  };

  const handleOpenVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveModal("vehicle");
  };

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
      const areaMatches = filters.area === "All" || areaName === filters.area;

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
  }, [filters, vehicles]);

  const scheduledVehicles = vehicles.filter(
    (vehicle) => vehicle.esdDate && !vehicle.currentSpotId
  );

  const statusSummary = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      const status = getPrimaryStatus(vehicle);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [vehicles]);

  const availableSpotOptions = Object.values(areas).flatMap((area) => {
    return Array.from({ length: area.rows * area.spotsPerRow }, (_, index) => {
      const number = index + 1;
      const spotId = `${area.id}-${number}`;
      return {
        id: spotId,
        label: `${area.name} - ${number}`,
        available: !assignments[spotId],
      };
    });
  });

  const handleLogin = (event) => {
    event.preventDefault();
    const user = mockUsers.find(
      (item) =>
        item.email === loginForm.email && item.password === loginForm.password
    );

    if (!user) {
      setLoginForm((prev) => ({
        ...prev,
        error: "Invalid credentials. Please try again.",
      }));
      return;
    }

    setCurrentUser(user);
    setLoginForm((prev) => ({ ...prev, error: "" }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSubmitIntake = (event) => {
    event.preventDefault();
    const vinFull = intakeForm.vinFull.trim();
    if (!vinFull) return;

    const vinLast8 = vinFull.slice(-8).toUpperCase();
    const newVehicle = {
      id: `VH-${Date.now().toString().slice(-4)}`,
      clientId: intakeForm.clientId,
      vinFull,
      vinLast8,
      entryDate: new Date().toISOString().slice(0, 10),
      serviceType: intakeForm.serviceType,
      bodyStatus: intakeForm.bodyStatus,
      mechanicalStatus: intakeForm.mechanicalStatus,
      esdDate: intakeForm.esdDate || null,
      currentSpotId: intakeForm.spotId || null,
      notes: intakeForm.notes
        ? [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: currentUser?.name ?? "System",
              message: intakeForm.notes,
            },
          ]
        : [],
    };

    setVehicles((prev) => [newVehicle, ...prev]);

    if (intakeForm.spotId) {
      setAssignments((prev) => ({
        ...prev,
        [intakeForm.spotId]: newVehicle.id,
      }));
    }

    setActiveModal(null);
    setIntakeForm({
      clientId: clients[0]?.id ?? "",
      vinFull: "",
      serviceType: serviceTypes[0],
      bodyStatus: bodyStatusOptions[0],
      mechanicalStatus: mechanicalStatusOptions[0],
      esdDate: "",
      spotId: "",
      notes: "",
    });
  };

  if (!currentUser) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Yard Parking Map</h1>
          <p>Sign in to manage the parking layout and vehicle intake.</p>
          <form onSubmit={handleLogin} className="auth-form">
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                    error: "",
                  }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                    error: "",
                  }))
                }
                required
              />
            </label>
            {loginForm.error && <span className="form-error">{loginForm.error}</span>}
            <button className="primary-btn" type="submit">
              Sign In
            </button>
            <span className="auth-hint">
              Demo credentials: admin@example.com / admin123
            </span>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">AutoBody Operations</p>
          <h1>Vehicle Parking Management</h1>
        </div>
        <div className="app-header-actions">
          <div className="app-user">
            <span className="app-user-role">{currentUser.role}</span>
            <strong>{currentUser.name}</strong>
          </div>
          <button
            className="primary-btn"
            type="button"
            onClick={() => setActiveModal("intake")}
          >
            + New Vehicle Intake
          </button>
          <button className="ghost-btn" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="app-map">
          <YardMap
            assignments={assignments}
            vehiclesById={vehiclesById}
            availabilityByArea={availabilityByArea}
            onSelectSpot={handleSelectSpot}
            selectedSpotId={selectedSpotId}
            getStatusColor={getStatusColor}
            totalOccupied={totalOccupied}
            totalSpots={TOTAL_SPOTS}
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
            {selectedSpotId && assignments[selectedSpotId] ? (
              <div className="selected-vehicle-body">
                <div className="vehicle-highlight">
                  <div>
                    <p className="vehicle-id">
                      {vehiclesById[assignments[selectedSpotId]].id}
                    </p>
                    <p className="vehicle-client">
                      {getClientName(
                        vehiclesById[assignments[selectedSpotId]].clientId
                      )}
                    </p>
                  </div>
                  <span
                    className="status-chip"
                    style={{
                      background: getStatusColor(
                        vehiclesById[assignments[selectedSpotId]]
                      ),
                    }}
                  >
                    {getPrimaryStatus(
                      vehiclesById[assignments[selectedSpotId]]
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() =>
                    handleOpenVehicle(
                      vehiclesById[assignments[selectedSpotId]]
                    )
                  }
                >
                  View full details
                </button>
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
                  <tr
                    key={vehicle.id}
                    className="table-row"
                    onClick={() => handleOpenVehicle(vehicle)}
                  >
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

      {activeModal === "intake" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>New Vehicle Intake</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitIntake}>
              <label>
                Client
                <select
                  value={intakeForm.clientId}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      clientId: event.target.value,
                    }))
                  }
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                VIN (full)
                <input
                  type="text"
                  value={intakeForm.vinFull}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      vinFull: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Service Type
                <select
                  value={intakeForm.serviceType}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      serviceType: event.target.value,
                    }))
                  }
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Body Status
                <select
                  value={intakeForm.bodyStatus}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      bodyStatus: event.target.value,
                    }))
                  }
                >
                  {bodyStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mechanical Status
                <select
                  value={intakeForm.mechanicalStatus}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      mechanicalStatus: event.target.value,
                    }))
                  }
                >
                  {mechanicalStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estimated Start Date (ESD)
                <input
                  type="date"
                  value={intakeForm.esdDate}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      esdDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Assign Spot (optional)
                <select
                  value={intakeForm.spotId}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      spotId: event.target.value,
                    }))
                  }
                >
                  <option value="">Not assigned</option>
                  {availableSpotOptions
                    .filter((spot) => spot.available)
                    .map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        {spot.label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={intakeForm.notes}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Save Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "vehicle" && selectedVehicle && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--wide">
            <div className="modal-header">
              <h2>Vehicle Details</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="vehicle-highlight">
                <div>
                  <p className="vehicle-id">{selectedVehicle.id}</p>
                  <p className="vehicle-client">
                    {getClientName(selectedVehicle.clientId)}
                  </p>
                </div>
                <span
                  className="status-chip"
                  style={{ background: getStatusColor(selectedVehicle) }}
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
                <div>
                  <span>Spot</span>
                  <strong>{selectedVehicle.currentSpotId ?? "Scheduled"}</strong>
                </div>
              </div>
              <div className="notes">
                <h3>Logbook</h3>
                {selectedVehicle.notes.length ? (
                  selectedVehicle.notes.map((note) => (
                    <div className="note" key={note.id}>
                      <span>{note.timestamp}</span>
                      <strong>{note.user}</strong>
                      <p>{note.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No notes available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
