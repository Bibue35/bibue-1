import { useState, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime, Anime } from "@/lib/api";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AnimeDetailModal = lazy(() => import("@/components/AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));

// Genre color map
const GENRE_COLORS: Record<string, string> = {
  Action: "#ef4444",
  Romance: "#ec4899",
  Comedy: "#f59e0b",
  Drama: "#8b5cf6",
  Fantasy: "#6366f1",
  "Sci-Fi": "#06b6d4",
  Horror: "#dc2626",
  Mystery: "#6d28d9",
  "Slice of Life": "#22c55e",
  Adventure: "#f97316",
  Thriller: "#991b1b",
  Sports: "#0ea5e9",
  Supernatural: "#a855f7",
  Mecha: "#64748b",
  Psychological: "#7c3aed",
};

function getGenreCluster(genre: string): [number, number, number] {
  const clusters: Record<string, [number, number, number]> = {
    Action: [15, 5, 0],
    Romance: [-15, 10, 5],
    Comedy: [0, 15, -10],
    Drama: [-10, -5, 15],
    Fantasy: [10, -10, 10],
    "Sci-Fi": [-5, 15, -15],
    Horror: [15, -15, -5],
    Mystery: [-15, -10, -10],
    "Slice of Life": [5, 10, 15],
    Adventure: [10, 10, -5],
    Thriller: [15, 0, -15],
    Sports: [-10, 15, 0],
    Supernatural: [0, -15, 10],
    Mecha: [-15, 0, 15],
    Psychological: [5, -10, -15],
  };
  return clusters[genre] || [
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 30,
  ];
}

interface AnimeNode {
  anime: Anime;
  position: [number, number, number];
  color: string;
  size: number;
  brightness: number;
}

function buildNodes(animeList: Anime[]): AnimeNode[] {
  return animeList.map((anime, i) => {
    const primaryGenre = anime.genres?.[0]?.name || "Action";
    const cluster = getGenreCluster(primaryGenre);
    const spread = 8;
    const position: [number, number, number] = [
      cluster[0] + (Math.random() - 0.5) * spread,
      cluster[1] + (Math.random() - 0.5) * spread,
      cluster[2] + (Math.random() - 0.5) * spread,
    ];
    const popularity = anime.popularity || 1000;
    const size = Math.max(0.15, Math.min(0.6, Math.log10(popularity) / 5));
    const score = anime.score || 5;
    const brightness = Math.max(0.3, score / 10);
    const color = GENRE_COLORS[primaryGenre] || "#9ca3af";
    return { anime, position, color, size, brightness };
  });
}

// Individual star/node
function AnimeStarNode({
  node,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: {
  node: AnimeNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + node.position[0]) * 0.05;
      const scale = isHovered ? node.size * 1.8 : node.size * pulse;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const glowScale = isHovered ? node.size * 4 : node.size * 2.5;
      glowRef.current.scale.setScalar(glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isHovered ? 0.3 : 0.1;
    }
  });

  return (
    <group position={node.position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.1} />
      </mesh>
      {/* Core */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={() => onHover(false)}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isHovered ? 2 : node.brightness}
        />
      </mesh>
      {/* Tooltip */}
      {isHovered && (
        <Html center distanceFactor={25} style={{ pointerEvents: "none" }}>
          <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg min-w-[180px] max-w-[220px]">
            <p className="text-sm font-semibold text-foreground truncate">{node.anime.title}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {node.anime.score && <span>★ {node.anime.score.toFixed(1)}</span>}
              <span>{node.anime.genres?.[0]?.name}</span>
              {node.anime.episodes && <span>{node.anime.episodes} ep</span>}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection lines between related anime (same genre cluster)
function ConnectionLines({ nodes }: { nodes: AnimeNode[] }) {
  const lineData = useMemo(() => {
    const result: { from: [number, number, number]; to: [number, number, number]; color: string }[] = [];
    const genreGroups: Record<string, AnimeNode[]> = {};
    nodes.forEach((n) => {
      const genre = n.anime.genres?.[0]?.name || "Other";
      if (!genreGroups[genre]) genreGroups[genre] = [];
      genreGroups[genre].push(n);
    });
    Object.values(genreGroups).forEach((group) => {
      for (let i = 0; i < Math.min(group.length - 1, 5); i++) {
        result.push({
          from: group[i].position,
          to: group[i + 1].position,
          color: group[i].color,
        });
      }
    });
    return result;
  }, [nodes]);

  return (
    <>
      {lineData.map((line, i) => {
        const points = new Float32Array([
          line.from[0], line.from[1], line.from[2],
          line.to[0], line.to[1], line.to[2],
        ]);
        return (
          <lineSegments key={i}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[points, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={line.color} transparent opacity={0.08} />
          </lineSegments>
        );
      })}
    </>
  );
}

// Genre labels floating in space
function GenreLabels() {
  const labels = Object.entries(GENRE_COLORS).slice(0, 10).map(([name, color]) => ({
    name,
    color,
    position: getGenreCluster(name),
  }));

  return (
    <>
      {labels.map((label) => (
        <Html
          key={label.name}
          position={[label.position[0], label.position[1] + 6, label.position[2]]}
          center
          distanceFactor={40}
          style={{ pointerEvents: "none" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider opacity-40"
            style={{ color: label.color }}
          >
            {label.name}
          </span>
        </Html>
      ))}
    </>
  );
}

function Scene({
  nodes,
  onSelectAnime,
}: {
  nodes: AnimeNode[];
  onSelectAnime: (anime: Anime) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#6366f1" />
      <pointLight position={[20, 10, -10]} intensity={0.5} color="#f59e0b" />

      <Stars radius={80} depth={60} count={3000} factor={3} saturation={0.5} fade speed={0.5} />

      <ConnectionLines nodes={nodes} />
      <GenreLabels />

      {nodes.map((node, i) => (
        <AnimeStarNode
          key={node.anime.anilist_id}
          node={node}
          isHovered={hoveredIndex === i}
          isSelected={selectedIndex === i}
          onHover={(h) => setHoveredIndex(h ? i : null)}
          onClick={() => {
            setSelectedIndex(i);
            onSelectAnime(node.anime);
          }}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        maxDistance={60}
        minDistance={5}
      />
    </>
  );
}

export default function AnimeMapPage() {
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  const { data: animeList, isLoading } = useQuery({
    queryKey: ["anime-map-data"],
    queryFn: () => getTopAnime(1, 50),
    staleTime: 1000 * 60 * 30,
  });

  const nodes = useMemo(() => {
    if (!animeList) return [];
    return buildNodes(animeList);
  }, [animeList]);

  const handleSelectAnime = useCallback((anime: Anime) => {
    setSelectedAnime(anime);
    setModalOpen(true);
  }, []);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative">
      <SEO
        title="Anime Galaxy Map — Visual Discovery — Bibue"
        description="Explore anime in an interactive 3D galaxy. Each star is an anime, clustered by genre. Discover visually."
        url="/map"
      />
      <CollapsibleNavbar />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Building your galaxy...</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      {nodes.length > 0 && (
        <Canvas
          camera={{ position: [0, 10, 30], fov: 60 }}
          className="!absolute inset-0"
          gl={{ antialias: true, alpha: true }}
        >
          <Scene nodes={nodes} onSelectAnime={handleSelectAnime} />
        </Canvas>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm h-10 w-10 rounded-full"
          onClick={() => setShowLegend(!showLegend)}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-6 right-6 z-20 bg-popover/90 backdrop-blur-md border border-border rounded-2xl p-4 max-w-[200px]">
          <h3 className="text-sm font-bold mb-3">Genre Clusters</h3>
          <div className="space-y-1.5">
            {Object.entries(GENRE_COLORS).slice(0, 10).map(([genre, color]) => (
              <div key={genre} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-muted-foreground">{genre}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Size = popularity · Brightness = rating
          </p>
        </div>
      )}

      {/* Title overlay */}
      <div className="absolute top-20 left-6 z-20">
        <h1 className="text-2xl md:text-4xl font-bold font-sacred">
          Anime Galaxy
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {nodes.length} anime • Click a star to explore
        </p>
      </div>

      {/* Detail modal */}
      {modalOpen && selectedAnime && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={selectedAnime.anilist_id}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </div>
  );
}
