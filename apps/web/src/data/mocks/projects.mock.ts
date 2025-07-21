export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'planning' | 'completed' | 'paused'
  progress: number
  responsible: string
  responsibleInitials: string
  responsibleAvatar: string
  category: string
  priority: 'high' | 'medium' | 'low'
  deadline: string
  budget: number
  isFavorite: boolean
  isArchived: boolean
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Water Quality Analysis',
    description: 'Study of microbiological contamination in surface water',
    status: 'active',
    progress: 45,
    responsible: 'Dr. Maria Stevens',
    responsibleInitials: 'MS',
    responsibleAvatar: '/avatars/01.png',
    category: 'Microbiology',
    priority: 'high',
    deadline: '2025-08-30',
    budget: 25000,
    isFavorite: true,
    isArchived: false,
  },
  {
    id: '2',
    name: 'Soil Composition Study',
    description: 'Analysis of chemical components in agricultural soil',
    status: 'planning',
    progress: 25,
    responsible: 'Dr. Michael Chen',
    responsibleInitials: 'MC',
    responsibleAvatar: '/avatars/02.png',
    category: 'Environmental Chemistry',
    priority: 'medium',
    deadline: '2024-11-15',
    budget: 45000,
    isFavorite: false,
    isArchived: false,
  },
  {
    id: '3',
    name: 'Stem Cell Research',
    description: 'Investigation into stem cell differentiation pathways',
    status: 'completed',
    progress: 100,
    responsible: 'Dr. Emily Rodriguez',
    responsibleInitials: 'ER',
    responsibleAvatar: '/avatars/03.png',
    category: 'Cell Biology',
    priority: 'high',
    deadline: '2024-06-10',
    budget: 150000,
    isFavorite: false,
    isArchived: false,
  },
  {
    id: '4',
    name: 'New Antibiotic Development',
    description: 'Screening for novel antibiotic compounds',
    status: 'paused',
    progress: 60,
    responsible: 'Dr. James Wilson',
    responsibleInitials: 'JW',
    responsibleAvatar: '/avatars/04.png',
    category: 'Pharmacology',
    priority: 'low',
    deadline: '2025-01-20',
    budget: 75000,
    isFavorite: true,
    isArchived: true,
  },
]