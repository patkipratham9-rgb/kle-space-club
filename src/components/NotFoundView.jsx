import { AlertTriangle, Terminal, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/useApp';

export const NotFoundView = () => {
  const { setCurrentTab } = useApp();

  return (
    <div className="beige-chassis p-8 hard-shadow max-w-2xl mx-auto my-12 border-2 border-[#1E1F22]">
      <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-5 text-[10px] font-mono text-[#6E737D]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#D95D24]">[+] ERROR LOG 0x404</span>
          <span>//</span>
          <span>ORBITAL TRAJECTORY MISSING</span>
        </div>
        <span>FAULT REF: MIL-STD-810/ERR</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
          <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display text-[#1E1F22] tracking-wider uppercase">
            VECTOR FAULT 404: UNKNOWN DIRECTORY
          </h1>
          <p className="text-xs font-mono text-[#525760] mt-0.5">
            The requested operations module or telemetry path does not exist in the flight avionics register.
          </p>
        </div>
      </div>

      <div className="crt-screen p-4 my-5 border-2 border-[#1E1F22] font-mono text-xs text-[#FFAE19] space-y-1">
        <div className="flex items-center gap-2 text-[#D95D24] font-bold border-b border-[#3A3D45] pb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>DIAGNOSTIC REPORT // 0x404_NOT_FOUND</span>
        </div>
        <p className="text-[#8A8F99]">TELEMETRY_VECTOR: NULL</p>
        <p className="text-[#8A8F99]">RACK_STATUS: REGISTER_UNMAPPED</p>
        <p className="text-[#4ADE80]">RECOVERY_ACTION: RETURN_TO_PRIMARY_DECK</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-[#1E1F22]">
        <span className="text-[10px] font-mono text-[#6E737D]">KLE SPACE LAB • ERROR HANDLER</span>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="mechanical-btn flex items-center gap-2 px-5 py-2.5 bg-[#D95D24] text-white text-xs font-mono font-bold hover:bg-[#BF4D1A]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO FLIGHT DECK</span>
        </button>
      </div>
    </div>
  );
};
