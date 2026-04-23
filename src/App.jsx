import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SongCard from "./components/SongCard";
import VideoPlayer from "./components/VideoPlayer";

// --- HELPERS ---
function uniqSorted(values) {
  return Array.from(
    new Set(values.map((v) => (v ?? "").toString().trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

function includesInsensitive(haystack, needle) {
  if (!needle) return true;
  return (haystack ?? "").toString().toLowerCase().includes(needle.toLowerCase());
}

// --- HIGH-LIGHT SKELETON ---
function SongCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden p-3">
      <div className="flex gap-4">
        <div className="h-20 w-32 shrink-0 rounded-xl bg-gradient-to-r from-white/5 via-sky-500/10 to-white/5 animate-pulse" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
          <div className="h-2 w-1/2 rounded bg-white/5 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-sky-500/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [songs, setSongs] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("All");
  const [genre, setGenre] = useState("All");

  const API_URL = "https://song-api-sw4i.onrender.com/luriz/songs";

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setSongs(data);
      if (!currentVideo && data?.[0]?.url) setCurrentVideo(data[0].url);
    } catch (err) {
      setError("Failed to sync with library.");
    } finally {
      setLoading(false);
    }
  };

  const artists = useMemo(() => ["All", ...uniqSorted(songs.map((s) => s.artist))], [songs]);
  const genres = useMemo(() => ["All", ...uniqSorted(songs.map((s) => s.genre))], [songs]);

  const filteredSongs = useMemo(() => {
    const q = query.trim();
    return songs.filter((s) => {
      const matchesArtist = artist === "All" || s.artist === artist;
      const matchesGenre = genre === "All" || s.genre === genre;
      const matchesQuery = !q || 
        includesInsensitive(s.title, q) || 
        includesInsensitive(s.artist, q) || 
        includesInsensitive(s.album, q);
      return matchesArtist && matchesGenre && matchesQuery;
    });
  }, [songs, query, artist, genre]);

  const currentSong = useMemo(() => {
    return songs.find((s) => s.url === currentVideo) || null;
  }, [songs, currentVideo]);

  const clearFilters = () => {
    setQuery("");
    setArtist("All");
    setGenre("All");
  };

  return (
    <div className="min-h-screen bg-[#020202] bg-gradient-to-tr from-[#020202] via-[#081121] to-[#020202] text-slate-200 font-sans selection:bg-sky-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#020202]/70 backdrop-blur-2xl">
        <div className="flex w-full items-center gap-4 px-8 py-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative h-10 w-10 rounded-xl bg-slate-900 border border-white/10 grid place-items-center shadow-lg">
                <span className="text-sky-400 text-lg drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">▶</span>
              </div>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-lg font-black tracking-tighter text-white">SONGPLAYER</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400/80 font-bold">Studio Edition</div>
            </div>
          </div>

          {/* WORLD-CLASS SEARCH BAR */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-[620px] group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-[2px] transition-opacity duration-500" />
              
              <div className="relative flex items-center w-full rounded-[15px] bg-white/[0.03] border border-white/10 px-4 py-2.5 shadow-2xl group-focus-within:bg-[#050505] transition-all duration-300">
                <div className="flex items-center justify-center mr-3 text-white/20 group-focus-within:text-sky-400 transition-colors">
                  <svg className="w-5 h-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for tracks, artists, or mood..."
                  className="w-full bg-transparent text-[15px] font-medium outline-none text-white placeholder:text-white/20"
                />
                <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 ml-2">
                  <span className="text-[10px] text-white/40 font-bold">⌘</span>
                  <span className="text-[10px] text-white/40 font-bold">K</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="ml-auto flex items-center gap-6">
            <button onClick={fetchSongs} className="p-2.5 rounded-full hover:bg-white/5 transition-all text-slate-400 hover:text-sky-400 active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-0.5 shadow-xl">
               <div className="h-full w-full rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 text-xs font-black">EX</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:block border-r border-white/[0.05] bg-black/20 backdrop-blur-sm">
          <div className="sticky top-[77px] h-[calc(100vh-77px)] p-6 flex flex-col">
            <nav className="space-y-1 mb-10">
              {[
                { label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { label: "Trending", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                { label: "Library", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
              ].map((item, idx) => (
                <button key={item.label} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${idx === 0 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Smart Filters</div>
              
              <div className="space-y-5 px-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 ml-2">Artist</label>
                  <select value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500/40 hover:bg-white/[0.05] transition-all appearance-none cursor-pointer">
                    {artists.map((a) => <option key={a} value={a} className="bg-[#020202]">{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 ml-2">Genre</label>
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500/40 hover:bg-white/[0.05] transition-all appearance-none cursor-pointer">
                    {genres.map((g) => <option key={g} value={g} className="bg-[#020202]">{g}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={clearFilters} className="w-full mt-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white transition-all">
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="px-8 py-10">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-12">
            
            {/* STAGE AREA */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] border border-white/10 bg-black">
                <VideoPlayer videoUrl={currentVideo} />
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest border border-sky-500/20">Now Playing</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">
                    {currentSong?.title || "Ready to Play"}
                  </h1>
                  <div className="flex items-center gap-4 text-lg font-medium text-slate-400">
                    <span className="hover:text-sky-300 transition-colors cursor-pointer">{currentSong?.artist}</span>
                    {currentSong?.album && <><span className="h-1.5 w-1.5 rounded-full bg-slate-800" /><span>{currentSong.album}</span></>}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-2 rounded-[2rem] backdrop-blur-md">
                  <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all shadow-xl">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3v11z"/></svg>
                    Like
                  </button>
                  <button className="p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-8 backdrop-blur-md shadow-inner">
                <h3 className="font-black text-xs text-sky-400 uppercase tracking-[0.2em] mb-4">Description</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl font-medium">
                  Immerse yourself in high-fidelity sound. Use the smart search bar to find artists or mood-based tracks instantly.
                </p>
              </div>
            </section>

            {/* QUEUE SECTION */}
            <aside className="space-y-8 flex flex-col h-full">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black tracking-tight text-white">Audio Feed</h2>
                  <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  {filteredSongs.length} TRACKS
                </span>
              </div>

              <div className="space-y-4 max-h-[850px] overflow-y-auto pr-3 custom-scrollbar-minimal pb-20">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SongCardSkeleton key={i} />)
                ) : filteredSongs.length === 0 ? (
                  <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                    <p className="text-slate-600 text-xs font-black uppercase tracking-widest">No Signal Found</p>
                  </div>
                ) : (
                  filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onPlay={setCurrentVideo}
                      isActive={song.url === currentVideo}
                    />
                  ))
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}