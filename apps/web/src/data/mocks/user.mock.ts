import type { User } from '@/data/types'

export const mockUser: Pick<User, 'name' | 'email'> & { avatar: string } = {
  name: 'Dr. Evelyn Reed',
  email: 'e.reed@scicloud.com',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
}