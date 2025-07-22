import { Briefcase, FileText, Users, Award } from 'lucide-vue-next'
import type { User } from '@/types/user'

export const mockUserProfile: User = {
  id: 'user-profile-001',
  // Propriétés de base
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@sciencelab.com',
  role: 'user',
  avatar_url: '/avatars/jane-doe.jpg',
  // Propriétés de profil étendues
  biography: 'Senior Research Scientist with a focus on molecular biology. Experienced in leading cross-functional teams to deliver cutting-edge scientific discoveries.',
  phone: '+1 415 555 0101',
  location: 'San Francisco, CA',
  fullAddress: '123 Lab Street, San Francisco, CA 94105',
  created_at: '2024-01-01T08:00:00Z',
  updated_at: '2024-07-20T15:30:00Z',
  stats: [
    {
      label: 'Completed projects',
      value: 23,
      icon: Award
    },
    {
      label: 'Active projects',
      value: 4,
      icon: Briefcase
    },
    {
      label: 'Publications',
      value: 18,
      icon: FileText
    },
    {
      label: 'Collaborations',
      value: 12,
      icon: Users
    }
  ]
}