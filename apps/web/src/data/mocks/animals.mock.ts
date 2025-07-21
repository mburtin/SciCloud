export interface Animal {
  id: string
  species: string
  strain: string
  age: number
  sex: 'male' | 'female'
  status: 'active' | 'quarantine' | 'experiment' | 'archived'
  project: string
  lastUpdated: string
  healthMonitoring: boolean
  upcomingExams: boolean
}

export const mockAnimals: Animal[] = [
  {
    id: 'M001',
    species: 'Mouse',
    strain: 'C57BL/6',
    age: 12,
    sex: 'male',
    status: 'active',
    project: 'Project Alpha',
    lastUpdated: '2024-07-10T09:30:00',
    healthMonitoring: false,
    upcomingExams: false,
  },
  {
    id: 'M002',
    species: 'Mouse',
    strain: 'BALB/c',
    age: 10,
    sex: 'female',
    status: 'experiment',
    project: 'Project Beta',
    lastUpdated: '2024-07-12T14:15:00',
    healthMonitoring: true,
    upcomingExams: false,
  },
  {
    id: 'R001',
    species: 'Rat',
    strain: 'Wistar',
    age: 16,
    sex: 'male',
    status: 'experiment',
    project: 'Project Beta',
    lastUpdated: '2024-07-15T11:45:00',
    healthMonitoring: false,
    upcomingExams: false,
  },
  {
    id: 'M003',
    species: 'Mouse',
    strain: 'C57BL/6',
    age: 8,
    sex: 'female',
    status: 'active',
    project: 'Project Alpha',
    lastUpdated: '2024-07-14T16:20:00',
    healthMonitoring: false,
    upcomingExams: false,
  },
  {
    id: 'RB001',
    species: 'Rabbit',
    strain: 'New Zealand White',
    age: 24,
    sex: 'male',
    status: 'archived',
    project: 'Project Gamma',
    lastUpdated: '2024-06-30T10:00:00',
    healthMonitoring: false,
    upcomingExams: false,
  }
]