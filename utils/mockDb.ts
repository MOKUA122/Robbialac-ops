import { Product, StockLevel, SalesRep, Customer, ProductionOrder, Region, DispatchRecord, MovementTier } from '../types';

// --- CONSTANTS ---
export const PRODUCTS: Product[] = [
  { id: 'P001', name: 'Robbialac PVA White 20L', category: 'PVA', tier: 'Economic', unit: 'L', unitSize: 20, weightKg: 25, price: 1500, cost: 900 },
  { id: 'P002', name: 'Permaplasto Exterior 25L', category: 'Undercoat', tier: 'Economic', unit: 'L', unitSize: 25, weightKg: 32, price: 1200, cost: 700 },
  { id: 'P003', name: 'Crown Silk Velveto 5L', category: 'PVA', tier: 'Premium', unit: 'L', unitSize: 5, weightKg: 6, price: 2500, cost: 1200 },
  { id: 'P004', name: 'Robbialac Gloss Enamel Red 5L', category: 'Enamel', tier: 'Premium', unit: 'L', unitSize: 5, weightKg: 5.5, price: 1800, cost: 950 },
  { id: 'P005', name: 'Micaflex Texture Sand 20kg', category: 'Texture', tier: 'Economic', unit: 'KG', unitSize: 20, weightKg: 20, price: 1100, cost: 600 },
  { id: 'P006', name: 'Crown Premium Primer 200L', category: 'Industrial', tier: 'Economic', unit: 'L', unitSize: 200, weightKg: 220, price: 15000, cost: 9000 },
];

const REGIONS: Region[] = ['Maputo', 'Beira', 'Nampula', 'Xai-Xai', 'Gaza', 'Tete'];

// --- GENERATORS ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateStockLevels = (): StockLevel[] => {
  const stock: StockLevel[] = [];
  REGIONS.forEach(region => {
    PRODUCTS.forEach(product => {
      // Logic: Maputo has huge stock, satellites have less
      const isHub = region === 'Maputo';
      const baseQty = isHub ? getRandomInt(5000, 10000) : getRandomInt(100, 2000);
      const consumption = isHub ? getRandomInt(200, 500) : getRandomInt(20, 100);
      
      // Calculate ROL based on consumption * lead time (approx 7 days for satellites) + safety stock
      const leadTime = isHub ? 1 : 7;
      const safetyStock = Math.floor(consumption * (isHub ? 2 : 5)); 
      const rol = (consumption * leadTime) + safetyStock;

      // Determine Movement Tier based on consumption
      let tier: MovementTier = 'Medium Mover';
      if (consumption > 300) tier = 'Fast Mover';
      if (consumption < 50) tier = 'Slow Mover';
      if (baseQty > 0 && consumption < 10) tier = 'Dead Stock';

      stock.push({
        productId: product.id,
        region,
        quantity: baseQty,
        reorderLevel: rol,
        safetyStock,
        consumptionRate: consumption,
        daysCover: Math.floor(baseQty / consumption),
        movementTier: tier
      });
    });
  });
  return stock;
};

export const generateSalesReps = (): SalesRep[] => {
  return [
    { 
      id: 'REP01', name: 'Kumar', region: 'Beira', 
      targetMonthly: 2500000, actualMonthly: 2800000, 
      customers: generateCustomers('Beira') 
    },
    { 
      id: 'REP02', name: 'Imran', region: 'Nampula', 
      targetMonthly: 3000000, actualMonthly: 2100000, 
      customers: generateCustomers('Nampula') 
    },
    { 
      id: 'REP03', name: 'Laura', region: 'Xai-Xai', // Covers Gaza too in logic
      targetMonthly: 1500000, actualMonthly: 1450000, 
      customers: generateCustomers('Xai-Xai') 
    },
    { 
      id: 'REP04', name: 'Carlos', region: 'Maputo', 
      targetMonthly: 8000000, actualMonthly: 8500000, 
      customers: generateCustomers('Maputo') 
    },
  ];
};

