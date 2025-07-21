<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Start date
              </p>
              <p class="flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Jan 15, 2024
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                End date
              </p>
              <p class="flex items-center gap-2">
                <Calendar class="h-4 w-4" /> Dec 15, 2024
              </p>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Funding
            </p>
            <p>€ 25,000 €</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Project summary
            </p>
            <p>Study of microbiological contamination in surface water</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Team</CardTitle>
          <CardDescription>Leaders and collaborators</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="member in team" :key="member.name" class="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{{ member.initials }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="font-semibold">
                {{ member.name }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ member.role }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from 'lucide-vue-next';

const team = ref([
  { name: 'Dr. Marie Dubois', role: 'Principal Investigator', initials: 'MD' },
  { name: 'Prof. Jean Martin', role: 'Co-investigator', initials: 'JM' },
  { name: 'Alice Chen', role: 'PhD Student', initials: 'AC' },
]);
</script>
