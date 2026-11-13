import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AttendancePortal } from './components/AttendancePortal';
import { TaskManagement } from './components/TaskManagement';
import { MemberManagement } from './components/MemberManagement';
import { AddMemberModal } from './components/AddMemberModal';
import { AddTaskModal } from './components/AddTaskModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ContactFormModal } from './components/ContactFormModal';
import { RulesAndRegulationsModal } from './components/RulesAndRegulationsModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { NotFoundView } from './components/NotFoundView';
import { LoginGateway } from './components/LoginGateway';
import { ToastContainer } from './components/Toast';
import { Phone } from 'lucide-react';

const TITLES = {
  dashboard: 'Dashboard | KLE Space Club',
  attendance: 'Attendance | KLE Space Club',
  tasks: 'Work | KLE Space Club',
  members: 'Member List | KLE Space Club'
};

const AppContent = () => {
  const { currentTab, setCurrentTab, isAuthenticated, isAdmin } = useApp();
  const [modal, setModal] = useState(null);

  useEffect(() => {
    document.title = TITLES[currentTab] || 'KLE Space Club';
  }, [currentTab]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && modal) setModal(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginGateway />
        <ToastContainer />
      </>
    );
  }

  const validTabs = ['dashboard', 'attendance', 'tasks', 'members'];

  return (
    <div className="min-h-screen bg-[#141517] nasa-rack-bg text-[#1E1F22] flex flex-col justify-between selection:bg-[#D95D24] selection:text-white overflow-x-hidden">
      <Navbar 
        onOpenChangePassword={() => setModal('password')}
        onOpenContact={() => setModal('contact')}
        onOpenMobileMenu={() => setModal('mobileMenu')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateToAttendance={() => setCurrentTab('attendance')}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            onNavigateToMembers={() => setCurrentTab('members')}
          />
        )}
        {currentTab === 'attendance' && <AttendancePortal />}
        {currentTab === 'tasks' && (
          <TaskManagement isCreateModalOpen={modal === 'addTask'} setIsCreateModalOpen={(open) => setModal(open ? 'addTask' : null)} />
        )}
        {currentTab === 'members' && (
          <MemberManagement isAddModalOpen={modal === 'addMember'} setIsAddModalOpen={(open) => setModal(open ? 'addMember' : null)} />
        )}
        {!validTabs.includes(currentTab) && <NotFoundView />}
      </main>

      <AddMemberModal isOpen={modal === 'addMember'} onClose={() => setModal(null)} />
      <AddTaskModal isOpen={modal === 'addTask'} onClose={() => setModal(null)} />
      {isAdmin && <ChangePasswordModal isOpen={modal === 'password'} onClose={() => setModal(null)} />}
      <ContactFormModal isOpen={modal === 'contact'} onClose={() => setModal(null)} />
      <RulesAndRegulationsModal isOpen={modal === 'rules'} onClose={() => setModal(null)} />
      <MobileMenuDrawer
        isOpen={modal === 'mobileMenu'} onClose={() => setModal(null)}
        onOpenAddMember={() => setModal('addMember')} onOpenAddTask={() => setModal('addTask')}
        onOpenChangePassword={() => setModal('password')} onOpenContact={() => setModal('contact')}
        onOpenRules={() => setModal('rules')}
      />

      <ToastContainer />

      <footer className="border-t-2 border-[#1E1F22] bg-[#0E0F12] py-5 px-4 mt-12 text-xs font-mono text-[#8A8F99]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#6E737D]">
          <p>&copy; KLE Space Club. Operating under university.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <a href="tel:+918971068665" className="flex items-center gap-1 text-[#A0A5AD] hover:text-[#D95D24] transition-colors" title="Call Operations Range Dispatch">
              <Phone className="w-3 h-3" />
              <span>+91 8971068665</span>
            </a>
            <button onClick={() => setModal('rules')} className="hover:text-[#F2EFE9] underline transition-colors">
              Rules &amp; Regulations
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
