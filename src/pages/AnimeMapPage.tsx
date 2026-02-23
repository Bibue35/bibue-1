import { useState, useRef, useMemo, useCallback, useEffect, Suspense, lazy } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime, getAnimeBatchByIds, getTopManga, getMangaBatchByIds, Anime, Manga } from "@/lib/api";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const AnimeDetailModal = lazy(() => import("@/components/AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
const MangaDetailModal = lazy(() => import("@/components/MangaDetailModal").then(m => ({ default: m.MangaDetailModal })));

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

type MediaMode = "anime" | "manga";

// ─── Types ─────────────────────────────────────────────────────
interface WebNode {
  id: number;
  title: string;
  imageUrl?: string;
  score?: number;
  episodes?: number;
  chapters?: number;
  position: THREE.Vector3;
  color: string;
  size: number;
  brightness: number;
  watchStatus?: string;
  userScore?: number | null;
  genre: string;
  mediaType: MediaMode;
  popularity?: number;
}

interface Connection {
  from: number;
  to: number;
  type: "sequel" | "genre" | "related" | "web";
}

// ─── Layout helpers ────────────────────────────────────────────
function buildNodes(
  animeList: Anime[],
  mangaList: Manga[],
  watchlistMap: Map<number, WatchlistItem>,
  mode: MediaMode
): WebNode[] {
  const nodes: WebNode[] = [];

  if (mode === "anime") {
    animeList.forEach((anime) => {
      const primaryGenre = anime.genres?.[0]?.name || "Action";
      const cluster = GENRE_CLUSTERS[primaryGenre] || [0, 0, 0];
      const spread = 10;
      const seed = anime.anilist_id;
      const r1 = Math.sin(seed * 12.9898 + 78.233) * 0.5 + 0.5;
      const r2 = Math.sin(seed * 43.2391 + 21.134) * 0.5 + 0.5;
      const r3 = Math.sin(seed * 91.3482 + 52.847) * 0.5 + 0.5;
      const position = new THREE.Vector3(cluster[0] + (r1 - 0.5) * spread, cluster[1] + (r2 - 0.5) * spread, cluster[2] + (r3 - 0.5) * spread);
      const wlItem = watchlistMap.get(anime.anilist_id);
      let size: number;
      if (wlItem?.score && wlItem.score > 0) {
        size = 0.08 + (wlItem.score / 10) * 0.22;
      } else {
        const pop = anime.popularity || 1000;
        size = Math.max(0.08, Math.min(0.2, Math.log10(pop) / 8));
      }
      const score = anime.score || 5;
      const color = GENRE_COLORS[primaryGenre] || "#9ca3af";
      nodes.push({
        id: anime.anilist_id, title: anime.title, imageUrl: anime.images?.webp?.image_url,
        score: anime.score, episodes: anime.episodes, position, color, size,
        brightness: Math.max(0.3, score / 10), watchStatus: wlItem?.status,
        userScore: wlItem?.score, genre: primaryGenre, mediaType: "anime", popularity: anime.popularity,
      });
    });
  } else {
    mangaList.forEach((manga) => {
      const primaryGenre = manga.genres?.[0]?.name || "Action";
      const cluster = GENRE_CLUSTERS[primaryGenre] || [0, 0, 0];
      const spread = 10;
      const seed = manga.anilist_id;
      const r1 = Math.sin(seed * 12.9898 + 78.233) * 0.5 + 0.5;
      const r2 = Math.sin(seed * 43.2391 + 21.134) * 0.5 + 0.5;
      const r3 = Math.sin(seed * 91.3482 + 52.847) * 0.5 + 0.5;
      const position = new THREE.Vector3(cluster[0] + (r1 - 0.5) * spread, cluster[1] + (r2 - 0.5) * spread, cluster[2] + (r3 - 0.5) * spread);
      const wlItem = watchlistMap.get(manga.anilist_id);
      let size: number;
      if (wlItem?.score && wlItem.score > 0) {
        size = 0.08 + (wlItem.score / 10) * 0.22;
      } else {
        const pop = manga.popularity || 1000;
        size = Math.max(0.08, Math.min(0.2, Math.log10(pop) / 8));
      }
      const score = manga.score || 5;
      const color = GENRE_COLORS[primaryGenre] || "#9ca3af";
      nodes.push({
        id: manga.anilist_id, title: manga.title, imageUrl: manga.images?.webp?.image_url,
        score: manga.score, chapters: manga.chapters, position, color, size,
        brightness: Math.max(0.3, score / 10), watchStatus: wlItem?.status,
        userScore: wlItem?.score, genre: primaryGenre, mediaType: "manga", popularity: manga.popularity,
      });
    });
  }

  return nodes;
}

function buildConnections(nodes: WebNode[]): Connection[] {
  const connections: Connection[] = [];

  // Dense genre web connections
  const genreGroups: Record<string, number[]> = {};
  nodes.forEach((n, i) => {
    if (!genreGroups[n.genre]) genreGroups[n.genre] = [];
    genreGroups[n.genre].push(i);
  });

  Object.values(genreGroups).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
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
        if (!connections.some(c => c.from === a && c.to === b && c.type === "genre")) {
          connections.push({ from: a, to: b, type: "genre" });
        }
      }
    }
  });

  // Cross-genre web connections
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

