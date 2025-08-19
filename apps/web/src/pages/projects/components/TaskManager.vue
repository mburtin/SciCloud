<template>
  <div>
    <NewTaskDialog :open="isNewTaskDialogOpen" @update:open="isNewTaskDialogOpen = $event"
      @task-added="handleTaskAdded" />
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">
          Project Tasks
        </h3>
        <Button size="sm" @click="isNewTaskDialogOpen = true">
          <Plus class="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="task in tasks" :key="task.id">
                <TableCell class="font-medium">
                  {{ task.name }}
                </TableCell>
                <TableCell>{{ task.assignee }}</TableCell>
                <TableCell>{{ task.dueDate }}</TableCell>
                <TableCell>
                  <Badge :variant="task.status === 'Completed' ? 'default' : 'secondary'">
                    {{ task.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Plus } from 'lucide-vue-next';
import { ref } from 'vue';
import NewTaskDialog from './NewTaskDialog.vue';

const isNewTaskDialogOpen = ref(false);

const handleTaskAdded = (newTask: any) => {
  tasks.value.unshift(newTask);
};

const tasks = ref([
  {
    id: '1',
    name: 'Initial research and data gathering',
    assignee: 'Dr. Alice Martin',
    dueDate: '2024-08-15',
    status: 'In Progress',
  },
  {
    id: '2',
    name: 'Develop experimental protocol',
    assignee: 'Dr. Ben Carter',
    dueDate: '2024-08-20',
    status: 'In Progress',
  },
  {
    id: '3',
    name: 'Procure necessary lab equipment',
    assignee: 'Lab Manager',
    dueDate: '2024-08-10',
    status: 'Completed',
  },
  {
    id: '4',
    name: 'Peer review of the protocol',
    assignee: 'Dr. Chloe Adams',
    dueDate: '2024-08-25',
    status: 'Not Started',
  },
]);
</script>
