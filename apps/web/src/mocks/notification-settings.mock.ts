import { FolderKanban, FileText, Users, AlertTriangle, Calendar, Mail } from 'lucide-vue-next'
import type { NotificationSettings } from '@/types/notifications'

export const mockNotificationSettings: NotificationSettings = {
  methods: {
    email: { label: 'Email', enabled: true },
    push: { label: 'Push Notifications', enabled: true },
  },
  types: {
    projectUpdates: { 
      label: 'Project Updates', 
      description: 'Status changes, new tasks, etc.', 
      icon: FolderKanban, 
      enabled: true 
    },
    documentUpdates: { 
      label: 'Documents & Files', 
      description: 'New documents, modifications.', 
      icon: FileText, 
      enabled: true 
    },
    collaborationRequests: { 
      label: 'Collaboration Requests', 
      description: 'Invitations to join projects.', 
      icon: Users, 
      enabled: true 
    },
    systemAlerts: { 
      label: 'System Alerts', 
      description: 'Security alerts, system updates.', 
      icon: AlertTriangle, 
      enabled: true 
    },
    deadlineReminders: { 
      label: 'Deadline Reminders', 
      description: 'Upcoming task deadlines.', 
      icon: Calendar, 
      enabled: false 
    },
    weeklyDigest: { 
      label: 'Weekly Digest', 
      description: 'A summary of project activity.', 
      icon: Mail, 
      enabled: false 
    },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
}