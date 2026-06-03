'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Building2, User } from 'lucide-react';

const APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PhoneFlip() {
  const [side, setSide] = useState<'student' | 'org'>('student');
  const [flipping, setFlipping] = useState(false);
  const reducedMotion = useReducedMotion();

  const flip = useCallback(() => {
    if (reducedMotion) {
      setSide((s) => (s === 'student' ? 'org' : 'student'));
      return;
    }
    setFlipping(true);
    setTimeout(() => {
      setSide((s) => (s === 'student' ? 'org' : 'student'));
      setFlipping(false);
    }, 400);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setInterval(flip, 3000);
    return () => clearInterval(t);
  }, [flip, reducedMotion]);

  return (
    <div className="flex flex-col items-center gap-8 mb-20">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">One product. Two perspectives.</p>
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-semibold transition-colors ${side === 'student' ? 'text-white' : 'text-gray-600'}`}>
            Student
          </span>
          <div className="w-8 h-px bg-gray-700" />
          <span className={`text-sm font-semibold transition-colors ${side === 'org' ? 'text-white' : 'text-gray-600'}`}>
            Organization
          </span>
        </div>
      </div>

      {/* Flipping phone */}
      <div
        className="relative w-[200px] h-[420px] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={flip}
      >
        <motion.div
          animate={{ rotateY: flipping ? 90 : 0 }}
          transition={{ duration: 0.35, ease: APPLE }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          <div className="absolute inset-0 rounded-[3rem] bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden">
            <div className="absolute inset-2 rounded-[2.5rem] overflow-hidden">
              <AnimatePresence mode="wait">
                {side === 'student' && (
                  <motion.div
                    key="student"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-4 p-6"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl" />
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-7 h-7 text-gray-700" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 text-base">Student view</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">Log hours. Get verified. Download your PDF.</p>
                    </div>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">Food bank sorting</p>
                          <p className="text-[10px] text-gray-500">Today · 4.0h</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Verified ✓</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400">Tap to see org view →</p>
                  </motion.div>
                )}

                {side === 'org' && (
                  <motion.div
                    key="org"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#0D0D0D] flex flex-col items-center justify-center gap-4 p-6"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl" />
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-base">Org view</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">See all volunteers. Verify. Generate reports.</p>
                    </div>
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Pending</p>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[8px] font-bold text-white">S</div>
                        <span className="text-[10px] text-white flex-1">Sarah Kim · 4h</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">Verify</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-600">← Tap to see student view</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-xs text-gray-600">Tap the phone to flip between perspectives</p>
    </div>
  );
}
