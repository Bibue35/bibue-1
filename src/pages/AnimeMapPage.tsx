import { useState, useRef, useMemo, useCallback, useEffect, Suspense, lazy } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime, getAnimeBatchByIds, Anime } from "@/lib/api";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";

const AnimeDetailModal = lazy(() => import("@/components/AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));

// ─── Genre config ──────────────────────────────────────────────
const GENRE_COLORS: Record<string, string> = {
  Action: "#ef4444",
  Romance: "#ec4899",
  Comedy: "#eab308",
  Fantasy: "#a855f7",
  "Sci-Fi": "#3b82f6",
  Horror: "#22c55e",
  "Slice of Life": "#94a3b8",
  Adventure: "#f97316",
  Drama: "#8b5cf6",
  Mystery: "#6d28d9",
  Thriller: "#991b1b",
  Sports: "#0ea5e9",
  Supernatural: "#c084fc",
  Mecha: "#64748b",
  Psychological: "#7c3aed",
  Music: "#f472b6",
};

const GENRE_CLUSTERS: Record<string, [number, number, number]> = {
  Action: [18, 4, 0],
  Romance: [-18, 12, 6],
  Comedy: [0, 18, -12],
  Drama: [-12, -6, 18],
  Fantasy: [12, -12, 12],
  "Sci-Fi": [-6, 18, -18],
  Horror: [18, -18, -6],
  Mystery: [-18, -12, -12],
  "Slice of Life": [6, 12, 18],
  Adventure: [12, 12, -6],
  Thriller: [18, 0, -18],
  Sports: [-12, 18, 0],
  Supernatural: [0, -18, 12],
  Mecha: [-18, 0, 18],
  Psychological: [6, -12, -18],
  Music: [-6, -18, -6],
};

// ─── Types ─────────────────────────────────────────────────────
interface GalaxyNode {
  id: number;
  anime: Anime;
  position: THREE.Vector3;
  color: string;
  size: number;
  brightness: number;
  watchStatus?: string;
  userScore?: number | null;
  genre: string;
}

interface Connection {
  from: number;
  to: number;
  type: "sequel" | "genre" | "related" | "web";
}

// ─── Layout helpers ────────────────────────────────────────────
function buildGalaxyNodes(
  animeList: Anime[],
  watchlistMap: Map<number, WatchlistItem>
): GalaxyNode[] {
  const nodes: GalaxyNode[] = [];

  animeList.forEach((anime) => {
    const primaryGenre = anime.genres?.[0]?.name || "Action";
    const cluster = GENRE_CLUSTERS[primaryGenre] || [0, 0, 0];
    const spread = 10;

    const seed = anime.anilist_id;
    const r1 = Math.sin(seed * 12.9898 + 78.233) * 0.5 + 0.5;
    const r2 = Math.sin(seed * 43.2391 + 21.134) * 0.5 + 0.5;
    const r3 = Math.sin(seed * 91.3482 + 52.847) * 0.5 + 0.5;

    const position = new THREE.Vector3(
      cluster[0] + (r1 - 0.5) * spread,
      cluster[1] + (r2 - 0.5) * spread,
      cluster[2] + (r3 - 0.5) * spread
    );

    const wlItem = watchlistMap.get(anime.anilist_id);
    const userScore = wlItem?.score;
    const watchStatus = wlItem?.status;

    let size: number;
    if (userScore && userScore > 0) {
      size = 0.08 + (userScore / 10) * 0.22; // smaller nodes for web style
    } else {
      const pop = anime.popularity || 1000;
      size = Math.max(0.08, Math.min(0.2, Math.log10(pop) / 8));
    }

    const score = anime.score || 5;
    const brightness = Math.max(0.3, score / 10);
    const color = GENRE_COLORS[primaryGenre] || "#9ca3af";

    nodes.push({ id: anime.anilist_id, anime, position, color, size, brightness, watchStatus, userScore, genre: primaryGenre });
  });

  return nodes;
}

function buildConnections(nodes: GalaxyNode[], animeList: Anime[]): Connection[] {
  const connections: Connection[] = [];
  const idToIndex = new Map<number, number>();
  nodes.forEach((n, i) => idToIndex.set(n.id, i));

  // Relation-based connections
  animeList.forEach((anime) => {
    const fromIdx = idToIndex.get(anime.anilist_id);
    if (fromIdx === undefined) return;
    const relations = (anime as any)._relations as Array<{ id: number; type: string }> | undefined;
    if (!relations) return;
    relations.forEach((rel) => {
      const toIdx = idToIndex.get(rel.id);
      if (toIdx === undefined || toIdx <= fromIdx) return;
      const type = ["SEQUEL", "PREQUEL", "PARENT", "SIDE_STORY"].includes(rel.type) ? "sequel" : "related";
      connections.push({ from: fromIdx, to: toIdx, type });
    });
  });

  // Dense genre web connections (spider web style — connect to multiple neighbors)
  const genreGroups: Record<string, number[]> = {};
  nodes.forEach((n, i) => {
    if (!genreGroups[n.genre]) genreGroups[n.genre] = [];
    genreGroups[n.genre].push(i);
  });

  Object.values(genreGroups).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      // Sort others by distance and connect to nearest 3
      const distances: { idx: number; dist: number }[] = [];
      for (let j = 0; j < group.length; j++) {
        if (i === j) continue;
        distances.push({ idx: j, dist: nodes[group[i]].position.distanceTo(nodes[group[j]].position) });
      }
      distances.sort((a, b) => a.dist - b.dist);
      const connectCount = Math.min(3, distances.length);
      for (let k = 0; k < connectCount; k++) {
        const a = Math.min(group[i], group[distances[k].idx]);
        const b = Math.max(group[i], group[distances[k].idx]);
        // Avoid exact duplicates
        if (!connections.some(c => c.from === a && c.to === b && c.type === "genre")) {
          connections.push({ from: a, to: b, type: "genre" });
        }
      }
    }
  });

  // Cross-genre web connections (connect nearby nodes across genres for spider web feel)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      if (dist < 6 && nodes[i].genre !== nodes[j].genre) {
        connections.push({ from: i, to: j, type: "web" });
      }
    }
  }

  return connections;
}

