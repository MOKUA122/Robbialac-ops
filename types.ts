export type Region = 'Maputo' | 'Beira' | 'Nampula' | 'Xai-Xai' | 'Gaza' | 'Tete';
export type ProductCategory = 'PVA' | 'Enamel' | 'Undercoat' | 'Texture' | 'Industrial';
export type ProductTier = 'Economic' | 'Premium';
export type MovementTier = 'Fast Mover' | 'Medium Mover' | 'Slow Mover' | 'Dead Stock';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  tier: ProductTier;
  unit: 'L' | 'KG';
  unitSize: number;
  weightKg: number; // Crucial for 30T truck logic
  price: number;
  cost: number; // For margin analysis
}

export interface ProductionOrder {
  id: string; // PO Number
  moNumber: string; // MO Number
  lotNumber: string; // YYMMWKXX#####
  productId: string;
  plannedQty: number;
  producedQty: number; // Manufacturing Output
  filledQty: number; // Filling Output
  warehouseReceivedQty: number; // Warehouse Output
  dateCreated: string;
  status: 'Planned' | 'In Production' | 'Filling' | 'QC Pending' | 'Warehouse Received' | 'Dispatched';
  varianceNote?: string;
}

export interface StockLevel {
  productId: string;
  region: Region;
  quantity: number;
  reorderLevel: number;
  safetyStock: number;
  consumptionRate: number; // Avg units per day
  daysCover: number;
  movementTier: MovementTier; // New: For prioritizing stock logic
}

export interface SalesRep {
  id: string;
  name: string;
  region: Region;
  targetMonthly: number;
  actualMonthly: number;
  customers: Customer[];
}

export interface Customer {
  id: string;
  name: string;
  tier: 'A' | 'B' | 'C' | 'D';
  region: Region;
  totalRevenueYTD: number;
  lastPurchaseDate: string;
}

export interface DispatchRecord {
  id: string;
  date: string;
  type: 'Customer Order' | 'Satellite Transfer';
  destination: string; // Customer Name or Region Name
  items: { productId: string; quantity: number; lotNumber?: string }[];
  status: 'Picking' | 'Loading' | 'Loaded' | 'Dispatched' | 'Delivered';
  truckId?: string;
}

export interface TruckLoad {
  id: string;
  destination: Region;
  status: 'Loading' | 'In Transit' | 'Delivered';
  totalWeightKg: number;
  maxWeightKg: 30000;
  items: { productId: string; quantity: number }[];
  eta?: string;
}