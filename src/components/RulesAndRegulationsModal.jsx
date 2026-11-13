import { BookOpen, X, AlertTriangle, ShieldCheck, Wrench, Zap } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. COMPONENTS & INVENTORY',
    icon: Wrench,
    color: '#D95D24',
    rules: [
      { label: 'Club Projects Only', text: 'Club components, tools, and equipment are strictly for official club projects - never for personal use or outside assignments.' },
      { label: 'Return to Its Exact Place', text: 'Put all tools, wires, sensors, and parts back into their labelled bins before leaving the lab.' },
      { label: 'Report Damage Immediately', text: 'If a sensor, board, or tool breaks or stops working, report it to a senior or inventory lead immediately - never quietly put a broken part back in the bin.' }
    ]
  },
  {
    title: '2. ELECTRONICS & POWER SAFETY',
    icon: Zap,
    color: '#3A6B5C',
    rules: [
      { label: 'Mandatory Senior Check', text: 'Always get a senior or subsystem lead to inspect your circuit connections before connecting a battery or turning on a power supply.' },
      { label: 'Power Off Before Adjusting', text: 'Disconnect the battery or turn off the power supply before plugging, unplugging, or rewiring any component.' },
      { label: 'Soldering & Hot Tools', text: 'Turn off and unplug soldering irons and hot glue guns immediately after use, and return them to their stands.' }
    ]
  },
  {
    title: '3. WORKSPACE & LAB ETIQUETTE',
    icon: AlertTriangle,
    color: '#E29526',
    rules: [
      { label: 'Clean Your Desk', text: 'Clear your workbench of wire clippings, scraps, and tools before you leave.' },
      { label: 'No Food or Drinks', text: 'Keep food and open beverages away from workbenches, electronics, and soldering stations.' },
      { label: 'Ask Before Using Heavy Tools', text: 'Do not operate drills or rotary tools unless a senior has cleared you to use them safely.' }
    ]
  },
  {
    title: '4. PROJECT & CODE DISCIPLINE',
    icon: ShieldCheck,
    color: '#1E1F22',
    rules: [
      { label: 'Internal Design Confidentiality', text: 'Club CAD files, proprietary PCB layouts, and competition source code must remain within the team and require prior authorization from the club lead before any external distribution.' }
    ]
  }
];

export const RulesAndRegulationsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="beige-chassis w-full max-w-2xl p-6 hard-shadow-lg relative border-2 border-[#1E1F22] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-4 text-[10px] font-mono text-[#6E737D]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#D95D24]">[+] SPEC DIR-04</span>
            <span>//</span>
            <span>SPACE CLUB LAB CODE OF CONDUCT</span>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black font-display text-[#1E1F22] tracking-wider uppercase">
              RULES &amp; REGULATIONS OF THE SPACE CLUB
            </h2>
            <p className="text-xs font-mono text-[#525760]">Operational Protocols • Academic Year 2026-27</p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-mono text-[#1E1F22] leading-relaxed">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <section key={sec.title} className="bg-[#E6E1D6] p-3.5 border-2 border-[#1E1F22] hard-shadow-sm">
                <div className="flex items-center gap-2 font-bold uppercase mb-2" style={{ color: sec.color }}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <h3 className="tracking-wider">{sec.title}</h3>
                </div>
                <ul className="space-y-2 text-[#525760] pl-1">
                  {sec.rules.map((r) => (
                    <li key={r.label} className="flex items-start gap-2">
                      <span className="font-bold shrink-0" style={{ color: sec.color }}>[+]</span>
                      <span><strong className="text-[#1E1F22]">{r.label}:</strong> {r.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-5 border-t-2 border-[#1E1F22] mt-5">
          <span className="text-[10px] font-mono text-[#6E737D]">KLE SPACE LAB • COMPLIANCE MANDATORY</span>
          <button onClick={onClose} className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#1E1F22] text-white hover:bg-[#2A2B30]">
            ACKNOWLEDGE &amp; COMPLY
          </button>
        </div>
      </div>
    </div>
  );
};
