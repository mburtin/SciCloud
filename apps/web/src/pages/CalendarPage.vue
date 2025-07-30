<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Calendar
          </h1>
          <p class="text-muted-foreground mt-1">
            Detailed Schedule - 3-Day View ({{ dateRange }})
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="icon" @click="previousDay">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" @click="nextDay">
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button>
            <Plus class="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>
    </div>

    <!-- Calendar Content -->
    <Card class="w-full">
      <CardHeader class="pb-2">
        <!-- Day Headers -->
        <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4">
          <div class="text-right pr-4">
&nbsp;
          </div> <!-- Spacer for alignment -->
          <div v-for="day in displayedDays" :key="day.date" class="text-center py-2">
            <p class="font-semibold">
              {{ day.name }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ day.eventCount }} event(s)
            </p>
          </div>
        </div>
      </CardHeader>
    <CardContent>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 border-t border-border mt-2">
        <!-- Hour Labels -->
        <div class="grid grid-rows-10 text-sm text-muted-foreground text-right pr-4">
          <div v-for="hour in hours" :key="hour" class="h-24 border-b border-border flex items-center justify-end">
            {{ hour }}:00
          </div>
        </div>

        <!-- Day Columns -->
        <div v-for="day in displayedDays" :key="day.date" class="relative grid grid-rows-10 border-l border-border">
          <!-- Hour Cells for grid lines -->
          <div v-for="hour in hours" :key="hour" class="h-24 border-b border-border" />

          <!-- Events -->
          <div
            v-for="event in day.events"
            :key="event.id" 
            class="absolute left-2 right-2 p-2 rounded-lg shadow-md flex flex-col justify-center" 
            :style="getEventStyle(event)" 
            :class="event.colorClass.bg"
          >
            <p class="font-semibold text-sm truncate">
              {{ event.title }}
            </p>
            <div class="flex items-center gap-1.5 text-xs">
              <Clock class="h-3 w-3" />
              <span>{{ event.startTime }} - {{ event.endTime }}</span>
            </div>
            <Badge :class="[event.colorClass.badge, 'absolute top-2 right-2']">
              {{ event.category }}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next';
import { format, addDays, subDays } from 'date-fns';

// --- Types --- //
interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  colorClass: { bg: string; badge: string; };
  date: string;
}

interface Day {
  date: string;
  name: string;
  eventCount: number;
  events: CalendarEvent[];
}

// --- Data --- //
const hours = ref(Array.from({ length: 10 }, (_, i) => (i + 8).toString().padStart(2, '0')));

const colorClasses = {
  Maintenance: { bg: 'bg-yellow-100/80 border border-yellow-300/80 text-yellow-900', badge: 'bg-yellow-200 text-yellow-800' },
  Experiment: { bg: 'bg-red-100/80 border border-red-300/80 text-red-900', badge: 'bg-red-200 text-red-800' },
  Training: { bg: 'bg-green-100/80 border border-green-300/80 text-green-900', badge: 'bg-green-200 text-green-800' },
  Meeting: { bg: 'bg-blue-100/80 border border-blue-300/80 text-blue-900', badge: 'bg-blue-200 text-blue-800' },
};

const currentDate = ref(new Date('2025-01-09')); // Center the view on the middle day

const allEvents = ref<CalendarEvent[]>([
  { id: 1, title: 'Microbiological analysis', startTime: '09:00', endTime: '12:00', category: 'Experiment', colorClass: colorClasses.Experiment, date: '2025-01-08' },
  { id: 2, title: 'WQA project team meeting', startTime: '14:00', endTime: '15:30', category: 'Meeting', colorClass: colorClasses.Meeting, date: '2025-01-08' },
  { id: 3, title: 'Preventive spectrometer maintenance', startTime: '08:00', endTime: '10:00', category: 'Maintenance', colorClass: colorClasses.Maintenance, date: '2025-01-09' },
  { id: 4, title: 'New protocols safety training', startTime: '10:30', endTime: '12:00', category: 'Training', colorClass: colorClasses.Training, date: '2025-01-09' },
  { id: 5, title: 'Material resistance testing', startTime: '13:30', endTime: '17:00', category: 'Experiment', colorClass: colorClasses.Experiment, date: '2025-01-09' },
  { id: 6, title: 'Quantitative PCR analysis', startTime: '09:30', endTime: '11:00', category: 'Experiment', colorClass: colorClasses.Experiment, date: '2025-01-10' },
  { id: 7, title: 'Sensor project meeting', startTime: '15:00', endTime: '16:30', category: 'Meeting', colorClass: colorClasses.Meeting, date: '2025-01-10' },
]);

const displayedDays = computed<Day[]>(() => {
  const start = subDays(currentDate.value, 1);
  return Array.from({ length: 3 }).map((_, i) => {
    const dayDate = addDays(start, i);
    const isoDate = format(dayDate, 'yyyy-MM-dd');
    const dayEvents = allEvents.value.filter(e => e.date === isoDate);
    return {
      date: isoDate,
      name: format(dayDate, 'E, MMM d'),
      eventCount: dayEvents.length,
      events: dayEvents,
    };
  });
});

const dateRange = computed(() => {
  const start = displayedDays.value[0];
  const end = displayedDays.value[2];
  if (!start || !end) return '';
  return `${format(new Date(start.date), 'MMMM d')} - ${format(new Date(end.date), 'MMMM d, yyyy')}`;
});

// --- Methods --- //
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const previousDay = () => {
  currentDate.value = subDays(currentDate.value, 1);
};

const nextDay = () => {
  currentDate.value = addDays(currentDate.value, 1);
};

const getEventStyle = (event: CalendarEvent) => {
  const startMinutes = timeToMinutes(event.startTime) - timeToMinutes('08:00');
  const endMinutes = timeToMinutes(event.endTime) - timeToMinutes('08:00');
  const durationMinutes = endMinutes - startMinutes;

  const top = (startMinutes / 60) * 6; // 6rem per hour (h-24)
  const height = (durationMinutes / 60) * 6;

  return {
    top: `${top}rem`,
    height: `${height}rem`,
  };
};

</script>
