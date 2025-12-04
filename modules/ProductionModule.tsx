import React, { useState } from 'react';
import { Plus, CheckCircle, AlertTriangle, Printer, Search, ArrowRight, Activity, Package } from 'lucide-react';
import { ProductionOrder } from '../types';
import { PRODUCTS, MOCK_DB } from '../utils/mockDb';
import "../index.css"

const ProductionModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'tracking'>('tracking');
  const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCTS[0].id);
  const [plannedQty, setPlannedQty] = useState<number>(1000);
  const [orders, setOrders] = useState<ProductionOrder[]>(MOCK_DB.production);

  // --- NEW LOT LOGIC ---
  const generateLotNumber = (moId: string): string => {
    // YYMMWKXX##### format
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');

    // Calculate week number (ISO week approx)
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(days / 7).toString().padStart(2, '0');

    const sequence = moId.slice(-5).padStart(5, '0');

    return `${yy}${mm}WK${week}${sequence}`;
  };

  const handleCreateOrder = () => {
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();
    const moNumber = `${new Date().getFullYear()}${randomId}.00`;
    const lotNumber = generateLotNumber(randomId);

    const newOrder: ProductionOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      moNumber: moNumber,
      lotNumber: lotNumber,
      productId: selectedProduct,
      plannedQty: plannedQty,
      producedQty: 0,
      filledQty: 0,
      warehouseReceivedQty: 0,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'Planned'
    };

    setOrders([newOrder, ...orders]);
    setActiveTab('tracking');
  };

  const getStatusColor = (status: ProductionOrder['status']) => {
    switch(status) {
      case 'Planned': return 'bg-slate-100 text-slate-600';
      case 'In Production': return 'bg-blue-100 text-blue-800';
      case 'Filling': return 'bg-purple-100 text-purple-800';
      case 'QC Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Warehouse Received': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Production & Traceability</h2>
          <p className="text-slate-500">End-to-end trace: PO → Manufacturing → Filling → Warehouse.</p>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'create' ? 'bg-[#003882] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Plus size={16} className="inline mr-1" /> New PO
          </button>
          <button
             onClick={() => setActiveTab('tracking')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'tracking' ? 'bg-[#003882] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Live Floor
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-6">Create Production Order (PO)</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003882] outline-none"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.tier})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planned Quantity (Units)</label>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003882] outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">System Auto-Generation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">MO Number:</span>
                    <span className="font-mono font-medium">2025XXXXX.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Traceability LOT:</span>
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-[#003882]">YYMMWKXX#####</span>
                      <span className="text-[10px] text-slate-400">Year-Month-Week-Seq</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full bg-[#003882] hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200"
              >
                Generate Order & LOT
              </button>
            </div>
          </div>

          <div className="space-y-6">
             {/* Workflow Explainer */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  3-Way Match Protocol
                </h3>
                <div className="space-y-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-700"></div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#003882] border-4 border-slate-800 flex items-center justify-center text-[10px] font-bold">1</div>
                    <p className="font-bold text-blue-200">Production Output</p>
                    <p className="text-xs text-slate-400">Target quantity defined in Manufacturing Order (MO).</p>
                  </div>
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#d3122a] border-4 border-slate-800 flex items-center justify-center text-[10px] font-bold">2</div>
                    <p className="font-bold text-red-200">Filling Output</p>
                    <p className="text-xs text-slate-400">Actual units filled. Variance triggers alert if &gt; 1%.</p>
                  </div>
                  <div className="relative pl-10">
                     <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-600 border-4 border-slate-800 flex items-center justify-center text-[10px] font-bold">3</div>
                     <p className="font-bold text-green-200">Warehouse Receipt</p>
                     <p className="text-xs text-slate-400">Final count scanned into stock. Must match Filling Qty.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-4">
              <h3 className="font-semibold text-slate-700">Active Production Batches</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Scan LOT or MO..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#003882]"
                />
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-4">LOT Number</th>
                   <th className="px-6 py-4">Product</th>
                   <th className="px-6 py-4 text-center">Plan</th>
                   <th className="px-6 py-4 text-center">Fill</th>
                   <th className="px-6 py-4 text-center">Recv</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Variance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {orders.map((order) => {
                    const product = PRODUCTS.find(p => p.id === order.productId);
                    const fillVariance = order.producedQty > 0 ? ((order.plannedQty - order.filledQty) / order.plannedQty) * 100 : 0;
                    const isVarianceHigh = fillVariance > 2 && order.status !== 'Planned';

                    return (
                     <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="font-mono font-bold text-[#003882]">{order.lotNumber}</div>
                         <div className="text-xs text-slate-400">MO: {order.moNumber}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-slate-800">{product?.name}</div>
                         <div className="text-xs text-slate-500">{product?.category} • {product?.tier}</div>
                       </td>
                       <td className="px-6 py-4 text-center font-mono text-slate-600">{order.plannedQty}</td>
                       <td className="px-6 py-4 text-center font-mono text-purple-600 bg-purple-50 rounded-lg">{order.filledQty || '-'}</td>
                       <td className="px-6 py-4 text-center font-mono text-green-600 bg-green-50 rounded-lg">{order.warehouseReceivedQty || '-'}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                           {order.status}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         {isVarianceHigh ? (
                           <div className="flex items-center text-red-600 text-xs font-bold">
                             <AlertTriangle size={14} className="mr-1" />
                             -{fillVariance.toFixed(1)}%
                           </div>
                         ) : (
                           order.status === 'Warehouse Received' && <div className="text-green-500 text-xs flex items-center"><CheckCircle size={14} className="mr-1" /> Match</div>
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
    </div>
  );
};

export default ProductionModule;
