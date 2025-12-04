import React, { useState } from 'react';
import { Truck, AlertTriangle, Package, MapPin, Scale, CalendarClock, ArrowRight, CheckCircle, ClipboardCheck, ArrowUpRight, ArrowDownLeft, BarChart3 } from 'lucide-react';
import { StockLevel, Product, ProductionOrder } from '../types';
import { MOCK_DB, PRODUCTS } from '../utils/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const WarehouseModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'inbound' | 'outbound'>('stocks');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const stocks = MOCK_DB.stock;
  const inboundOrders = MOCK_DB.production.filter(p => ['Filling', 'QC Pending', 'Warehouse Received'].includes(p.status));
  const [dispatchRecords, setDispatchRecords] = useState(MOCK_DB.dispatch);

  // --- REPLENISHMENT LOGIC ---
  const calculateTransferNeeds = (stock: StockLevel) => {
    const product = PRODUCTS.find(p => p.id === stock.productId);
    if (!product) return null;

    // Formula: If Stock < ROL
    // Deficit = (ROL * 1.5) - Current Stock (Targeting 1.5x ROL for safety)
    const isCritical = stock.quantity < stock.safetyStock;
    const isLow = stock.quantity < stock.reorderLevel;
    
    if (!isLow) return null;

    const targetLevel = Math.floor(stock.reorderLevel * 1.5);
    const deficitUnits = targetLevel - stock.quantity;
    const totalWeightKg = deficitUnits * product.weightKg;

    return {
      product,
      deficitUnits,
      totalWeightKg,
      urgency: isCritical ? 'Critical' : 'Warning'
    };
  };

  // Generate Truck Loads based on deficits
  const generateProposedTrucks = (region: string) => {
    const regionStocks = stocks.filter(s => s.region === region);
    const loads: any[] = [];
    let currentTruckWeight = 0;
    let currentTruckItems: any[] = [];

    regionStocks.forEach(stock => {
      const need = calculateTransferNeeds(stock);
      if (need) {
        // Simple bin packing: add to truck until full
        if (currentTruckWeight + need.totalWeightKg > 30000) {
          // Push current truck
          if (currentTruckWeight > 0) {
             loads.push({ weight: currentTruckWeight, items: currentTruckItems });
          }
          // Start new truck
          currentTruckWeight = need.totalWeightKg;
          currentTruckItems = [need];
        } else {
          currentTruckWeight += need.totalWeightKg;
          currentTruckItems.push(need);
        }
      }
    });
    // Push last truck
    if (currentTruckWeight > 0) {
      loads.push({ weight: currentTruckWeight, items: currentTruckItems });
    }
    return loads;
  };

  const handleConfirmDelivery = (id: string) => {
    setDispatchRecords(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status: 'Delivered' } : rec
    ));
  };

  const chartData = stocks
    .filter(s => s.productId === 'P001') // Visualizing main product only for clarity
    .map(s => ({
      region: s.region,
      Stock: s.quantity,
      ROL: s.reorderLevel,
      Safety: s.safetyStock
    }));

  // Data for Tier Distribution Chart
  const tierChartData = ['Maputo', 'Beira', 'Nampula', 'Xai-Xai', 'Gaza', 'Tete'].map(region => {
    const regionStocks = stocks.filter(s => s.region === region);
    return {
      name: region,
      'Fast Mover': regionStocks.filter(s => s.movementTier === 'Fast Mover').reduce((acc, s) => acc + s.quantity, 0),
      'Medium Mover': regionStocks.filter(s => s.movementTier === 'Medium Mover').reduce((acc, s) => acc + s.quantity, 0),
      'Slow Mover': regionStocks.filter(s => s.movementTier === 'Slow Mover').reduce((acc, s) => acc + s.quantity, 0),
      'Dead Stock': regionStocks.filter(s => s.movementTier === 'Dead Stock').reduce((acc, s) => acc + s.quantity, 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex space-x-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stocks' ? 'bg-[#003882] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Package className="w-4 h-4 mr-2" />
          Stock Levels & Tiers
        </button>
        <button
          onClick={() => setActiveTab('inbound')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inbound' ? 'bg-[#003882] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          Inbound Receipts (Picked)
        </button>
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'outbound' ? 'bg-[#003882] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Dispatch & Transfers
        </button>
      </div>

      {activeTab === 'stocks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stock Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-semibold text-slate-800">Regional Stock Levels (Robbialac PVA 20L)</h3>
                 <div className="flex items-center space-x-2 text-sm">
                    <span className="flex items-center"><div className="w-3 h-3 bg-[#d3122a] rounded-sm mr-1"></div> ROL</span>
                    <span className="flex items-center"><div className="w-3 h-3 bg-[#003882] rounded-sm mr-1"></div> Current</span>
                 </div>
               </div>
               <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="region" />
                     <YAxis />
                     <Tooltip cursor={{fill: '#f8fafc'}} />
                     <ReferenceLine y={0} stroke="#000" />
                     <Bar dataKey="Stock" fill="#003882" radius={[4, 4, 0, 0]} barSize={40} />
                     <Bar dataKey="ROL" fill="#d3122a" radius={[4, 4, 0, 0]} barSize={40} opacity={0.3} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Receiving Capacity & Constraints */}
            <div className="bg-[#002f6c] text-white p-6 rounded-xl shadow-lg">
               <h3 className="font-semibold mb-4 flex items-center">
                 <MapPin className="w-5 h-5 mr-2 text-[#facc15]" />
                 Warehouse Constraints
               </h3>
               <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-300">Nampula Hub</span>
                      <span className="text-xs text-green-900 bg-green-400 px-2 py-0.5 rounded">High Capacity</span>
                    </div>
                    <div className="w-full bg-blue-900/50 rounded-full h-2 mb-1">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400">Can handle 4-5 trucks/day. Regional redistribution hub.</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-300">Beira</span>
                      <span className="text-xs text-yellow-900 bg-[#facc15] px-2 py-0.5 rounded">Constrained</span>
                    </div>
                    <div className="w-full bg-blue-900/50 rounded-full h-2 mb-1">
                      <div className="bg-[#facc15] h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400">Max 1-2 trucks/day. Narrow access road.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* New Chart: Stock Movement Tiers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-[#003882]" />
                Inventory Health: Movement Tiers by Region
              </h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="Fast Mover" stackId="a" fill="#22c55e" name="Fast Moving" />
                  <Bar dataKey="Medium Mover" stackId="a" fill="#003882" name="Medium Moving" />
                  <Bar dataKey="Slow Mover" stackId="a" fill="#f97316" name="Slow Moving" />
                  <Bar dataKey="Dead Stock" stackId="a" fill="#d3122a" name="Dead Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-slate-500 text-center">
              * Quantities shown are total units across all product categories. "Dead Stock" represents items with &lt;10 units monthly movement.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">Detailed Stock Ledger</h3>
               <select 
                  className="bg-white border border-slate-300 text-sm rounded-lg p-2"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="All">All Regions</option>
                  <option value="Maputo">Maputo</option>
                  <option value="Beira">Beira</option>
                  <option value="Nampula">Nampula</option>
               </select>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                     <th className="px-6 py-4">Region</th>
                     <th className="px-6 py-4">Product Details</th>
                     <th className="px-6 py-4 text-center">Movement Tier</th>
                     <th className="px-6 py-4 text-center">In Stock</th>
                     <th className="px-6 py-4 text-center">Days Cover</th>
                     <th className="px-6 py-4 text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {stocks
                      .filter(s => selectedRegion === 'All' || s.region === selectedRegion)
                      .map((stock, idx) => {
                     const product = PRODUCTS.find(p => p.id === stock.productId);
                     const isLow = stock.quantity < stock.reorderLevel;
                     
                     return (
                       <tr key={idx} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{stock.region}</td>
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900">{product?.name}</div>
                           <div className="text-xs text-slate-500">{product?.category} • {product?.tier}</div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <span className={`
                              inline-flex px-2 py-1 rounded text-xs font-bold border
                              ${stock.movementTier === 'Fast Mover' ? 'bg-green-50 text-green-700 border-green-200' :
                                stock.movementTier === 'Slow Mover' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                stock.movementTier === 'Dead Stock' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'}
                           `}>
                             {stock.movementTier}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center font-mono">{stock.quantity}</td>
                         <td className="px-6 py-4 text-center">
                            <span className="font-mono">{stock.daysCover}</span>
                            <span className="text-xs text-slate-400 ml-1">days</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                           {isLow ? (
                             <span className="inline-flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                               <AlertTriangle size={12} className="mr-1" /> Reorder
                             </span>
                           ) : (
                             <span className="inline-flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                               <CheckCircle size={12} className="mr-1" /> Safe
                             </span>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'inbound' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-blue-50">
             <div className="flex items-center mb-2">
                <ClipboardCheck className="w-5 h-5 mr-2 text-[#003882]" />
                <h3 className="font-bold text-slate-800 text-lg">Inbound Verification (3-Way Match)</h3>
             </div>
             <p className="text-sm text-slate-600 max-w-2xl">
               Confirm receipt of Finished Goods from Production/Filling. Ensure "Picked/Received" quantity matches the "Filled" quantity stated on the manifest.
             </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Batch / LOT</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">1. Produced (MO)</th>
                  <th className="px-6 py-4 text-center">2. Filled Qty</th>
                  <th className="px-6 py-4 text-center bg-blue-50 border-x border-blue-100 text-[#003882] font-bold">3. Received (Picked)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inboundOrders.map(order => {
                  const product = PRODUCTS.find(p => p.id === order.productId);
                  const isMatch = order.filledQty === order.warehouseReceivedQty;
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-800">{order.lotNumber}</div>
                        <div className="text-xs text-slate-400">MO: {order.moNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{product?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500">{order.plannedQty}</td>
                      <td className="px-6 py-4 text-center font-medium">{order.filledQty}</td>
                      <td className="px-6 py-4 text-center bg-blue-50/30 border-x border-slate-100">
                         {order.status === 'Warehouse Received' ? (
                           <span className={`font-bold ${isMatch ? 'text-green-600' : 'text-red-600'}`}>
                             {order.warehouseReceivedQty}
                           </span>
                         ) : (
                           <span className="text-slate-400 italic">--</span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium 
                          ${order.status === 'QC Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                        `}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status !== 'Warehouse Received' && (
                          <button className="px-3 py-1 bg-[#003882] text-white text-xs font-bold rounded hover:bg-blue-800 shadow-sm">
                            Confirm Receipt
                          </button>
                        )}
                        {order.status === 'Warehouse Received' && isMatch && (
                          <div className="flex items-center text-green-600 text-xs font-bold">
                            <CheckCircle size={14} className="mr-1" /> Verified
                          </div>
                        )}
                         {order.status === 'Warehouse Received' && !isMatch && (
                          <div className="flex items-center text-red-600 text-xs font-bold">
                            <AlertTriangle size={14} className="mr-1" /> Variance
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'outbound' && (
        <div className="space-y-6">
          
          {/* Section 1: Replenishment Needs (Existing Logic Enhanced) */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-slate-600" />
              Satellite Replenishment Planner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Beira', 'Nampula', 'Xai-Xai'].map(region => {
                const trucks = generateProposedTrucks(region);
                if (trucks.length === 0) return null;

                return (
                  <div key={region} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-bold text-slate-700">{region} Transfer</h4>
                      <span className="text-xs font-bold bg-[#003882] text-white px-2 py-1 rounded">
                        {trucks.length} Truck(s)
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {trucks.map((truck, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative">
                          <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            TRUCK {idx + 1}
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Payload:</span>
                            <span className={`font-bold ${truck.weight > 28000 ? 'text-green-600' : 'text-orange-600'}`}>
                              {(truck.weight / 1000).toFixed(1)} / 30 Tons
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full mb-3">
                            <div 
                              className={`h-1.5 rounded-full ${truck.weight > 29000 ? 'bg-[#d3122a]' : 'bg-green-500'}`} 
                              style={{ width: `${(truck.weight / 30000) * 100}%` }}
                            ></div>
                          </div>
                          <ul className="space-y-1">
                            {truck.items.map((item: any, i: number) => (
                              <li key={i} className="text-xs flex justify-between text-slate-600 border-b border-slate-100 pb-1 last:border-0">
                                <span>{item.product.name}</span>
                                <span className="font-mono">{item.deficitUnits} units</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <button className="w-full mt-2 bg-[#003882] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
                        Create Dispatch Note
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Outbound Log */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Outbound Movement Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Dispatch ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Destination</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {dispatchRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono text-slate-600">{rec.id}</td>
                        <td className="px-6 py-3">{rec.date}</td>
                        <td className="px-6 py-3 font-medium">{rec.destination}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                            rec.type === 'Customer Order' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {rec.type}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                           <span className="text-xs font-bold text-slate-500 uppercase">{rec.status}</span>
                        </td>
                        <td className="px-6 py-3">
                            {rec.status === 'Dispatched' && (
                                <button 
                                    onClick={() => handleConfirmDelivery(rec.id)}
                                    className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center bg-green-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <CheckCircle size={14} className="mr-1" /> Confirm Delivery
                                </button>
                            )}
                            {rec.status === 'Delivered' && (
                                <span className="text-green-600 text-xs font-bold flex items-center">
                                    <CheckCircle size={14} className="mr-1" /> Delivered
                                </span>
                            )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseModule;