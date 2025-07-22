import { Session, AuthUser } from '@/types/auth'

export const mockActiveSessions: Session[] = [
  {
    id: '1',
    user: {} as AuthUser,
    device: 'Chrome on macOS',
    location: 'New York, US',
    lastActive: '10 minutes ago',
    isActive: true,
  },
  {
    id: '2',
    user: {} as AuthUser,
    device: 'Safari on iPhone',
    location: 'London, UK',
    lastActive: '2 hours ago',
    isActive: false,
  },
]