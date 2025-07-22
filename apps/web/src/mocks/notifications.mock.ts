import type { Notification } from '@/types/notifications'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New results available',
    message: 'Results for experiment EXP-08A are ready for review.',
    read: false,
    timestamp: '2024-01-15T14:30:00Z',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    title: 'Maintenance reminder',
    message: 'Spectrometer SPEC-02 is scheduled for maintenance tomorrow.',
    read: true,
    timestamp: '2024-01-14T18:00:00Z',
    created_at: '2024-01-14T18:00:00Z',
    updated_at: '2024-01-14T18:00:00Z',
  },
  {
    id: '3',
    title: 'Low stock alert',
    message: 'Reagents for PCR analysis are running low.',
    read: false,
    timestamp: '2024-01-15T09:15:00Z',
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T09:15:00Z',
  }
]