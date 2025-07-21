export type StockLevel = 'high' | 'normal' | 'low' | 'outofstock'

export interface Consumable {
  id: string
  reference: string
  name: string
  supplier: string
  category: string
  quantity: number
  unit: string
  stockLevel: StockLevel
  location: string
  lastOrder: string | null
  expiryDate: string | null
}

export const mockConsumables: Consumable[] = [
  {
    id: 'C001',
    reference: 'R-1234',
    name: 'Ethanol 96%',
    supplier: 'Sigma-Aldrich',
    category: 'Reagents',
    quantity: 5,
    unit: 'L',
    stockLevel: 'normal',
    location: 'Shelf A-1',
    lastOrder: '2024-06-15',
    expiryDate: '2025-12-31'
  },
  {
    id: 'C002',
    reference: 'GLS-001',
    name: 'Beakers',
    supplier: 'Corning',
    category: 'Glassware',
    quantity: 50,
    unit: 'units',
    stockLevel: 'high',
    location: 'Cabinet B-3',
    lastOrder: '2024-05-20',
    expiryDate: null
  },
  {
    id: 'C003',
    reference: 'PLS-002',
    name: 'Petri Dishes',
    supplier: 'Falcon',
    category: 'Plasticware',
    quantity: 500,
    unit: 'units',
    stockLevel: 'normal',
    location: 'Shelf C-2',
    lastOrder: '2024-07-01',
    expiryDate: null
  },
  {
    id: 'C004',
    reference: 'MED-001',
    name: 'DMEM',
    supplier: 'Gibco',
    category: 'Culture Media',
    quantity: 2,
    unit: 'bottles',
    stockLevel: 'low',
    location: 'Fridge 1',
    lastOrder: '2024-06-25',
    expiryDate: '2024-08-31'
  },
  {
    id: 'C005',
    reference: 'OTH-001',
    name: 'Syringes',
    supplier: 'BD',
    category: 'Other',
    quantity: 0,
    unit: 'boxes',
    stockLevel: 'outofstock',
    location: 'Drawer D-5',
    lastOrder: '2024-04-10',
    expiryDate: null
  },
  {
    id: 'C006',
    reference: 'RGT-002',
    name: 'Ethanol',
    supplier: 'Sigma-Aldrich',
    category: 'Reagents',
    quantity: 1,
    unit: 'bottles',
    stockLevel: 'low',
    location: 'Flammable Cabinet',
    lastOrder: '2024-07-10',
    expiryDate: '2023-12-31'
  },
  {
    id: 'C007',
    reference: 'RGT-003',
    name: 'HCl',
    supplier: 'Merck',
    category: 'Reagents',
    quantity: 1,
    unit: 'bottles',
    stockLevel: 'low',
    location: 'Acid Cabinet',
    lastOrder: '2024-07-10',
    expiryDate: '2024-07-20'
  }
]