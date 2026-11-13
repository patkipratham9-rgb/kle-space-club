import { useState, useEffect } from 'react';
import { Rocket, Users, CalendarDays, Layers, Clock, Activity, Menu } from 'lucide-react';
import { useApp } from '../context/useApp';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { currentTab, setCurrentTab, members, tasks } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Activity, count: null },
    { id: 'attendance', label: 'ATTENDANCE', icon: CalendarDays, count: null },
    { id: 'tasks', label: 'WORK', icon: Layers, count: tasks.filter(t => t?.status?.toLowerCase() !== 'completed').length },
    { id: 'members', label: 'MEMBER LIST', icon: Users, count: members.length },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141517] border-b-2 border-[#1E1F22]">
      <div className="hidden md:flex items-center justify-between px-6 py-1 bg-[#0E0F12] border-b border-[#1E1F22] text-[11px] font-mono text-[#A0A5AD]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#D95D24] font-bold tracking-wider">
            <span className="w-2 h-2 bg-[#D95D24] animate-ping" />
            <span className="text-white">KLE Space Club</span>
          </div>
          <span className="text-[#3A3D45]">|</span>
          <span>TOTAL MEMBERS: <strong className="text-white font-bold">{members.length}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#FFAE19] bg-[#141517] px-2 py-0.5 border border-[#3A3D45]">
          <Clock className="w-3 h-3 text-[#FFAE19]" />
          <span>{currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <button 
            onClick={() => setCurrentTab('dashboard')} aria-label="Dashboard"
            className="w-10 h-10 bg-[#D95D24] border-2 border-[#1E1F22] hard-shadow-sm flex items-center justify-center text-white shrink-0 hover:bg-[#BF4D1A] transition-colors"
          >
            <Rocket className="w-6 h-6 stroke-[2.2]" />
          </button>

          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id} onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all whitespace-nowrap ${
                    isActive ? 'bg-[#F2EFE9] text-[#1E1F22] hard-shadow-sm translate-y-[-1px]' : 'bg-[#1E1F22] text-[#A0A5AD] hover:text-white hover:bg-[#2A2B30]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D95D24]' : 'text-[#8A8F99]'}`} />
                  <span className="tracking-wider">{item.label}</span>
                  {item.count !== null && (
                    <span className={`px-1 py-0.2 text-[9px] font-mono ${isActive ? 'bg-[#1E1F22] text-white' : 'bg-[#0E0F12] text-[#8A8F99]'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => onOpenMobileMenu()}
            className="mechanical-btn flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22] hover:bg-white border-2 border-[#1E1F22] hard-shadow-sm cursor-pointer"
            aria-label="Open Side Menu Bar"
          >
            <Menu className="w-4 h-4 text-[#D95D24]" />
            <span className="tracking-wider">MENU</span>
          </button>
        </div>
      </div>
    </header>
  );
};
