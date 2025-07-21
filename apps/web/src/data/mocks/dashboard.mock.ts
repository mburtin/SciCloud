import {
  FolderOpen, AlertTriangle, Users, Clock, TrendingUp, BarChart, CheckCircle
} from 'lucide-vue-next'

export interface StatCard {
  title: string
  value: string
  icon: any
  trendText: string
  trendIcon: any
  trendClass: string
}

export interface RecentProject {
  initials: string
  name: string
  category: string
  progress: number
}

export interface Deadline {
  task: string
  time: string
  status: string
  variant: 'destructive' | 'secondary' | 'outline' | 'default'
}

export const mockStatCards: StatCard[] = [
  {
    title: 'Active projects',
    value: '12',
    icon: FolderOpen,
    trendText: '+2 since last month',
    trendIcon: TrendingUp,
    trendClass: 'text-green-500'
  },
  {
    title: 'Ongoing analyses',
    value: '247',
    icon: AlertTriangle,
    trendText: '34 completed this week',
    trendIcon: BarChart,
    trendClass: 'text-blue-500'
  },
  {
    title: 'Active team',
    value: '8',
    icon: Users,
    trendText: 'All connected',
    trendIcon: CheckCircle,
    trendClass: 'text-green-500'
  },
  {
    title: 'Deadlines',
    value: '3',
    icon: Clock,
    trendText: 'This week',
    trendIcon: AlertTriangle,
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