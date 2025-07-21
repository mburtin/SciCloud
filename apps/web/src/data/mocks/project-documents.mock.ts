export interface ProjectDocument {
  name: string
  type: string
  description: string
  uploadDate: string
  uploader: string
  size: string
  tags: string[]
  icon: any
}

export const mockProjectDocuments: ProjectDocument[] = [
  {
    name: 'Protocole_Recherche_V3.pdf',
    type: 'Report',
    description: 'Project PDF document for Water Quality Analysis',
    uploadDate: 'Jun 15, 2024, 02:00 AM',
    uploader: 'System',
    size: '21.0 MB',
    tags: ['pdf', 'project', 'initial'],
    icon: null, // Will be set by getFileIcon in component
  },
  {
    name: 'Resultats_Analyse.xlsx',
    type: 'Data',
    description: 'Project Excel document for Water Quality Analysis',
    uploadDate: 'Jun 20, 2024, 02:00 AM',
    uploader: 'System',
    size: '854.0 KB',
    tags: ['excel', 'project', 'initial'],
    icon: null, // Will be set by getFileIcon in component
  },
  {
    name: 'Rapport_Intermediaire.docx',
    type: 'Protocol',
    description: 'Project Word document for Water Quality Analysis',
    uploadDate: 'Jun 22, 2024, 09:30 AM',
    uploader: 'Dr. Martin',
    size: '1.2 MB',
    tags: ['word', 'protocol', 'draft'],
    icon: null, // Will be set by getFileIcon in component
  },
]