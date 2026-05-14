import { useState, useEffect, useRef, ChangeEvent, MouseEvent as ReactMouseEvent } from "react";
import { Play, Pause, RotateCcw, Info, Settings2, Activity, Download, ChevronDown, ChevronUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts";

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
  const dx = x2 - x1, dy = y2 - y1;
  if (Math.sqrt(dx * dx + dy * dy) < 5) return;
  const a = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 2; ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4));
  ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillStyle = color;
  ctx.fillText(label, x2 + 16 * (dx >= 0 ? 1 : -1), y2 + (dy < 0 ? -8 : 14));
  ctx.restore();
}

interface SliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  accent?: string;
}

function Slider({ label, description, value, onChange, min, max, step, unit, accent = "#3b82f6" }: SliderProps) {
  const [localText, setLocalText] = useState(value.toString());
  const [error, setError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalText(value.toString());
      setError(false);
    }
  }, [value, isFocused]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalText(val);
    
    // Allow empty or partial input while typing
    if (val === "" || val === "-") {
      setError(true);
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num) && num >= min && num <= max) {
      setError(false);
      onChange(num);
    } else {
      setError(true);
    }
  };

  return (
    <div className="mb-3 group/slider">
      <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        error 
          ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
          : isFocused 
            ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/10' 
            : 'border-white/5 bg-slate-900/40 hover:border-white/10'
      }`}>
        <div className="flex flex-col gap-0.5 relative">
          <div 
            className="flex items-center gap-1 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover/slider:text-slate-400 transition-colors">
              {label}
            </span>
            <Info size={8} className="text-slate-600 mb-1 opacity-0 group-hover/slider:opacity-100 transition-opacity" />
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute left-0 bottom-full mb-2 w-48 z-50 pointer-events-none"
                >
                  <div className="bg-slate-950 border border-white/10 p-2.5 rounded-lg shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                      {description}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-blue-400 uppercase">Unit: {unit || 'none'}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Step: {step}</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
             <div className="w-1 h-3 rounded-full" style={{ backgroundColor: accent }} />
             <span className="text-[9px] text-slate-600 font-mono italic">
               Range: {min}-{max}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <input 
                type="text"
                value={localText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  // Ensure we revert to a valid number if invalid when blurred
                  setLocalText(value.toString());
                  setError(false);
                }}
                onChange={handleTextChange}
                className={`w-[33px] bg-transparent border-none text-right text-sm font-mono font-bold focus:outline-none transition-colors ${
                  error ? 'text-red-400' : 'text-blue-400'
                }`}
              />
              <span className="text-[10px] text-slate-600 font-bold uppercase select-none pr-1">
                {unit}
              </span>
            </div>
            <AnimatePresence>
              {error && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[8px] text-red-500/80 font-bold uppercase tracking-tighter mt-1"
                >
                  Invalid
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatProps {
  label: string;
  val: string | number;
  unit: string;
  color?: string;
}

function Stat({ label, val, unit, color = "#c0d4f0" }: StatProps) {
  return (
    <div className="flex justify-between items-center mb-2 last:mb-0">
      <span className="text-[10px] text-blue-400/60 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm font-mono font-bold" style={{ color }}>
        {val} <span className="text-[10px] text-blue-900/60 font-normal">{unit}</span>
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isX = payload[0].dataKey === 'y';
    return (
      <div className="bg-slate-950/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[130px]">
        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1.5">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{isX ? 'Position X' : 'Time Elapsed'}</span>
          <span className="text-[10px] font-mono font-bold text-blue-400">{typeof label === 'number' ? label.toFixed(3) : label}{isX ? 'm' : 's'}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{entry.name}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-white">
                {entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProjectileSimulator() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(30);
  const [gravity, setGravity] = useState(9.8);
  const [initialHeight, setInitialHeight] = useState(0);
  const [airResistance, setAirResistance] = useState(0); // Simplified drag factor
  const [mass, setMass] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedMult, setSpeedMult] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [showAccel, setShowAccel] = useState(true);
  const [showAngle, setShowAngle] = useState(true);
  const [isAutoScaling, setIsAutoScaling] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [vectorSettingsExpanded, setVectorSettingsExpanded] = useState(false);
  const [themeSettingsExpanded, setThemeSettingsExpanded] = useState(false);
  const [advancedHUD, setAdvancedHUD] = useState(true);
  const [showProjections, setShowProjections] = useState(true);
  const [showFill, setShowFill] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [hoverData, setHoverData] = useState<any>(null);
  const [ghostPath, setGhostPath] = useState<{x: number, y: number}[]>([]);
  const [showGhost, setShowGhost] = useState(true);
  const [wind, setWind] = useState(0);
  
  // Theme state
  const [canvasBgColor, setCanvasBgColor] = useState("#0c111c");
  const [glowColor, setGlowColor] = useState("#3b82f6");
  const [showGlow, setShowGlow] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTicks, setShowTicks] = useState(true);
  const [groundColor, setGroundColor] = useState("#1e293b");

  const [showDebugLog, setShowDebugLog] = useState(false);
  const [eventLog, setEventLog] = useState<{ time: string, msg: string, type: 'info' | 'warn' | 'success' }[]>([]);
  
  const addLog = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLog(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  // Trajectory calculation using numerical integration
  const [pathData, setPathData] = useState<{x: number, y: number, vx: number, vy: number, t: number, spd: number, ax: number, ay: number}[]>([]);
  const [theoreticalT, setTheoreticalT] = useState(0);
  const [theoreticalRange, setTheoreticalRange] = useState(0);
  const [theoreticalHmax, setTheoreticalHmax] = useState(0);

  useEffect(() => {
    const dt = 0.01;
    const rad = (angle * Math.PI) / 180;
    let x = 0;
    let y = initialHeight;
    let vx = velocity * Math.cos(rad);
    let vy = velocity * Math.sin(rad);
    let t = 0;
    
    const newPath = [];
    let maxH = y;
    
    // Euler Integration
    while (y >= 0 && t < 100) { // Limit for safety
      const spd = Math.sqrt(vx * vx + vy * vy);
      const dragFactor = airResistance / mass;
      const ax = -dragFactor * spd * vx + (wind / mass);
      const ay = -gravity - dragFactor * spd * vy;

      newPath.push({ x, y, vx, vy, t, spd, ax, ay });
      
      x += vx * dt;
      y += vy * dt;
      vx += ax * dt;
      vy += ay * dt;
      t += dt;
      
      if (y > maxH) maxH = y;
      
      // Stop if it goes below ground
      if (y < 0) break;
    }
    
    // Final point at impact
    const last = newPath[newPath.length - 1] || { x: 0, y: initialHeight, vx: velocity * Math.cos(rad), vy: velocity * Math.sin(rad), t: 0, spd: velocity };
    setPathData(newPath);
    setTheoreticalT(t);
    setTheoreticalRange(last.x);
    setTheoreticalHmax(maxH);
  }, [angle, velocity, gravity, initialHeight, airResistance, mass]);

  // Log events based on simulation progress
  const lastState = useRef({ peakLogged: false, landedLogged: false, collisionLogged: false });

  useEffect(() => {
    if (progress === 0 && !isPlaying && !lastState.current.landedLogged) {
       // Reset case
       lastState.current = { peakLogged: false, landedLogged: false, collisionLogged: false };
    }
    
    if (isPlaying && progress > 0) {
      const idx = Math.min(Math.floor(progress * (pathData.length - 1)), pathData.length - 1);
      const current = pathData[idx];
      
      if (!current) return;

      // Peak detection
      if (!lastState.current.peakLogged && current.vy <= 0 && progress < 0.9) {
        addLog("Apogee reached: vertical velocity is zero", 'info');
        lastState.current.peakLogged = true;
      }

      // Collision detection
      if (!lastState.current.collisionLogged && collisionTime !== null && progress >= (collisionTime / theoreticalT) * 0.99) {
        addLog(`Collision detected at t=${collisionTime.toFixed(3)}s`, 'warn');
        lastState.current.collisionLogged = true;
      }

      // Landing detection
      if (!lastState.current.landedLogged && progress >= 0.99) {
        if (collisionTime !== null) {
          addLog("Simulation terminated: Impact with obstacle", 'warn');
        } else {
          addLog(`Projectile landed at ${theoreticalRange.toFixed(2)}m`, 'success');
        }
        lastState.current.landedLogged = true;
      }
    }
  }, [progress, isPlaying, pathData]);

  useEffect(() => {
    if (isPlaying && progress === 0) {
      addLog(`Launched: u=${velocity}m/s, θ=${angle}°, y₀=${initialHeight}m, drag=${airResistance}`, 'info');
      lastState.current = { peakLogged: false, landedLogged: false, collisionLogged: false };
    }
  }, [isPlaying]);

  // Vector customization state
  const [vectorScale, setVectorScale] = useState(1);
  const [accelScale, setAccelScale] = useState(1);
  const [velXColor, setVelXColor] = useState("#f97316");
  const [velYColor, setVelYColor] = useState("#22c55e");
  const [accelColor, setAccelColor] = useState("#ef4444");
  
  // Obstacle state
  const [obstacleEnabled, setObstacleEnabled] = useState(false);
  const [obsX, setObsX] = useState(30);
  const [obsY, setObsY] = useState(0);
  const [obsW, setObsW] = useState(5);
  const [obsH, setObsH] = useState(15);
  const [collisionTime, setCollisionTime] = useState<number | null>(null);

  const [isDraggingObs, setIsDraggingObs] = useState(false);
  const obsDragOffset = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const progRef = useRef(0);
  const dynRef = useRef<any>({
    angle: 45, velocity: 30, gravity: 9.8, initialHeight: 0, airResistance: 0, mass: 1, speedMult: 1, 
    T: 0, Hmax: 0, Range: 0, r: 0, pathData: [],
    showVectors: true, showAccel: true, showAngle: true, isAutoScaling: true,
    vectorScale: 1, accelScale: 1, velXColor: "#f97316", velYColor: "#22c55e", accelColor: "#ef4444",
    obstacleEnabled: false, obsX: 30, obsY: 0, obsW: 5, obsH: 15, collisionTime: null,
    canvasBgColor: "#0c111c", glowColor: "#3b82f6", showGlow: true, showGrid: true, showTicks: true, groundColor: "#1e293b",
    advancedHUD: true, showProjections: true, showFill: true
  });
  const drawRef = useRef<((prog: number) => void) | null>(null);

  // Calculate collision time with numerical path
  useEffect(() => {
    if (!obstacleEnabled || pathData.length === 0) {
      setCollisionTime(null);
      return;
    }

    let firstCollision: number | null = null;
    for (const pt of pathData) {
      if (
        pt.x >= obsX && 
        pt.x <= obsX + obsW && 
        pt.y >= obsY && 
        pt.y <= obsY + obsH
      ) {
        firstCollision = pt.t;
        break;
      }
    }
    setCollisionTime(firstCollision);
  }, [pathData, obstacleEnabled, obsX, obsY, obsW, obsH]);

  const T_actual = collisionTime !== null ? collisionTime : theoreticalT;
  const Hmax = theoreticalHmax;
  const Range = theoreticalRange;
  
  // Interpolate position from pathData based on progress
  const getCurrentState = (p: number) => {
    if (pathData.length === 0) return { x: 0, y: initialHeight, vx: 0, vy: 0, t: 0, spd: 0 };
    const t_target = p * T_actual;
    // Find closest index
    const idx = Math.min(Math.floor((t_target / theoreticalT) * (pathData.length - 1)), pathData.length - 1);
    return pathData[idx] || pathData[0];
  };

  const { x: pos_x, y: pos_y, vx: vel_x, vy: vel_y, spd } = getCurrentState(progress);

  // Energy calculations
  const ke = 0.5 * mass * spd * spd;
  const pe = mass * gravity * pos_y;
  const totalEnergy = ke + pe;

  dynRef.current = { 
    angle, velocity, gravity, initialHeight, airResistance, mass, speedMult, T: T_actual, Hmax, Range, pathData, ghostPath, showGhost,
    showVectors, showAccel, showAngle, isAutoScaling,
    vectorScale, accelScale, velXColor, velYColor, accelColor,
    obstacleEnabled, obsX, obsY, obsW, obsH, collisionTime,
    canvasBgColor, glowColor, showGlow, showGrid, showTicks, groundColor,
    advancedHUD, showProjections, showFill
  };

  const draw = (prog: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { 
      velocity, gravity, showVectors, showAccel, showAngle, T: Tf, Hmax: Hf, Range: Rf, r: rad,
      isAutoScaling, vectorScale, accelScale, velXColor, velYColor, accelColor,
      obstacleEnabled, obsX, obsY, obsW, obsH, collisionTime,
      canvasBgColor, glowColor, showGlow, showGrid, showTicks, groundColor,
      advancedHUD: showHUD, showProjections, showFill: trajFill
    } = dynRef.current;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, CH = canvas.height;
    const pad = { l: 70, r: 40, t: 40, b: 60 };
    const pw = W - pad.l - pad.r, ph = CH - pad.t - pad.b;
    
    // Auto-scale to fit trajectory and obstacle
    const maxBoundX = obstacleEnabled ? Math.max(Rf, obsX + obsW) : Rf;
    const maxX = Math.max(maxBoundX * 1.15, 1);
    const maxBoundY = obstacleEnabled ? Math.max(Hf, obsY + obsH) : Hf;
    const maxY = Math.max(maxBoundY * 1.6, 1);
    
    const tx = (x: number) => pad.l + (x / maxX) * pw;
    const ty = (y: number) => pad.t + ph - (y / maxY) * ph;

    const { pathData: dynPath, ghostPath: gPath, showGhost: sGhost } = dynRef.current;

    // Clear and background
    ctx.fillStyle = canvasBgColor; 
    ctx.fillRect(0, 0, W, CH);

    // Stylized Background (Sun/Glow)
    if (showGlow) {
      const gX = W * 0.8, gY = pad.t, gR = W * 0.5;
      if (Number.isFinite(gX) && Number.isFinite(gY) && Number.isFinite(gR) && gR > 0) {
        const skyGlow = ctx.createRadialGradient(gX, gY, 0, gX, gY, gR);
        skyGlow.addColorStop(0, `${glowColor}1a`); // 10% opacity
        skyGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = skyGlow;
        ctx.fillRect(0, 0, W, CH);
      }
    }

    // Major and Minor Grid Lines
    if (showGrid) {
      ctx.lineWidth = 1;
      
      // Minor Grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.03)";
      for (let i = 0; i <= 20; i++) {
        ctx.beginPath(); ctx.moveTo(pad.l + (pw / 20) * i, pad.t); ctx.lineTo(pad.l + (pw / 20) * i, pad.t + ph); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad.l, pad.t + (ph / 20) * (20 - i)); ctx.lineTo(pad.l + pw, pad.t + (ph / 20) * (20 - i)); ctx.stroke();
      }

      // Major Grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      for (let i = 0; i <= 10; i++) {
          ctx.beginPath(); ctx.moveTo(pad.l + (pw / 10) * i, pad.t); ctx.lineTo(pad.l + (pw / 10) * i, pad.t + ph); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pad.l, pad.t + (ph / 10) * i); ctx.lineTo(pad.l + pw, pad.t + (ph / 10) * i); ctx.stroke();
      }
    }

    // Ground shading with depth
    const groundGrd = ctx.createLinearGradient(0, ty(0), 0, CH);
    groundGrd.addColorStop(0, `${groundColor}cc`); // 80%
    groundGrd.addColorStop(0.1, `${groundColor}e6`); // 90%
    groundGrd.addColorStop(1, "#020617");
    ctx.fillStyle = groundGrd; 
    ctx.fillRect(0, ty(0), W, CH - ty(0));

    // Ground top highlight
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, ty(0));
    ctx.lineTo(W, ty(0));
    ctx.stroke();

    // Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"; 
    ctx.lineWidth = 2;
    ctx.beginPath(); 
    ctx.moveTo(pad.l, pad.t); 
    ctx.lineTo(pad.l, pad.t + ph); 
    ctx.lineTo(pad.l + pw, pad.t + ph); 
    ctx.stroke();

    // Tick labels and Axis Titles
    if (showTicks) {
      ctx.font = "bold 9px Inter, sans-serif"; 
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.textAlign = "center";
      
      // X-Axis Ticks
      for (let i = 0; i <= 5; i++) {
          const val = (maxX / 5) * i;
          const xPos = pad.l + (pw / 5) * i;
          ctx.beginPath();
          ctx.moveTo(xPos, pad.t + ph);
          ctx.lineTo(xPos, pad.t + ph + 4);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
          ctx.stroke();
          ctx.fillText(val.toFixed(0) + "m", xPos, pad.t + ph + 18);
      }
      
      // Y-Axis Ticks
      ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) {
          const val = (maxY / 4) * (4 - i);
          const yPos = pad.t + (ph / 4) * i;
          ctx.beginPath();
          ctx.moveTo(pad.l - 4, yPos);
          ctx.lineTo(pad.l, yPos);
          ctx.stroke();
          ctx.fillText(val.toFixed(0) + "m", pad.l - 12, yPos + 3);
      }

      // Axis Titles
      ctx.save();
      ctx.font = "bold 10px Inter";
      ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
      ctx.textAlign = "center";
      ctx.fillText("DISTANCE (m)", pad.l + pw / 2, pad.t + ph + 40);
      
      ctx.translate(pad.l - 45, pad.t + ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("ALTITUDE (m)", 0, 0);
      ctx.restore();
    }

    // Obstacle
    if (obstacleEnabled) {
      ctx.save();
      const ox = tx(obsX), oy = ty(obsY + obsH);
      const ow = (obsW / maxX) * pw, oh = (obsH / maxY) * ph;
      
      // Shadow
      ctx.shadowColor = collisionTime !== null ? "rgba(239, 68, 68, 0.6)" : "rgba(59, 130, 246, 0.2)";
      ctx.shadowBlur = 15;
      
      const obsGrd = ctx.createLinearGradient(ox, oy, ox, oy + oh);
      obsGrd.addColorStop(0, collisionTime !== null ? "#450a0a" : "#1e293b");
      obsGrd.addColorStop(0.5, collisionTime !== null ? "#7f1d1d" : "#0f172a");
      obsGrd.addColorStop(1, "#020617");
      
      ctx.fillStyle = obsGrd;
      ctx.strokeStyle = collisionTime !== null ? "#ef4444" : "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.roundRect(ox, oy, ow, oh, 4);
      ctx.fill();
      ctx.stroke();
      
      // Warning stripes if collision
      if (collisionTime !== null) {
        ctx.clip();
        ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
        ctx.lineWidth = 20;
        for (let i = -100; i < ow + oh; i += 40) {
          ctx.beginPath();
          ctx.moveTo(ox + i, oy);
          ctx.lineTo(ox + i + 40, oy + oh);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Full path ghost
    if (dynPath.length > 1) {
      ctx.beginPath(); 
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)"; 
      ctx.lineWidth = 1.5;
      dynPath.forEach((pt: any, i: number) => {
        i === 0 ? ctx.moveTo(tx(pt.x), ty(pt.y)) : ctx.lineTo(tx(pt.x), ty(pt.y));
      });
      ctx.stroke(); 
      ctx.setLineDash([]);
    }

    // Ghost Path
    if (sGhost && gPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;
      gPath.forEach((pt: any, i: number) => {
        i === 0 ? ctx.moveTo(tx(pt.x), ty(pt.y)) : ctx.lineTo(tx(pt.x), ty(pt.y));
      });
      ctx.stroke();
    }

    // Actual Trajectory
    if (prog > 0.001 && dynPath.length > 1) {
      const tn = Math.ceil(prog * (dynPath.length - 1));
      
      // Trajectory Shading
      if (trajFill) {
        ctx.beginPath();
        const fillGrd = ctx.createLinearGradient(0, pad.t, 0, ty(0));
        fillGrd.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        fillGrd.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = fillGrd;
        
        ctx.moveTo(tx(dynPath[0].x), ty(0));
        for (let i = 0; i <= tn; i++) {
          ctx.lineTo(tx(dynPath[i].x), ty(dynPath[i].y));
        }
        ctx.lineTo(tx(dynPath[tn].x), ty(0));
        ctx.closePath();
        ctx.fill();
      }

      const gradient = ctx.createLinearGradient(tx(0), 0, tx(dynPath[tn].x), 0);
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, collisionTime !== null ? "#ef4444" : "#60a5fa");
      
      ctx.beginPath(); 
      ctx.strokeStyle = gradient; 
      ctx.lineWidth = 3;
      ctx.shadowColor = collisionTime !== null && prog >= 0.99 ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.5)"; 
      ctx.shadowBlur = collisionTime !== null && prog >= 0.99 ? 15 : 8;
      
      for (let i = 0; i <= tn; i++) {
        i === 0 ? ctx.moveTo(tx(dynPath[i].x), ty(dynPath[i].y)) : ctx.lineTo(tx(dynPath[i].x), ty(dynPath[i].y));
      }
      ctx.stroke(); 
      ctx.shadowBlur = 0;
    }

    // Max Height Indicator
    ctx.setLineDash([2, 4]); 
    ctx.strokeStyle = "#eab308"; 
    ctx.lineWidth = 1;
    ctx.beginPath(); 
    ctx.moveTo(pad.l, ty(Hf)); 
    ctx.lineTo(pad.l + pw, ty(Hf)); 
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#eab308"; 
    ctx.font = "italic 10px Inter"; 
    ctx.textAlign = "left";
    ctx.fillText(`Hₘₐₓ: ${Hf.toFixed(2)}m`, pad.l + 10, ty(Hf) - 8);

    // Landing marker
    const lx = tx(Rf), ly = ty(0);
    if (Number.isFinite(lx) && Number.isFinite(ly)) {
      ctx.beginPath(); 
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      const landingGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 15);
      landingGlow.addColorStop(0, "rgba(34, 197, 94, 0.4)");
      landingGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = landingGlow; ctx.fill();
      
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; 
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1; ctx.stroke();
    }

    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.font = "bold 10px font-mono"; 
    ctx.textAlign = "center";
    ctx.fillText(`RANGE: ${Rf.toFixed(2)}m`, tx(Rf), ty(0) + 32);

    // Launch Angle Arc
    if (showAngle) {
      ctx.strokeStyle = "#8b5cf6"; 
      ctx.lineWidth = 1.5;
      ctx.beginPath(); 
      ctx.arc(tx(0), ty(0), 40, -rad, 0, true); 
      ctx.stroke();
      ctx.fillStyle = "#8b5cf6"; 
      ctx.font = "bold 11px Inter"; 
      ctx.textAlign = "left";
      ctx.fillText(`${dynRef.current.angle}°`, tx(0) + 45, ty(0) - 15);
    }

    // The Ball - Use state from numerical path
    const bt = prog * Tf;
    // We use a helper to get the state for current progress from the pathData
    const getPointAt = (p: number) => {
      if (dynPath.length === 0) return { x: 0, y: initialHeight, vx: 0, vy: 0, spd: 0 };
      const idx = Math.min(Math.floor(p * (dynPath.length - 1)), dynPath.length - 1);
      return dynPath[idx] || dynPath[0];
    };
    
    const { x: bxp, y: byp, vx: vcx, vy: vcy, spd } = getPointAt(prog);
    const bx = tx(bxp), by = ty(byp);

    if (Number.isFinite(bx) && Number.isFinite(by)) {
      // Ball reflection/glow
      const ballGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
      ballGlow.addColorStop(0, "rgba(59, 130, 246, 0.4)");
      ballGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ballGlow; 
      ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();

      // Ball main
      const ballGradient = ctx.createRadialGradient(bx - 3, by - 3, 2, bx, by, 8);
      ballGradient.addColorStop(0, "#ffffff");
      ballGradient.addColorStop(1, "#2563eb");
      ctx.beginPath(); 
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fillStyle = ballGradient; 
      ctx.fill();
      ctx.strokeStyle = "white"; 
      ctx.lineWidth = 1; 
      ctx.stroke();
    }

    // Projections
    if (showProjections && prog > 0) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      
      // To X axis
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, ty(0)); ctx.stroke();
      // To Y axis
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(pad.l, by); ctx.stroke();
      
      // Projectile "Shadow" on ground
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.beginPath(); ctx.ellipse(bx, ty(0), 5, 2, 0, 0, Math.PI * 2); ctx.fill();
      
      ctx.restore();
    }

    // Advanced HUD
    if (showHUD && prog > 0) {
      ctx.save();
      const hw = 75, hh = 45;
      const hx = bx + 15, hy = by - hh - 15;
      
      // HUD box
      ctx.fillStyle = "rgba(12, 17, 28, 0.85)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 6); ctx.fill(); ctx.stroke();
      
      // HUD Title bar
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.beginPath(); ctx.roundRect(hx, hy, hw, 14, [6, 6, 0, 0]); ctx.fill();
      
      ctx.font = "bold 8px font-mono";
      ctx.fillStyle = "#60a5fa";
      ctx.textAlign = "left";
      ctx.fillText("LIVE TELEMETRY", hx + 6, hy + 10);
      
      ctx.font = "7px font-mono";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.fillText(`X: ${bxp.toFixed(2)}m`, hx + 6, hy + 24);
      ctx.fillText(`Y: ${byp.toFixed(2)}m`, hx + 6, hy + 33);
      ctx.fillText(`V: ${spd.toFixed(2)}m/s`, hx + 6, hy + 42);
      
      // Energy mini-stats
      ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
      ctx.fillRect(hx + hw - 20, hy + 20, 15, 20);
      const keH = (ke / Math.max(totalEnergy, 1)) * 20;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(hx + hw - 20, hy + 40 - keH, 15, keH);
      
      ctx.restore();
    }

    // Vectors
    if (showVectors || showAccel) {
      let baseVScale: number;
      let baseAScale: number;

      if (isAutoScaling) {
        // Dynamic scaling for vectors based on canvas size and reference magnitudes
        // We target a vector length of roughly 15-20% of the viewport for the reference values
        const refDim = Math.min(pw, ph);
        const targetVectorLen = refDim * 0.18;
        
        // Use initial velocity and gravity as references to keep scales consistent during flight
        baseVScale = (targetVectorLen / Math.max(velocity, 10)) * vectorScale;
        baseAScale = (targetVectorLen / Math.max(gravity, 5)) * accelScale;
      } else {
        // Manual fixed scaling
        baseVScale = 2.5 * vectorScale;
        baseAScale = 5.0 * accelScale;
      }
      
      if (showVectors) {
        // Draw velocity components
        drawArrow(ctx, bx, by, bx + vcx * baseVScale, by, velXColor, `Vₓ ${vcx.toFixed(1)}`);
        drawArrow(ctx, bx, by, bx, by - vcy * baseVScale, velYColor, `Vᵧ ${vcy.toFixed(1)}`);
      }
      
      if (showAccel) {
        // Acceleration is constant -g (downwards)
        drawArrow(ctx, bx, by, bx, by + gravity * baseAScale, accelColor, `ay -${gravity.toFixed(1)}`);
      }
    }
  };

  drawRef.current = draw;
  
  useEffect(() => {
    if (drawRef.current) drawRef.current(progress);
  }, [progress, angle, velocity, gravity, obstacleEnabled, obsX, obsY, obsW, obsH, showVectors, showAccel, showAngle, isAutoScaling, collisionTime, vectorScale, accelScale, velXColor, velYColor, accelColor, canvasBgColor, glowColor, showGlow, showGrid, showTicks, groundColor, advancedHUD, showProjections, showFill]);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    progRef.current = 0;
  }, [angle, velocity, gravity]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    
    let lastTs: number | null = null;
    const tick = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000; 
      lastTs = ts;
      
      const { speedMult: sm, T: tf } = dynRef.current;
      progRef.current = Math.min(progRef.current + (dt * sm) / tf, 1);
      setProgress(progRef.current);
      
      if (progRef.current >= 1) {
        setIsPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
    progRef.current = 0;
  };

  const handlePlay = () => {
    if (progress >= 0.99) {
      setProgress(0);
      progRef.current = 0;
    }
    setIsPlaying(true);
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    if (!obstacleEnabled || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const W = canvasRef.current.width, CH = canvasRef.current.height;
    const pad = { l: 70, r: 40, t: 40, b: 60 };
    const pw = W - pad.l - pad.r, ph = CH - pad.t - pad.b;

    // We need the same maxX/maxY logic as in draw
    const maxBoundX = Math.max(Range, obsX + obsW);
    const maxX = Math.max(maxBoundX * 1.15, 1);
    const maxBoundY = Math.max(Hmax, obsY + obsH);
    const maxY = Math.max(maxBoundY * 1.6, 1);

    const worldX = ((sx - pad.l) / pw) * maxX;
    const worldY = ((pad.t + ph - sy) / ph) * maxY;

    if (worldX >= obsX && worldX <= obsX + obsW && worldY >= obsY && worldY <= obsY + obsH) {
      setIsDraggingObs(true);
      obsDragOffset.current = { x: worldX - obsX, y: worldY - obsY };
    }
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDraggingObs || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const W = canvasRef.current.width, CH = canvasRef.current.height;
    const pad = { l: 70, r: 40, t: 40, b: 60 };
    const pw = W - pad.l - pad.r, ph = CH - pad.t - pad.b;

    // Use current maxX/maxY for mapping
    const maxBoundX = Math.max(Range, obsX + obsW);
    const maxX = Math.max(maxBoundX * 1.15, 1);
    const maxBoundY = Math.max(Hmax, obsY + obsH);
    const maxY = Math.max(maxBoundY * 1.6, 1);

    const worldX = ((sx - pad.l) / pw) * maxX;
    const worldY = ((pad.t + ph - sy) / ph) * maxY;

    setObsX(Math.max(0, worldX - obsDragOffset.current.x));
    setObsY(Math.max(0, worldY - obsDragOffset.current.y));
  };

  const handleMouseUp = () => {
    setIsDraggingObs(false);
  };

  const playCollisionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Audio context might be blocked by browser policy until interaction
      console.warn("Audio feedback blocked:", e);
    }
  };

  useEffect(() => {
    // Only shake if we just hit the collision state
    if (progress >= 0.99 && collisionTime !== null) {
      setIsShaking(true);
      playCollisionSound();
      const timer = setTimeout(() => setIsShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [progress, collisionTime]);

  const exportToCSV = () => {
    let csv = "Time(s),X(m),Y(m),Vx(m/s),Vy(m/s),NetVelocity(m/s)\n";
    
    pathData.forEach(pt => {
        csv += `${pt.t.toFixed(3)},${pt.x.toFixed(3)},${pt.y.toFixed(3)},${pt.vx.toFixed(3)},${pt.vy.toFixed(3)},${pt.spd.toFixed(3)}\n`;
        if (collisionTime !== null && pt.t >= collisionTime) return;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `projectile_data_${angle}deg_${velocity}ms.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const equations = [
    { eq: "m·aₓ = -k·v·vₓ", lbl: "Drag Eq (Horizontal)", c: "#3b82f6" },
    { eq: "m·aᵧ = -mg - k·v·vᵧ", lbl: "Drag Eq (Vertical)", c: "#f97316" },
    { eq: "y = y₀ + u·sinθ·t − ½gt²", lbl: "Height (No Drag)", c: "#ef4444" },
    { eq: "v = √(vₓ² + vᵧ²)", lbl: "Net Velocity", c: "#22c55e" },
    { eq: "T = Precalculated", lbl: "Numerical Flight Time", c: "#eab308" },
    { eq: "R = Numeric Int.", lbl: "Numerical Range", c: "#06b6d4" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Activity size={20} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Physics Engine v2.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Projectile Motion <span className="font-light text-blue-400 font-mono">Simulator</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono tracking-wider">
            <button 
              onClick={() => setShowDebugLog(!showDebugLog)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                showDebugLog 
                  ? "bg-blue-500/10 border-blue-500 text-blue-400" 
                  : "bg-slate-900 border-white/5 hover:border-white/10 text-slate-500"
              }`}
            >
              <Activity size={14} className={showDebugLog ? "animate-pulse" : ""} />
              {showDebugLog ? "HIDE LOG" : "DEBUG LOG"}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM READY
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Parameters */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings2 size={14} className="text-blue-400" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Parameters</h2>
                </div>
                <div className="group relative">
                  <Info size={14} className="text-slate-500 cursor-help hover:text-blue-400 transition-colors" />
                  <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">Initial Velocity (u)</div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">The magnitude of the starting velocity vector. Higher values result in greater range and peak altitude.</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">Launch Angle (θ)</div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Measurement from the horizontal plane. 45° is optimal for maximum distance in a vacuum.</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">Gravity (g)</div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">The constant downward acceleration. Varying this simulates different planetary environments.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Slider 
                label="Launch Angle (θ)" 
                description="The angle at which the projectile is launched relative to the horizontal axis. 45° typically yields maximum range."
                value={angle} min={0} max={90} step={1} unit="°"
                onChange={(v) => setAngle(v)} 
              />
              <Slider 
                label="Initial Velocity (u)" 
                description="The magnitude of the starting velocity vector. Directly influences the kinetic energy and total flight distance."
                value={velocity} min={1} max={150} step={1} unit=" m/s"
                onChange={(v) => setVelocity(v)} 
              />
              <Slider 
                label="Initial Height (y₀)" 
                description="The vertical starting elevation. Launching from higher ground increases flight time and overall range."
                value={initialHeight} min={0} max={100} step={1} unit=" m"
                accent="#10b981"
                onChange={(v) => setInitialHeight(v)} 
              />
              <Slider 
                label="Air Resistance (k)" 
                description="A simplified drag coefficient representing air friction. Opposes the motion based on the current velocity."
                value={airResistance} min={0} max={0.5} step={0.01} unit=""
                accent="#f59e0b"
                onChange={(v) => setAirResistance(v)} 
              />
              <Slider 
                label="Projectile Mass (m)" 
                description="The mass of the projectile. In this model, it affects how strongly air resistance slows down the object."
                value={mass} min={0.1} max={10} step={0.1} unit=" kg"
                accent="#ec4899"
                onChange={(v) => setMass(v)} 
              />
              <Slider 
                label="Earth Gravity (g)" 
                description="The downward acceleration constant. Simulates planetary gravity causing the parabolic trajectory."
                value={gravity} min={0.1} max={50} step={0.1} unit=" m/s²"
                accent="#8b5cf6"
                onChange={(v) => setGravity(v)} 
              />
              <Slider 
                label="Wind Speed (w)" 
                description="Adds a constant horizontal force. Positive values assist flight, negative values act as headwind."
                value={wind} min={-50} max={50} step={1} unit=" m/s²"
                accent="#94a3b8"
                onChange={(v) => setWind(v)} 
              />
              <div className="mt-4 pt-4 border-t border-white/5">
                 <div className="text-[8px] font-bold text-slate-600 uppercase mb-2 tracking-widest text-center">Planetary Presets</div>
                 <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => { setGravity(9.8); setAirResistance(0.12); addLog("Gravity set to Earth normal", 'success'); }} className="text-[9px] py-1.5 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-400 uppercase tracking-tight border border-white/5 transition-all focus:ring-1 focus:ring-blue-500/50">Earth</button>
                   <button onClick={() => { setGravity(1.6); setAirResistance(0); addLog("Gravity set to Moon vacuum", 'success'); }} className="text-[9px] py-1.5 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-400 uppercase tracking-tight border border-white/5 transition-all focus:ring-1 focus:ring-blue-500/50">Moon</button>
                   <button onClick={() => { setGravity(3.7); setAirResistance(0.04); addLog("Gravity set to Mars thin air", 'success'); }} className="text-[9px] py-1.5 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-400 uppercase tracking-tight border border-white/5 transition-all focus:ring-1 focus:ring-blue-500/50">Mars</button>
                   <button onClick={() => { setGravity(24.8); setAirResistance(0.4); addLog("Gravity set to Jupiter dense gas", 'success'); }} className="text-[9px] py-1.5 bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-400 uppercase tracking-tight border border-white/5 transition-all focus:ring-1 focus:ring-blue-500/50">Jupiter</button>
                 </div>
              </div>
            </motion.div>

            {/* Simulation Controls */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Timeline</span>
                <span className="text-xs font-mono text-blue-400">{progress === 1 ? "FIN" : `${(progress * 100).toFixed(0)}%`}</span>
              </div>

              <div className="w-full h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                />
              </div>

              <div className="flex flex-col gap-2 mb-6">
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => {
                    setGhostPath(pathData.map(p => ({ x: p.x, y: p.y })));
                    setShowGhost(true);
                    addLog("Current trajectory saved as ghost", 'info');
                  }}
                  className="flex-1 text-[9px] font-bold uppercase tracking-widest py-2 bg-slate-800/50 hover:bg-slate-100 hover:text-slate-900 border border-white/5 rounded-lg transition-all"
                >
                  Save Ghost
                </button>
                <button 
                  onClick={() => setShowGhost(!showGhost)}
                  className={`flex-1 text-[9px] font-bold uppercase tracking-widest py-2 border rounded-lg transition-all ${showGhost ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                >
                  {showGhost ? 'Hide Ghost' : 'Show Ghost'}
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                    isPlaying 
                      ? "bg-slate-100 text-slate-900" 
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                  }`}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {isPlaying ? "PAUSE" : "EXECUTE"}
                </button>
                <button 
                  onClick={reset}
                  className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                  title="Reset Simulation"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <Slider 
                  label="Sim Speed" 
                  description="Adjusts the playback rate of the simulation. Values greater than 1x simulate at high speed."
                  value={speedMult} min={0.1} max={5} step={0.1} unit="×"
                  accent="#3b82f6"
                  onChange={(v) => setSpeedMult(v)} 
                />
                
                <div className="pt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={showVectors} 
                      onChange={(e) => setShowVectors(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border ${showVectors ? 'bg-blue-500 border-blue-500' : 'border-slate-600'} flex items-center justify-center transition-all`}>
                      {showVectors && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Vector Field</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={showAccel} 
                      onChange={(e) => setShowAccel(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border ${showAccel ? 'bg-red-500 border-red-500' : 'border-slate-600'} flex items-center justify-center transition-all`}>
                      {showAccel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Acceleration Vector</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={showAngle} 
                      onChange={(e) => setShowAngle(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border ${showAngle ? 'bg-purple-500 border-purple-500' : 'border-slate-600'} flex items-center justify-center transition-all`}>
                      {showAngle && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Theta Overlay</span>
                  </label>
                </div>

                <AnimatePresence>
                  {(showVectors || showAccel) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/5 space-y-4 overflow-hidden"
                    >
                      <button 
                        onClick={() => setVectorSettingsExpanded(!vectorSettingsExpanded)}
                        className="w-full flex items-center justify-between mb-4 group cursor-pointer"
                      >
                         <div className="flex items-center gap-2">
                           <Settings2 size={12} className={vectorSettingsExpanded ? "text-blue-400" : "text-slate-500"} />
                           <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${vectorSettingsExpanded ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>Vector Styles</span>
                         </div>
                         {vectorSettingsExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                      </button>
                      
                      <AnimatePresence>
                        {vectorSettingsExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden pb-2"
                          >
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Configuration</span>
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-tight">Auto Scale</span>
                                 <input 
                                   type="checkbox" 
                                   checked={isAutoScaling} 
                                   onChange={(e) => setIsAutoScaling(e.target.checked)}
                                   className="sr-only peer"
                                 />
                                 <div className="w-7 h-3.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                               </label>
                            </div>
                            
                            {showVectors && (
                              <div className="space-y-3">
                                <Slider 
                                  label="Velocity Scale" 
                                  description="Visual scaling factor for the velocity vectors. Does not affect calculation."
                                  value={vectorScale} min={0.1} max={5} step={0.1} unit="x" 
                                  accent={velXColor}
                                  onChange={(v) => setVectorScale(v)} 
                                />
                                <div className="flex gap-2">
                                   <div className="flex-1">
                                      <label className="text-[9px] text-slate-500 block mb-1">Vₓ Color</label>
                                      <input type="color" value={velXColor} onChange={(e) => setVelXColor(e.target.value)} className="w-full h-6 bg-transparent border-none cursor-pointer" />
                                   </div>
                                   <div className="flex-1">
                                      <label className="text-[9px] text-slate-500 block mb-1">Vᵧ Color</label>
                                      <input type="color" value={velYColor} onChange={(e) => setVelYColor(e.target.value)} className="w-full h-6 bg-transparent border-none cursor-pointer" />
                                   </div>
                                </div>
                              </div>
                            )}

                            {showAccel && (
                              <div className="space-y-3">
                                <Slider 
                                  label="Accel Scale" 
                                  description="Visual scaling factor for the acceleration vector. Does not affect calculation."
                                  value={accelScale} min={0.1} max={10} step={0.1} unit="x" 
                                  accent={accelColor}
                                  onChange={(v) => setAccelScale(v)} 
                                />
                                <div>
                                  <label className="text-[9px] text-slate-500 block mb-1">Accel Color</label>
                                  <input type="color" value={accelColor} onChange={(e) => setAccelColor(e.target.value)} className="w-full h-6 bg-transparent border-none cursor-pointer" />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Theme Settings */}
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 overflow-hidden">
                  <button 
                    onClick={() => setThemeSettingsExpanded(!themeSettingsExpanded)}
                    className="w-full flex items-center justify-between group cursor-pointer"
                  >
                     <div className="flex items-center gap-2">
                       <Activity size={12} className={themeSettingsExpanded ? "text-blue-400" : "text-slate-500"} />
                       <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${themeSettingsExpanded ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>Environment Theme</span>
                     </div>
                     {themeSettingsExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                  </button>
                  
                  <AnimatePresence>
                    {themeSettingsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden pb-2"
                      >
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Main BG</label>
                              <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
                                <input type="color" value={canvasBgColor} onChange={(e) => setCanvasBgColor(e.target.value)} className="w-6 h-6 bg-transparent border-none cursor-pointer" />
                                <span className="text-[10px] text-slate-400 font-mono uppercase">{canvasBgColor}</span>
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Sky Glow</label>
                              <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
                                <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="w-6 h-6 bg-transparent border-none cursor-pointer" />
                                <span className="text-[10px] text-slate-400 font-mono uppercase">{glowColor}</span>
                              </div>
                           </div>
                           <div className="space-y-1.5 col-span-2">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Ground Color</label>
                              <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                  <input type="color" value={groundColor} onChange={(e) => setGroundColor(e.target.value)} className="w-6 h-6 bg-transparent border-none cursor-pointer" />
                                  <span className="text-[10px] text-slate-400 font-mono uppercase">{groundColor}</span>
                                </div>
                                <div className="flex gap-1 pr-2">
                                   <button onClick={() => setGroundColor("#1e293b")} className="w-3 h-3 rounded-full bg-[#1e293b] border border-white/10" />
                                   <button onClick={() => setGroundColor("#064e3b")} className="w-3 h-3 rounded-full bg-[#064e3b] border border-white/10" />
                                   <button onClick={() => setGroundColor("#451a03")} className="w-3 h-3 rounded-full bg-[#451a03] border border-white/10" />
                                   <button onClick={() => setGroundColor("#312e81")} className="w-3 h-3 rounded-full bg-[#312e81] border border-white/10" />
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-2.5 bg-black/20 p-3 rounded-xl border border-white/5">
                          <label className="flex items-center justify-between cursor-pointer group">
                             <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Show Sky Glow</span>
                             <input type="checkbox" checked={showGlow} onChange={(e) => setShowGlow(e.target.checked)} className="sr-only peer" />
                             <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                             <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Display Grid</span>
                             <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="sr-only peer" />
                             <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                             <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Axis Labels</span>
                             <input type="checkbox" checked={showTicks} onChange={(e) => setShowTicks(e.target.checked)} className="sr-only peer" />
                             <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                          </label>
                          <div className="pt-2 mt-1 border-t border-white/5 space-y-2.5">
                            <label className="flex items-center justify-between cursor-pointer group">
                               <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Advanced HUD</span>
                               <input type="checkbox" checked={advancedHUD} onChange={(e) => setAdvancedHUD(e.target.checked)} className="sr-only peer" />
                               <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                               <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Projection Lines</span>
                               <input type="checkbox" checked={showProjections} onChange={(e) => setShowProjections(e.target.checked)} className="sr-only peer" />
                               <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                               <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300">Trajectory Fill</span>
                               <input type="checkbox" checked={showFill} onChange={(e) => setShowFill(e.target.checked)} className="sr-only peer" />
                               <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/50 peer-checked:after:bg-blue-400"></div>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Obstacle Controls */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-red-500 rounded-full" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Target Obstacle</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={obstacleEnabled} onChange={(e) => setObstacleEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-500/50 peer-checked:after:bg-red-400"></div>
                </label>
              </div>

              {obstacleEnabled ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Slider 
                    label="Distance (X)" 
                    description="Horizontal separation between the launch origin and the center of the target obstacle."
                    value={obsX} min={0} max={200} step={1} unit=" m"
                    accent="#ef4444"
                    onChange={(v) => setObsX(v)} 
                  />
                  <Slider 
                    label="Base Height (Y)" 
                    description="The starting vertical elevation of the obstacle's base relative to the ground plane."
                    value={obsY} min={0} max={100} step={1} unit=" m"
                    accent="#ef4444"
                    onChange={(v) => setObsY(v)} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Slider 
                      label="Width" 
                      description="The horizontal thickness of the obstacle."
                      value={obsW} min={0.1} max={50} step={0.1} unit=" m"
                      accent="#ef4444"
                      onChange={(v) => setObsW(v)} 
                    />
                    <Slider 
                      label="Height" 
                      description="The total vertical height of the obstacle from its own base."
                      value={obsH} min={0.1} max={100} step={0.1} unit=" m"
                      accent="#ef4444"
                      onChange={(v) => setObsH(v)} 
                    />
                  </div>
                  {collisionTime !== null && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-bold uppercase tracking-wider text-center animate-pulse">
                      Target Locked: Collision Detected
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">Obstacle System Offline</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Visualizer */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={isShaking ? { 
                opacity: 1, 
                scale: 1,
                x: [0, -6, 6, -6, 6, 0],
                y: [0, 4, -4, 4, -4, 0]
              } : { opacity: 1, scale: 1 }}
              transition={isShaking ? { 
                duration: 0.4,
                times: [0, 0.1, 0.3, 0.5, 0.7, 1],
                ease: "easeInOut"
              } : { opacity: { duration: 0.5 } }}
              className={`relative aspect-[16/10] bg-[#0c111d] rounded-2xl overflow-hidden border border-white/5 border-t-white/10 shadow-2xl ${isDraggingObs ? 'cursor-grabbing' : (obstacleEnabled) ? 'cursor-crosshair' : ''} ${isShaking ? 'ring-2 ring-red-500/50 transition-all shadow-[0_0_40px_rgba(239,68,68,0.2)]' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={500}
                className="w-full h-full block"
              />
              
              {/* Overlay Indicators */}
              <div className="absolute top-4 right-6 font-mono text-right pointer-events-none select-none">
                <div className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Relative Time (s)</div>
                <div className="text-2xl font-bold tabular-nums text-slate-200">{(progress * T_actual).toFixed(3)}</div>
              </div>

              <div className="absolute bottom-4 right-6 flex items-center gap-2">
                 <button 
                  onClick={() => setShowCharts(!showCharts)}
                  className={`p-2 rounded-lg border transition-all ${showCharts ? 'bg-blue-500 border-blue-500 text-white' : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'}`}
                  title="Advanced Data Visualization"
                 >
                   <BarChart3 size={16} />
                 </button>
              </div>

              <AnimatePresence>
                {obstacleEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 left-6 pointer-events-none select-none flex items-center gap-2 bg-black/40 backdrop-blur px-2 py-1 rounded border border-white/5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Drag Red Block to Reposition</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>

            {/* Detailed Flight Phases */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { 
                  l: "Launch Phase", 
                  v: `u=${velocity}m/s`, 
                  d: `Energy: ${(0.5 * mass * velocity * velocity / 1000).toFixed(2)}kJ`,
                  c: "text-blue-400"
                },
                { 
                  l: "Apex State", 
                  v: `h=${theoreticalHmax.toFixed(2)}m`, 
                  d: `V_min: ${Math.min(...pathData.map(p => p.spd)).toFixed(2)}m/s`,
                  c: "text-amber-400"
                },
                { 
                  l: "Impact Phase", 
                  v: `x=${theoreticalRange.toFixed(2)}m`, 
                  d: `θ_imp: ${(Math.atan2(Math.abs(pathData[pathData.length-1]?.vy || 0), Math.abs(pathData[pathData.length-1]?.vx || 1)) * (180/Math.PI)).toFixed(1)}°`,
                  c: "text-emerald-400"
                }
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-slate-900/60 p-4 rounded-xl border border-white/5 relative overflow-hidden group"
                >
                  <div className={`text-[8px] font-bold uppercase tracking-widest ${p.c} mb-1 opacity-70`}>{p.l}</div>
                  <div className="text-sm font-bold text-slate-100 mb-0.5">{p.v}</div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-tight">{p.d}</div>
                  <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <Activity size={32} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Advanced Data Graphs */}
            <AnimatePresence>
              {showCharts && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Series Telemetry</h3>
                      <p className="text-[8px] text-slate-500 font-medium">Numerical Euler Integration (dt=0.01s)</p>
                    </div>
                    {hoverData && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="text-[7px] font-bold text-blue-400 uppercase">T: {hoverData.t.toFixed(3)}s</span>
                        </div>
                        <div className="w-[1px] h-4 bg-blue-500/20" />
                        <div className="flex flex-col">
                          <span className="text-[7px] font-bold text-slate-400 uppercase">X: {hoverData.x.toFixed(2)}m</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-bold text-slate-400 uppercase">Y: {hoverData.y.toFixed(2)}m</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-bold text-white uppercase">V: {hoverData.spd.toFixed(2)}m/s</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      className="h-48 bg-black/40 rounded-xl p-3 border border-white/5 relative group/chart flex flex-col"
                      onMouseLeave={() => setHoverData(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Velocity & Accel</span>
                        <LineChartIcon size={12} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={pathData.filter((_, i) => i % 5 === 0)}
                            onMouseMove={(e: any) => {
                              if (e && e.activePayload) setHoverData(e.activePayload[0].payload);
                            }}
                          >
                            <defs>
                              <linearGradient id="colorSpd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="t" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="spd" name="Velocity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpd)" isAnimationActive={false} />
                            <Line type="monotone" dataKey="ax" name="Accel X" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                            {(progress > 0 || hoverData) && (
                              <ReferenceLine x={hoverData ? hoverData.t : progress * theoreticalT} stroke="#fff" strokeOpacity={hoverData ? 0.8 : 0.4} strokeWidth={1} />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div 
                      className="h-48 bg-black/40 rounded-xl p-3 border border-white/5 relative group/chart flex flex-col"
                      onMouseLeave={() => setHoverData(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Trajectory (Y vs X)</span>
                        <Activity size={12} className="text-green-500" />
                      </div>
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={pathData.filter((_, i) => i % 5 === 0)}
                            onMouseMove={(e: any) => {
                              if (e && e.activePayload) setHoverData(e.activePayload[0].payload);
                            }}
                          >
                             <defs>
                              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="x" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="y" name="Altitude" stroke="#10b981" fillOpacity={1} fill="url(#colorY)" isAnimationActive={false} />
                            {(progress > 0 || hoverData) && (
                              <ReferenceLine x={hoverData ? hoverData.x : pos_x} stroke="#fff" strokeOpacity={hoverData ? 0.8 : 0.4} strokeWidth={1} />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div 
                      className="h-48 bg-black/40 rounded-xl p-3 border border-white/5 relative sm:col-span-2 flex flex-col"
                      onMouseLeave={() => setHoverData(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Energy vs Time (Stacked KE+PE)</span>
                         <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> <span className="text-[7px] text-slate-500 font-bold uppercase">Kinetic</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> <span className="text-[7px] text-slate-500 font-bold uppercase">Potential</span></div>
                         </div>
                      </div>
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={pathData.filter((_, i) => i % 5 === 0).map(pt => ({
                              ...pt,
                              ke: (0.5 * mass * pt.spd * pt.spd) / 1000,
                              pe: (mass * gravity * pt.y) / 1000
                            }))}
                            onMouseMove={(e: any) => {
                              if (e && e.activePayload) setHoverData(e.activePayload[0].payload);
                            }}
                          >
                             <defs>
                              <linearGradient id="colorKE" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPE" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="t" hide />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="ke" name="Kinetic" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorKE)" isAnimationActive={false} />
                            <Area type="monotone" dataKey="pe" name="Potential" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorPE)" isAnimationActive={false} />
                            {(progress > 0 || hoverData) && (
                              <ReferenceLine x={hoverData ? hoverData.t : progress * theoreticalT} stroke="#fff" strokeOpacity={hoverData ? 0.8 : 0.4} strokeWidth={1} />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { label: "Apex Altitude", val: Hmax.toFixed(2), unit: "m", color: "#eab308" },
                 { label: "Total Range", val: Range.toFixed(2), unit: "m", color: "#22c55e" },
                 { label: "Total Time", val: T_actual.toFixed(2), unit: "s", color: "#f97316" },
                 { label: "Impact Vel", val: (pathData[pathData.length-1]?.spd || velocity).toFixed(2), unit: "m/s", color: "#ef4444" }
               ].map((item, idx) => (
                 <motion.div 
                   key={item.label}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 + idx * 0.05 }}
                   className="bg-slate-900/40 p-4 rounded-xl border border-white/5"
                 >
                   <div className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1">{item.label}</div>
                   <div className="text-xl font-bold font-mono" style={{ color: item.color }}>{item.val}<span className="text-xs ml-1 opacity-50">{item.unit}</span></div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Theoretical Data & Debug Log */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {showDebugLog ? (
                <motion.div 
                  key="debug-log"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[#0c111c] border border-blue-500/20 p-5 rounded-2xl h-full flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.05)]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Activity size={14} className="text-blue-400" />
                       <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Simulation Log</h2>
                    </div>
                    <button onClick={() => setEventLog([])} className="text-[9px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-tight transition-colors">Clear</button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] custom-scrollbar pr-2 min-h-[300px] max-h-[500px]">
                    {eventLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                        <Activity size={32} className="mb-4" />
                        <span className="uppercase tracking-[0.2em]">Awaiting telemetry...</span>
                      </div>
                    ) : (
                      eventLog.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="flex gap-3 leading-relaxed border-b border-white/5 pb-2 last:border-0"
                        >
                          <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                          <span className={`${
                            log.type === 'warn' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 
                            'text-blue-300/80'
                          }`}>
                            {log.msg}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-2">Energy Mechanics</div>
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-[8px] uppercase font-bold mb-1">
                             <span className="text-blue-400">Kinetic Energy</span>
                             <span className="text-slate-400 font-mono">{(ke/1000).toFixed(2)} kJ</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(ke / Math.max(totalEnergy, 1)) * 100}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                             />
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between text-[8px] uppercase font-bold mb-1">
                             <span className="text-emerald-400">Potential Energy</span>
                             <span className="text-slate-400 font-mono">{(pe/1000).toFixed(2)} kJ</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                                className="h-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(pe / Math.max(totalEnergy, 1)) * 100}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                             />
                          </div>
                       </div>
                       <div className="pt-2 flex justify-between border-t border-white/5 items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Total Mechanical</span>
                          <span className="text-xs font-mono font-bold text-slate-200">{(totalEnergy/1000).toFixed(2)} kJ</span>
                       </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                     <div className="flex justify-between items-center opacity-50">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Live State</span>
                        <div className="flex gap-1">
                           <div className="w-1 h-1 rounded-full bg-blue-500" />
                           <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                           <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                        <div className="text-slate-500 italic">X_POS: <span className="text-slate-300 not-italic">{pos_x.toFixed(3)}</span></div>
                        <div className="text-slate-500 italic">Y_POS: <span className="text-slate-300 not-italic">{pos_y.toFixed(3)}</span></div>
                        <div className="text-slate-500 italic">V_NET: <span className="text-slate-300 not-italic">{spd.toFixed(3)}</span></div>
                        <div className="text-slate-500 italic">T_CUR: <span className="text-slate-300 not-italic">{(progress * T_actual).toFixed(3)}</span></div>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="physics-ref"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl h-full"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Info size={14} className="text-blue-400" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Physics Reference</h2>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Visual Legend</h2>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                         <span className="text-[10px] font-mono text-slate-400 uppercase">Trajectory Path</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                         <span className="text-[10px] font-mono text-slate-400 uppercase">Vector X (u cosθ)</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                         <span className="text-[10px] font-mono text-slate-400 uppercase">Vector Y (u sinθ - gt)</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                         <span className="text-[10px] font-mono text-slate-400 uppercase">Accel Y (-g)</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {equations.map((item) => (
                      <div key={item.lbl} className="group p-3 rounded-lg border border-white/5 bg-black/20 hover:border-blue-500/30 transition-all transition-duration-300">
                        <div className="font-mono text-sm font-bold mb-1" style={{ color: item.c }}>{item.eq}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-500">{item.lbl}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      Insight
                    </h3>
                    <p className="text-[11px] leading-relaxed text-blue-200/60 font-medium italic">
                      "In a vacuum, the horizontal component of velocity remains constant, while the vertical component is subject to uniform acceleration due to gravity."
                    </p>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2">
                     <div className="flex justify-between items-center mb-1">
                       <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">State Monitoring</div>
                       <button 
                         onClick={exportToCSV}
                         className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/20 transition-all group"
                       >
                         <Download size={10} className="group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-bold uppercase tracking-wider">Export CSV</span>
                       </button>
                     </div>
                     <Stat label="Current X" val={pos_x.toFixed(2)} unit="m" />
                     <Stat label="Current Y" val={pos_y.toFixed(2)} unit="m" />
                     <Stat label="Inst. Vₓ" val={vel_x.toFixed(2)} unit="m/s" color="#f97316" />
                     <Stat label="Inst. Vᵧ" val={vel_y.toFixed(2)} unit="m/s" color="#22c55e" />
                     <Stat label="Net Velocity" val={spd.toFixed(2)} unit="m/s" color="#60a5fa" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center py-8 opacity-30">
          <p className="text-[10px] font-sans tracking-[0.4em] uppercase hover:opacity-100 transition-opacity cursor-default">
            Simulated in Non-Relativistic Space-Time
          </p>
        </div>

      </div>
    </div>
  );
}
