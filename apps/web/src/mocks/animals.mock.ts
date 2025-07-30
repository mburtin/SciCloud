import type { Animal } from '@/types/lab'

export const mockAnimals: Animal[] = [
  {
    id: 'M001',
    identifier: 'M001-2024',
    species: 'Mus musculus',
    strain: 'C57BL/6J',
    line: 'Wild Type',
    sex: 'male',
    birthDate: '2024-03-15',
    arrivalDate: '2024-04-01',
    currentWeight: 28.5,
    supplier: 'Charles River Laboratories',
    status: 'alive',
    location: {
      facility: 'Animal Facility A',
      room: 'Room 205',
      rack: 'R-12',
      cage: 'C-034'
    },
    housingType: 'group',
    groupSize: 4,
    protocols: ['PROT-2024-001', 'PROT-2024-015'],
    experimentalGroup: 'Control Group',
    veterinarian: 'Dr. Marie Dubois',
    lastExamDate: '2024-06-20',
    nextExamDate: '2024-07-20',
    healthStatus: 'excellent',
    notes: 'Animal in excellent condition, normal growth, active behavior',
    ethicsApproval: 'CE-2024-008',
    documents: [
      {
        id: 'doc1',
        name: 'Health_certificate_M001.pdf',
        type: 'health-certificate',
        uploadDate: '2024-04-01',
        size: '2.1 MB',
        uploadedBy: 'Dr. Marie Dubois'
      },
      {
        id: 'doc2',
        name: 'Identification_photo_M001.jpg',
        type: 'photo',
        uploadDate: '2024-04-01',
        size: '845 KB',
        uploadedBy: 'Tech. Paul Martin'
      }
    ],
    medicalHistory: [
      {
        id: 'med1',
        date: '2024-06-20',
        type: 'examination',
        veterinarian: 'Dr. Marie Dubois',
        description: 'Monthly routine checkup',
        findings: 'Animal in good health, stable weight',
        severity: 'normal'
      },
      {
        id: 'med2',
        date: '2024-04-01',
        type: 'vaccination',
        veterinarian: 'Dr. Marie Dubois',
        description: 'Prophylactic vaccination',
        treatment: 'Multivalent vaccine as per protocol',
        severity: 'normal'
      }
    ],
    measurements: [
      {
        id: 'meas1',
        date: '2024-07-05',
        type: 'weight',
        value: 28.5,
        unit: 'g',
        measuredBy: 'Tech. Sarah Lucas'
      },
      {
        id: 'meas2',
        date: '2024-06-20',
        type: 'weight',
        value: 27.8,
        unit: 'g',
        measuredBy: 'Dr. Marie Dubois'
      }
    ],
    created_by: 'user-123',
    created_at: '2024-04-01T08:00:00',
    updated_by: 'user-123',
    updated_at: '2024-07-05T09:30:00',
    version: 1,
  },
  {
    id: 'M002',
    identifier: 'F003-2024',
    species: 'Mus musculus',
    strain: 'BALB/c',
    line: 'Transgenic KO',
    sex: 'female',
    birthDate: '2024-02-28',
    arrivalDate: '2024-03-20',
    currentWeight: 24.2,
    supplier: 'Janvier Labs',
    status: 'experimental',
    location: {
      facility: 'Animal Facility B',
      room: 'Room 102',
      rack: 'R-05',
      cage: 'C-017'
    },
    housingType: 'pair',
    groupSize: 2,
    protocols: ['PROT-2024-007'],
    experimentalGroup: 'Test Group A',
    veterinarian: 'Dr. Jean Moreau',
    lastExamDate: '2024-07-01',
    nextExamDate: '2024-08-01',
    healthStatus: 'good',
    notes: 'Post-procedure follow-up, normal recovery',
    ethicsApproval: 'CE-2024-003',
    documents: [
      {
        id: 'doc3',
        name: 'Experimentation_authorization_F003.pdf',
        type: 'authorization',
        uploadDate: '2024-03-20',
        size: '1.5 MB',
        uploadedBy: 'Dr. Jean Moreau'
      }
    ],
    medicalHistory: [
      {
        id: 'med3',
        date: '2024-07-01',
        type: 'examination',
        veterinarian: 'Dr. Jean Moreau',
        description: 'Post-intervention check',
        findings: 'Normal healing, appropriate behavior',
        severity: 'normal'
      }
    ],
    measurements: [
      {
        id: 'meas3',
        date: '2024-07-01',
        type: 'weight',
        value: 24.2,
        unit: 'g',
        measuredBy: 'Dr. Jean Moreau'
      }
    ],
    created_by: 'user-123',
    created_at: '2024-03-20T10:00:00',
    updated_by: 'user-123',
    updated_at: '2024-07-01T14:15:00',
    version: 1,
  },
  {
    id: 'R001',
    identifier: 'R012-2024',
    species: 'Rattus norvegicus',
    strain: 'Wistar',
    sex: 'male',
    birthDate: '2024-01-10',
    arrivalDate: '2024-01-25',
    currentWeight: 345.0,
    supplier: 'Harlan Laboratories',
    status: 'alive',
    location: {
      facility: 'Animal Facility A',
      room: 'Room 301',
      rack: 'R-08',
      cage: 'C-025'
    },
    housingType: 'individual',
    protocols: ['PROT-2024-012'],
    experimentalGroup: 'Control Group',
    veterinarian: 'Dr. Marie Dubois',
    lastExamDate: '2024-06-25',
    nextExamDate: '2024-07-25',
    healthStatus: 'good',
    notes: 'Adult rat in good health, long-term protocol',
    ethicsApproval: 'CE-2024-012',
    documents: [],
    medicalHistory: [
      {
        id: 'med4',
        date: '2024-06-25',
        type: 'examination',
        veterinarian: 'Dr. Marie Dubois',
        description: 'Routine checkup',
        findings: 'General condition satisfactory',
        severity: 'normal'
      }
    ],
    measurements: [
      {
        id: 'meas4',
        date: '2024-06-25',
        type: 'weight',
        value: 345.0,
        unit: 'g',
        measuredBy: 'Dr. Marie Dubois'
      }
    ],
    created_by: 'user-123',
    created_at: '2024-01-25T12:00:00',
    updated_by: 'user-123',
    updated_at: '2024-06-25T11:45:00',
    version: 1,
  },
  {
    id: 'M003',
    identifier: 'F008-2024',
    species: 'Mus musculus',
    strain: 'C57BL/6J',
    sex: 'female',
    birthDate: '2024-04-20',
    arrivalDate: '2024-05-10',
    currentWeight: 22.1,
    supplier: 'Charles River Laboratories',
    status: 'experimental',
    location: {
      facility: 'Animal Facility C',
      room: 'Quarantine',
      rack: 'Q-02',
      cage: 'Q-008'
    },
    housingType: 'individual',
    protocols: [],
    veterinarian: 'Dr. Jean Moreau',
    lastExamDate: '2024-07-03',
    nextExamDate: '2024-07-10',
    healthStatus: 'concerning',
    notes: 'Observed weight loss, increased monitoring required',
    ethicsApproval: 'CE-2024-008',
    documents: [
      {
        id: 'doc4',
        name: 'Veterinary_report_F008.pdf',
        type: 'report',
        uploadDate: '2024-07-03',
        size: '924 KB',
        uploadedBy: 'Dr. Jean Moreau'
      }
    ],
    medicalHistory: [
      {
        id: 'med5',
        date: '2024-07-03',
        type: 'examination',
        veterinarian: 'Dr. Jean Moreau',
        description: 'Checkup after weight loss',
        findings: '15% weight loss, apathetic behavior',
        treatment: 'Daily monitoring, nutritional supplement',
        followUp: 'Checkup in 7 days',
        severity: 'moderate'
      }
    ],
    measurements: [
      {
        id: 'meas5',
        date: '2024-07-03',
        type: 'weight',
        value: 22.1,
        unit: 'g',
        measuredBy: 'Dr. Jean Moreau'
      }
    ],
    created_by: 'user-123',
    created_at: '2024-05-10T14:00:00',
    updated_by: 'user-123',
    updated_at: '2024-07-03T16:20:00',
    version: 1,
  }
]