'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Users, Clock, CheckCircle2 } from 'lucide-react';

/**
 * Simple, mobile-friendly org-dashboard laptop mockup with a subtle floating
 * animation. Shown on small screens where the rich (lg+) OrgShowcase laptop is
 * hidden, so the org section always has a laptop visual.
 */
export function OrgLaptopMockup() {
  const rm = useReducedMotion();

  const stats = [
    { v: '12', l: 'Volunteers', icon: Users, c: 'text-blue-400' },
    { v: '48h', l: 'This Month', icon: Clock, c: 'text-green-400' },
    { v: '3', l: 'Pending', icon: CheckCircle2, c: 'text-amber-400' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        animate={rm ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Screen */}
        <div className="relative aspect-[16/10] rounded-t-xl bg-gradient-to-b from-gray-600 to-gray-800 p-[5px] shadow-2xl">
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-500" />
          <div className="w-full h-full rounded-lg bg-[#0A0A0A] overflow-hidden border border-white/10 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-[#111] shrink-0">
              <div className="w-5 h-5 rounded bg-white/10 grid place-items-center text-[8px] font-bold text-white">MA</div>
              <span className="text-white text-[10px] font-semibold truncate">Modiv Advisors · Overview</span>
            </div>

            {/* Body */}
            <div className="p-3 flex-1 overflow-hidden">
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.l}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="bg-white/5 rounded-lg p-2"
                  >
                    <s.icon className={`w-3 h-3 ${s.c} mb-1`} />
                    <p className="font-bold text-[13px] text-white leading-none">{s.v}</p>
                    <p className="text-[8px] text-gray-400 mt-0.5 truncate">{s.l}</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-[8px] text-gray-500 uppercase tracking-wide font-bold mb-1.5">Pending verification</p>
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[9px] font-bold text-white shrink-0">S</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-white truncate">Sarah Kim · 4h</p>
                  <p className="text-[8px] text-gray-400 truncate">Food Bank · Today</p>
                </div>
                <span className="text-[9px] font-bold text-white bg-green-600 px-2.5 py-1 rounded-md shrink-0">Verify</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Base / keyboard */}
        <div className="h-2.5 bg-gradient-to-b from-gray-500 to-gray-600 rounded-b-xl mx-[-1.5%]" />
        <div className="h-1 bg-gray-500 rounded-b-2xl mx-[-3%] opacity-60" />
      </motion.div>

      {/* Glow */}
      <div aria-hidden className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-blue-500 rounded-full scale-90 translate-y-8" />
    </div>
  );
}
