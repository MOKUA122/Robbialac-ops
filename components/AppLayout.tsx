import React, { useState } from 'react';
import { 
  Factory, 
  Package, 
  Truck, 
  BarChart3, 
  Video, 
  LayoutDashboard,
  Menu,
  X,
  Users
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, activeModule, setActiveModule }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Management Overview', icon: LayoutDashboard },
    { id: 'production', label: 'Production & Filling', icon: Factory },
    { id: 'warehouse', label: 'Warehouse & Dispatch', icon: Package },
    { id: 'sales', label: 'Sales Team', icon: Users },
    { id: 'accounting', label: 'Accounting & Finance', icon: BarChart3 },
    { id: 'veo', label: 'Veo Studio', icon: Video },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar for Desktop - Robbialac Deep Blue #003882 */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#003882] text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-blue-800">
          <div className="flex items-center space-x-2">
            {/* Logo Placeholder - Red Accent */}
            <div className="w-8 h-8 bg-[#d3122a] rounded-lg flex items-center justify-center border border-[#facc15]">
              <span className="font-bold text-white">R</span>
            </div>
            <div className="leading-none">
               <span className="block text-lg font-bold tracking-tight text-white">Robbialac</span>
               <span className="block text-[10px] text-[#facc15] tracking-widest uppercase">Tintas Berger</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 group
                ${activeModule === item.id 
                  ? 'bg-[#d3122a] text-white shadow-md' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'}
              `}
            >
              <item.icon size={20} className={activeModule === item.id ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-800 bg-[#002f6c]">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-blue-700 border-2 border-[#facc15] flex items-center justify-center text-xs font-bold text-white">
                MJ
             </div>
             <div>
               <p className="text-sm font-medium text-white">Manager User</p>
               <p className="text-xs text-blue-300">Maputo HQ</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-slate-200">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden text-[#003882] hover:text-[#d3122a]"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-xs font-medium px-2 py-1 bg-[#d3122a]/10 text-[#d3122a] rounded-full border border-[#d3122a]/20">
              Operations Live
            </span>
            <span className="w-2 h-2 bg-[#003882] rounded-full animate-pulse"></span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;