const generateCustomers = (region: Region): Customer[] => {
  const tiers: ('A'|'B'|'C'|'D')[] = ['A', 'B', 'C', 'C', 'D', 'D', 'D'];
  const customers: Customer[] = [];
  const count = getRandomInt(5, 12);
  
  for(let i=0; i<count; i++) {
    customers.push({
      id: `CUST-${region.substring(0,3).toUpperCase()}-${i}`,
      name: `${region} Hardware ${i+1} Lda`,
      tier: tiers[getRandomInt(0, tiers.length-1)],
      region: region,
      totalRevenueYTD: getRandomInt(100000, 5000000),
      lastPurchaseDate: new Date(2023, getRandomInt(0, 11), getRandomInt(1, 28)).toISOString().split('T')[0]
    });
  }
  return customers.sort((a,b) => b.totalRevenueYTD - a.totalRevenueYTD);
};

export const generateProductionOrders = (): ProductionOrder[] => {
  const orders: ProductionOrder[] = [];
  const statuses: ProductionOrder['status'][] = ['Planned', 'In Production', 'Filling', 'QC Pending', 'Warehouse Received', 'Dispatched'];
  
  for (let i = 0; i < 20; i++) {
    const product = PRODUCTS[getRandomInt(0, PRODUCTS.length - 1)];
    const planned = getRandomInt(50, 500) * 10; // Round numbers
    const produced = planned; // Perfect production usually
    const filled = Math.floor(produced * (Math.random() * (1 - 0.98) + 0.98)); // 0-2% loss
    const received = Math.floor(filled * (Math.random() * (1 - 0.99) + 0.99)); // 0-1% loss
    
    // Generate LOT: YYMMWKXX#####
    const moId = (10000 + i).toString();
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const week = '05'; // Static for demo
    const lot = `${yy}${mm}WK${week}${moId.slice(-5)}`;

    const status = statuses[getRandomInt(0, statuses.length - 1)];

    orders.push({
      id: `PO-${2024000+i}`,
      moNumber: `${2024}${moId}.00`,
      lotNumber: lot,
      productId: product.id,
      plannedQty: planned,
      producedQty: status === 'Planned' ? 0 : produced,
      filledQty: (status === 'Planned' || status === 'In Production') ? 0 : filled,
      warehouseReceivedQty: (status === 'Warehouse Received' || status === 'Dispatched') ? received : 0,
      dateCreated: new Date().toISOString().split('T')[0],
      status: status,
      varianceNote: (filled < planned || received < filled) ? 'Minor variance detected' : undefined
    });
  }
  return orders;
};

export const generateDispatchRecords = (): DispatchRecord[] => {
  const records: DispatchRecord[] = [];
  
  // Recent Customer Orders
  for(let i=0; i<8; i++) {
    records.push({
      id: `DSP-C-${1000+i}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Customer Order',
      destination: `Customer: ${['Maputo Builders', 'Beira Const', 'Nampula Retail'][getRandomInt(0,2)]}`,
      items: [{ productId: 'P001', quantity: getRandomInt(50, 200) }],
      status: 'Dispatched'
    });
  }

  // Recent Satellite Transfers
  for(let i=0; i<4; i++) {
    records.push({
      id: `DSP-T-${5000+i}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Satellite Transfer',
      destination: ['Beira', 'Nampula', 'Xai-Xai'][getRandomInt(0,2)],
      items: [
        { productId: 'P001', quantity: getRandomInt(500, 1000) },
        { productId: 'P003', quantity: getRandomInt(100, 300) }
      ],
      status: 'Loading',
      truckId: `TRK-${getRandomInt(10,99)}`
    });
  }
  
  return records;
};

// Initial Data Load
export const MOCK_DB = {
  stock: generateStockLevels(),
  reps: generateSalesReps(),
  production: generateProductionOrders(),
  dispatch: generateDispatchRecords()
};