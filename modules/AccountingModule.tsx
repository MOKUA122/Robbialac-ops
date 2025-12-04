import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, Activity, BarChart3, AlertCircle } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Jan', Maputo: 4500, Beira: 2400, Nampula: 2400, Total: 9300 },
  { month: 'Feb', Maputo: 3000, Beira: 1398, Nampula: 2210, Total: 6608 },
  { month: 'Mar', Maputo: 2000, Beira: 9800, Nampula: 2290, Total: 14090 },
  { month: 'Apr', Maputo: 2780, Beira: 3908, Nampula: 2000, Total: 8688 },
  { month: 'May', Maputo: 1890, Beira: 4800, Nampula: 2181, Total: 8871 },
  { month: 'Jun', Maputo: 3500, Beira: 4200, Nampula: 3100, Total: 10800 },
];

const CATEGORY_PROFITABILITY = [
  { name: 'PVA (Vol)', value: 50, margin: '15%', color: '#003882' }, // Robbialac Blue
  { name: 'Enamels', value: 20, margin: '35%', color: '#d3122a' }, // Robbialac Red
  { name: 'Texture', value: 15, margin: '25%', color: '#facc15' }, // Gold/Yellow
  { name: 'Industrial', value: 15, margin: '45%', color: '#0f766e' }, // Teal
];

const MetricCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        {sub}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

const AccountingModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Intelligence</h2>
          <p className="text-slate-500">Revenue analytics, profitability margins, and cost-per-batch.</p>
        </div>
        <button className="bg-[#003882] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg hover:bg-blue-800 transition-colors">
          <BarChart3 className="w-4 h-4 mr-2" /> Download Report
        </button>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue YTD" value="48.2M MZN" sub="+12.5%" icon={DollarSign} color="bg-[#003882]" />
        <MetricCard title="Gross Profit Margin" value="32.4%" sub="+2.1%" icon={Activity} color="bg-[#d3122a]" />
        <MetricCard title="Cost of Goods Sold" value="32.6M MZN" sub="-1.4%" icon={AlertCircle} color="bg-orange-500" />
        <MetricCard title="Avg Batch Cost" value="185k MZN" sub="+0.5%" icon={TrendingUp} color="bg-[#0f766e]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-6">Revenue Trajectory by Region</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorMaputo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003882" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003882" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBeira" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Area type="monotone" dataKey="Maputo" stackId="1" stroke="#003882" fill="url(#colorMaputo)" />
                <Area type="monotone" dataKey="Beira" stackId="1" stroke="#0f766e" fill="url(#colorBeira)" />
                <Area type="monotone" dataKey="Nampula" stackId="1" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profitability Matrix */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-2">Profitability by Category</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PROFITABILITY}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_PROFITABILITY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                 <p className="text-xs text-slate-400">Avg Margin</p>
                 <p className="text-xl font-bold text-[#003882]">32%</p>
               </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
             <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Highest Margin</span>
                <span className="font-bold text-[#0f766e]">Industrial (45%)</span>
             </div>
             <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Volume Driver</span>
                <span className="font-bold text-[#003882]">PVA (15%)</span>
             </div>
          </div>
        </div>
      </div>

      {/* Dead Stock & Costing Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Dead Stock Analysis (Ageing &gt; 90 Days)</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 font-medium border-b border-slate-100">
                     <tr>
                        <th className="pb-2">Product</th>
                        <th className="pb-2">Region</th>
                        <th className="pb-2 text-right">Value</th>
                        <th className="pb-2 text-right">Age</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     <tr>
                        <td className="py-3 font-medium">Micaflex Texture Sand</td>
                        <td className="py-3 text-slate-500">Tete</td>
                        <td className="py-3 text-right text-[#d3122a]">45,000 MZN</td>
                        <td className="py-3 text-right">112 Days</td>
                     </tr>
                     <tr>
                        <td className="py-3 font-medium">Robbialac Enamel Red</td>
                        <td className="py-3 text-slate-500">Gaza</td>
                        <td className="py-3 text-right text-[#d3122a]">12,500 MZN</td>
                        <td className="py-3 text-right">95 Days</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Batch Costing Variance</h3>
            <p className="text-sm text-slate-500 mb-4">Comparison of Standard Cost vs Actual Manufacturing Cost.</p>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium">Batch MO-20250012 (PVA)</span>
                     <span className="text-green-600 font-bold">-2.5% Cost</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium">Batch MO-20250015 (Enamel)</span>
                     <span className="text-[#d3122a] font-bold">+5.1% Cost</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className="bg-[#d3122a] h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-xs text-[#d3122a] mt-1">Due to raw material price surge in resin.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AccountingModule;