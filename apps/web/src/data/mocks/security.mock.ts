export interface ActiveSession {
  id: string
  device: string
  location: string
  lastActive: string
  isCurrent: boolean
}

export const mockActiveSessions: ActiveSession[] = [
  {
    id: '1',
    device: 'Chrome on macOS',
    location: 'New York, US',
    lastActive: '10 minutes ago',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'London, UK',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
]