<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Animals
          </h1>
          <p class="text-muted-foreground mt-1">
            Manage and track laboratory animals.
          </p>
        </div>
        <Button @click="openNewAnimalDialog">
          <Plus class="h-4 w-4 mr-2" />
          New Animal
        </Button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-blue-100 p-2 rounded-lg">
            <Users class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Total animals
            </p>
            <p class="text-xl font-bold">
              {{ totalAnimals }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-green-100 p-2 rounded-lg">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Alive
            </p>
            <p class="text-xl font-bold">
              {{ aliveAnimals }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-purple-100 p-2 rounded-lg">
            <FlaskConical class="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              In experimentation
            </p>
            <p class="text-xl font-bold">
              {{ experimentAnimals }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-orange-100 p-2 rounded-lg">
            <HeartPulse class="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Health monitoring
            </p>
            <p class="text-xl font-bold">
              {{ healthMonitoringAnimals }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-yellow-100 p-2 rounded-lg">
            <CalendarDays class="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Upcoming exams
            </p>
            <p class="text-xl font-bold">
              {{ upcomingExamsAnimals }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Filters -->
    <div class="bg-card border rounded-lg p-4 flex items-center gap-4">
      <div class="relative w-full max-w-sm">
        <Input
          v-model="searchQuery"
          placeholder="Search by ID, species, strain, veterinarian..."
          class="pl-10"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <Select v-model="filterSpecies">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All species" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Species
          </SelectItem>
          <SelectItem value="mouse">
            Mouse
          </SelectItem>
          <SelectItem value="rat">
            Rat
          </SelectItem>
          <SelectItem value="rabbit">
            Rabbit
          </SelectItem>
          <SelectItem value="other">
            Other
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Statuses
          </SelectItem>
          <SelectItem value="active">
            Active
          </SelectItem>
          <SelectItem value="quarantine">
            Quarantine
          </SelectItem>
          <SelectItem value="experiment">
            In Experiment
          </SelectItem>
          <SelectItem value="archived">
            Archived
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="filterProject">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Projects
          </SelectItem>
          <SelectItem value="Project Alpha">
            Project Alpha
          </SelectItem>
          <SelectItem value="Project Beta">
            Project Beta
          </SelectItem>
          <SelectItem value="Project Gamma">
            Project Gamma
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Animals Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="animal in filteredAnimals"
              :key="animal.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="navigateToAnimalDetail(animal.id)"
            >
              <TableCell>{{ animal.identifier }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ getSpeciesLabel(animal.species) }}</span>
                  <Badge v-if="animal.strain" variant="outline">
                    {{ animal.strain }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{{ calculateAge(animal.birth_date) }}</TableCell>
              <TableCell>{{ animal.sex === 'male' ? 'M' : 'F' }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(animal.status)">
                  {{ getStatusLabel(animal.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div v-if="animal.protocols.length > 0" class="text-sm">
                  {{ animal.protocols[0] }}
                </div>
                <div v-else class="text-sm text-muted-foreground">
                  No protocol
                </div>
              </TableCell>
              <TableCell>{{ formatDate(animal.updated_at) }}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" class="h-8 w-8 p-0" @click.stop>
                      <span class="sr-only">Open menu</span>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem @click="navigateToAnimalDetail(animal.id)">
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="openEditAnimalDialog(animal)">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-500" @click="handleDeleteAnimal(animal.id)">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>

  <!-- Animal Form Dialogs -->
  <AnimalFormDialog
    v-model:open="isNewAnimalDialogOpen"
    mode="create"
    @save="handleCreateAnimal"
  />

  <AnimalFormDialog
    v-model:open="isEditDialogOpen"
    mode="edit"
    :animal="editingAnimal"
    @save="handleUpdateAnimal"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Users,
  CheckCircle2,
  FlaskConical,
  HeartPulse,
  CalendarDays
} from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAnimalsStore } from '@/stores/animals.store'
import type { Animal, AnimalInsert } from '@/types/supabase'
import AnimalFormDialog from '@/components/labs/AnimalFormDialog.vue'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/utils/format.utils'

// Router and store
const router = useRouter()
const animalsStore = useAnimalsStore()

// Initialize animals data
onMounted(() => {
  animalsStore.fetchAnimals()
})

// Stats (using store computed values)
const totalAnimals = computed(() => animalsStore.stats.total)
const aliveAnimals = computed(() => animalsStore.stats.alive)
const experimentAnimals = computed(() => animalsStore.stats.experimental)
const healthMonitoringAnimals = computed(() => animalsStore.stats.concerning + animalsStore.stats.critical)
const upcomingExamsAnimals = computed(() => 
  animalsStore.animals.filter(a => 
    a.next_exam_date && new Date(a.next_exam_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length
)

// Filters (connected to store)
const searchQuery = computed({
  get: () => animalsStore.searchQuery,
  set: (value: string) => animalsStore.setSearchQuery(value)
})

const filterSpecies = computed({
  get: () => animalsStore.speciesFilter,
  set: (value: string) => animalsStore.setSpeciesFilter(value)
})

const filterStatus = computed({
  get: () => animalsStore.statusFilter,
  set: (value: any) => animalsStore.setStatusFilter(value)
})

// For now, we'll create a basic project filter
const filterProject = ref('all')

// Use store filtered animals directly
const filteredAnimals = computed(() => animalsStore.filteredAnimals)

// Methods
const getSpeciesLabel = (species: string) => {
  const speciesLabels: Record<string, string> = {
    'Mus musculus': 'Mouse',
    'Rattus norvegicus': 'Rat',
    'Oryctolagus cuniculus': 'Rabbit',
    'Cavia porcellus': 'Guinea Pig'
  }
  return speciesLabels[species] || species
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'alive': 'Alive',
    'deceased': 'Deceased',
    'transferred': 'Transferred',
    'experimental': 'In Experiment'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    'alive': 'default',
    'deceased': 'destructive',
    'transferred': 'outline',
    'experimental': 'secondary'
  }
  return variants[status] || 'default'
}

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  const diffInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 3600 * 24))
  
  if (diffInDays < 30) {
    return `${diffInDays} days`
  } else if (diffInDays < 365) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} weeks`
  } else {
    const years = Math.floor(diffInDays / 365)
    const months = Math.floor((diffInDays % 365) / 30)
    return `${years}y ${months}m`
  }
}


const isNewAnimalDialogOpen = ref(false)

const openNewAnimalDialog = () => {
  isNewAnimalDialogOpen.value = true
}

const handleCreateAnimal = async (animalData: AnimalInsert) => {
  const result = await animalsStore.createAnimal(animalData)
  if (result) {
    isNewAnimalDialogOpen.value = false
  }
}

const isEditDialogOpen = ref(false);
const editingAnimal = ref<any>(null);

const openEditAnimalDialog = (animal: Animal) => {
  editingAnimal.value = JSON.parse(JSON.stringify(animal));
  isEditDialogOpen.value = true;
};

const handleUpdateAnimal = async (animalData: Animal | AnimalInsert) => {
  if ('id' in animalData && animalData.id) {
    const result = await animalsStore.updateAnimal(animalData.id, animalData as Animal)
    if (result) {
      isEditDialogOpen.value = false
    }
  }
}

const handleDeleteAnimal = async (animalId: string) => {
  if (confirm('Are you sure you want to delete this animal?')) {
    await animalsStore.deleteAnimal(animalId)
  }
}

const navigateToAnimalDetail = (animalId: string) => {
  router.push({ name: 'lab-animal-detail', params: { id: animalId } });
}
</script>