// ─── Small node dots (instanced) ───────────────────────────────
function InstancedNodes({
  nodes,
  hoveredIndex,
  onHover,
  onClick,
}: {
  nodes: GalaxyNode[];
  hoveredIndex: number | null;
  onHover: (idx: number | null) => void;
  onClick: (idx: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { raycaster, camera, pointer } = useThree();

  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    nodes.forEach((node, i) => {
      dummy.position.copy(node.position);
      dummy.scale.setScalar(node.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      color.set(node.color);
      meshRef.current!.setColorAt(i, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [nodes, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    nodes.forEach((node, i) => {
      let scale = node.size;
      if (node.watchStatus === "watching") scale *= 1 + Math.sin(time * 3 + node.id) * 0.15;
      if (node.watchStatus === "plan_to_watch") scale *= 0.6;
      if (hoveredIndex === i) scale *= 2.5;
      dummy.position.copy(node.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const handlePointerMove = useCallback(() => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      onHover(intersects[0].instanceId);
    } else {
      onHover(null);
    }
  }, [raycaster, camera, pointer, onHover]);

  const handleClick = useCallback(() => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      onClick(intersects[0].instanceId);
    }
  }, [raycaster, camera, pointer, onClick]);

  return (
    <group onPointerMove={handlePointerMove} onClick={handleClick}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// ─── Animated web lines (draw-in effect) ───────────────────────
function WebLines({ nodes, connections }: { nodes: GalaxyNode[]; connections: Connection[] }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const progressRef = useRef(0);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // Full target positions & colors
  const { targetPositions, colors } = useMemo(() => {
    const pos = new Float32Array(connections.length * 6);
    const col = new Float32Array(connections.length * 6);

    connections.forEach((conn, i) => {
      const from = nodes[conn.from];
      const to = nodes[conn.to];
      const offset = i * 6;

      pos[offset] = from.position.x; pos[offset + 1] = from.position.y; pos[offset + 2] = from.position.z;
      pos[offset + 3] = to.position.x; pos[offset + 4] = to.position.y; pos[offset + 5] = to.position.z;

      const c1 = new THREE.Color(from.color);
      const c2 = new THREE.Color(to.color);

      if (conn.type === "sequel") {
        c1.set("#f59e0b"); c2.set("#f59e0b");
      } else if (conn.type === "related") {
        c1.set("#6366f1"); c2.set("#6366f1");
      } else if (conn.type === "web") {
        c1.lerp(c2, 0.5).multiplyScalar(0.5);
        c2.copy(c1);
      }

      col[offset] = c1.r; col[offset + 1] = c1.g; col[offset + 2] = c1.b;
      col[offset + 3] = c2.r; col[offset + 4] = c2.g; col[offset + 5] = c2.b;
    });

    return { targetPositions: pos, colors: col };
  }, [nodes, connections]);

  // Animated positions: lines start collapsed at "from" node, then extend to "to" node
  const animPositions = useMemo(() => {
    const pos = new Float32Array(connections.length * 6);
    // Initialize all endpoints to the "from" position (lines start as points)
    connections.forEach((conn, i) => {
      const from = nodes[conn.from];
      const offset = i * 6;
      pos[offset] = from.position.x; pos[offset + 1] = from.position.y; pos[offset + 2] = from.position.z;
      pos[offset + 3] = from.position.x; pos[offset + 4] = from.position.y; pos[offset + 5] = from.position.z;
    });
    return pos;
  }, [nodes, connections]);

  // Animate: progressively draw lines over ~3 seconds with staggered timing
  useFrame((_, delta) => {
    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.4); // ~2.5s total
    const p = progressRef.current;

    const geom = lineRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const total = connections.length;

    for (let i = 0; i < total; i++) {
      // Stagger: each line starts drawing at a different time
      const stagger = i / total * 0.6; // spread over 60% of duration
      const localP = Math.max(0, Math.min(1, (p - stagger) / 0.4)); // each line draws in 40% of duration
      const eased = localP * localP * (3 - 2 * localP); // smoothstep

      const offset = i * 6;
      // "from" stays fixed, "to" interpolates
      arr[offset + 3] = arr[offset] + (targetPositions[offset + 3] - targetPositions[offset]) * eased;
      arr[offset + 4] = arr[offset + 1] + (targetPositions[offset + 4] - targetPositions[offset + 1]) * eased;
      arr[offset + 5] = arr[offset + 2] + (targetPositions[offset + 5] - targetPositions[offset + 2]) * eased;
    }
    posAttr.needsUpdate = true;

    // Fade in opacity
    if (materialRef.current) {
      materialRef.current.opacity = Math.min(0.35, p * 0.5);
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[animPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial ref={materialRef} vertexColors transparent opacity={0} toneMapped={false} />
    </lineSegments>
  );
}

// ─── Genre labels ──────────────────────────────────────────────
function GenreLabels() {
  const labels = Object.entries(GENRE_COLORS).slice(0, 12).map(([name, color]) => ({
    name, color, position: GENRE_CLUSTERS[name] || [0, 0, 0],
  }));

  return (
    <>
      {labels.map((label) => (
        <Html key={label.name} position={[label.position[0], label.position[1] + 7, label.position[2]]} center distanceFactor={45} style={{ pointerEvents: "none" }}>
          <span className="text-[10px] font-bold uppercase tracking-widest select-none" style={{ color: label.color, opacity: 0.6 }}>
            {label.name}
          </span>
        </Html>
      ))}
    </>
  );
}

// ─── Hover tooltip ─────────────────────────────────────────────
function NodeTooltip({ node }: { node: GalaxyNode }) {
  const statusLabel: Record<string, string> = {
    watching: "🔵 Watching", completed: "✅ Completed", plan_to_watch: "📋 Plan to Watch",
    on_hold: "⏸ On Hold", dropped: "❌ Dropped",
  };

  return (
    <Html position={[node.position.x, node.position.y + node.size + 0.8, node.position.z]} center distanceFactor={20} style={{ pointerEvents: "none" }}>
      <div className="bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px] max-w-[240px]">
        {node.anime.images?.webp?.image_url && (
          <div className="h-20 w-full overflow-hidden">
            <img src={node.anime.images.webp.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{node.anime.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
            {node.anime.score && <span>★ {node.anime.score.toFixed(1)}</span>}
            <span style={{ color: node.color }}>{node.genre}</span>
            {node.anime.episodes && <span>{node.anime.episodes} ep</span>}
          </div>
          {node.watchStatus && <p className="text-xs mt-1" style={{ color: node.color }}>{statusLabel[node.watchStatus] || node.watchStatus}</p>}
          {node.userScore && node.userScore > 0 && <p className="text-xs text-gray-400">Your rating: {node.userScore}/10</p>}
        </div>
      </div>
    </Html>
  );
}

// ─── Idle rendering control ────────────────────────────────────
function IdleControl() {
  const { invalidate } = useThree();
  const lastInteraction = useRef(Date.now());
  const isIdle = useRef(false);

  useEffect(() => {
    const onInteract = () => {
      lastInteraction.current = Date.now();
      if (isIdle.current) { isIdle.current = false; invalidate(); }
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("pointermove", onInteract);
    window.addEventListener("wheel", onInteract);
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("pointermove", onInteract);
      window.removeEventListener("wheel", onInteract);
    };
  }, [invalidate]);

  useFrame(() => {
    if (Date.now() - lastInteraction.current > 5000) isIdle.current = true;
  });

  return null;
}

// ─── Main scene ────────────────────────────────────────────────
function GalaxyScene({ nodes, connections, onSelectAnime }: { nodes: GalaxyNode[]; connections: Connection[]; onSelectAnime: (anime: Anime) => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleClick = useCallback((idx: number) => {
    if (nodes[idx]) onSelectAnime(nodes[idx].anime);
  }, [nodes, onSelectAnime]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#8b5cf6" distance={60} />
      <pointLight position={[25, 15, -15]} intensity={0.2} color="#f59e0b" distance={60} />

      <WebLines nodes={nodes} connections={connections} />
      <GenreLabels />
      <InstancedNodes nodes={nodes} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} onClick={handleClick} />

      {hoveredIndex !== null && nodes[hoveredIndex] && <NodeTooltip node={nodes[hoveredIndex]} />}

      <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.15} maxDistance={70} minDistance={5} enableDamping dampingFactor={0.05} />
      <IdleControl />
    </>
  );
}

// ─── Light theme enforcer ──────────────────────────────────────
function useForceLight() {
  const { theme, setTheme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    previousTheme.current = theme;
    if (theme !== "light") setTheme("light");
    return () => {
      if (previousTheme.current && previousTheme.current !== "light") {
        setTheme(previousTheme.current);
      }
    };
  }, []); // only on mount/unmount
}

// ─── Page component ────────────────────────────────────────────
export default function AnimeMapPage() {
  useForceLight();
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();

  const watchlistMap = useMemo(() => {
    const map = new Map<number, WatchlistItem>();
    watchlist?.forEach((item) => { if (item.media_type === "anime") map.set(item.mal_id, item); });
    return map;
  }, [watchlist]);

  const watchlistAnimeIds = useMemo(() => Array.from(watchlistMap.keys()).slice(0, 500), [watchlistMap]);
  const hasWatchlist = watchlistAnimeIds.length > 0;

  const { data: watchlistAnime, isLoading: batchLoading } = useQuery({
    queryKey: ["galaxy-watchlist-batch", watchlistAnimeIds, language],
    queryFn: () => getAnimeBatchByIds(watchlistAnimeIds, language as any),
    enabled: hasWatchlist && watchlistAnimeIds.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const { data: popularAnime, isLoading: popularLoading } = useQuery({
    queryKey: ["galaxy-popular-seed", language],
    queryFn: () => getTopAnime(1, 80, "bypopularity", language as any),
    enabled: !hasWatchlist,
    staleTime: 1000 * 60 * 30,
  });

  const isLoading = watchlistLoading || (hasWatchlist ? batchLoading : popularLoading);
  const animeList = hasWatchlist ? (watchlistAnime || []) : (popularAnime || []);

  const { nodes, connections } = useMemo(() => {
    if (animeList.length === 0) return { nodes: [], connections: [] };
    const n = buildGalaxyNodes(animeList, watchlistMap);
    const c = buildConnections(n, animeList);
    return { nodes: n, connections: c };
  }, [animeList, watchlistMap]);

  const handleSelectAnime = useCallback((anime: Anime) => {
    setSelectedAnime(anime);
    setModalOpen(true);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { watching: 0, completed: 0, plan_to_watch: 0, other: 0 };
    nodes.forEach((n) => {
      if (n.watchStatus === "watching") counts.watching++;
      else if (n.watchStatus === "completed") counts.completed++;
      else if (n.watchStatus === "plan_to_watch") counts.plan_to_watch++;
      else if (n.watchStatus) counts.other++;
    });
    return counts;
  }, [nodes]);

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "#f8f9fc" }}>
      <SEO title="Anime Galaxy — Your Universe — Bibue" description="Explore your anime universe as an interactive 3D web constellation." url="/map" />
      <CollapsibleNavbar />

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "#f8f9fc" }}>
          <div className="text-center space-y-4">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto animate-pulse" />
            <p className="text-gray-500 text-sm">{hasWatchlist ? "Weaving your galaxy..." : "Loading the anime web..."}</p>
            <p className="text-gray-400 text-xs">{hasWatchlist ? `Connecting ${watchlistAnimeIds.length} anime` : "Discovering connections"}</p>
          </div>
        </div>
      )}

      {nodes.length > 0 && (
        <Canvas
          camera={{ position: [0, 15, 40], fov: 55 }}
          className="!absolute inset-0"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ background: "#f0f1f5" }}
        >
          <GalaxyScene nodes={nodes} connections={connections} onSelectAnime={handleSelectAnime} />
        </Canvas>
      )}

      {/* Title overlay */}
      <div className="absolute top-20 left-4 md:left-6 z-20 max-w-xs">
        <h1 className="text-xl md:text-3xl font-bold font-sacred" style={{ color: "#1a1a2e" }}>
          {hasWatchlist ? "Your Galaxy" : "Anime Galaxy"}
        </h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: "#6b7280" }}>
          {nodes.length} nodes • {connections.length} connections
        </p>
        {!hasWatchlist && !isLoading && (
          <div className="mt-3 bg-white/70 backdrop-blur-sm border border-black/5 rounded-xl px-3 py-2">
            <p className="text-xs" style={{ color: "#6b7280" }}>
              {user ? "Add anime to your watchlist to build your personal web ✨" : "Sign in and start watching to create your universe 🌌"}
            </p>
          </div>
        )}
        {hasWatchlist && !isLoading && (
          <div className="flex gap-3 mt-2 text-[10px]" style={{ color: "#9ca3af" }}>
            {statusCounts.watching > 0 && <span>🔵 {statusCounts.watching} watching</span>}
            {statusCounts.completed > 0 && <span>✅ {statusCounts.completed} completed</span>}
            {statusCounts.plan_to_watch > 0 && <span>📋 {statusCounts.plan_to_watch} planned</span>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-4 md:left-6 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/60 backdrop-blur-sm border-black/10 text-gray-600 hover:text-gray-900 hover:bg-white/80 h-9 w-9 rounded-full"
          onClick={() => setShowLegend(!showLegend)}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-6 right-4 md:right-6 z-20 bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl p-4 max-w-[220px]">
          <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Genre Clusters</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(GENRE_COLORS).slice(0, 12).map(([genre, color]) => (
              <div key={genre} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-gray-500 truncate">{genre}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-black/5 mt-3 pt-2 space-y-1">
            <p className="text-[10px] text-gray-400">★ Size = your rating</p>
            <p className="text-[10px] text-gray-400">🔵 Pulsing = watching</p>
            <p className="text-[10px] text-gray-400">🕸 Lines = connections</p>
          </div>
          <div className="border-t border-black/5 mt-2 pt-2 space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-4 h-0.5 bg-amber-500 rounded" />
              <span className="text-gray-400">Sequel/Prequel</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-4 h-0.5 bg-indigo-500 rounded" />
              <span className="text-gray-400">Related</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-4 h-0.5 bg-gray-300 rounded" />
              <span className="text-gray-400">Genre web</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      {!isLoading && nodes.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] text-center pointer-events-none" style={{ color: "#9ca3af" }}>
          Drag to rotate • Scroll to zoom • Click a node to explore
        </div>
      )}

      {/* Detail modal */}
      {modalOpen && selectedAnime && (
        <Suspense fallback={null}>
          <AnimeDetailModal animeId={selectedAnime.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
        </Suspense>
      )}
    </div>
  );
}
