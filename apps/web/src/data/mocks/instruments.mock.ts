export interface Instrument {
  id: string
  serialNumber: string
  name: string
  brand: string
  model: string
  category: string
  location: string
  status: 'available' | 'reserved' | 'maintenance' | 'outoforder'
  maintenanceDue: boolean
  nextReservation: string | null
}

export const mockInstruments: Instrument[] = [
  {
    id: '1',
    serialNumber: 'MICR-001',
    name: 'Confocal Microscope',
    brand: 'Zeiss',
    model: 'LSM 980',
    category: 'Microscopes',
    location: 'Room A-101',
    status: 'available',
    maintenanceDue: false,
    nextReservation: null
  },
  {
    id: '2',
    serialNumber: 'CENT-002',
    name: 'High-Speed Centrifuge',
    brand: 'Beckman Coulter',
    model: 'Avanti J-26S',
    category: 'Centrifuges',
    location: 'Room B-203',
    status: 'available',
    maintenanceDue: true,
    nextReservation: '2024-07-20T09:00:00'
  },
  {
    id: '3',
    serialNumber: 'SPEC-003',
    name: 'UV-Vis Spectrophotometer',
    brand: 'Thermo Scientific',
    model: 'Evolution 300',
    category: 'Spectrophotometers',
    location: 'Room A-105',
    status: 'maintenance',
    maintenanceDue: false,
    nextReservation: null
  },
  {
    id: '4',
    serialNumber: 'PCR-004',
    name: 'PCR Thermocycler',
    brand: 'Bio-Rad',
    model: 'T100',
    category: 'PCR',
    location: 'Room C-110',
    status: 'reserved',
    maintenanceDue: false,
    nextReservation: '2024-07-22T14:00:00'
  },
  {
    id: '5',
    serialNumber: 'MICR-005',
    name: 'Electron Microscope',
    brand: 'JEOL',
    model: 'JEM-2100',
    category: 'Microscopes',
    location: 'Room D-001',
    status: 'outoforder',
    maintenanceDue: true,
    nextReservation: null
  },
  {
    id: '6',
    serialNumber: 'CENT-006',
    name: 'Microcentrifuge',
    brand: 'Eppendorf',
    model: '5424 R',
    category: 'Centrifuges',
    location: 'Room B-203',
    status: 'available',
    maintenanceDue: true,
    nextReservation: null
  }
]