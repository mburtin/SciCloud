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
    <div class="grid layout-standard-grid layout-section-gap">
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
          <SelectItem
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
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
              <TableCell>{{ instrument.serial_number || 'N/A' }}</TableCell>
              <TableCell>
                <div class="font-medium">
                  {{ instrument.name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ instrument.manufacturer }} - {{ instrument.model }}
                </div>
              </TableCell>
              <TableCell>{{ instrument.category }}</TableCell>
              <TableCell>{{ instrument.location || 'N/A' }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(instrument.status)">
                  {{ getStatusLabel(instrument.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" @click.stop>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditInstrumentDialog(instrument.id)">
                      <Edit class="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click="handleDeleteInstrument(instrument.id)"
                      class="text-red-600 focus:text-red-600"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
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

    <!-- Instrument Dialog -->
    <InstrumentDialog
      :open="showInstrumentDialog"
      :mode="dialogMode"
      :instrument="selectedInstrument"
      @update:open="showInstrumentDialog = $event"
      @save="handleSaveInstrument"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Box, CheckCircle2, Wrench, AlertTriangle, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInstrumentsStore } from '@/stores/instruments.store'
import InstrumentDialog from '@/components/labs/InstrumentDialog.vue'
import type { InstrumentStatus, Instrument, InstrumentInsert } from '@/types/supabase'

// Store
const instrumentsStore = useInstrumentsStore()

// Computed properties from store
const filteredInstruments = computed(() => instrumentsStore.filteredInstruments)
const stats = computed(() => instrumentsStore.stats)
const categories = computed(() => instrumentsStore.categories)
const loading = computed(() => instrumentsStore.loading)
const error = computed(() => instrumentsStore.error)

// Filters
const searchQuery = computed({
  get: () => instrumentsStore.searchQuery,
  set: (value: string) => instrumentsStore.setSearchQuery(value)
})

const filterCategory = computed({
  get: () => instrumentsStore.categoryFilter,
  set: (value: string | 'all') => instrumentsStore.setCategoryFilter(value)
})

const filterStatus = computed({
  get: () => instrumentsStore.statusFilter,
  set: (value: InstrumentStatus | 'all') => instrumentsStore.setStatusFilter(value)
})

// Stats (using store)
const totalInstruments = computed(() => stats.value.total)
const operationalInstruments = computed(() => stats.value.operational)
const maintenanceInstruments = computed(() => stats.value.maintenance)
const maintenanceDueInstruments = computed(() => stats.value.maintenanceDue)

// Dialog state
const showInstrumentDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedInstrument = ref<Instrument | null>(null)

// Initialize data
onMounted(() => {
  instrumentsStore.fetchInstruments()
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
  dialogMode.value = 'create'
  selectedInstrument.value = null
  showInstrumentDialog.value = true
}

const openEditInstrumentDialog = (instrumentId: string) => {
  const instrument = filteredInstruments.value.find(i => i.id === instrumentId)
  if (instrument) {
    dialogMode.value = 'edit'
    selectedInstrument.value = instrument
    showInstrumentDialog.value = true
  }
}

const navigateToInstrumentDetail = (instrumentId: string) => {
  // TODO: Implement navigation to the instrument detail page
  console.log('Navigate to instrument detail page:', instrumentId)
}

const handleSaveInstrument = async (instrumentData: Instrument | InstrumentInsert) => {
  try {
    if (dialogMode.value === 'create') {
      await instrumentsStore.createInstrument(instrumentData as InstrumentInsert)
    } else {
      await instrumentsStore.updateInstrument(selectedInstrument.value!.id, instrumentData as any)
    }
  } catch (error) {
    console.error('Error saving instrument:', error)
  }
}

const handleDeleteInstrument = async (instrumentId: string) => {
  const instrument = filteredInstruments.value.find(i => i.id === instrumentId)
  if (!instrument) return

  const confirmDelete = confirm(`Are you sure you want to delete "${instrument.name}"? This action cannot be undone.`)
  if (!confirmDelete) return

  try {
    const success = await instrumentsStore.deleteInstrument(instrumentId)
    if (success) {
      console.log('Instrument deleted successfully')
    }
  } catch (error) {
    console.error('Error deleting instrument:', error)
  }
}
</script>
