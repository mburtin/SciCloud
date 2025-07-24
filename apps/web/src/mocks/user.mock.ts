import type { User } from '@/types/user'

export const mockUser: Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar: string } = {
  firstName: 'Dr. Evelyn',
  lastName: 'Reed',
  email: 'e.reed@scicloud.com',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
}