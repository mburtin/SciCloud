import type { StatCard } from '@/types/ui'
import type { RecentProject, Deadline } from '@/types/projects'

export const mockStatCards: StatCard[] = [
  {
    title: 'Active projects',
    value: '12',
    icon: 'folder-open',
    trendText: '+2 since last month',
    trendIcon: 'trending-up',
    trendClass: 'text-green-500'
  },
  {
    title: 'Ongoing analyses',
    value: '247',
    icon: 'alert-triangle',
    trendText: '34 completed this week',
    trendIcon: 'bar-chart',
    trendClass: 'text-blue-500'
  },
  {
    title: 'Active team',
    value: '8',
    icon: 'users',
    trendText: 'All connected',
    trendIcon: 'check-circle',
    trendClass: 'text-green-500'
  },
  {
    title: 'Deadlines',
    value: '3',
    icon: 'clock',
    trendText: 'This week',
    trendIcon: 'alert-triangle',
    trendClass: 'text-orange-500'
  }
]

export const mockRecentProjects: RecentProject[] = [
  {
    initials: 'MD',
    name: 'Water Quality Analysis',
    category: 'Microbiology',
    progress: 45
  },
  {
    initials: 'PM',
    name: 'Organic Compound Synthesis',
    category: 'Organic Chemistry',
    progress: 15
  },
  {
    initials: 'SJ',
    name: 'Membrane Protein Study',
    category: 'Biochemistry',
    progress: 78
  }
]

export const mockUpcomingDeadlines: Deadline[] = [
  {
    task: 'Final report - Project Alpha',
    time: 'In 2 days',
    status: 'Urgent',
    variant: 'destructive'
  },
  {
    task: 'Beta protocol review',
    time: 'In 5 days',
    status: 'Normal',
    variant: 'secondary'
  },
  {
    task: 'Equipment training',
    time: 'In 1 week',
    status: 'Planned',
    variant: 'outline'
  }
]