// ─── Celestial body (sun/moon) ─────────────────────────────────
function CelestialBody({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 0.8) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  if (isDark) {
    // Moon
    return (
      <group position={[30, 25, -20]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshStandardMaterial color="#c4ccd8" emissive="#8899aa" emissiveIntensity={0.3} roughness={0.8} />
        </mesh>
        <mesh ref={glowRef}>
          <sphereGeometry args={[3.8, 32, 32]} />
          <meshBasicMaterial color="#8899bb" transparent opacity={0.08} />
        </mesh>
        <pointLight color="#8899cc" intensity={0.4} distance={80} />
      </group>
    );
  }

  // Sun
  return (
    <group position={[30, 25, -20]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.12} />
      </mesh>
      <pointLight color="#fbbf24" intensity={0.8} distance={100} />
    </group>
  );
}

// ─── Instanced Nodes ───────────────────────────────────────────
function InstancedNodes({
  nodes,
  hoveredIndex,
  onHover,
  onClick,
}: {
  nodes: WebNode[];
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
      if (node.watchStatus === "watching" || node.watchStatus === "reading") scale *= 1 + Math.sin(time * 3 + node.id) * 0.15;
      if (node.watchStatus === "plan_to_watch" || node.watchStatus === "plan_to_read") scale *= 0.6;
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
    <group onPointerMove={handlePointerMove} onClick={handleClick} onPointerLeave={() => onHover(null)}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// ─── Animated web lines ────────────────────────────────────────
function WebLines({ nodes, connections, hoveredNodeIndex }: { nodes: WebNode[]; connections: Connection[]; hoveredNodeIndex: number | null }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const progressRef = useRef(0);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  const { targetPositions, baseColors } = useMemo(() => {
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
      if (conn.type === "sequel") { c1.set("#f59e0b"); c2.set("#f59e0b"); }
      else if (conn.type === "related") { c1.set("#6366f1"); c2.set("#6366f1"); }
      else if (conn.type === "web") { c1.lerp(c2, 0.5).multiplyScalar(0.5); c2.copy(c1); }
      col[offset] = c1.r; col[offset + 1] = c1.g; col[offset + 2] = c1.b;
      col[offset + 3] = c2.r; col[offset + 4] = c2.g; col[offset + 5] = c2.b;
    });
    return { targetPositions: pos, baseColors: col };
  }, [nodes, connections]);

  const animPositions = useMemo(() => {
    const pos = new Float32Array(connections.length * 6);
    connections.forEach((conn, i) => {
      const from = nodes[conn.from];
      const offset = i * 6;
      pos[offset] = from.position.x; pos[offset + 1] = from.position.y; pos[offset + 2] = from.position.z;
      pos[offset + 3] = from.position.x; pos[offset + 4] = from.position.y; pos[offset + 5] = from.position.z;
    });
    return pos;
  }, [nodes, connections]);

  const connectedSet = useMemo(() => {
    if (hoveredNodeIndex === null) return null;
    const set = new Set<number>();
    connections.forEach((conn, i) => {
      if (conn.from === hoveredNodeIndex || conn.to === hoveredNodeIndex) set.add(i);
    });
    return set;
  }, [hoveredNodeIndex, connections]);

  useFrame((_, delta) => {
    const geom = lineRef.current?.geometry;
    if (!geom) return;
    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.4);
      const p = progressRef.current;
      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < connections.length; i++) {
        const stagger = i / connections.length * 0.6;
        const localP = Math.max(0, Math.min(1, (p - stagger) / 0.4));
        const eased = localP * localP * (3 - 2 * localP);
        const offset = i * 6;
        arr[offset + 3] = arr[offset] + (targetPositions[offset + 3] - targetPositions[offset]) * eased;
        arr[offset + 4] = arr[offset + 1] + (targetPositions[offset + 4] - targetPositions[offset + 1]) * eased;
        arr[offset + 5] = arr[offset + 2] + (targetPositions[offset + 5] - targetPositions[offset + 2]) * eased;
      }
      posAttr.needsUpdate = true;
      if (materialRef.current) materialRef.current.opacity = Math.min(0.35, p * 0.5);
    }
    const colAttr = geom.getAttribute("color") as THREE.BufferAttribute;
    const colArr = colAttr.array as Float32Array;
    if (connectedSet) {
      for (let i = 0; i < connections.length; i++) {
        const offset = i * 6;
        const mult = connectedSet.has(i) ? 1.8 : 0.15;
        for (let j = 0; j < 6; j++) colArr[offset + j] = baseColors[offset + j] * mult;
      }
      colAttr.needsUpdate = true;
      if (materialRef.current && progressRef.current >= 1) materialRef.current.opacity = 0.7;
    } else {
      for (let i = 0; i < colArr.length; i++) colArr[i] = baseColors[i];
      colAttr.needsUpdate = true;
      if (materialRef.current && progressRef.current >= 1) materialRef.current.opacity = 0.35;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[animPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[baseColors.slice(), 3]} />
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
          <span
            className="text-[10px] font-bold uppercase tracking-widest select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            style={{ color: label.color, textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)" }}
          >
            {label.name}
          </span>
        </Html>
      ))}
    </>
  );
}

