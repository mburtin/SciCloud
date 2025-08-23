<template>
  <div class="space-y-6">
    <!-- Header with navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button variant="ghost" @click="$router.push('/lab/animals')">
          <ArrowLeft class="h-4 w-4 mr-2" />
          {{ t('labs.animals.backToAnimals') }}
        </Button>
        <div class="h-6 w-px bg-border" />
        <div v-if="animal" class="flex items-center gap-3">
          <PawPrint class="h-8 w-8 text-primary" />
          <div>
            <h1 class="flex items-center gap-2">
              {{ animal.identifier }} - {{ speciesLabels[animal.species as keyof typeof speciesLabels] || animal.species
              }}
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
          {{ t('common.actions.edit') }}
        </Button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="!animal" class="text-center py-12">
      <AlertTriangle class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="font-medium mb-2">{{ t('labs.animals.animalNotFound') }}</h3>
      <p class="text-sm text-muted-foreground">
        {{ t('labs.animals.animalNotFoundDescription', { id: animalId }) }}
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
            {{ t('labs.animals.detail.overview') }}
          </TabsTrigger>
          <TabsTrigger value="medical" class="flex items-center gap-2">
            <Stethoscope class="h-4 w-4" />
            {{ t('labs.animals.detail.medicalHistory') }}
          </TabsTrigger>
          <TabsTrigger value="measurements" class="flex items-center gap-2">
            <Activity class="h-4 w-4" />
            {{ t('labs.animals.detail.measurements') }}
          </TabsTrigger>
          <TabsTrigger value="protocols" class="flex items-center gap-2">
            <ClipboardList class="h-4 w-4" />
            {{ t('labs.animals.detail.protocols') }}
          </TabsTrigger>
          <TabsTrigger value="documents" class="flex items-center gap-2">
            <FileText class="h-4 w-4" />
            {{ t('labs.animals.detail.documents') }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- General information -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">{{ t('labs.animals.detail.generalInformation') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.identifier') }}</Label>
                    <p class="font-medium">{{ animal.identifier }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.sex') }}</Label>
                    <p class="font-medium">{{ animal.sex === 'male' ? t('labs.animals.form.male') + ' ♂' : t('labs.animals.form.female') + ' ♀' }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.species') }}</Label>
                    <p class="font-medium">{{ speciesLabels[animal.species as keyof typeof speciesLabels] ||
                      animal.species }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.strain') }}</Label>
                    <p class="font-medium">{{ animal.strain }}</p>
                  </div>
                </div>
                <div v-if="animal.line">
                  <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.line') }}</Label>
                  <p class="font-medium">{{ animal.line }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.birthDate') }}</Label>
                    <p class="font-medium">{{ formatDate(animal.birth_date) }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.detail.age') }}</Label>
                    <p class="font-medium">{{ calculateAge(animal.birth_date) }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.arrivalDate') }}</Label>
                    <p class="font-medium">{{ formatDate(animal.arrival_date) }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.supplier') }}</Label>
                    <p class="font-medium">{{ animal.supplier }}</p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.currentWeight') }}</Label>
                  <p class="font-medium">{{ animal.current_weight }} g</p>
                </div>
              </CardContent>
            </Card>

            <!-- Status and health -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">{{ t('labs.animals.detail.statusAndHealth') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('common.labels.status') }}</Label>
                    <Badge :class="getStatusInfo(animal.status).color">
                      {{ getStatusInfo(animal.status).label }}
                    </Badge>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.detail.healthStatus') }}</Label>
                    <Badge :class="getHealthStatusInfo(animal.health_status).color">
                      {{ getHealthStatusInfo(animal.health_status).label }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.veterinarian') }}</Label>
                  <p class="font-medium">{{ animal.veterinarian }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.detail.lastExamination') }}</Label>
                    <p class="font-medium">
                      {{ animal.last_exam_date ? formatDate(animal.last_exam_date) : t('common.labels.none') }}
                    </p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.detail.nextExamination') }}</Label>
                    <p class="font-medium">
                      {{ animal.next_exam_date ? formatDate(animal.next_exam_date) : t('labs.animals.detail.notScheduled') }}
                    </p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.ethicsApproval') }}</Label>
                  <p class="font-medium">{{ animal.ethics_approval }}</p>
                </div>
              </CardContent>
            </Card>

            <!-- Housing -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">{{ t('labs.animals.detail.housing') }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.facility') }}</Label>
                  <p class="font-medium">{{ animal.location.facility }}</p>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.room') }}</Label>
                    <p class="font-medium">{{ animal.location.room }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.rack') }}</Label>
                    <p class="font-medium">{{ animal.location.rack }}</p>
                  </div>
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.cage') }}</Label>
                    <p class="font-medium">{{ animal.location.cage }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.housingTypeLabel') }}</Label>
                    <p class="font-medium">
                      {{ animal.housing_type === 'individual' ? t('labs.animals.form.housingType.individual') :
                        animal.housing_type === 'pair' ? t('labs.animals.form.housingType.pair') : t('labs.animals.form.housingType.group') }}
                    </p>
                  </div>
                  <div v-if="animal.group_size">
                    <Label class="text-sm text-muted-foreground">{{ t('labs.animals.form.groupSize') }}</Label>
                    <p class="font-medium">{{ t('labs.animals.detail.groupSizeAnimals', { count: animal.group_size }) }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Notes -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">{{ t('labs.animals.detail.notesAndObservations') }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm">{{ animal.notes }}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">{{ t('labs.animals.detail.medicalHistory') }}</h3>
            <Button size="sm" @click="newMedicalExamDialogOpen = true">
              <Plus class="h-4 w-4 mr-2" />
              {{ t('labs.animals.detail.newExamination') }}
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
                      <strong>{{ t('labs.animals.detail.observations') }}:</strong> {{ record.findings }}
                    </p>
                    <p v-if="record.treatment" class="text-sm text-muted-foreground">
                      <strong>{{ t('labs.animals.detail.treatment') }}:</strong> {{ record.treatment }}
                    </p>
                    <p v-if="record.followUp" class="text-sm text-muted-foreground">
                      <strong>{{ t('labs.animals.detail.followUp') }}:</strong> {{ record.followUp }}
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
            <h3 class="text-lg font-medium">{{ t('labs.animals.detail.measurementHistory') }}</h3>
            <Button size="sm" @click="newMeasurementDialogOpen = true">
              <Plus class="h-4 w-4 mr-2" />
              {{ t('labs.animals.detail.newMeasurement') }}
            </Button>
          </div>

          <div class="space-y-4">
            <Card v-for="measurement in sortedMeasurements" :key="measurement.id"
              class="transition-all hover:shadow-md">
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
                        {{ t('labs.animals.detail.measuredBy', { name: measurement.measuredBy }) }}
                      </div>
                      <div v-if="measurement.notes" class="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                        <span class="font-medium">{{ t('common.labels.note') }}:</span> {{ measurement.notes }}
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
              <h3 class="font-medium mb-2">{{ t('labs.animals.detail.noMeasurements') }}</h3>
              <p class="text-sm text-muted-foreground mb-4">
                {{ t('labs.animals.detail.firstMeasurementPrompt') }}
              </p>
              <Button @click="newMeasurementDialogOpen = true">
                <Plus class="h-4 w-4 mr-2" />
                {{ t('labs.animals.detail.firstMeasurement') }}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="protocols" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">{{ t('labs.animals.detail.experimentalProtocols') }}</h3>
            <Button size="sm">
              <Plus class="h-4 w-4 mr-2" />
              {{ t('labs.animals.detail.linkProtocol') }}
            </Button>
          </div>

          <div class="space-y-4">
            <Card v-for="protocol in animal.protocols" :key="protocol">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">{{ protocol }}</p>
                    <p v-if="animal.experimental_group" class="text-sm text-muted-foreground">
                      {{ t('labs.animals.detail.group') }}: {{ animal.experimental_group }}
                    </p>
                  </div>
                  <Badge variant="secondary">{{ t('labs.animals.detail.active') }}</Badge>
                </div>
              </CardContent>
            </Card>

            <div v-if="animal.protocols.length === 0" class="text-center py-8">
              <ClipboardList class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">{{ t('labs.animals.detail.noProtocolLinked') }}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" class="space-y-4">
          <DocumentManager :title="t('labs.animals.detail.animalDocuments')"
            :description="t('labs.animals.detail.documentsDescription', { identifier: animal.identifier, species: speciesLabels[animal.species as keyof typeof speciesLabels] || animal.species })"
            owner-type="animals" :owner-id="animalId" :initial-documents="convertAnimalDocuments(animal.documents)"
            :show-stats="true"
            :available-types="['health-certificate', 'protocol', 'report', 'photo', 'analysis', 'authorization', 'other']"
            display-mode="cards" @document-uploaded="handleDocumentUploaded"
            @documents-updated="handleDocumentsUpdated" />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Edit dialog -->
    <AnimalFormDialog v-if="animal" :animal="animal" v-model:open="editDialogOpen" mode="edit"
      @save="handleSaveAnimal" />

    <!-- New measurement dialog -->
    <NewMeasurementDialog v-model:open="newMeasurementDialogOpen" @save="handleAddMeasurement" />

    <!-- New medical examination dialog -->
    <NewMedicalExamDialog v-model:open="newMedicalExamDialogOpen" :animal-identifier="animal?.identifier"
      @save="handleAddMedicalRecord" />
  </div>
</template>

<script setup lang="ts">
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building,
  CheckCircle,
  ClipboardList,
  Edit3,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  PawPrint,
  Plus,
  Scale,
  Stethoscope,
  Thermometer,
  Trash2,
  UserCheck
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

import { useAnimalsStore } from '@/stores/animals.store'
import type { Document } from '@/types/documents'
import type { AnimalDocument, Measurement, MedicalRecord } from '@/types/lab'
import { speciesLabels } from '@/types/lab'
import type { Animal } from '@/types/supabase'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AnimalFormDialog from '@/components/labs/AnimalFormDialog.vue'
import NewMeasurementDialog from '@/components/labs/NewMeasurementDialog.vue'
import NewMedicalExamDialog from '@/components/labs/NewMedicalExamDialog.vue'
import DocumentManager from '@/components/shared/DocumentManager.vue'
import { useTranslation } from '@/composables/useLocale'
import { formatDate } from '@/lib/format.utils'

const route = useRoute()
const animalId = route.params.id as string
const { t } = useTranslation()

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
      return { label: t('labs.animals.alive'), color: 'bg-green-100 text-green-800' }
    case 'experimental':
      return { label: t('labs.animals.experimental'), color: 'bg-blue-100 text-blue-800' }
    case 'transferred':
      return { label: t('labs.animals.transferred'), color: 'bg-yellow-100 text-yellow-800' }
    case 'deceased':
      return { label: t('labs.animals.deceased'), color: 'bg-gray-100 text-gray-800' }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800' }
  }
}

const getHealthStatusInfo = (healthStatus: string) => {
  switch (healthStatus) {
    case 'excellent':
      return { label: t('labs.animals.healthStatus.excellent'), color: 'bg-green-100 text-green-800', icon: CheckCircle }
    case 'good':
      return { label: t('labs.animals.healthStatus.good'), color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    case 'concerning':
      return { label: t('labs.animals.healthStatus.concerning'), color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    case 'critical':
      return { label: t('labs.animals.healthStatus.critical'), color: 'bg-red-100 text-red-800', icon: AlertCircle }
    default:
      return { label: healthStatus, color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
  }
}


const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  const diffInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 3600 * 24))

  if (diffInDays < 30) {
    return t('labs.animals.detail.ageDays', { count: diffInDays })
  } else if (diffInDays < 365) {
    const weeks = Math.floor(diffInDays / 7)
    return t('labs.animals.detail.ageWeeks', { count: weeks })
  } else {
    const years = Math.floor(diffInDays / 365)
    const months = Math.floor((diffInDays % 365) / 30)
    return t('labs.animals.detail.ageYearsMonths', { years, months })
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
      return t('labs.animals.measurement.types.weight')
    case 'temperature':
      return t('labs.animals.measurement.types.temperature')
    case 'blood-pressure':
      return t('labs.animals.measurement.types.bloodPressure')
    case 'behavior':
      return t('labs.animals.measurement.types.behavior')
    default:
      return t('labs.animals.measurement.types.other')
  }
}

const getMedicalTypeLabel = (type: string) => {
  switch (type) {
    case 'examination':
      return t('labs.animals.medical.types.examination')
    case 'vaccination':
      return t('labs.animals.medical.types.vaccination')
    case 'treatment':
      return t('labs.animals.medical.types.treatment')
    case 'surgery':
      return t('labs.animals.medical.types.surgery')
    case 'sampling':
      return t('labs.animals.medical.types.sampling')
    default:
      return t('labs.animals.medical.types.observation')
  }
}

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'normal':
      return t('labs.animals.medical.severity.normal')
    case 'minor':
      return t('labs.animals.medical.severity.minor')
    case 'moderate':
      return t('labs.animals.medical.severity.moderate')
    case 'severe':
      return t('labs.animals.medical.severity.severe')
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
      toast.success(t('labs.animals.animalUpdatedSuccess'))
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
    toast.success(t('labs.animals.measurementAddedSuccess'))
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

    toast.success(t('labs.animals.medicalRecordAddedSuccess'))
  }
}

// Convert AnimalDocument to Document format
const convertAnimalDocuments = (animalDocs: AnimalDocument[]): Document[] => {
  return animalDocs.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    uploadDate: doc.uploadDate,
    size: doc.size,
    uploadedBy: doc.uploadedBy
  }))
}

const handleDocumentUploaded = async (document: Document) => {
  if (!animal.value) return

  // Convert back to AnimalDocument for store
  const animalDocument: AnimalDocument = {
    id: document.id,
    name: document.name,
    type: document.type as AnimalDocument['type'],
    uploadDate: document.uploadDate,
    size: document.size,
    uploadedBy: document.uploadedBy
  }

  await animalsStore.addDocument(animalId, animalDocument)
}

const handleDocumentsUpdated = async (documents: Document[]) => {
  // Optionally sync the updated documents list back to the store
  // This could be used for bulk operations or reordering
}
</script>
