<template>
  <div class="space-y-6">
    <!-- Header with navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button variant="ghost" @click="$router.push('/lab/animals')">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to animals
        </Button>
        <div class="h-6 w-px bg-border" />
        <div v-if="animal" class="flex items-center gap-3">
          <PawPrint class="h-8 w-8 text-primary" />
          <div>
            <h1 class="flex items-center gap-2">
              {{ animal.identifier }} - {{ speciesLabels[animal.species as keyof typeof speciesLabels] || animal.species }}
              <Badge variant="outline" class="ml-2">
                {{ animal.sex === 'male' ? '♂' : '♀' }}
              </Badge>
            </h1>
            <p class="text-muted-foreground">
              {{ animal.strain }} • {{ animal.line }} • {{ calculateAge(animal.birth_date) }}
            </p>
          </div>
        </div>
      </div>
      <div v-if="animal" class="flex items-center gap-2">
        <Button variant="outline" @click="editDialogOpen = true">
          <Edit3 class="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="!animal" class="text-center py-12">
      <AlertTriangle class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="font-medium mb-2">Animal not found</h3>
      <p class="text-sm text-muted-foreground">
        The animal with ID "{{ animalId }}" does not exist or has been deleted.
      </p>
    </div>

    <!-- Main content -->
    <div v-if="animal" class="space-y-6">
      <!-- Status and health badges -->
      <div class="flex items-center gap-4">
        <Badge :class="getStatusInfo(animal.status).color">
          {{ getStatusInfo(animal.status).label }}
        </Badge>
        <Badge :class="getHealthStatusInfo(animal.health_status).color">
          <component :is="getHealthStatusInfo(animal.health_status).icon" class="h-3 w-3 mr-1" />
          {{ getHealthStatusInfo(animal.health_status).label }}
        </Badge>
        <Badge variant="outline">
          <UserCheck class="h-3 w-3 mr-1" />
          {{ animal.veterinarian }}
        </Badge>
        <Badge variant="outline">
          <Building class="h-3 w-3 mr-1" />
          {{ animal.location.facility }}
        </Badge>
      </div>

      <!-- Main content with tabs -->
      <Tabs v-model="activeTab" class="space-y-6">
        <TabsList class="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" class="flex items-center gap-2">
            <Eye class="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="medical" class="flex items-center gap-2">
            <Stethoscope class="h-4 w-4" />
            Medical history
          </TabsTrigger>
          <TabsTrigger value="measurements" class="flex items-center gap-2">
            <Activity class="h-4 w-4" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="protocols" class="flex items-center gap-2">
            <ClipboardList class="h-4 w-4" />
            Protocols
          </TabsTrigger>
          <TabsTrigger value="documents" class="flex items-center gap-2">
            <FileText class="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- General information -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">General information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Identifier</Label>
                    <p class="font-medium">{{ animal.identifier }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Sex</Label>
                    <p class="font-medium">{{ animal.sex === 'male' ? 'Male ♂' : 'Female ♀' }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Species</Label>
                    <p class="font-medium">{{ speciesLabels[animal.species as keyof typeof speciesLabels] || animal.species }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Strain</Label>
                    <p class="font-medium">{{ animal.strain }}</p>
                  </div>
                </div>
                <div v-if="animal.line">
                  <Label class="text-sm text-muted-foreground">Line</Label>
                  <p class="font-medium">{{ animal.line }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Birth date</Label>
                    <p class="font-medium">{{ formatDate(animal.birth_date) }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Age</Label>
                    <p class="font-medium">{{ calculateAge(animal.birth_date) }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Arrival date</Label>
                    <p class="font-medium">{{ formatDate(animal.arrival_date) }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Supplier</Label>
                    <p class="font-medium">{{ animal.supplier }}</p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">Current weight</Label>
                  <p class="font-medium">{{ animal.current_weight }} g</p>
                </div>
              </CardContent>
            </Card>

            <!-- Status and health -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Status and health</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Status</Label>
                    <Badge :class="getStatusInfo(animal.status).color">
                      {{ getStatusInfo(animal.status).label }}
                    </Badge>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Health status</Label>
                    <Badge :class="getHealthStatusInfo(animal.health_status).color">
                      {{ getHealthStatusInfo(animal.health_status).label }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">Attending veterinarian</Label>
                  <p class="font-medium">{{ animal.veterinarian }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Last examination</Label>
                    <p class="font-medium">
                      {{ animal.last_exam_date ? formatDate(animal.last_exam_date) : 'None' }}
                    </p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Next examination</Label>
                    <p class="font-medium">
                      {{ animal.next_exam_date ? formatDate(animal.next_exam_date) : 'Not scheduled' }}
                    </p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">Ethics approval</Label>
                  <p class="font-medium">{{ animal.ethics_approval }}</p>
                </div>
              </CardContent>
            </Card>

            <!-- Housing -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Housing</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <Label class="text-sm text-muted-foreground">Facility</Label>
                  <p class="font-medium">{{ animal.location.facility }}</p>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Room</Label>
                    <p class="font-medium">{{ animal.location.room }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Rack</Label>
                    <p class="font-medium">{{ animal.location.rack }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">Cage</Label>
                    <p class="font-medium">{{ animal.location.cage }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">Housing type</Label>
                    <p class="font-medium">
                      {{ animal.housing_type === 'individual' ? 'Individual' : 
                         animal.housing_type === 'pair' ? 'Pair' : 'Group' }}
                    </p>
                  </div>
                  <div v-if="animal.group_size">
                    <Label class="text-sm text-muted-foreground">Group size</Label>
                    <p class="font-medium">{{ animal.group_size }} animals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Notes -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Notes and observations</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm">{{ animal.notes }}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Medical history</h3>
            <Button size="sm" @click="newMedicalExamDialogOpen = true">
              <Plus class="h-4 w-4 mr-2" />
              New examination
            </Button>
          </div>
          
          <div class="space-y-4">
            <Card v-for="record in animal.medical_history" :key="record.id">
              <CardContent class="p-4">
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <Badge variant="outline">
                        {{ getMedicalTypeLabel(record.type) }}
                      </Badge>
                      <Badge :class="getSeverityColor(record.severity)">
                        {{ getSeverityLabel(record.severity) }}
                      </Badge>
                    </div>
                    <p class="font-medium">{{ record.description }}</p>
                    <p v-if="record.findings" class="text-sm text-muted-foreground">
                      <strong>Observations:</strong> {{ record.findings }}
                    </p>
                    <p v-if="record.treatment" class="text-sm text-muted-foreground">
                      <strong>Treatment:</strong> {{ record.treatment }}
                    </p>
                    <p v-if="record.followUp" class="text-sm text-muted-foreground">
                      <strong>Follow-up:</strong> {{ record.followUp }}
                    </p>
                    <div class="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{{ formatDate(record.date) }}</span>
                      <span>•</span>
                      <span>{{ record.veterinarian }}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="measurements" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Measurement history</h3>
            <Button size="sm" @click="newMeasurementDialogOpen = true">
              <Plus class="h-4 w-4 mr-2" />
              New measurement
            </Button>
          </div>
          
          <div class="space-y-4">
            <Card 
              v-for="measurement in sortedMeasurements" 
              :key="measurement.id" 
              class="transition-all hover:shadow-md"
            >
              <CardContent class="p-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg">
                      <component :is="getMeasurementIcon(measurement.type)" class="h-5 w-5 text-primary" />
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ getMeasurementLabel(measurement.type) }}</span>
                        <Badge variant="outline" class="text-xs">
                          {{ formatDate(measurement.date) }}
                        </Badge>
                      </div>
                      <div class="text-2xl font-bold text-primary">
                        {{ measurement.value }} {{ measurement.unit }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Measured by {{ measurement.measuredBy }}
                      </div>
                      <div v-if="measurement.notes" class="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                        <span class="font-medium">Note:</span> {{ measurement.notes }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit3 class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div v-if="animal.measurements.length === 0" class="text-center py-8">
              <Scale class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 class="font-medium mb-2">No measurements recorded</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Start by adding a first measurement for this animal.
              </p>
              <Button @click="newMeasurementDialogOpen = true">
                <Plus class="h-4 w-4 mr-2" />
                First measurement
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="protocols" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Experimental protocols</h3>
            <Button size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Link protocol
            </Button>
          </div>
          
          <div class="space-y-4">
            <Card v-for="protocol in animal.protocols" :key="protocol">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">{{ protocol }}</p>
                    <p v-if="animal.experimental_group" class="text-sm text-muted-foreground">
                      Group: {{ animal.experimental_group }}
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardContent>
            </Card>
            
            <div v-if="animal.protocols.length === 0" class="text-center py-8">
              <ClipboardList class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">No protocol linked</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" class="space-y-4">
          <DocumentManager
            entity-type="animal"
            :entity-id="animal.id"
            :entity-name="`${animal.identifier} - ${speciesLabels[animal.species as keyof typeof speciesLabels] || animal.species}`"
            :initial-documents="animal.documents"
            :show-stats="true"
            @add-documents="handleAddDocuments"
          />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Edit dialog -->
    <AnimalFormDialog
      v-if="animal"
      :animal="animal"
      v-model:open="editDialogOpen"
      mode="edit"
      @save="handleSaveAnimal"
    />

    <!-- New measurement dialog -->
    <NewMeasurementDialog
      v-model:open="newMeasurementDialogOpen"
      @save="handleAddMeasurement"
    />

    <!-- New medical examination dialog -->
    <NewMedicalExamDialog
      v-model:open="newMedicalExamDialogOpen"
      :animal-identifier="animal?.identifier"
      @save="handleAddMedicalRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { 
  ArrowLeft,
  Edit3, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Activity,
  Building,
  PawPrint,
  Stethoscope,
  ClipboardList,
  UserCheck,
  AlertCircle,
  Scale,
  Thermometer,
  Heart,
  FlaskConical,
  FileText,
  Plus,
  Trash2
} from 'lucide-vue-next'

import type { Animal } from '@/types/supabase'
import type { Measurement, MedicalRecord, AnimalDocument } from '@/types/lab'
import { speciesLabels } from '@/types/lab'
import { useAnimalsStore } from '@/stores/animals.store'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AnimalFormDialog from '@/components/labs/AnimalFormDialog.vue'
import NewMeasurementDialog from '@/components/labs/NewMeasurementDialog.vue'
import NewMedicalExamDialog from '@/components/labs/NewMedicalExamDialog.vue'
import DocumentManager from '@/components/labs/DocumentManager.vue'

const route = useRoute()
const animalId = route.params.id as string

const activeTab = ref('overview')
const editDialogOpen = ref(false)
const newMeasurementDialogOpen = ref(false)
const newMedicalExamDialogOpen = ref(false)

// Store
const animalsStore = useAnimalsStore()

// Initialize and find animal by ID
onMounted(async () => {
  await animalsStore.fetchAnimals()
  if (!animal.value) {
    await animalsStore.getAnimalById(animalId)
  }
})

const animal = computed(() => animalsStore.animals.find(a => a.id === animalId))

const sortedMeasurements = computed(() => {
  if (!animal.value) return []
  return [...animal.value.measurements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'alive':
      return { label: 'Alive', color: 'bg-green-100 text-green-800' }
    case 'experimental':
      return { label: 'In experiment', color: 'bg-blue-100 text-blue-800' }
    case 'transferred':
      return { label: 'Transferred', color: 'bg-yellow-100 text-yellow-800' }
    case 'deceased':
      return { label: 'Deceased', color: 'bg-gray-100 text-gray-800' }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800' }
  }
}

const getHealthStatusInfo = (healthStatus: string) => {
  switch (healthStatus) {
    case 'excellent':
      return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    case 'good':
      return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    case 'concerning':
      return { label: 'Concerning', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    case 'critical':
      return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    default:
      return { label: healthStatus, color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
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

const getMeasurementIcon = (type: string) => {
  switch (type) {
    case 'weight':
      return Scale
    case 'temperature':
      return Thermometer
    case 'blood-pressure':
      return Heart
    case 'behavior':
      return Activity
    default:
      return FlaskConical
  }
}

const getMeasurementLabel = (type: string) => {
  switch (type) {
    case 'weight':
      return 'Weight'
    case 'temperature':
      return 'Temperature'
    case 'blood-pressure':
      return 'Blood pressure'
    case 'behavior':
      return 'Behavioral score'
    default:
      return 'Other measurement'
  }
}

const getMedicalTypeLabel = (type: string) => {
  switch (type) {
    case 'examination':
      return 'Examination'
    case 'vaccination':
      return 'Vaccination'
    case 'treatment':
      return 'Treatment'
    case 'surgery':
      return 'Surgery'
    case 'sampling':
      return 'Sampling'
    default:
      return 'Observation'
  }
}

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'normal':
      return 'Normal'
    case 'minor':
      return 'Minor'
    case 'moderate':
      return 'Moderate'
    case 'severe':
      return 'Severe'
    default:
      return severity
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'normal':
      return 'bg-green-100 text-green-800'
    case 'minor':
      return 'bg-blue-100 text-blue-800'
    case 'moderate':
      return 'bg-orange-100 text-orange-800'
    case 'severe':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const handleSaveAnimal = async (updatedAnimal: Animal | import('@/types/supabase').AnimalInsert) => {
  if ('id' in updatedAnimal && updatedAnimal.id) {
    const result = await animalsStore.updateAnimal(updatedAnimal.id, updatedAnimal as Animal)
    if (result) {
      toast.success('Animal successfully updated')
    }
  }
}

const handleAddMeasurement = async (newMeasurement: Omit<Measurement, 'id'>) => {
  if (!animal.value) return

  const measurementWithId = {
    ...newMeasurement,
    id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const result = await animalsStore.addMeasurement(animalId, measurementWithId)
  if (result) {
    toast.success('Measurement successfully added')
  }
}

const handleAddMedicalRecord = async (newRecord: Omit<MedicalRecord, 'id'>) => {
  if (!animal.value) return

  const recordWithId = {
    ...newRecord,
    id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const result = await animalsStore.addMedicalRecord(animalId, recordWithId)
  if (result) {
    // Also update last exam date and health status
    const healthStatusUpdate = 
      newRecord.severity === 'severe' ? 'critical' :
      newRecord.severity === 'moderate' ? 'concerning' :
      newRecord.severity === 'minor' ? 'good' : 'excellent'
    
    await animalsStore.updateAnimal(animalId, {
      last_exam_date: newRecord.date,
      health_status: healthStatusUpdate as any
    })
    
    toast.success('Medical record successfully added')
  }
}

const handleAddDocuments = async (newDocuments: AnimalDocument[]) => {
  if (!animal.value) return

  for (const document of newDocuments) {
    await animalsStore.addDocument(animalId, document)
  }
}
</script>
