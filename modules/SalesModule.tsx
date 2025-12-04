import React, { useState } from 'react';
import { Users, TrendingUp, Target, Award, MapPin } from 'lucide-react';
import { MOCK_DB } from '../utils/mockDb';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SalesModule: React.FC = () => {
  const [selectedRepId, setSelectedRepId] = useState<string>(MOCK_DB.reps[0].id);
  const activeRep = MOCK_DB.reps.find(r => r.id === selectedRepId) || MOCK_DB.reps[0];

  const pieData = [
    { name: 'Premium (Crown)', value: 35, color: '#003882' }, // Brand Blue
    { name: 'Economic (Robbialac)', value: 65, color: '#facc15' }, // Brand Gold
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Team Visibility</h2>
          <p className="text-slate-500">Rep performance, customer tiers, and regional penetration.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select 
            value={selectedRepId}
            onChange={(e) => setSelectedRepId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-[#003882] focus:border-[#003882] block w-full p-2.5 shadow-sm"
          >
            {MOCK_DB.reps.map(rep => (
              <option key={rep.id} value={rep.id}>{rep.name} - {rep.region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#003882] to-blue-900 rounded-xl p-6 text-white shadow-lg">
           <div className="flex items-start justify-between">
             <div>
               <p className="text-blue-100 font-medium text-sm">Monthly Achievement</p>
               <h3 className="text-3xl font-bold mt-1">{Math.round((activeRep.actualMonthly / activeRep.targetMonthly) * 100)}%</h3>
             </div>
             <div className="p-2 bg-white/20 rounded-lg">
               <Target className="w-6 h-6 text-white" />
             </div>
           </div>
           <div className="mt-4">
             <div className="flex justify-between text-xs text-blue-100 mb-1">
               <span>{activeRep.actualMonthly.toLocaleString()} MZN</span>
               <span>Target: {activeRep.targetMonthly.toLocaleString()}</span>
             </div>
             <div className="w-full bg-blue-900/30 rounded-full h-2">
               <div 
                 className="bg-[#facc15] h-2 rounded-full transition-all duration-1000" 
                 style={{ width: `${Math.min((activeRep.actualMonthly / activeRep.targetMonthly) * 100, 100)}%` }}
               ></div>
             </div>
           </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm mb-1">Top Performing Tier</p>
             <h3 className="text-2xl font-bold text-slate-800 flex items-center">
               Tier A <Award className="w-5 h-5 ml-2 text-[#facc15]" />
             </h3>
           </div>
           <p className="text-xs text-slate-400 mt-2">Driven by bulk purchases from construction firms in {activeRep.region}.</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm mb-1">Active Accounts</p>
             <h3 className="text-2xl font-bold text-slate-800">{activeRep.customers.length}</h3>
           </div>
           <div className="h-16 w-16">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} innerRadius={15} outerRadius={30} paddingAngle={5} dataKey="value">
                   {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Portfolio Overview</h3>
             <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">Sorted by Revenue</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">YTD Revenue</th>
                  <th className="px-6 py-4">Last Purchase</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeRep.customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cust.name}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold
                        ${cust.tier === 'A' ? 'bg-[#003882]/10 text-[#003882]' : 
                          cust.tier === 'B' ? 'bg-[#facc15]/20 text-yellow-800' : 
                          'bg-slate-100 text-slate-600'}
                      `}>
                        {cust.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{cust.totalRevenueYTD.toLocaleString()} MZN</td>
                    <td className="px-6 py-4 text-slate-500">{cust.lastPurchaseDate}</td>
                    <td className="px-6 py-4">
                      <button className="text-[#003882] hover:text-[#d3122a] font-medium text-xs">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Mix */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-6">Penetration Strategy</h3>
           
           <div className="space-y-6">
             <div>
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium text-slate-700">Economic (Volume Driver)</span>
                 <span className="font-bold text-[#003882]">65%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                 <div className="bg-[#003882] h-2 rounded-full" style={{ width: '65%' }}></div>
               </div>
               <p className="text-xs text-slate-400 mt-1">Leading with Robbialac PVA 20L in rural expansion.</p>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium text-slate-700">Premium (Margin Driver)</span>
                 <span className="font-bold text-[#d3122a]">35%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                 <div className="bg-[#d3122a] h-2 rounded-full" style={{ width: '35%' }}></div>
               </div>
               <p className="text-xs text-slate-400 mt-1">Focus on Tier A & B customers in city centers.</p>
             </div>

             <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
               <h4 className="text-yellow-800 font-bold text-xs uppercase mb-1 flex items-center">
                 <MapPin className="w-3 h-3 mr-1" />
                 Expansion Goal
               </h4>
               <p className="text-xs text-yellow-700">
                 {activeRep.region} needs +10% growth in Crown Premium sector to unlock quarterly bonus.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;