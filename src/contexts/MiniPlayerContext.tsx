import { createContext, useContext, useState, ReactNode } from "react";

interface MiniPlayerState {
  isActive: boolean;
  animeId: number | null;
  animeTitle: string;
  animeTitleJapanese?: string;
  episodeNumber: number;
  totalEpisodes: number;
  thumbnail?: string;
  youtubeId?: string;
}

interface MiniPlayerContextType {
  miniPlayer: MiniPlayerState;
  activateMiniPlayer: (data: Omit<MiniPlayerState, "isActive">) => void;
  closeMiniPlayer: () => void;
  setEpisode: (episode: number) => void;
}

const defaultState: MiniPlayerState = {
  isActive: false,
  animeId: null,
  animeTitle: "",
  episodeNumber: 1,
  totalEpisodes: 1,
};

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export function MiniPlayerProvider({ children }: { children: ReactNode }) {
  const [miniPlayer, setMiniPlayer] = useState<MiniPlayerState>(defaultState);

  const activateMiniPlayer = (data: Omit<MiniPlayerState, "isActive">) => {
    setMiniPlayer({ ...data, isActive: true });
  };

  const closeMiniPlayer = () => {
    setMiniPlayer(defaultState);
  };

  const setEpisode = (episode: number) => {
    setMiniPlayer((prev) => ({ ...prev, episodeNumber: episode }));
  };

  return (
    <MiniPlayerContext.Provider value={{ miniPlayer, activateMiniPlayer, closeMiniPlayer, setEpisode }}>
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error("useMiniPlayer must be used within a MiniPlayerProvider");
  }
  return context;
}
