import { useMemo, useState } from "react";
import "./styles.css";
import YardMap from "./components/YardMap";
import {
  activityLogs,
  areas,
  bays,
  clients as initialClients,
  serviceTypes,
  spotAssignments as initialAssignments,
  statusPalette,
  TOTAL_SPOTS,
  vehicles as initialVehicles,
} from "./parkingData";

const statusOptions = ["All", ...Object.keys(statusPalette)];
const statusChoices = Object.keys(statusPalette);
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
  const [currentPage, setCurrentPage] = useState("dashboard");

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
  const [activeBayId, setActiveBayId] = useState(null);
  const [viewTab, setViewTab] = useState("map");
  const [tablePage, setTablePage] = useState(1);
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
  const [releaseForm, setReleaseForm] = useState({
    vinFull: "",
    contactName: "",
    contactPhone: "",
    companyName: "",
    releaseDate: todayString(),
    error: "",
  });
  const [registerForm, setRegisterForm] = useState({
    clientId: initialClients[0]?.id ?? "",
    vinFull: "",
    serviceType: serviceTypes[0],
    expectedDate: todayString(),
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    spotId: "",
    bodyStatus: statusChoices[0],
    mechanicalStatus: statusChoices[0],
    note: "",
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

  const filteredVehicleIds = useMemo(
    () => new Set(filteredVehicles.map((vehicle) => vehicle.id)),
    [filteredVehicles]
  );
  const releaseCandidates = useMemo(
    () => vehicles.filter((vehicle) => vehicle.currentSpotId),
    [vehicles]
  );

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const safeTablePage = Math.min(tablePage, totalPages);
  const tableSlice = filteredVehicles.slice(
    (safeTablePage - 1) * pageSize,
    safeTablePage * pageSize
  );

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

  const availableSpotOptions = [
    ...Object.values(areas).flatMap((area) => {
      return Array.from(
        { length: area.rows * area.spotsPerRow },
        (_, index) => {
          const number = index + 1;
          const spotId = `${area.id}-${number}`;
          return {
            id: spotId,
            label: `${area.name} - ${number}`,
            available: !assignments[spotId],
          };
        }
      );
    }),
    ...bays.flatMap((bay) =>
      Array.from({ length: bay.capacity }, (_, index) => {
        const number = index + 1;
        const spotId = `BAY-${bay.id}-${number}`;
        return {
          id: spotId,
          label: `${bay.name} - ${number}`,
          available: !assignments[spotId],
        };
      })
    ),
  ];

  const bayVehicles = (bayId) => {
    const bay = bays.find((item) => item.id === bayId);
    if (!bay) return [];
    return Array.from({ length: bay.capacity }, (_, index) => {
      const spotId = `BAY-${bayId}-${index + 1}`;
      const vehicleId = assignments[spotId];
      return vehicleId ? vehiclesById[vehicleId] : null;
    }).filter(Boolean);
  };

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
    setCurrentPage("dashboard");
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

  const handleSubmitRelease = (event) => {
    event.preventDefault();
    const vinFull = releaseForm.vinFull.trim();
    if (!vinFull) {
      setReleaseForm((prev) => ({
        ...prev,
        error: "Please select a vehicle VIN.",
      }));
      return;
    }

    const vehicle = vehicles.find(
      (item) => item.vinFull.toLowerCase() === vinFull.toLowerCase()
    );

    if (!vehicle) {
      setReleaseForm((prev) => ({
        ...prev,
        error: "No matching vehicle found in the yard.",
      }));
      return;
    }

    if (getPrimaryStatus(vehicle) !== "Completed") {
      const shouldRelease = window.confirm(
        "This vehicle is not marked Completed. Release anyway?"
      );
      if (!shouldRelease) {
        return;
      }
    }

    setVehicles((prev) =>
      prev.map((item) =>
        item.id === vehicle.id ? { ...item, currentSpotId: null } : item
      )
    );

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((spotId) => {
        if (next[spotId] === vehicle.id) {
          delete next[spotId];
        }
      });
      return next;
    });

    if (selectedSpotId && assignments[selectedSpotId] === vehicle.id) {
      setSelectedSpotId(null);
      setSelectedVehicle(null);
    }

    setActiveModal(null);
    setReleaseForm({
      vinFull: "",
      contactName: "",
      contactPhone: "",
      companyName: "",
      releaseDate: todayString(),
      error: "",
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

  const handleSelectSpot = (spotId) => {
    setSelectedSpotId(spotId);
    const vehicleId = assignments[spotId];
    if (vehicleId) {
      const vehicle = vehiclesById[vehicleId];
      setSelectedVehicle(vehicle);
      setEditForm({
        spotId: spotId,
        bodyStatus: vehicle.bodyStatus,
        mechanicalStatus: vehicle.mechanicalStatus,
        note: "",
      });
      setActiveModal("vehicle");
      return;
    }

    setIntakeForm((prev) => ({
      ...prev,
      spotId,
      intakeDate: todayString(),
    }));
    setActiveModal("intake");
  };

  const handleOpenBay = (bayId) => {
    setActiveBayId(bayId);
    setActiveModal("bay");
  };

  const handleOpenVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      spotId: vehicle.currentSpotId ?? "",
      bodyStatus: vehicle.bodyStatus,
      mechanicalStatus: vehicle.mechanicalStatus,
      note: "",
    });
    setActiveModal("vehicle");
  };

  const handleSaveVehicle = () => {
    if (!selectedVehicle) return;
    const updated = {
      ...selectedVehicle,
      bodyStatus: editForm.bodyStatus,
      mechanicalStatus: editForm.mechanicalStatus,
      currentSpotId: editForm.spotId || null,
    };

    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === selectedVehicle.id ? updated : vehicle
      )
    );

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((spotId) => {
        if (next[spotId] === selectedVehicle.id) {
          delete next[spotId];
        }
      });
      if (editForm.spotId) {
        next[editForm.spotId] = selectedVehicle.id;
      }
      return next;
    });

    if (editForm.note.trim()) {
      const logEntry = {
        id: `NOTE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser?.name ?? "System",
        message: editForm.note.trim(),
      };
      updated.notes = [...updated.notes, logEntry];
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicle.id
            ? { ...updated, notes: updated.notes }
            : vehicle
        )
      );
    }

    setSelectedVehicle(updated);
    setActiveModal(null);
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

  if (currentPage === "settings") {
    return (
      <div className="app-root">
        <header className="app-header">
          <div>
            <p className="app-eyebrow">Admin Tools</p>
            <h1>Settings</h1>
          </div>
          <div className="app-header-actions">
            <div className="app-user">
              <span className="app-user-role">{currentUser.role}</span>
              <strong>{currentUser.name}</strong>
            </div>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setCurrentPage("dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <main className="settings-layout">
          <section className="panel">
            <div className="panel-header">
              <h2>Customers</h2>
              <span>Create or remove customers</span>
            </div>
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
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Tags</h2>
              <span>Define labels and colors</span>
            </div>
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
            <div className="form-grid">
              <label>
                Tag name
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(event) =>
                    setNewTag((prev) => ({ ...prev, name: event.target.value }))
                  }
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
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleAddTag}>
                Add tag
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Users</h2>
              <span>Manage staff access</span>
            </div>
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
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Activity Log</h2>
              <span>Latest updates</span>
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setActiveModal("activity")}
            >
              See Activity Log
            </button>
          </section>
        </main>

        {activeModal === "activity" && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card modal-card--wide">
              <div className="modal-header">
                <h2>Recent Activity</h2>
                <button type="button" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
              <div className="modal-body">
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
              </div>
            </div>
          </div>
        )}
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
            onClick={() => setActiveModal("release")}
          >
            Release Vehicle
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setActiveModal("register")}
          >
            Register Vehicle
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setCurrentPage("settings")}
          >
            Settings
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

      <div className="panel view-tabs">
        <button
          type="button"
          className={viewTab === "map" ? "tab-btn tab-btn--active" : "tab-btn"}
          onClick={() => setViewTab("map")}
        >
          Map View
        </button>
        <button
          type="button"
          className={viewTab === "table" ? "tab-btn tab-btn--active" : "tab-btn"}
          onClick={() => setViewTab("table")}
        >
          Table View
        </button>
      </div>

      <main className="app-main">
        <section className="app-map">
          {viewTab === "map" ? (
            <YardMap
              assignments={assignments}
              vehiclesById={vehiclesById}
              availabilityByArea={availabilityByArea}
              onSelectSpot={handleSelectSpot}
              selectedSpotId={selectedSpotId}
              getStatusColor={getStatusColor}
              filteredVehicleIds={filteredVehicleIds}
              onOpenBay={handleOpenBay}
              totalOccupied={totalOccupied}
              totalSpots={TOTAL_SPOTS}
            />
          ) : (
            <section className="panel table-panel table-panel--inline">
              <div className="panel-header">
                <h2>Vehicle Register</h2>
                <span>
                  {filteredVehicles.length} records • Page {safeTablePage} of{" "}
                  {totalPages}
                </span>
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
                    {tableSlice.map((vehicle) => {
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
              <div className="table-pagination">
                <button
                  type="button"
                  onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                  disabled={tablePage === 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTablePage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={tablePage === totalPages}
                >
                  Next
                </button>
              </div>
            </section>
          )}
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

      {activeModal === "release" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Release Vehicle</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitRelease}>
              <label>
                VIN #
                <input
                  type="text"
                  value={releaseForm.vinFull}
                  onChange={(event) =>
                    setReleaseForm((prev) => ({
                      ...prev,
                      vinFull: event.target.value,
                      error: "",
                    }))
                  }
                  list="release-vin-list"
                  placeholder="Enter full VIN"
                  required
                />
                <datalist id="release-vin-list">
                  {releaseCandidates.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.vinFull}
                    >{`${vehicle.id} • ${vehicle.vinLast8}`}</option>
                  ))}
                </datalist>
              </label>
              <div className="modal-grid">
                <label>
                  Released To
                  <input
                    type="text"
                    value={releaseForm.contactName}
                    onChange={(event) =>
                      setReleaseForm((prev) => ({
                        ...prev,
                        contactName: event.target.value,
                      }))
                    }
                    placeholder="Full name"
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    value={releaseForm.contactPhone}
                    onChange={(event) =>
                      setReleaseForm((prev) => ({
                        ...prev,
                        contactPhone: event.target.value,
                      }))
                    }
                    placeholder="(555) 555-5555"
                    required
                  />
                </label>
              </div>
              <label>
                Company
                <input
                  type="text"
                  value={releaseForm.companyName}
                  onChange={(event) =>
                    setReleaseForm((prev) => ({
                      ...prev,
                      companyName: event.target.value,
                    }))
                  }
                  placeholder="Company name"
                />
              </label>
              <label>
                Release Date
                <input
                  type="date"
                  value={releaseForm.releaseDate}
                  onChange={(event) =>
                    setReleaseForm((prev) => ({
                      ...prev,
                      releaseDate: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              {releaseForm.error && (
                <span className="form-error">{releaseForm.error}</span>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Release Vehicle
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
                  <p className="vehicle-id">
                    {selectedVehicle.id}
                    <span className="vehicle-vin">{selectedVehicle.vinFull}</span>
                  </p>
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
                  <span>Entry</span>
                  <strong>{selectedVehicle.entryDate}</strong>
                </div>
                <div>
                  <span>Service</span>
                  <strong>{selectedVehicle.serviceType}</strong>
                </div>
                <div>
                  <span>Body Status</span>
                  <select
                    value={editForm.bodyStatus}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        bodyStatus: event.target.value,
                      }))
                    }
                  >
                    {statusChoices.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span>Mechanical Status</span>
                  <select
                    value={editForm.mechanicalStatus}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        mechanicalStatus: event.target.value,
                      }))
                    }
                  >
                    {statusChoices.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span>Spot</span>
                  <select
                    value={editForm.spotId}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        spotId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Scheduled</option>
                    {availableSpotOptions.map((spot) => (
                      <option
                        key={spot.id}
                        value={spot.id}
                        disabled={!spot.available && spot.id !== editForm.spotId}
                      >
                        {spot.label}
                      </option>
                    ))}
                  </select>
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
              <label>
                Add log entry
                <textarea
                  rows={3}
                  value={editForm.note}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Add update or comment"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button className="primary-btn" type="button" onClick={handleSaveVehicle}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "bay" && activeBayId && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--wide">
            <div className="modal-header">
              <h2>{bays.find((bay) => bay.id === activeBayId)?.name}</h2>
              <button type="button" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="list-grid">
                {bayVehicles(activeBayId).map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    className="list-item list-item--button"
                    onClick={() => handleOpenVehicle(vehicle)}
                  >
                    <div>
                      <strong>{vehicle.id}</strong>
                      <span className="muted">{vehicle.vinFull}</span>
                    </div>
                    <span className="muted">{vehicle.serviceType}</span>
                  </button>
                ))}
                {bayVehicles(activeBayId).length === 0 && (
                  <p className="empty-state">No vehicles in this bay.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
