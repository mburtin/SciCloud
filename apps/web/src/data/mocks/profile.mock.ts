import { Briefcase, FileText, Users, Award } from 'lucide-vue-next'

export interface UserProfile {
  firstName: string
  lastName: string
  initials: string
  avatarUrl: string
  biography: string
  email: string
  phone: string
  location: string
  fullAddress: string
  stats: UserStat[]
}

export interface UserStat {
  label: string
  value: number
  icon: any
}

export const mockUserProfile: UserProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  initials: 'JD',
  avatarUrl: '/avatars/jane-doe.jpg', // Placeholder image
  biography: 'Senior Research Scientist with a focus on molecular biology. Experienced in leading cross-functional teams to deliver cutting-edge scientific discoveries.',
  email: 'jane.doe@sciencelab.com',
  phone: '+1 415 555 0101',
  location: 'San Francisco, CA',
  fullAddress: '123 Lab Street, San Francisco, CA 94105',
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