import { useMemo, useState } from "react";
import "./styles.css";
import YardMap from "./components/YardMap";
import {
  activityLogs,
  areas,
  clients as initialClients,
  serviceTypes,
  spotAssignments as initialAssignments,
  statusPalette,
  TOTAL_SPOTS,
  vehicles as initialVehicles,
} from "./parkingData";

const statusOptions = ["All", ...Object.keys(statusPalette)];
const todayString = () => new Date().toISOString().slice(0, 10);

const defaultUsers = [
  {
    id: "USR-001",
    name: "Alex Rivera",
    email: "admin@example.com",
    password: "admin123",
    role: "Admin",
  },
];

const defaultTags = [
  { id: "TAG-01", name: "Priority", color: "#f97316" },
  { id: "TAG-02", name: "Parts Hold", color: "#facc15" },
  { id: "TAG-03", name: "Ready", color: "#4ade80" },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(defaultUsers);
  const [clients, setClients] = useState(initialClients);
  const [tags, setTags] = useState(defaultTags);

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
    clientId: initialClients[0]?.id ?? "",
    vinFull: "",
    serviceType: serviceTypes[0],
    intakeDate: todayString(),
    spotId: "",
    notes: "",
  });
  const [registerForm, setRegisterForm] = useState({
    clientId: initialClients[0]?.id ?? "",
    vinFull: "",
    serviceType: serviceTypes[0],
    expectedDate: todayString(),
    notes: "",
  });
  const [newClientName, setNewClientName] = useState("");
  const [newTag, setNewTag] = useState({ name: "", color: "#60a5fa" });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Supervisor",
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
  }, [filters, vehicles, clients]);

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
    const user = users.find(
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

  const handleScanVin = () => {
    const demoVins = [
      "1N4AL3AP9GC123456",
      "3FA6P0H73HR210445",
      "5J6RW2H89JL028912",
    ];
    const vinFull = demoVins[Math.floor(Math.random() * demoVins.length)];
    setIntakeForm((prev) => ({ ...prev, vinFull }));
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
      entryDate: intakeForm.intakeDate || todayString(),
      serviceType: intakeForm.serviceType,
      bodyStatus: "New Intake",
      mechanicalStatus: "New Intake",
      esdDate: null,
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
      intakeDate: todayString(),
      spotId: "",
      notes: "",
    });
  };

  const handleSubmitRegister = (event) => {
    event.preventDefault();
    const vinFull = registerForm.vinFull.trim();
    if (!vinFull) return;

    const vinLast8 = vinFull.slice(-8).toUpperCase();
    const newVehicle = {
      id: `VH-${Date.now().toString().slice(-4)}`,
      clientId: registerForm.clientId,
      vinFull,
      vinLast8,
      entryDate: todayString(),
      serviceType: registerForm.serviceType,
      bodyStatus: "New Intake",
      mechanicalStatus: "New Intake",
      esdDate: registerForm.expectedDate || todayString(),
      currentSpotId: null,
      notes: registerForm.notes
        ? [
            {
              id: `NOTE-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: currentUser?.name ?? "System",
              message: registerForm.notes,
            },
          ]
        : [],
    };

    setVehicles((prev) => [newVehicle, ...prev]);
    setActiveModal(null);
    setRegisterForm({
      clientId: clients[0]?.id ?? "",
      vinFull: "",
      serviceType: serviceTypes[0],
      expectedDate: todayString(),
      notes: "",
    });
  };

  const handleAddClient = () => {
    if (!newClientName.trim()) return;
    const newClient = {
      id: `CL-${Date.now().toString().slice(-4)}`,
      name: newClientName.trim(),
    };
    setClients((prev) => [...prev, newClient]);
    setNewClientName("");
  };

  const handleDeleteClient = (clientId) => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
  };

  const handleAddTag = () => {
    if (!newTag.name.trim()) return;
    const tag = {
      id: `TAG-${Date.now().toString().slice(-4)}`,
      name: newTag.name.trim(),
      color: newTag.color,
    };
    setTags((prev) => [...prev, tag]);
    setNewTag({ name: "", color: "#60a5fa" });
  };

  const handleDeleteTag = (tagId) => {
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      return;
    }
    const user = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      ...newUser,
    };
    setUsers((prev) => [...prev, user]);
    setNewUser({ name: "", email: "", password: "", role: "Supervisor" });
  };

  const handleDeleteUser = (userId) => {
    if (currentUser?.id === userId) return;
    setUsers((prev) => prev.filter((user) => user.id !== userId));
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
            {loginForm.error && (
              <span className="form-error">{loginForm.error}</span>
            )}
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
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setActiveModal("register")}
          >
            Register Vehicle
          </button>
          <button className="ghost-btn" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="panel filters filters--bar">
        <div className="panel-header">
          <h2>Filters</h2>
          <span>VIN, client, status</span>
        </div>
        <div className="filters-grid">
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
            Show scheduled only
          </label>
        </div>
      </section>

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
                <p>Scheduled</p>
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
              <h2>Schedule</h2>
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
                    <span>ETA</span>
                    <strong>{vehicle.esdDate}</strong>
                  </div>
                </div>
              ))}
              {scheduledVehicles.length === 0 && (
                <p className="empty-state">No vehicles scheduled.</p>
              )}
            </div>
          </section>

          <section className="panel admin-panel">
            <div className="panel-header">
              <h2>Admin Settings</h2>
              <span>Manage data</span>
            </div>
            <div className="admin-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setActiveModal("customers")}
              >
                Manage Customers
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setActiveModal("tags")}
              >
                Manage Tags
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setActiveModal("users")}
              >
                Manage Users
              </button>
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
                VIN #
                <div className="input-row">
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
                  <button type="button" onClick={handleScanVin}>
                    Scan VIN / QR
                  </button>
                </div>
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
                Intake Date
                <input
                  type="date"
                  value={intakeForm.intakeDate}
                  onChange={(event) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      intakeDate: event.target.value,
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

      {activeModal === "register" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Register Vehicle Arrival</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitRegister}>
              <label>
                Client
                <select
                  value={registerForm.clientId}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
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
                VIN #
                <input
                  type="text"
                  value={registerForm.vinFull}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
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
                  value={registerForm.serviceType}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
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
                Expected Arrival Date
                <input
                  type="date"
                  value={registerForm.expectedDate}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      expectedDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={registerForm.notes}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
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
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "customers" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Manage Customers</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="list-grid">
                {clients.map((client) => (
                  <div className="list-item" key={client.id}>
                    <span>{client.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <label>
                New customer
                <input
                  type="text"
                  value={newClientName}
                  onChange={(event) => setNewClientName(event.target.value)}
                  placeholder="Customer name"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={handleAddClient}>
                  Add customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "tags" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Manage Tags</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="list-grid">
                {tags.map((tag) => (
                  <div className="list-item" key={tag.id}>
                    <span className="tag-pill">
                      <span
                        className="tag-dot"
                        style={{ background: tag.color }}
                      />
                      {tag.name}
                    </span>
                    <button type="button" onClick={() => handleDeleteTag(tag.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <label>
                Tag name
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(event) =>
                    setNewTag((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Tag label"
                />
              </label>
              <label>
                Tag color
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(event) =>
                    setNewTag((prev) => ({ ...prev, color: event.target.value }))
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={handleAddTag}>
                  Add tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "users" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--wide">
            <div className="modal-header">
              <h2>Manage Users</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="list-grid">
                {users.map((user) => (
                  <div className="list-item" key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <span className="muted">{user.email}</span>
                    </div>
                    <div className="list-actions">
                      <span className="muted">{user.role}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(event) =>
                      setNewUser((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(event) =>
                      setNewUser((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Role
                  <select
                    value={newUser.role}
                    onChange={(event) =>
                      setNewUser((prev) => ({
                        ...prev,
                        role: event.target.value,
                      }))
                    }
                  >
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Driver">Driver</option>
                  </select>
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(event) =>
                      setNewUser((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleAddUser}>
                  Add user
                </button>
              </div>
            </div>
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
