import { 
  X, Activity, CalendarDays, Layers, Users, KeyRound, Lock, Mail, BookOpen, Rocket 
} from 'lucide-react';
import { useApp } from '../context/useApp';

export const MobileMenuDrawer = ({ 
  isOpen, onClose, onOpenAddMember, onOpenAddTask, onOpenChangePassword, onOpenContact, onOpenRules 
}) => {
  const { currentTab, setCurrentTab, isAdmin, currentOperator, logout } = useApp();
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', serial: 'SYS-01', icon: Activity },
    { id: 'attendance', label: 'ATTENDANCE', serial: 'SYS-02', icon: CalendarDays },
    { id: 'tasks', label: 'WORK', serial: 'SYS-03', icon: Layers },
    { id: 'members', label: 'MEMBER LIST', serial: 'SYS-04', icon: Users },
  ];

  const systemActions = [
    { label: 'CONTACT', serial: 'COM-01', icon: Mail, onClick: onOpenContact, show: true },
    { label: 'CHANGE PASSWORD', serial: 'SEC-01', icon: KeyRound, onClick: onOpenChangePassword, show: isAdmin },
    { label: 'LOCK TERMINAL', serial: 'SEC-02', icon: Lock, onClick: logout, show: true },
  ];

  const quickActions = [
    { label: '+ ADD NEW MEMBER', onClick: onOpenAddMember, show: isAdmin, primary: true },
    { label: '+ ISSUE WORK', onClick: onOpenAddTask, show: isAdmin, primary: false },
    { label: 'RULES & REGULATIONS', icon: BookOpen, onClick: onOpenRules, show: true, outline: true },
  ];

  const handleAction = (cb) => {
    onClose();
    if (cb) cb();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
      <div onClick={(e) => e.stopPropagation()} className="beige-chassis w-4/5 max-w-sm h-full p-5 hard-shadow-lg flex flex-col justify-between overflow-y-auto border-r-2 border-[#1E1F22]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D95D24] text-white flex items-center justify-center border-2 border-[#1E1F22]">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="font-display font-black text-sm text-[#1E1F22]">KLE SPACE CLUB</span>
            </div>
            <button onClick={onClose} aria-label="Close side menu bar" className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Operator */}
          <div className="bg-[#E6E1D6] p-3 border-2 border-[#1E1F22] mb-4 text-xs font-mono">
            <span className="text-[10px] text-[#6E737D] uppercase font-bold block mb-1">CURRENT OPERATOR:</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-[#1E1F22]">{currentOperator.full_name}</span>
              <span className={`px-1.5 py-0.2 text-[9px] font-bold border border-[#1E1F22] ${isAdmin ? 'bg-[#D95D24] text-white' : 'bg-[#3A6B5C] text-white'}`}>
                {currentOperator.role.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1.5 mb-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(() => setCurrentTab(item.id))}
                  className={`w-full flex items-center justify-between p-2.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all cursor-pointer ${
                    isActive ? 'bg-[#1E1F22] text-[#FFAE19] hard-shadow-sm' : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] text-[#6E737D]">{item.serial}</span>
                </button>
              );
            })}

            {/* System Controls */}
            <div className="pt-3 border-t-2 border-[#1E1F22] space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase block mb-1">SYSTEM CONTROLS:</span>
              {systemActions.filter(a => a.show).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.onClick)}
                    className="w-full flex items-center justify-between p-2.5 text-xs font-mono font-bold border-2 border-[#1E1F22] bg-[#F2EFE9] text-[#1E1F22] hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#D95D24]" />
                      <span>{action.label}</span>
                    </div>
                    <span className="text-[9px] text-[#6E737D]">{action.serial}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Quick Launch Drawer Footer */}
        <div className="pt-4 border-t-2 border-[#1E1F22] space-y-2">
          {quickActions.filter(a => a.show).map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.onClick)}
              className={`w-full py-2.5 px-3 text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 border-[#1E1F22] transition-all cursor-pointer ${
                action.primary
                  ? 'bg-[#D95D24] text-white hover:bg-[#BF4D1A]'
                  : action.outline
                  ? 'bg-[#E6E1D6] text-[#1E1F22] hover:bg-white'
                  : 'bg-[#1E1F22] text-[#FFAE19] hover:bg-[#2A2B30]'
              }`}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          ))}
          <p className="text-center text-[10px] font-mono text-[#6E737D] pt-2">
            KLE SPACE CLUB • SYSTEM CONSOLE
          </p>
        </div>
      </div>
    </div>
  );
};
