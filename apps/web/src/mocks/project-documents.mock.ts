import type { Documents } from '@/types/documents'

export const mockProjectDocuments: Documents[] = [
  {
    id: 'doc-001',
    name: 'Protocole_Recherche_V3.pdf',
    type: 'Report',
    description: 'Project PDF document for Water Quality Analysis',
    uploadDate: 'Jun 15, 2024, 02:00 AM',
    uploader: 'System',
    size: '21.0 MB',
    tags: ['pdf', 'project', 'initial'],
    icon: null, // Will be set by getFileIcon in component
    created_by: "user-123",
    created_at: '2024-06-15T02:00:00Z',
    updated_by: "user-123",
    updated_at: '2024-06-15T02:00:00Z',
      version: 1,
  },
  {
    id: 'doc-002',
    name: 'Resultats_Analyse.xlsx',
    type: 'Data',
    description: 'Project Excel document for Water Quality Analysis',
    uploadDate: 'Jun 20, 2024, 02:00 AM',
    uploader: 'System',
    size: '854.0 KB',
    tags: ['excel', 'project', 'initial'],
    icon: null, // Will be set by getFileIcon in component
    created_by: "user-123",
    created_at: '2024-06-20T02:00:00Z',
    updated_by: "user-123",
    updated_at: '2024-06-20T02:00:00Z',
      version: 1,
  },
  {
    id: 'doc-003',
    name: 'Rapport_Intermediaire.docx',
    type: 'Protocol',
    description: 'Project Word document for Water Quality Analysis',
    uploadDate: 'Jun 22, 2024, 09:30 AM',
    uploader: 'Dr. Martin',
    size: '1.2 MB',
    tags: ['word', 'protocol', 'draft'],
    icon: null, // Will be set by getFileIcon in component
    created_by: "user-123",
    created_at: '2024-06-22T09:30:00Z',
    updated_by: "user-123",
    updated_at: '2024-06-22T09:30:00Z',
      version: 1,
  },
]