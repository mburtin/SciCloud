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
              <TableCell>{{ calculateAge(animal.birthDate) }}</TableCell>
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

  <!-- New Animal Dialog -->
  <Dialog v-model:open="isNewAnimalDialogOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Add New Animal</DialogTitle>
        <DialogDescription>
          Fill in the details for the new animal.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="species" class="text-right">Species</Label>
          <Input id="species" v-model="newAnimalForm.species" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="strain" class="text-right">Strain</Label>
          <Input id="strain" v-model="newAnimalForm.strain" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="age" class="text-right">Age (weeks)</Label>
          <Input
            id="age"
            v-model.number="newAnimalForm.age"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="sex" class="text-right">Sex</Label>
          <Select v-model="newAnimalForm.sex">
            <SelectTrigger class="col-span-3">
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">
                Male
              </SelectItem>
              <SelectItem value="female">
                Female
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="project" class="text-right">Project</Label>
          <Input id="project" v-model="newAnimalForm.project" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isNewAnimalDialogOpen = false">
          Cancel
        </Button>
        <Button @click="handleCreateAnimal">
          Save Animal
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit Animal Dialog -->
  <Dialog v-model:open="isEditDialogOpen">
    <DialogContent v-if="editingAnimal" class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Animal</DialogTitle>
        <DialogDescription>
          Update the details for animal ID: {{ editingAnimal.id }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-species" class="text-right">Species</Label>
          <Input id="edit-species" v-model="editingAnimal.species" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-strain" class="text-right">Strain</Label>
          <Input id="edit-strain" v-model="editingAnimal.strain" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-age" class="text-right">Age (weeks)</Label>
          <Input
            id="edit-age"
            v-model.number="editingAnimal.age"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-project" class="text-right">Project</Label>
          <Input id="edit-project" v-model="editingAnimal.project" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-status" class="text-right">Status</Label>
          <Select v-model="editingAnimal.status">
            <SelectTrigger class="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
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
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isEditDialogOpen = false">
          Cancel
        </Button>
        <Button @click="handleUpdateAnimal">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label';
import { mockAnimals } from '@/mocks/animals.mock';
import type { Animal } from '@/types/lab';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Reactive state
const searchQuery = ref('')
const filterSpecies = ref('all')
const filterStatus = ref('all')
const filterProject = ref('all');
const router = useRouter();

// Animals data
const animals = ref<Animal[]>(mockAnimals)
  

// Stats
const totalAnimals = computed(() => animals.value.length)
const aliveAnimals = computed(() => animals.value.filter(a => a.status === 'alive').length)
const experimentAnimals = computed(() => animals.value.filter(a => a.status === 'experimental').length)
const healthMonitoringAnimals = computed(() => animals.value.filter(a => a.healthStatus === 'concerning' || a.healthStatus === 'critical').length)
const upcomingExamsAnimals = computed(() => animals.value.filter(a => a.nextExamDate && new Date(a.nextExamDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length)

// Filter animals
const filteredAnimals = computed(() => {
  let filtered = animals.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(animal => 
      animal.identifier.toLowerCase().includes(query) ||
      animal.species.toLowerCase().includes(query) ||
      (animal.strain && animal.strain.toLowerCase().includes(query)) ||
      (animal.veterinarian && animal.veterinarian.toLowerCase().includes(query))
    )
  }

  if (filterSpecies.value !== 'all') {
    const speciesMap: Record<string, string> = {
      'mouse': 'Mus musculus',
      'rat': 'Rattus norvegicus',
      'rabbit': 'Oryctolagus cuniculus'
    }
    filtered = filtered.filter(animal => animal.species === speciesMap[filterSpecies.value])
  }

  if (filterStatus.value !== 'all') {
    const statusMap: Record<string, string> = {
      'active': 'alive',
      'experiment': 'experimental'
    }
    const mappedStatus = statusMap[filterStatus.value] || filterStatus.value
    filtered = filtered.filter(animal => animal.status === mappedStatus)
  }

  if (filterProject.value !== 'all') {
    filtered = filtered.filter(animal => 
      animal.protocols.includes(filterProject.value) ||
      animal.experimentalGroup === filterProject.value
    )
  }

  return filtered
})

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isNewAnimalDialogOpen = ref(false)
const newAnimalForm = ref<Partial<Animal>>({})

const resetNewAnimalForm = () => {
  newAnimalForm.value = {
    id: `M${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
    species: 'Mouse',
    strain: '',
    age: 8,
    sex: 'male',
    status: 'active',
    project: '',
    lastUpdated: new Date().toISOString(),
    healthMonitoring: false,
    upcomingExams: false,
  }
}

const openNewAnimalDialog = () => {
  resetNewAnimalForm()
  isNewAnimalDialogOpen.value = true
}

const handleCreateAnimal = () => {
  animals.value.unshift(newAnimalForm.value as Animal)
  isNewAnimalDialogOpen.value = false
}

const isEditDialogOpen = ref(false);
const editingAnimal = ref<Animal | null>(null);

const openEditAnimalDialog = (animal: Animal) => {
  editingAnimal.value = JSON.parse(JSON.stringify(animal));
  isEditDialogOpen.value = true;
};

const handleUpdateAnimal = () => {
  if (!editingAnimal.value) return;
  const index = animals.value.findIndex(a => a.id === editingAnimal.value!.id);
  if (index !== -1) {
    animals.value[index] = editingAnimal.value;
  }
  isEditDialogOpen.value = false;
};

const handleDeleteAnimal = (animalId: string) => {
  if (confirm('Are you sure you want to delete this animal?')) {
    animals.value = animals.value.filter(a => a.id !== animalId);
  }
};

const navigateToAnimalDetail = (animalId: string) => {
  router.push({ name: 'lab-animal-detail', params: { id: animalId } });
}
</script>
