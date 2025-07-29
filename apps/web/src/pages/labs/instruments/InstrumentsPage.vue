<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Instruments
          </h1>
          <p class="text-muted-foreground mt-1">
            Manage and reserve lab instruments
          </p>
        </div>
        <Button @click="openNewInstrumentDialog">
          <Plus class="h-4 w-4 mr-2" />
          New Instrument
        </Button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-blue-100 p-2 rounded-lg">
            <Box class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Total instruments
            </p>
            <p class="text-xl font-bold">
              {{ totalInstruments }}
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
              Operational
            </p>
            <p class="text-xl font-bold">
              {{ operationalInstruments }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-orange-100 p-2 rounded-lg">
            <Wrench class="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Under maintenance
            </p>
            <p class="text-xl font-bold">
              {{ maintenanceInstruments }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-red-100 p-2 rounded-lg">
            <AlertTriangle class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              Maintenance due
            </p>
            <p class="text-xl font-bold">
              {{ maintenanceDueInstruments }}
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
          placeholder="Search by name, brand, model, serial number or location..."
          class="pl-10"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Statuses
          </SelectItem>
          <SelectItem value="available">
            Available
          </SelectItem>
          <SelectItem value="in-use">
            In Use
          </SelectItem>
          <SelectItem value="maintenance">
            In Maintenance
          </SelectItem>
          <SelectItem value="broken">
            Broken
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="filterCategory">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Categories
          </SelectItem>
          <SelectItem value="Microscopes">
            Microscopes
          </SelectItem>
          <SelectItem value="Centrifuges">
            Centrifuges
          </SelectItem>
          <SelectItem value="Spectrophotometers">
            Spectrophotometers
          </SelectItem>
          <SelectItem value="PCR">
            PCR
          </SelectItem>
          <SelectItem value="Other">
            Other
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Instruments Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="instrument in filteredInstruments"
              :key="instrument.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="navigateToInstrumentDetail(instrument.id)"
            >
              <TableCell>{{ instrument.serial_number }}</TableCell>
              <TableCell>
                <div class="font-medium">
                  {{ instrument.name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ instrument.manufacturer }} - {{ instrument.model }}
                </div>
              </TableCell>
              <TableCell>{{ instrument.category }}</TableCell>
              <TableCell>{{ instrument.location }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(instrument.status)">
                  {{ getStatusLabel(instrument.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Button variant="ghost" size="sm" @click.stop="openEditInstrumentDialog(instrument.id)">
                    <Edit class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Box, CheckCircle2, Wrench, AlertTriangle } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockInstruments } from '@/mocks/instruments.mock'

// Reactive state
const searchQuery = ref('')
const filterCategory = ref('all')
const filterStatus = ref('all')

// Instruments data
const instruments = ref(mockInstruments)

// Stats
const totalInstruments = computed(() => instruments.value.length)
const operationalInstruments = computed(() => instruments.value.filter(i => i.status === 'available' || i.status === 'in-use').length)
const maintenanceInstruments = computed(() => instruments.value.filter(i => i.status === 'maintenance').length)
const maintenanceDueInstruments = computed(() => instruments.value.filter(i => i.maintenanceDue).length)


// Instrument filtering
const filteredInstruments = computed(() => {
  let filtered = instruments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(instrument => 
      instrument.serial_number?.toLowerCase().includes(query) ||
      instrument.name.toLowerCase().includes(query) ||
      instrument.manufacturer.toLowerCase().includes(query) ||
      instrument.model.toLowerCase().includes(query) ||
      instrument.location?.toLowerCase().includes(query)
    )
  }

  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(instrument => instrument.category === filterCategory.value)
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(instrument => instrument.status === filterStatus.value)
  }

  return filtered
})

// Methods
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'available': 'Available',
    'in-use': 'In Use',
    'maintenance': 'In Maintenance',
    'broken': 'Broken'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    'available': 'default',
    'in-use': 'secondary',
    'maintenance': 'outline',
    'broken': 'destructive'
  }
  return variants[status] || 'default'
}

const openNewInstrumentDialog = () => {
  // TODO: Implement opening the dialog to add a new instrument
  console.log('Open dialog to add new instrument')
}

const openEditInstrumentDialog = (instrumentId: string) => {
  // TODO: Implement opening the dialog to edit an instrument
  console.log('Open dialog to edit instrument:', instrumentId)
}

const navigateToInstrumentDetail = (instrumentId: string) => {
  // TODO: Implement navigation to the instrument detail page
  console.log('Navigate to instrument detail page:', instrumentId)
}
</script>
