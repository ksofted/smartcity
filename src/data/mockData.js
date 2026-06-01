export const mockIncidents = [
  {
    incidentId: "INC-001",
    type: "crowd_anomaly",
    severity: "high",
    location: { lat: 11.8846, lng: 13.1520, address: "Maiduguri Central Market" },
    reportedBy: "user_003",
    status: "active",
    mediaUrls: [],
    validationCount: 4,
    description: "Unusual crowd gathering detected near the market entrance",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    incidentId: "INC-002",
    type: "geofence_violation",
    severity: "critical",
    location: { lat: 11.8500, lng: 13.0800, address: "Northern Boundary Checkpoint" },
    reportedBy: "system",
    status: "active",
    mediaUrls: [],
    validationCount: 1,
    description: "Vehicle entered restricted zone via unauthorized route",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    incidentId: "INC-003",
    type: "suspicious_movement",
    severity: "medium",
    location: { lat: 11.9100, lng: 13.1800, address: "University Road Junction" },
    reportedBy: "user_007",
    status: "investigating",
    mediaUrls: [],
    validationCount: 2,
    description: "Suspicious vehicle movement reported by multiple citizens",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    incidentId: "INC-004",
    type: "citizen_report",
    severity: "low",
    location: { lat: 11.8700, lng: 13.1200, address: "Baga Road Area" },
    reportedBy: "user_012",
    status: "resolved",
    mediaUrls: [],
    validationCount: 1,
    description: "Abandoned bag reported near bus stop",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    incidentId: "INC-005",
    type: "crowd_anomaly",
    severity: "medium",
    location: { lat: 11.8950, lng: 13.1650, address: "Monday Market" },
    reportedBy: "user_005",
    status: "active",
    mediaUrls: [],
    validationCount: 3,
    description: "Large crowd forming outside normal market hours",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export const mockGeofences = [
  {
    geofenceId: "GEO-001",
    name: "City Core Boundary",
    type: "boundary",
    active: true,
    coordinates: [
      [11.9200, 13.0500],
      [11.9200, 13.2500],
      [11.8200, 13.2500],
      [11.8200, 13.0500],
    ],
    color: "#3b82f6",
  },
  {
    geofenceId: "GEO-002",
    name: "Government House Restricted Zone",
    type: "restricted",
    active: true,
    coordinates: [
      [11.8900, 13.1400],
      [11.8900, 13.1600],
      [11.8750, 13.1600],
      [11.8750, 13.1400],
    ],
    color: "#ef4444",
  },
  {
    geofenceId: "GEO-003",
    name: "Airport Security Perimeter",
    type: "restricted",
    active: true,
    coordinates: [
      [11.8550, 13.0900],
      [11.8550, 13.1100],
      [11.8400, 13.1100],
      [11.8400, 13.0900],
    ],
    color: "#f97316",
  },
];

export const mockUsers = [
  { userId: "user_001", name: "Amina Bello", role: "admin", trustScore: 100, status: "active", email: "admin@cityalert.ng" },
  { userId: "user_002", name: "Ibrahim Musa", role: "trusted_reporter", trustScore: 87, status: "active", email: "ibrahim@cityalert.ng" },
  { userId: "user_003", name: "Fatima Umar", role: "trusted_reporter", trustScore: 74, status: "active", email: "fatima@cityalert.ng" },
  { userId: "user_005", name: "Yusuf Garba", role: "citizen", trustScore: 55, status: "active", email: "yusuf@mail.com" },
  { userId: "user_007", name: "Hauwa Sule", role: "citizen", trustScore: 62, status: "active", email: "hauwa@mail.com" },
  { userId: "user_012", name: "Bashir Kolo", role: "citizen", trustScore: 30, status: "suspended", email: "bashir@mail.com" },
];

export const mockAlerts = [
  { alertId: "ALT-001", incidentId: "INC-001", severity: "high", message: "High crowd density at Central Market", createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
  { alertId: "ALT-002", incidentId: "INC-002", severity: "critical", message: "Geofence breach at Northern Checkpoint", createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), read: false },
  { alertId: "ALT-003", incidentId: "INC-003", severity: "medium", message: "Suspicious movement on University Road", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: true },
  { alertId: "ALT-004", incidentId: "INC-005", severity: "medium", message: "Crowd anomaly at Monday Market", createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: true },
];

export const mockStats = {
  totalIncidents: 24,
  activeAlerts: 3,
  resolvedToday: 8,
  trustedReporters: 12,
  geofenceViolations: 2,
  avgResponseTime: "4.2 min",
};

export const mockSchools = [
  {
    schoolId: 'SCH-001',
    name: 'Government Secondary School Maiduguri',
    contact: { phone: '+2348012345678', email: 'gss.maiduguri@edu.ng' },
    location: { lat: 11.8870, lng: 13.1480 },
    radius: 500,
    active: true,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    schoolId: 'SCH-002',
    name: 'Ramat Polytechnic',
    contact: { phone: '+2348023456789', email: 'ramat.poly@edu.ng' },
    location: { lat: 11.8760, lng: 13.1350 },
    radius: 700,
    active: true,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    schoolId: 'SCH-003',
    name: 'University of Maiduguri',
    contact: { phone: '+2348034567890', email: 'security@unimaid.edu.ng' },
    location: { lat: 11.9050, lng: 13.1700 },
    radius: 1000,
    active: true,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    schoolId: 'SCH-004',
    name: 'Lamisula Primary School',
    contact: { phone: '+2348045678901', email: 'lamisula@edu.ng' },
    location: { lat: 11.8510, lng: 13.0820 },
    radius: 300,
    active: false,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const NIGERIAN_AGENCIES = [
  { id: 'npf',    name: 'Nigeria Police Force (NPF)',                    short: 'NPF',    icon: '👮', color: '#3b82f6' },
  { id: 'dss',    name: 'Dept. of State Services (DSS)',                 short: 'DSS',    icon: '🕵️', color: '#6366f1' },
  { id: 'army',   name: 'Nigerian Army',                                 short: 'ARMY',   icon: '🪖', color: '#22c55e' },
  { id: 'navy',   name: 'Nigerian Navy',                                 short: 'NAVY',   icon: '⚓', color: '#06b6d4' },
  { id: 'airforce', name: 'Nigerian Air Force',                          short: 'NAF',    icon: '✈️', color: '#8b5cf6' },
  { id: 'nscdc',  name: 'Nigeria Security & Civil Defence Corps (NSCDC)',short: 'NSCDC',  icon: '🛡️', color: '#f97316' },
  { id: 'efcc',   name: 'Economic & Financial Crimes Commission (EFCC)', short: 'EFCC',   icon: '💼', color: '#eab308' },
  { id: 'icpc',   name: 'Independent Corrupt Practices Commission (ICPC)',short: 'ICPC',  icon: '⚖️', color: '#ec4899' },
  { id: 'customs','name': 'Nigeria Customs Service',                     short: 'NCS',    icon: '🏛️', color: '#14b8a6' },
  { id: 'immigration', name: 'Nigeria Immigration Service (NIS)',        short: 'NIS',    icon: '🛂', color: '#f43f5e' },
  { id: 'frsc',   name: 'Federal Road Safety Corps (FRSC)',              short: 'FRSC',   icon: '🚦', color: '#a855f7' },
  { id: 'ndlea',  name: 'National Drug Law Enforcement Agency (NDLEA)',  short: 'NDLEA',  icon: '💊', color: '#dc2626' },
  { id: 'naf_intel', name: 'Defence Intelligence Agency (DIA)',          short: 'DIA',    icon: '🔍', color: '#0ea5e9' },
  { id: 'amotekun', name: 'Operation Amotekun',                          short: 'AMOTEKUN', icon: '🐆', color: '#84cc16' },
  { id: 'civilian_jtt', name: 'Civilian Joint Task Force (CJTF)',        short: 'CJTF',   icon: '🤝', color: '#fb923c' },
];

export const mockAgencies = [
  {
    agencyId: 'AGY-001',
    agencyType: 'npf',
    agencyName: 'Nigeria Police Force — Borno State Command',
    contactName: 'CP Aliyu Musa',
    email: 'borno.command@npf.gov.ng',
    phone: '+2348011223344',
    state: 'Borno',
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'active',
    admins: [
      { adminId: 'ADM-001', name: 'Insp. Fatima Umar', email: 'fatima.umar@npf.gov.ng', role: 'agency_admin', addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
      { adminId: 'ADM-002', name: 'Sgt. Bello Garba',  email: 'bello.garba@npf.gov.ng',  role: 'agency_admin', addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
  },
  {
    agencyId: 'AGY-002',
    agencyType: 'nscdc',
    agencyName: 'NSCDC — Borno State',
    contactName: 'SC Ibrahim Kolo',
    email: 'borno@nscdc.gov.ng',
    phone: '+2348022334455',
    state: 'Borno',
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'active',
    admins: [
      { adminId: 'ADM-003', name: 'Hauwa Sule', email: 'hauwa.sule@nscdc.gov.ng', role: 'agency_admin', addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
    ],
  },
];

export const mockChartData = [
  { day: "Mon", incidents: 4, resolved: 3 },
  { day: "Tue", incidents: 7, resolved: 5 },
  { day: "Wed", incidents: 3, resolved: 3 },
  { day: "Thu", incidents: 9, resolved: 6 },
  { day: "Fri", incidents: 5, resolved: 4 },
  { day: "Sat", incidents: 6, resolved: 5 },
  { day: "Sun", incidents: 2, resolved: 2 },
];
