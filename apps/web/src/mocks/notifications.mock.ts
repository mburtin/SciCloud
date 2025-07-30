import type { Notification } from '@/types/notifications'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'project',
    title: 'New results available',
    message: 'Results for experiment EXP-08A are ready for review. The analysis shows promising patterns that require immediate attention.',
    read: false,
    timestamp: '2024-01-30T10:30:00Z',
    priority: 'high'
  },
  {
    id: '2',
    type: 'system',
    title: 'Maintenance reminder',
    message: 'Spectrometer SPEC-02 is scheduled for maintenance tomorrow from 14:00 to 16:00.',
    read: true,
    timestamp: '2024-01-29T18:00:00Z',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'system',
    title: 'Low stock alert',
    message: 'Reagents for PCR analysis are running low. Current stock: 15 units remaining.',
    read: false,
    timestamp: '2024-01-30T09:15:00Z',
    priority: 'high'
  },
  {
    id: '4',
    type: 'collaboration',
    title: 'New team member',
    message: 'Dr. Sophie Laurent has joined the "Microbiological Study" project team.',
    read: false,
    timestamp: '2024-01-30T08:45:00Z',
    priority: 'medium'
  },
  {
    id: '5',
    type: 'document',
    title: 'Report shared',
    message: 'A new analysis report has been added to the "Water Quality Analysis" project documents.',
    read: true,
    timestamp: '2024-01-29T16:20:00Z',
    priority: 'low'
  },
  {
    id: '6',
    type: 'project',
    title: 'Deadline approaching',
    message: 'The "Chemical Analysis" project phase 2 must be completed in 3 days.',
    read: false,
    timestamp: '2024-01-29T14:30:00Z',
    priority: 'high'
  },
  {
    id: '7',
    type: 'collaboration',
    title: 'Review request',
    message: 'Dr. Martin has requested your review on the latest experiment protocols.',
    read: true,
    timestamp: '2024-01-29T11:15:00Z',
    priority: 'medium'
  }
]