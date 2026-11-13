// Space Club 1970s/80s Cassette Futurism ("NASA-punk") Core Data

export const DOMAINS = {
  Robotics: {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'Robotics',
    name: 'Robotics',
    fullName: 'Robotics',
    subtitle: 'Planetary Surface Mobility & Manipulators',
    tagline: 'LIDAR SLAM, Rocker-Bogie Chassis & Computer Vision Nodes',
    color_code: '#3A6B5C', // Desaturated Olive / Teal
    badgeClass: 'bg-[#3A6B5C] text-white border-2 border-[#1E1F22]',
    lightBadge: 'bg-[#3A6B5C]/15 text-[#23453A] border border-[#3A6B5C]/40',
    indicatorColor: 'bg-[#3A6B5C]',
    serial: 'SPEC-R01-REV.B'
  },
  Rocketry: {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'Rocketry',
    name: 'Rocketry',
    fullName: 'Rocketry',
    subtitle: 'High-Power Propulsion & Dual-Deploy Avionics',
    tagline: 'Static Hot-Fire Test Stands, Prepreg Carbon Airframes & Telemetry',
    color_code: '#D95D24', // Muted Aerospace Orange
    badgeClass: 'bg-[#D95D24] text-white border-2 border-[#1E1F22]',
    lightBadge: 'bg-[#D95D24]/15 text-[#9E3E12] border border-[#D95D24]/40',
    indicatorColor: 'bg-[#D95D24]',
    serial: 'PROP-P02-REV.A'
  },
  Astronautics: {
    id: '33333333-3333-3333-3333-333333333333',
    code: 'Astronautics',
    name: 'Astronautics',
    fullName: 'Astronautics',
    subtitle: 'CubeSat Payloads & Ground Station Comms',
    tagline: '3-Axis ADCS Magnetorquers, SDR Telemetry & Solar Arrays',
    color_code: '#E29526', // Industrial Ochre / Amber
    badgeClass: 'bg-[#E29526] text-[#1E1F22] border-2 border-[#1E1F22] font-bold',
    lightBadge: 'bg-[#E29526]/15 text-[#85520D] border border-[#E29526]/40',
    indicatorColor: 'bg-[#E29526]',
    serial: 'ORBIT-A03-REV.C'
  }
};

export const ABSENCE_REASONS = [
  { id: 'Holiday', label: 'Holiday / Leave', code: 'RSN-01', icon: 'Plane' },
  { id: 'Exams', label: 'Exams / Academics', code: 'RSN-02', icon: 'GraduationCap' },
  { id: 'Emergency', label: 'Emergency / Medical', code: 'RSN-03', icon: 'AlertTriangle' },
  { id: 'Other', label: 'Other Duty', code: 'RSN-04', icon: 'HelpCircle' }
];

export const getDateString = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getFutureDateTimeString = (daysOffset = 2, hours = 18, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const DEFAULT_ADMIN = {
  id: 'a0000000-0000-0000-0000-000000000001',
  full_name: 'Elena Rostova',
  student_id: 'NAS-2024-001',
  email: 'admin@spaceclub.org',
  role: 'admin',
  role_title: 'Flight Director & Lead Avionics Systems Engineer',
  domains: ['Rocketry', 'Astronautics'],
  callsign: 'COMMANDER // ELENA',
  avatar: 'ER'
};

// Clean baseline - ready for fresh input
export const INITIAL_PROFILES = [];
export const INITIAL_ATTENDANCE = {};
export const INITIAL_TASKS = [];
