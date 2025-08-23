<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            {{ t('labs.consumables.title') }}
          </h1>
          <p class="text-muted-foreground mt-1">
            {{ t('labs.consumables.subtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="openNewConsumableDialog">
            <Plus class="h-4 w-4 mr-2" />
            {{ t('labs.consumables.newConsumable') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid layout-standard-grid layout-section-gap">
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-orange-100 p-2 rounded-lg">
            <TrendingDown class="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              {{ t('labs.consumables.lowStock') }}
            </p>
            <p class="text-xl font-bold">
              {{ lowStockConsumables }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-red-100 p-2 rounded-lg">
            <Clock class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              {{ t('labs.consumables.outOfStock') }}
            </p>
            <p class="text-xl font-bold">
              {{ expiredConsumables }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-gray-100 p-2 rounded-lg">
            <Archive class="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              {{ t('labs.consumables.outOfStock') }}
            </p>
            <p class="text-xl font-bold">
              {{ outOfStockConsumables }}
            </p>
          </div>
        </div>
      </Card>
      <Card class="p-3">
        <div class="flex items-center gap-4">
          <div class="bg-yellow-100 p-2 rounded-lg">
            <AlertTriangle class="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              {{ t('labs.consumables.expiringSoon') }}
            </p>
            <p class="text-xl font-bold">
              {{ expiringSoonConsumables }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Filters -->
    <div class="bg-card border rounded-lg p-4 flex items-center gap-4">
      <div class="relative w-full max-w-sm">
        <Input v-model="searchQuery" :placeholder="t('labs.animals.searchPlaceholder')" class="pl-10" />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <Select v-model="filterStock">
        <SelectTrigger class="w-48">
          <SelectValue :placeholder="t('labs.animals.allStatuses')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {{ t('labs.animals.allStatuses') }}
          </SelectItem>
          <SelectItem value="low">
            {{ t('labs.consumables.lowStock') }}
          </SelectItem>
          <SelectItem value="outofstock">
            {{ t('labs.consumables.outOfStock') }}
          </SelectItem>
          <SelectItem value="expired">
            {{ t('labs.consumables.outOfStock') }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="filterCategory">
        <SelectTrigger class="w-48">
          <SelectValue :placeholder="t('common.labels.category')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {{ t('common.labels.category') }}
          </SelectItem>
          <SelectItem value="Reagents">
            {{ t('labs.consumables.categories.reagents') }}
          </SelectItem>
          <SelectItem value="Glassware">
            {{ t('labs.consumables.categories.glassware') }}
          </SelectItem>
          <SelectItem value="Plasticware">
            {{ t('labs.consumables.categories.plasticware') }}
          </SelectItem>
          <SelectItem value="Culture Media">
            {{ t('labs.consumables.categories.cultureMedia') }}
          </SelectItem>
          <SelectItem value="Other">
            {{ t('labs.consumables.categories.other') }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Consumables Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('labs.consumables.lotNumber') }}</TableHead>
              <TableHead>{{ t('common.labels.name') }}</TableHead>
              <TableHead>{{ t('common.labels.category') }}</TableHead>
              <TableHead>{{ t('labs.consumables.quantity') }}</TableHead>
              <TableHead>{{ t('common.labels.location') }}</TableHead>
              <TableHead>{{ t('labs.consumables.supplier') }}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="consumable in filteredConsumables" :key="consumable.id">
              <TableCell>{{ consumable.reference }}</TableCell>
              <TableCell>
                <div class="font-medium">
                  {{ consumable.name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ consumable.supplier }}
                </div>
              </TableCell>
              <TableCell>{{ getCategoryLabel(consumable.category) }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="getStockIndicatorClass(consumable.stock_level)" />
                  <span>{{ consumable.stock }} {{ consumable.unit }}</span>
                  <Badge v-if="consumable.stock_level === 'outofstock'" variant="destructive">
                    {{ t('labs.consumables.outOfStock') }}
                  </Badge>
                  <Badge v-else-if="consumable.stock_level === 'low'" variant="secondary">
                    {{ t('labs.consumables.lowStock') }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{{ consumable.location }}</TableCell>
              <TableCell>
                <div v-if="consumable.last_order">
                  {{ formatDate(consumable.last_order) }}
                </div>
                <div v-else class="text-sm text-muted-foreground">
                  {{ t('labs.consumables.supplier') }}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" class="h-8 w-8 p-0" @click.stop>
                      <span class="sr-only">{{ t('common.actions.openMenu') }}</span>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{{ t('common.actions.actions') }}</DropdownMenuLabel>
                    <DropdownMenuItem @click="openEditConsumableDialog(consumable)">
                      {{ t('common.actions.edit') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem :disabled="consumable.stock_level === 'outofstock'"
                      @click="updateStock(consumable.id)">
                      {{ t('common.actions.update') }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-500" @click="handleDeleteConsumable(consumable.id)">
                      {{ t('common.actions.delete') }}
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

  <!-- New Consumable Dialog -->
  <Dialog v-model:open="isNewConsumableDialogOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ t('labs.consumables.newConsumable') }}</DialogTitle>
        <DialogDescription>
          {{ t('labs.consumables.subtitle') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">{{ t('common.labels.name') }}</Label>
          <Input id="name" v-model="newConsumableForm.name" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="reference" class="text-right">{{ t('labs.consumables.lotNumber') }}</Label>
          <Input id="reference" v-model="newConsumableForm.reference" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="supplier" class="text-right">{{ t('labs.consumables.supplier') }}</Label>
          <Input id="supplier" v-model="newConsumableForm.supplier" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="category" class="text-right">{{ t('common.labels.category') }}</Label>
          <Select v-model="newConsumableForm.category">
            <SelectTrigger class="col-span-3">
              <SelectValue :placeholder="t('common.labels.category')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Reagents">
                {{ t('labs.consumables.categories.reagents') }}
              </SelectItem>
              <SelectItem value="Glassware">
                {{ t('labs.consumables.categories.glassware') }}
              </SelectItem>
              <SelectItem value="Plasticware">
                {{ t('labs.consumables.categories.plasticware') }}
              </SelectItem>
              <SelectItem value="Culture Media">
                {{ t('labs.consumables.categories.cultureMedia') }}
              </SelectItem>
              <SelectItem value="Other">
                {{ t('labs.consumables.categories.other') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="stock" class="text-right">{{ t('labs.consumables.quantity') }}</Label>
          <Input id="stock" v-model.number="newConsumableForm.stock" type="number" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="quantity" class="text-right">{{ t('labs.consumables.quantity') }}</Label>
          <Input id="quantity" v-model.number="newConsumableForm.quantity" type="number" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="unit" class="text-right">{{ t('labs.consumables.unit') }}</Label>
          <Input id="unit" v-model="newConsumableForm.unit" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="location" class="text-right">{{ t('common.labels.location') }}</Label>
          <Input id="location" v-model="newConsumableForm.location" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isNewConsumableDialogOpen = false">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button @click="handleCreateConsumable">
          {{ t('common.actions.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit Consumable Dialog -->
  <Dialog v-model:open="isEditDialogOpen">
    <DialogContent v-if="editingConsumable" class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ t('common.actions.edit') }}</DialogTitle>
        <DialogDescription>
          {{ t('common.actions.update') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-name" class="text-right">{{ t('common.labels.name') }}</Label>
          <Input id="edit-name" v-model="editingConsumable.name" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-reference" class="text-right">{{ t('labs.consumables.lotNumber') }}</Label>
          <Input id="edit-reference" v-model="editingConsumable.reference" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-supplier" class="text-right">{{ t('labs.consumables.supplier') }}</Label>
          <Input id="edit-supplier" v-model="editingConsumable.supplier" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-stock" class="text-right">{{ t('labs.consumables.quantity') }}</Label>
          <Input id="edit-stock" v-model.number="editingConsumable.stock" type="number" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-quantity" class="text-right">{{ t('labs.consumables.quantity') }}</Label>
          <Input id="edit-quantity" v-model.number="editingConsumable.quantity" type="number" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-unit" class="text-right">{{ t('labs.consumables.unit') }}</Label>
          <Input id="edit-unit" v-model="editingConsumable.unit" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-location" class="text-right">{{ t('common.labels.location') }}</Label>
          <Input id="edit-location" v-model="editingConsumable.location" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isEditDialogOpen = false">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button @click="handleUpdateConsumable">
          {{ t('common.actions.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Order Stock Dialog -->
  <Dialog v-model:open="isOrderDialogOpen">
    <DialogContent class="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>{{ t('common.actions.create') }}</DialogTitle>
        <DialogDescription>
          {{ t('labs.consumables.subtitle') }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div v-if="lowStockItems.length > 0" class="space-y-4 max-h-[60vh] overflow-y-auto">
          <div v-for="item in lowStockItems" :key="item.id" class="grid grid-cols-5 items-center gap-4">
            <span class="col-span-2">{{ item.name }}</span>
            <span class="text-sm text-muted-foreground">Current: {{ item.stock }} {{ item.unit }}</span>
            <Badge :variant="item.stock_level === 'outofstock' ? 'destructive' : 'secondary'">
              {{ item.stock_level }}
            </Badge>
            <Input v-model.number="orderQuantities[item.id]" type="number" :placeholder="t('labs.consumables.quantity')" class="col-span-1" />
          </div>
        </div>
        <div v-else class="text-center text-muted-foreground py-8">
          {{ t('labs.consumables.noConsumables') }}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOrderDialogOpen = false">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button :disabled="lowStockItems.length === 0" @click="handlePlaceOrder">
          {{ t('common.actions.create') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from '@/composables/useLocale';
import { formatDate } from '@/lib/format.utils';
import { useAuthStore } from '@/stores/auth.store';
import { useConsumablesStore } from '@/stores/consumables.store';
import type { StockLevel } from '@/types/supabase';
import {
  AlertTriangle,
  Archive,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  TrendingDown
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';

// Translation
const { t } = useTranslation()

// Stores
const consumablesStore = useConsumablesStore()
const authStore = useAuthStore()

// Initialize data
onMounted(() => {
  consumablesStore.fetchConsumables()
})

// Reactive state from store
const {
  filteredConsumables
} = consumablesStore

// Local filters - sync with store
const searchQuery = computed({
  get: () => consumablesStore.searchQuery,
  set: (value: string) => consumablesStore.setSearchQuery(value)
})

const filterCategory = computed({
  get: () => consumablesStore.categoryFilter,
  set: (value: string) => consumablesStore.setCategoryFilter(value)
})

const filterStock = computed({
  get: () => consumablesStore.stockLevelFilter === 'all' ? 'all' : consumablesStore.stockLevelFilter,
  set: (value: string) => {
    if (value === 'expired') {
      // Handle expired separately since it's not a stock level
      consumablesStore.setStockLevelFilter('all')
      // TODO: Add expired filter to store
    } else {
      consumablesStore.setStockLevelFilter(value as StockLevel | 'all')
    }
  }
})

// Methods
const getStockIndicatorClass = (stockLevel: StockLevel) => {
  const classes: Record<StockLevel, string> = {
    'high': 'bg-green-500',
    'normal': 'bg-blue-500',
    'low': 'bg-amber-500',
    'outofstock': 'bg-red-500'
  }
  return classes[stockLevel]
}

const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    'Reagents': t('labs.consumables.categories.reagents'),
    'Glassware': t('labs.consumables.categories.glassware'), 
    'Plasticware': t('labs.consumables.categories.plasticware'),
    'Culture Media': t('labs.consumables.categories.cultureMedia'),
    'Other': t('labs.consumables.categories.other')
  }
  return categoryMap[category] || category
}


const isNewConsumableDialogOpen = ref(false)
const newConsumableForm = ref({
  reference: '',
  name: '',
  supplier: '',
  category: 'Reagents',
  quantity: 0,
  unit: '',
  stock: 0,
  min_stock: 5,
  location: '',
  last_order: null,
  expiry_date: '9999-12-31'
})

const resetNewConsumableForm = () => {
  newConsumableForm.value = {
    reference: '',
    name: '',
    supplier: '',
    category: 'Reagents',
    quantity: 0,
    unit: '',
    stock: 0,
    min_stock: 5,
    location: '',
    last_order: null,
    expiry_date: '9999-12-31'
  }
}

const openNewConsumableDialog = () => {
  resetNewConsumableForm()
  isNewConsumableDialogOpen.value = true
}

const handleCreateConsumable = async () => {
  const consumableData = {
    ...newConsumableForm.value,
    created_by: authStore.user?.id || '',
    updated_by: authStore.user?.id || ''
  }

  const success = await consumablesStore.createConsumable(consumableData)
  if (success) {
    isNewConsumableDialogOpen.value = false
    resetNewConsumableForm()
  }
}

const isEditDialogOpen = ref(false)
const editingConsumable = ref<any>(null)

const openEditConsumableDialog = (consumable: any) => {
  editingConsumable.value = JSON.parse(JSON.stringify(consumable))
  isEditDialogOpen.value = true
}

const handleUpdateConsumable = async () => {
  if (!editingConsumable.value) return

  const updates = {
    ...editingConsumable.value,
    updated_by: authStore.user?.id || ''
  }

  const success = await consumablesStore.updateConsumable(editingConsumable.value.id, updates)
  if (success) {
    isEditDialogOpen.value = false
  }
}

const handleDeleteConsumable = async (consumableId: string) => {
  if (confirm(t('labs.animals.confirmDelete'))) {
    await consumablesStore.deleteConsumable(consumableId)
  }
}

const isOrderDialogOpen = ref(false)
const orderQuantities = ref<Record<string, number>>({})

const lowStockItems = computed(() => {
  return [...consumablesStore.lowStockConsumables, ...consumablesStore.outOfStockConsumables]
})

const lowStockConsumables = computed(() => {
  return consumablesStore.stats.low
})

const expiredConsumables = computed(() => {
  return consumablesStore.stats.expired
})

const outOfStockConsumables = computed(() => {
  return consumablesStore.stats.outofstock
})

const expiringSoonConsumables = computed(() => {
  return consumablesStore.stats.expiringSoon
})

const handlePlaceOrder = async () => {
  console.log('Placing order:', orderQuantities.value)
  const today = new Date().toISOString().split('T')[0]

  for (const id of Object.keys(orderQuantities.value)) {
    const quantity = orderQuantities.value[id]
    if (quantity && quantity > 0) {
      await consumablesStore.updateConsumable(id, {
        last_order: today,
        updated_by: authStore.user?.id || ''
      })
    }
  }

  isOrderDialogOpen.value = false
}

const updateStock = async (consumableId: string) => {
  const consumable = consumablesStore.consumables.find(c => c.id === consumableId)
  if (consumable && consumable.stock > 0) {
    await consumablesStore.updateConsumableStock(consumableId, consumable.stock - 1)
  }
}

</script>
