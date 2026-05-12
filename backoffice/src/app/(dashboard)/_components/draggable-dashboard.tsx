"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { cn } from "@/lib/utils";
import { X, Plus, Settings2, RotateCcw, LayoutGrid } from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DraggableDashboardProps {
  children: { [key: string]: { component: ReactNode; label: string } };
}

const STORAGE_KEY = "dashboard-layout-v1";
const VISIBILITY_KEY = "dashboard-visibility-v1";

export function DraggableDashboard({ children }: DraggableDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Default layouts
  const defaultLayouts: { [key: string]: Layout[] } = {
    lg: [
      { i: "payments", x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 8 },
      { i: "low-stock", x: 8, y: 0, w: 4, h: 7, minW: 2, minH: 5 },
      { i: "ai-insight", x: 8, y: 7, w: 4, h: 3, minW: 2, minH: 2 },
      { i: "system-monitor", x: 8, y: 10, w: 4, h: 3, minW: 2, minH: 2 },
      { i: "forecast", x: 0, y: 12, w: 8, h: 10, minW: 4, minH: 6 },
      { i: "pulse", x: 8, y: 13, w: 4, h: 7, minW: 2, minH: 4 },
      { i: "profit", x: 8, y: 20, w: 4, h: 8, minW: 2, minH: 4 },
      { i: "top-products", x: 0, y: 22, w: 8, h: 13, minW: 4, minH: 8 },
      { i: "stock-levels", x: 8, y: 28, w: 4, h: 7, minW: 2, minH: 4 },
      { i: "channels", x: 0, y: 35, w: 8, h: 13, minW: 4, minH: 8 },
      { i: "chats", x: 8, y: 35, w: 4, h: 13, minW: 2, minH: 8 },
    ],
  };

  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>(defaultLayouts);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(Object.keys(children));

  useEffect(() => {
    setMounted(true);
    const savedLayouts = localStorage.getItem(STORAGE_KEY);
    if (savedLayouts) {
      try { setLayouts(JSON.parse(savedLayouts)); } catch (e) { setLayouts(defaultLayouts); }
    }
    const savedVisibility = localStorage.getItem(VISIBILITY_KEY);
    if (savedVisibility) {
      try { setVisibleWidgets(JSON.parse(savedVisibility)); } catch (e) { setVisibleWidgets(Object.keys(children)); }
    }
  }, []);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
  };

  const toggleWidget = (id: string) => {
    const newVisibility = visibleWidgets.includes(id)
      ? visibleWidgets.filter(w => w !== id)
      : [...visibleWidgets, id];
    setVisibleWidgets(newVisibility);
    localStorage.setItem(VISIBILITY_KEY, JSON.stringify(newVisibility));
  };

  const resetDashboard = () => {
    if (confirm("Réinitialiser le dashboard ?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VISIBILITY_KEY);
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-[500px]">
      {/* Floating Action Button */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
            "fixed bottom-8 right-8 z-[9999] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl group",
            showSettings ? "bg-red-500 text-white" : "bg-primary text-white hover:scale-105"
        )}
      >
        {showSettings ? <X size={20} /> : <Settings2 size={20} className="group-hover:rotate-90 transition-transform duration-500" />}
        <span className="font-bold text-sm">{showSettings ? "Fermer" : "Personnaliser"}</span>
      </button>

      {/* Floating Management Panel */}
      {showSettings && (
        <div className="fixed bottom-24 right-8 z-[9999] w-80 glass-premium rounded-3xl p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={18} className="text-primary" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Widgets</h4>
                </div>
                <button onClick={resetDashboard} className="text-red-400 hover:text-red-500 transition-colors" title="Réinitialiser">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(children).map(([id, { label }]) => (
                    <button
                        key={id}
                        onClick={() => toggleWidget(id)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all border",
                            visibleWidgets.includes(id) 
                                ? "bg-primary/10 border-primary/30 text-primary" 
                                : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                        )}
                    >
                        {label}
                        {visibleWidgets.includes(id) ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Draggable Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={40}
        draggableHandle=".drag-handle"
        onLayoutChange={onLayoutChange}
        margin={[12, 12]}
        isResizable={true}
        resizeHandles={['se']}
        verticalCompact={false}
        compactType={null}
        preventCollision={false}
      >
        {Object.entries(children)
          .filter(([id]) => visibleWidgets.includes(id))
          .map(([id, { component }]) => (
            <div key={id} className="group relative">
              {/* Discrete Controls Overlay */}
              <div className="absolute top-4 right-4 z-50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <div className="drag-handle p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl cursor-move border border-white/10 shadow-lg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                        <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                    </svg>
                </div>
                <button 
                    onClick={() => toggleWidget(id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-xl border border-red-500/20 text-red-400 shadow-lg"
                >
                    <X size={12} />
                </button>
              </div>

              <div className="h-full w-full">
                {component}
              </div>
            </div>
          ))}
      </ResponsiveGridLayout>
    </div>
  );
}

function Check({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
