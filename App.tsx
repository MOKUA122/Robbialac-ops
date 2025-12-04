import React, { useState } from 'react';
import AppLayout from './components/AppLayout';
import ProductionModule from './modules/ProductionModule';
import WarehouseModule from './modules/WarehouseModule';
import AccountingModule from './modules/AccountingModule';
import SalesModule from './modules/SalesModule';
import VeoStudio from './modules/VeoStudio';
import { LayoutDashboard, TrendingUp, AlertTriangle } from 'lucide-react';
import { MOCK_DB } from './utils/mockDb';
import "./index.css"

const DashboardOverview: React.FC = () => {
  const stockAlerts = MOCK_DB.stock.filter(s => s.quantity < s.reorderLevel).length;
  const activeMOs = MOCK_DB.production.filter(p => p.status === 'In Production').length;

  return (
    <div className="space-y-6">
      {/* Brand Gradient: Teal/Green to Deep Blue reflecting the poster aesthetic */}
      <div className="bg-gradient-to-r from-[#005f5f] to-[#003882] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border-b-4 border-[#facc15]">
        <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">Robbialac Ops Center</h1>
           <p className="text-teal-100 font-light">Pense Tinta, Pense Robbialac. Real-time visibility across Mozambique.</p>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                <p className="text-xs text-[#facc15] uppercase font-bold tracking-wider">Revenue (MTD)</p>
                <p className="text-2xl font-bold mt-1">4.2M MZN</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                <p className="text-xs text-[#facc15] uppercase font-bold tracking-wider">Stock Alerts</p>
                <p className={`text-2xl font-bold mt-1 ${stockAlerts > 0 ? 'text-red-300' : 'text-green-300'}`}>
                   {stockAlerts} Critical
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                <p className="text-xs text-[#facc15] uppercase font-bold tracking-wider">Active MOs</p>
                <p className="text-2xl font-bold mt-1">{activeMOs} Batches</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                <p className="text-xs text-[#facc15] uppercase font-bold tracking-wider">Fill Rate</p>
                <p className="text-2xl font-bold mt-1">98.4%</p>
              </div>
           </div>
        </div>
        {/* Decorative Swirls simulating the marble paint */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0f766e] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#003882] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-[#003882] mb-4 flex items-center">
             <AlertTriangle className="w-5 h-5 mr-2 text-[#d3122a]" />
             Exception Reporting
           </h3>
           <div className="space-y-4">
             {stockAlerts > 0 ? (
               <div className="flex items-start pb-4 border-b border-slate-100 last:border-0">
                  <div className="bg-red-50 text-[#d3122a] p-2 rounded-lg mr-3 shrink-0">
                     <LayoutDashboard size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Replenishment Required</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Nampula and Beira are below Reorder Levels for Robbialac PVA. Dispatch planner suggests 3 trucks.
                    </p>
                  </div>
               </div>
             ) : (
                <p className="text-sm text-slate-500 italic">No critical exceptions.</p>
             )}

             <div className="flex items-start pb-4 border-b border-slate-100 last:border-0">
                <div className="bg-blue-50 text-[#003882] p-2 rounded-lg mr-3 shrink-0">
                   <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Regional Growth Trend</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Xai-Xai Premium product penetration is up 12% MoM. Consider increasing Crown Silk Velveto stock for Laura.
                  </p>
                </div>
             </div>
           </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
           <h3 className="font-bold text-[#003882] mb-4">Management Quick Links</h3>
           <div className="grid grid-cols-2 gap-4">
             <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors group">
               <span className="block font-medium text-[#003882] mb-1 group-hover:text-[#d3122a] transition-colors">Approve Dispatch</span>
               <span className="text-xs text-slate-500">2 pending for Beira</span>
             </button>
             <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors group">
               <span className="block font-medium text-purple-600 mb-1 group-hover:text-purple-700">Veo Marketing</span>
               <span className="text-xs text-slate-500">Create new assets</span>
             </button>
             <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors group">
               <span className="block font-medium text-slate-700 mb-1 group-hover:text-[#003882]">Production Report</span>
               <span className="text-xs text-slate-500">View 3-way match variances</span>
             </button>
             <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors group">
               <span className="block font-medium text-slate-700 mb-1 group-hover:text-[#003882]">Sales Targets</span>
               <span className="text-xs text-slate-500">Review Rep performance</span>
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'production':
        return <ProductionModule />;
      case 'warehouse':
        return <WarehouseModule />;
      case 'accounting':
        return <AccountingModule />;
      case 'sales':
        return <SalesModule />;
      case 'veo':
        return <VeoStudio />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AppLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderModule()}
    </AppLayout>
  );
};

export default App;
