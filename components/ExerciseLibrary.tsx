import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, X, Youtube, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { searchExerciseVideos, YouTubeVideo } from '../services/youtubeService';

interface ExerciseLibraryProps {
  className?: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ className }) => {
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [alternativeVideos, setAlternativeVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  // Initial popular exercises
  const initialExercises = ['Pushups', 'Squats', 'Burpees', 'Pullups', 'Lunges', 'Plank'];

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    const videos = await searchExerciseVideos(search);
    if (videos && videos.length > 0) {
      const mainVideo = videos[0];
      const alternatives = videos.slice(1);
      
      setResults(prev => {
        const unique = [...prev];
        if (!unique.find(v => v.id === mainVideo.id)) {
          unique.unshift(mainVideo);
        }
        return unique;
      });
      
      setSelectedVideo(mainVideo);
      setAlternativeVideos(alternatives);
    } else {
      setError("NO VIDEOS FOUND FOR THIS EXERCISE");
    }
    setLoading(false);
  };

  const tryNextVideo = () => {
    if (alternativeVideos.length > 0) {
      const next = alternativeVideos[0];
      const remaining = alternativeVideos.slice(1);
      setSelectedVideo(next);
      setAlternativeVideos(remaining);
      setError(null);
    } else {
      setError("NO MORE VIDEOS AVAILABLE");
    }
  };

  const onPlayerError = (event: any) => {
    // 100: Video requested not found, deleted, or private
    // 101/150: Video owner does not allow it to be played in embedded players
    // 2: The request contains an invalid parameter value
    // 5: The requested content cannot be played in an HTML5 player
    if ([2, 5, 100, 101, 150].includes(event.data)) {
      setError(`VIDEO UNAVAILABLE (Error ${event.data}). SEARCHING FOR ALTERNATIVE...`);
      // Use a slightly longer delay to ensure the user sees the message
      setTimeout(() => tryNextVideo(), 3000);
    }
  };

  useEffect(() => {
    if (selectedVideo && window.YT && window.YT.Player) {
      const initPlayer = () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: selectedVideo.id,
          events: {
            'onError': onPlayerError
          }
        });
      };

      // Small delay to ensure the div is in the DOM
      const timer = setTimeout(initPlayer, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedVideo]);

  return (
    <div className={cn('p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-600/20 text-red-500">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              EXERCISE LIBRARY
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              LEARN FROM THE MASTERS
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
        <input
          type="text"
          placeholder="Search exercise (e.g. Pushups, Squats...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all duration-300 shadow-inner"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          </div>
        )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.length === 0 && !loading && (
          <div className="col-span-full space-y-6">
            <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest opacity-30">SEARCH FOR AN EXERCISE TO BEGIN</p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-center">POPULAR SEARCHES</p>
              <div className="flex flex-wrap justify-center gap-2">
                {initialExercises.map(ex => (
                  <button
                    key={ex}
                    onClick={() => { setSearch(ex); handleSearch({ preventDefault: () => {} } as any); }}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600/20 hover:border-red-500/30 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {results.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedVideo(video);
              setAlternativeVideos([]); // Reset alternatives on manual selection
              setError(null);
            }}
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-red-600/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight mb-1 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  {video.channel}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] border border-white/10"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {alternativeVideos.length > 0 && (
                  <button
                    onClick={tryNextVideo}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-[10px] font-bold uppercase tracking-widest border border-white/10"
                  >
                    Next Video
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="aspect-video w-full relative">
                <div id="youtube-player" className="w-full h-full" />
                {error && error.includes("SEARCHING") && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{error}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-lg font-black uppercase tracking-tight mb-1">{selectedVideo.title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50">{selectedVideo.channel}</p>
                
                {error && !error.includes("SEARCHING") && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                    </div>
                    <button
                      onClick={(e) => { setSearch(search); handleSearch(e as any); }}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      RETRY SEARCH
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