// ─── Hover tooltip ─────────────────────────────────────────────
function NodeTooltip({ node }: { node: WebNode }) {
  const statusLabel: Record<string, string> = {
    watching: "🔵 Watching", completed: "✅ Completed", plan_to_watch: "📋 Plan to Watch",
    on_hold: "⏸ On Hold", dropped: "❌ Dropped", reading: "🔵 Reading", plan_to_read: "📋 Plan to Read",
  };

  return (
    <Html position={[node.position.x, node.position.y + node.size + 0.8, node.position.z]} center distanceFactor={20} style={{ pointerEvents: "none" }}>
      <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden min-w-[200px] max-w-[240px]">
        {node.imageUrl && (
          <div className="h-20 w-full overflow-hidden">
            <img src={node.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">{node.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
            {node.score && <span>★ {node.score.toFixed(1)}</span>}
            <span style={{ color: node.color }}>{node.genre}</span>
            {node.episodes && <span>{node.episodes} ep</span>}
            {node.chapters && <span>{node.chapters} ch</span>}
          </div>
          {node.watchStatus && <p className="text-xs mt-1" style={{ color: node.color }}>{statusLabel[node.watchStatus] || node.watchStatus}</p>}
          {node.userScore && node.userScore > 0 && <p className="text-xs text-muted-foreground">Your rating: {node.userScore}/10</p>}
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
function WebScene({ nodes, connections, onSelectNode, isDark }: { nodes: WebNode[]; connections: Connection[]; onSelectNode: (node: WebNode) => void; isDark: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleClick = useCallback((idx: number) => {
    if (nodes[idx]) onSelectNode(nodes[idx]);
  }, [nodes, onSelectNode]);

  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color={isDark ? "#8b5cf6" : "#d97706"} distance={60} />

      <CelestialBody isDark={isDark} />
      <WebLines nodes={nodes} connections={connections} hoveredNodeIndex={hoveredIndex} />
      <GenreLabels />
      <InstancedNodes nodes={nodes} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} onClick={handleClick} />

      {hoveredIndex !== null && nodes[hoveredIndex] && <NodeTooltip node={nodes[hoveredIndex]} />}

      <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.15} maxDistance={70} minDistance={5} enableDamping dampingFactor={0.05} />
      <IdleControl />
    </>
  );
}

// ─── Page component ────────────────────────────────────────────
export default function AnimeMapPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mode, setMode] = useState<MediaMode>("anime");
  const [selectedNode, setSelectedNode] = useState<WebNode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();

  const watchlistMap = useMemo(() => {
    const map = new Map<number, WatchlistItem>();
    watchlist?.forEach((item) => {
      if ((mode === "anime" && item.media_type === "anime") || (mode === "manga" && item.media_type === "manga")) {
        map.set(item.mal_id, item);
      }
    });
    return map;
  }, [watchlist, mode]);

  const watchlistIds = useMemo(() => Array.from(watchlistMap.keys()).slice(0, 500), [watchlistMap]);
  const hasWatchlist = watchlistIds.length > 0;

  // Anime data
  const { data: watchlistAnime, isLoading: batchAnimeLoading } = useQuery({
    queryKey: ["web-watchlist-anime", watchlistIds, language],
    queryFn: () => getAnimeBatchByIds(watchlistIds, language as any),
    enabled: mode === "anime" && hasWatchlist,
    staleTime: 1000 * 60 * 30,
  });

  const { data: popularAnime, isLoading: popularAnimeLoading } = useQuery({
    queryKey: ["web-popular-anime", language],
    queryFn: () => getTopAnime(1, 80, "bypopularity", language as any),
    enabled: mode === "anime" && !hasWatchlist,
    staleTime: 1000 * 60 * 30,
  });

  // Manga data
  const { data: watchlistManga, isLoading: batchMangaLoading } = useQuery({
    queryKey: ["web-watchlist-manga", watchlistIds, language],
    queryFn: () => getMangaBatchByIds(watchlistIds, language as any),
    enabled: mode === "manga" && hasWatchlist,
    staleTime: 1000 * 60 * 30,
  });

  const { data: popularManga, isLoading: popularMangaLoading } = useQuery({
    queryKey: ["web-popular-manga", language],
    queryFn: () => getTopManga(1, 80, undefined, "popularity", language as any),
    enabled: mode === "manga" && !hasWatchlist,
    staleTime: 1000 * 60 * 30,
  });

  const isLoading = watchlistLoading ||
    (mode === "anime" ? (hasWatchlist ? batchAnimeLoading : popularAnimeLoading) : (hasWatchlist ? batchMangaLoading : popularMangaLoading));

  const animeList = mode === "anime" ? (hasWatchlist ? (watchlistAnime || []) : (popularAnime || [])) : [];
  const mangaList = mode === "manga" ? (hasWatchlist ? (watchlistManga || []) : (popularManga || [])) : [];

  const { nodes, connections } = useMemo(() => {
    const n = buildNodes(animeList, mangaList, watchlistMap, mode);
    if (n.length === 0) return { nodes: [], connections: [] };
    const c = buildConnections(n);
    return { nodes: n, connections: c };
  }, [animeList, mangaList, watchlistMap, mode]);

  const handleSelectNode = useCallback((node: WebNode) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const bgColor = isDark ? "#0a0a14" : "#f0f1f5";

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: bgColor }}>
      <SEO title="Media Web — Your Universe — Bibue" description="Explore your anime & manga universe as an interactive 3D web." url="/map" />
      <CollapsibleNavbar />

      {/* Mode toggle */}
      <div className="absolute top-20 right-4 md:right-6 z-20 flex gap-1 p-1 rounded-full bg-popover/80 backdrop-blur-md border border-border/30">
        {(["anime", "manga"] as MediaMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
              mode === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "anime" ? "📺 Anime" : "📖 Manga"}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: bgColor }}>
          <div className="text-center space-y-4">
            <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <p className="text-muted-foreground text-sm">{hasWatchlist ? "Weaving your web..." : `Loading the ${mode} web...`}</p>
            <p className="text-muted-foreground/60 text-xs">{hasWatchlist ? `Connecting ${watchlistIds.length} titles` : "Discovering connections"}</p>
          </div>
        </div>
      )}

      {nodes.length > 0 && (
        <Canvas
          camera={{ position: [0, 15, 40], fov: 55 }}
          className="!absolute inset-0"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ background: bgColor }}
        >
          <WebScene nodes={nodes} connections={connections} onSelectNode={handleSelectNode} isDark={isDark} />
        </Canvas>
      )}

      {/* Title overlay */}
      <div className="absolute top-20 left-4 md:left-6 z-20 max-w-xs">
        <h1 className="text-xl md:text-3xl font-bold font-sacred text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {hasWatchlist ? "Your Web" : `${mode === "anime" ? "Anime" : "Manga"} Web`}
        </h1>
        <p className="text-xs md:text-sm mt-1 text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          {nodes.length} nodes • {connections.length} connections
        </p>
        {!hasWatchlist && !isLoading && (
          <div className="mt-3 bg-popover/70 backdrop-blur-sm border border-border/30 rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {user ? `Add ${mode} to your list to build your personal web ✨` : "Sign in and start tracking to create your universe 🌌"}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-4 md:left-6 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-popover/60 backdrop-blur-sm border-border/30 text-muted-foreground hover:text-foreground hover:bg-popover/80 h-9 w-9 rounded-full"
          onClick={() => setShowLegend(!showLegend)}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-6 right-4 md:right-6 z-20 bg-popover/90 backdrop-blur-xl border border-border/30 rounded-2xl p-4 max-w-[220px]">
          <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Genre Clusters</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(GENRE_COLORS).slice(0, 12).map(([genre, color]) => (
              <div key={genre} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-muted-foreground truncate">{genre}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 mt-3 pt-2 space-y-1">
            <p className="text-[10px] text-muted-foreground">★ Size = your rating</p>
            <p className="text-[10px] text-muted-foreground">🔵 Pulsing = in progress</p>
            <p className="text-[10px] text-muted-foreground">🕸 Lines = connections</p>
          </div>
          <div className="border-t border-border/30 mt-2 pt-2 space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-4 h-0.5 rounded" style={{ backgroundColor: "hsl(var(--muted-foreground))" }} />
              <span className="text-muted-foreground">Genre web</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      {!isLoading && nodes.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] text-center pointer-events-none text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          Drag to rotate • Scroll to zoom • Click a node to explore
        </div>
      )}

      {/* Detail modals */}
      {modalOpen && selectedNode && selectedNode.mediaType === "anime" && (
        <Suspense fallback={null}>
          <AnimeDetailModal animeId={selectedNode.id} open={modalOpen} onOpenChange={setModalOpen} />
        </Suspense>
      )}
      {modalOpen && selectedNode && selectedNode.mediaType === "manga" && (
        <Suspense fallback={null}>
          <MangaDetailModal mangaId={selectedNode.id} open={modalOpen} onOpenChange={setModalOpen} />
        </Suspense>
      )}
    </div>
  );
}
