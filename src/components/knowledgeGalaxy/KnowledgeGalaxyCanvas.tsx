import React, { useRef, useEffect, useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Concept, UserConceptState } from '../../types/subject';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, Layers, ShieldAlert, ArrowRight } from 'lucide-react';

interface KnowledgeGalaxyCanvasProps {
  onSelectConcept: (conceptId: string) => void;
}

export const KnowledgeGalaxyCanvas: React.FC<KnowledgeGalaxyCanvasProps> = ({ onSelectConcept }) => {
  const { concepts, userConceptStates, activeSubject } = useAdaptive();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredConceptId, setHoveredConceptId] = useState<string | null>(null);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  const filteredConcepts = concepts.filter((c) => {
    if (selectedTierFilter === 'all') return true;
    const tier = userConceptStates[c.id]?.masteryTier || 'novice';
    return tier === selectedTierFilter;
  });

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      particleOffset += 0.4;
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Background Ambient Grid & Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let gx = -200; gx < 1200; gx += 60) {
        for (let gy = -200; gy < 900; gy += 60) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw Prerequisite Edge Lines & Flow Particles
      concepts.forEach((concept) => {
        concept.prerequisiteIds.forEach((prereqId) => {
          const prereq = concepts.find((c) => c.id === prereqId);
          if (!prereq) return;

          const pState = userConceptStates[prereqId];
          const isSatisfied = (pState?.masteryScore || 0) >= 0.60;

          const startX = prereq.visualGalaxyCoords.x;
          const startY = prereq.visualGalaxyCoords.y;
          const endX = concept.visualGalaxyCoords.x;
          const endY = concept.visualGalaxyCoords.y;

          // Edge stroke
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = isSatisfied ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = isSatisfied ? 2 : 1.5;
          if (!isSatisfied) ctx.setLineDash([4, 4]);
          else ctx.setLineDash([]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated particle moving along the edge
          const dx = endX - startX;
          const dy = endY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = ((particleOffset * 15) % dist) / dist;
          const px = startX + dx * t;
          const py = startY + dy * t;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isSatisfied ? '#818cf8' : '#f87171';
          ctx.shadowColor = isSatisfied ? '#6366f1' : '#ef4444';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // 3. Draw Concept Nodes
      concepts.forEach((concept) => {
        const state = userConceptStates[concept.id] || {
          masteryScore: 0.15,
          retentionScore: 0.8,
          masteryTier: 'novice',
          isPrerequisiteBottleneck: false,
        };

        const { x, y } = concept.visualGalaxyCoords;
        const isHovered = hoveredConceptId === concept.id;
        const isMatchFilter = filteredConcepts.some((fc) => fc.id === concept.id);
        const radius = isHovered ? 26 : 22;

        ctx.save();
        if (!isMatchFilter) {
          ctx.globalAlpha = 0.25;
        }

        // Color coding by mastery
        let glowColor = '#6366f1';
        let fillColor = '#1e1e2d';
        let strokeColor = '#4338ca';

        if (state.masteryScore >= 0.90) {
          glowColor = '#10b981';
          fillColor = '#064e3b';
          strokeColor = '#34d399';
        } else if (state.masteryScore >= 0.70) {
          glowColor = '#6366f1';
          fillColor = '#312e81';
          strokeColor = '#818cf8';
        } else if (state.masteryScore >= 0.40) {
          glowColor = '#06b6d4';
          fillColor = '#164e63';
          strokeColor = '#22d3ee';
        } else if (state.retentionScore < 0.60) {
          glowColor = '#f59e0b';
          fillColor = '#78350f';
          strokeColor = '#fbbf24';
        }

        // Outer Glow
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isHovered ? 22 : 12;
        ctx.globalAlpha = isHovered ? 0.35 : 0.15;
        ctx.fill();
        ctx.globalAlpha = !isMatchFilter ? 0.25 : 1.0;
        ctx.shadowBlur = 0;

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // Mastery Progress Arc Ring
        const masteryAngle = (state.masteryScore || 0.1) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, -Math.PI / 2, -Math.PI / 2 + masteryAngle);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Label (Short code inside)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(concept.shortCode, x, y);

        // Concept Name below node
        ctx.fillStyle = isHovered ? '#ffffff' : '#d4d4d8';
        ctx.font = isHovered ? '600 12px Plus Jakarta Sans, sans-serif' : '500 11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(concept.name, x, y + radius + 15);

        // Mastery % Badge
        ctx.fillStyle = state.masteryScore >= 0.8 ? '#34d399' : '#a5b4fc';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${Math.round(state.masteryScore * 100)}% mastery`, x, y + radius + 28);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [concepts, userConceptStates, panOffset, zoom, hoveredConceptId, selectedTierFilter]);

  // Mouse / Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Check hit test for hover
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoom;
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoom;

    const hit = concepts.find((c) => {
      const dx = c.visualGalaxyCoords.x - mouseX;
      const dy = c.visualGalaxyCoords.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= 28;
    });

    setHoveredConceptId(hit ? hit.id : null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hoveredConceptId) {
      onSelectConcept(hoveredConceptId);
    }
  };

  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-2xl">
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/90 p-1 backdrop-blur-xl shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPanOffset({ x: 50, y: 30 });
            }}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Tier Filter dropdown */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-1.5 backdrop-blur-xl shadow-lg text-xs">
          <Filter className="h-3.5 w-3.5 text-indigo-400" />
          <select
            value={selectedTierFilter}
            onChange={(e) => setSelectedTierFilter(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-900 text-white">All Mastery Tiers</option>
            <option value="mastery" className="bg-zinc-900 text-emerald-400">Mastery (93%+)</option>
            <option value="advanced" className="bg-zinc-900 text-indigo-400">Advanced (80-92%)</option>
            <option value="proficient" className="bg-zinc-900 text-cyan-400">Proficient (60-79%)</option>
            <option value="developing" className="bg-zinc-900 text-amber-400">Developing (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Floating Status / Legend Badge */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/90 px-3.5 py-2 backdrop-blur-xl text-xs text-zinc-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <span>Mastery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
          <span>Advanced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span>Proficient</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
          <span>Decaying / Prereq Gap</span>
        </div>
      </div>

      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Hover Info Tooltip Preview */}
      {hoveredConceptId && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">
              {concepts.find((c) => c.id === hoveredConceptId)?.name}
            </h4>
            <p className="text-[11px] text-zinc-400">
              Click node to open Deep Dive Drawer & AI Socratic Tutor
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-400" />
        </div>
      )}
    </div>
  );
};
