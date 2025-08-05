<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Consumables
          </h1>
          <p class="text-muted-foreground mt-1">
            Manage stock levels and orders for consumables
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="openNewConsumableDialog">
            <Plus class="h-4 w-4 mr-2" />
            New Consumable
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
              Low stock
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
              Expired
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
              Out of stock
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
              Expiring soon
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
        <Input
          v-model="searchQuery"
          placeholder="Search by name, brand, reference, supplier..."
          class="pl-10"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <Select v-model="filterStock">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Statuses
          </SelectItem>
          <SelectItem value="low">
            Low Stock
          </SelectItem>
          <SelectItem value="outofstock">
            Out of Stock
          </SelectItem>
          <SelectItem value="expired">
            Expired
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
          <SelectItem value="Reagents">
            Reagents
          </SelectItem>
          <SelectItem value="Glassware">
            Glassware
          </SelectItem>
          <SelectItem value="Plasticware">
            Plasticware
          </SelectItem>
          <SelectItem value="Culture Media">
            Culture Media
          </SelectItem>
          <SelectItem value="Other">
            Other
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
              <TableHead>Reference</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Ordered</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="consumable in filteredConsumables" 
              :key="consumable.id"
            >
              <TableCell>{{ consumable.reference }}</TableCell>
              <TableCell>
                <div class="font-medium">
                  {{ consumable.name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ consumable.supplier }}
                </div>
              </TableCell>
              <TableCell>{{ consumable.category }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div 
                    class="w-2 h-2 rounded-full" 
                    :class="getStockIndicatorClass(consumable.stock_level)"
                  />
                  <span>{{ consumable.stock }} {{ consumable.unit }}</span>
                  <Badge 
                    v-if="consumable.stock_level === 'outofstock'" 
                    variant="destructive"
                  >
                    Out of Stock
                  </Badge>
                  <Badge 
                    v-else-if="consumable.stock_level === 'low'" 
                    variant="secondary"
                  >
                    Low Stock
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{{ consumable.location }}</TableCell>
              <TableCell>
                <div v-if="consumable.last_order">
                  {{ formatDate(consumable.last_order) }}
                </div>
                <div v-else class="text-sm text-muted-foreground">
                  Never ordered
                </div>
              </TableCell>
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
                    <DropdownMenuItem @click="openEditConsumableDialog(consumable)">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem :disabled="consumable.stock_level === 'outofstock'" @click="updateStock(consumable.id)">
                      Use Stock
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-500" @click="handleDeleteConsumable(consumable.id)">
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

  <!-- New Consumable Dialog -->
  <Dialog v-model:open="isNewConsumableDialogOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Add New Consumable</DialogTitle>
        <DialogDescription>
          Fill in the details for the new consumable item.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Name</Label>
          <Input id="name" v-model="newConsumableForm.name" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="reference" class="text-right">Reference</Label>
          <Input id="reference" v-model="newConsumableForm.reference" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="supplier" class="text-right">Supplier</Label>
          <Input id="supplier" v-model="newConsumableForm.supplier" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="category" class="text-right">Category</Label>
          <Select v-model="newConsumableForm.category">
            <SelectTrigger class="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Reagents">
                Reagents
              </SelectItem>
              <SelectItem value="Glassware">
                Glassware
              </SelectItem>
              <SelectItem value="Plasticware">
                Plasticware
              </SelectItem>
              <SelectItem value="Culture Media">
                Culture Media
              </SelectItem>
              <SelectItem value="Other">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="stock" class="text-right">Current Stock</Label>
          <Input
            id="stock"
            v-model.number="newConsumableForm.stock"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="quantity" class="text-right">Package Size</Label>
          <Input
            id="quantity"
            v-model.number="newConsumableForm.quantity"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="unit" class="text-right">Unit</Label>
          <Input id="unit" v-model="newConsumableForm.unit" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="location" class="text-right">Location</Label>
          <Input id="location" v-model="newConsumableForm.location" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isNewConsumableDialogOpen = false">
          Cancel
        </Button>
        <Button @click="handleCreateConsumable">
          Save Consumable
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit Consumable Dialog -->
  <Dialog v-model:open="isEditDialogOpen">
    <DialogContent v-if="editingConsumable" class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Consumable</DialogTitle>
        <DialogDescription>
          Update details for {{ editingConsumable.name }}.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-name" class="text-right">Name</Label>
          <Input id="edit-name" v-model="editingConsumable.name" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-reference" class="text-right">Reference</Label>
          <Input id="edit-reference" v-model="editingConsumable.reference" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-supplier" class="text-right">Supplier</Label>
          <Input id="edit-supplier" v-model="editingConsumable.supplier" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-stock" class="text-right">Current Stock</Label>
          <Input
            id="edit-stock"
            v-model.number="editingConsumable.stock"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-quantity" class="text-right">Package Size</Label>
          <Input
            id="edit-quantity"
            v-model.number="editingConsumable.quantity"
            type="number"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-unit" class="text-right">Unit</Label>
          <Input id="edit-unit" v-model="editingConsumable.unit" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="edit-location" class="text-right">Location</Label>
          <Input id="edit-location" v-model="editingConsumable.location" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isEditDialogOpen = false">
          Cancel
        </Button>
        <Button @click="handleUpdateConsumable">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Order Stock Dialog -->
  <Dialog v-model:open="isOrderDialogOpen">
    <DialogContent class="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Order Stock</DialogTitle>
        <DialogDescription>
          Review items with low stock and place an order.
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
            <Input
              v-model.number="orderQuantities[item.id]"
              type="number"
              placeholder="Quantity"
              class="col-span-1"
            />
          </div>
        </div>
        <div v-else class="text-center text-muted-foreground py-8">
          No items are currently low on stock.
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOrderDialogOpen = false">
          Cancel
        </Button>
        <Button :disabled="lowStockItems.length === 0" @click="handlePlaceOrder">
          Place Order
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  TrendingDown,
  Clock,
  Archive,
  AlertTriangle
} from 'lucide-vue-next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConsumablesStore } from '@/stores/consumables.store';
import type { StockLevel } from '@/types/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/utils/format.utils';

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
  if (confirm('Are you sure you want to delete this consumable?')) {
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
