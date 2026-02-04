import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CirclePlay,
  Film,
  MonitorPlay,
  Search,
  Star,
  Trash2,
  Tv,
} from "lucide-react";

const mockBranding = {
  brandPrimary: "#ff00ff",
  brandNav: "#00ffff",
  owner: "Kaytlin365 Studios",
};

const initialMedia = [
  {
    id: "neo-01",
    title: "Neon Hush",
    category: "Originals",
    description: "A neon-coded heist through spectral city grids.",
    tags: ["heist", "cyber", "noir"],
    duration: 3120,
    viewCount: 42050,
    avgWatchTime: 2675,
    isStar: true,
    sources: [
      { label: "1080p", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { label: "720p", url: "https://www.w3schools.com/html/movie.mp4" },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "neo-02",
    title: "Spectrum Drift",
    category: "Series",
    description: "Runners chart the bleed between realities.",
    tags: ["drama", "sci-fi", "mystery"],
    duration: 2800,
    viewCount: 31200,
    avgWatchTime: 2320,
    isStar: false,
    sources: [
      { label: "1080p", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { label: "720p", url: "https://www.w3schools.com/html/movie.mp4" },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "neo-03",
    title: "Glass Pulse",
    category: "Movies",
    description: "A glassmorphic dive into rogue AIs.",
    tags: ["thriller", "ai", "future"],
    duration: 3550,
    viewCount: 50900,
    avgWatchTime: 2980,
    isStar: false,
    sources: [
      { label: "1080p", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { label: "720p", url: "https://www.w3schools.com/html/movie.mp4" },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "neo-04",
    title: "Chromawave",
    category: "Movies",
    description: "Frequency wars bend time into neon ribbons.",
    tags: ["action", "sound", "future"],
    duration: 3300,
    viewCount: 28750,
    avgWatchTime: 2010,
    isStar: false,
    sources: [
      { label: "1080p", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { label: "720p", url: "https://www.w3schools.com/html/movie.mp4" },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1522120692537-84263b6d22c3?auto=format&fit=crop&w=800&q=80",
  },
];

const toastColors = {
  success: "border-neon-cyan text-neon-cyan",
  error: "border-neon-magenta text-neon-magenta",
  info: "border-white text-white",
};

const fuzzySearch = (query, item) => {
  const haystack = [
    item.title,
    item.category,
    item.description,
    ...(item.tags || []),
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(token));
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getStoredValue = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const setStoredValue = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage errors (quota, privacy mode, etc.).
  }
};

const safeRandomId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.round(Math.random() * 10000)}`;
};

const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const id = safeRandomId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  return { toasts, pushToast };
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("UI crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-deep-black px-6 text-white">
          <div className="max-w-lg space-y-3 rounded-3xl border border-neon-magenta/60 bg-black/70 p-6 text-center shadow-neon">
            <h1 className="text-2xl font-semibold">Spectrum Stream Offline</h1>
            <p className="text-sm text-white/70">
              The UI hit an unexpected error. Refresh the page or reset storage
              to recover.
            </p>
            <p className="text-xs text-white/50">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [mediaItems, setMediaItems] = useState(initialMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMedia, setActiveMedia] = useState(initialMedia[0]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [myList, setMyList] = useState(() => getStoredValue("my-list", []));
  const [history, setHistory] = useState(() =>
    getStoredValue("watch-history", {}),
  );
  const [branding, setBranding] = useState(mockBranding);
  const [assetHealth, setAssetHealth] = useState({});
  const [autoNext, setAutoNext] = useState(null);
  const [quality, setQuality] = useState(
    initialMedia[0].sources?.[0]?.label || "1080p",
  );
  const [ratings, setRatings] = useState(() =>
    getStoredValue("media-ratings", {}),
  );
  const [partyState, setPartyState] = useState({
    active: true,
    room: "neon-lounge",
    viewers: 8,
    host: "@kaytlin365",
  });
  const { toasts, pushToast } = useToasts();

  const user = { id: "demo-user", handle: "@kaytlin365" };
  const adminHandles = ["@kaytlin365", "@bennybean07"];
  const isAdmin = adminHandles.includes(user?.handle);
  const videoRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--brand-primary",
      branding.brandPrimary,
    );
    document.documentElement.style.setProperty(
      "--brand-nav",
      branding.brandNav,
    );
  }, [branding]);

  useEffect(() => {
    setStoredValue("my-list", myList);
  }, [myList]);

  useEffect(() => {
    setStoredValue("watch-history", history);
  }, [history]);

  useEffect(() => {
    setStoredValue("media-ratings", ratings);
  }, [ratings]);

  const heroMedia = mediaItems.find((item) => item.isStar) || mediaItems[0];

  const filteredMedia = useMemo(() => {
    if (!searchQuery) return mediaItems;
    return mediaItems.filter((item) => fuzzySearch(searchQuery, item));
  }, [mediaItems, searchQuery]);

  const updateStar = (id) => {
    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        isStar: item.id === id,
      })),
    );
    pushToast("success", "Hero banner updated.");
  };

  const toggleMyList = (item) => {
    if (!user) return;
    setMyList((prev) =>
      prev.some((saved) => saved.id === item.id)
        ? prev.filter((saved) => saved.id !== item.id)
        : [...prev, item],
    );
  };

  const saveWatchProgress = (item, position) => {
    if (!user) return;
    const percentComplete = Math.min(
      100,
      Math.round((position / item.duration) * 100),
    );
    setHistory((prev) => ({
      ...prev,
      [item.id]: {
        lastPosition: position,
        percentComplete,
      },
    }));
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    saveWatchProgress(activeMedia, videoRef.current.currentTime);
  };

  const handleVideoEnded = () => {
    const next = mediaItems.find(
      (item) => item.category === activeMedia.category && item.id !== activeMedia.id,
    );
    if (!next) return;
    setAutoNext({
      next,
      countdown: 8,
    });
  };

  useEffect(() => {
    if (!autoNext) return;
    if (autoNext.countdown === 0) {
      setActiveMedia(autoNext.next);
      setQuality(autoNext.next.sources?.[0]?.label || "1080p");
      setAutoNext(null);
      return;
    }
    const timer = setTimeout(() => {
      setAutoNext((prev) => ({
        ...prev,
        countdown: prev.countdown - 1,
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoNext]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    setMediaItems((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id)),
    );
    setSelectedIds([]);
    pushToast("success", "Selected assets deleted.");
  };

  const applyCategory = (category) => {
    if (!selectedIds.length) return;
    setMediaItems((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, category } : item,
      ),
    );
    setSelectedIds([]);
    pushToast("info", "Batch category update complete.");
  };

  const checkAssetHealth = async (item) => {
    if (!item.sources?.[0]?.url) return;
    try {
      const response = await fetch(item.sources[0].url, { method: "HEAD" });
      setAssetHealth((prev) => ({
        ...prev,
        [item.id]: response.ok,
      }));
    } catch (error) {
      setAssetHealth((prev) => ({
        ...prev,
        [item.id]: false,
      }));
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    if (!document?.pictureInPictureEnabled) {
      pushToast("error", "PiP is not supported in this browser.");
      return;
    }
    if (!document.pictureInPictureElement) {
      await videoRef.current.requestPictureInPicture();
    } else {
      await document.exitPictureInPicture();
    }
  };

  const updateRating = (itemId, nextRating) => {
    if (!user) return;
    setRatings((prev) => ({
      ...prev,
      [itemId]: nextRating,
    }));
    pushToast("success", "Star rating captured.");
  };

  const updatePartyStatus = () => {
    if (!user) return;
    setPartyState((prev) => ({
      ...prev,
      viewers: prev.viewers + 1,
      active: !prev.active,
    }));
  };

  const historyData = history[activeMedia.id];
  const activeSource =
    activeMedia.sources?.find((source) => source.label === quality) ||
    activeMedia.sources?.[0];

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-glass">
        <div className="flex items-center gap-3">
          <Film className="text-[var(--brand-primary)]" />
          <span className="text-lg font-semibold tracking-widest">
            {branding.owner}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/70">Spectrum-Stream</span>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs">
            {user.handle}
          </span>
        </div>
      </nav>

      <main className="px-4 pb-20 pt-8 md:px-10">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-neon"
          >
            <img
              src={heroMedia.thumbnail}
              alt={heroMedia.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.3em]">
                <Star className="h-4 w-4 text-[var(--brand-primary)]" />
                Trending Star
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                {heroMedia.title}
              </h1>
              <p className="max-w-xl text-white/70">{heroMedia.description}</p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-white/70">
                {heroMedia.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMedia(heroMedia)}
                  className="flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-black shadow-neon"
                >
                  <CirclePlay className="h-4 w-4" />
                  Watch Now
                </button>
                <button
                  type="button"
                  onClick={() => toggleMyList(heroMedia)}
                  className="rounded-full border border-[var(--brand-primary)] px-5 py-2 text-sm text-[var(--brand-primary)]"
                >
                  {myList.some((item) => item.id === heroMedia.id)
                    ? "Saved"
                    : "Save for Later"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-glass"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Global Search</h2>
              <Search className="h-4 w-4 text-[var(--brand-primary)]" />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search titles, tags, categories..."
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
            <div className="mt-6 space-y-4">
              {filteredMedia.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-[var(--brand-primary)]"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-14 w-20 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-white/60">{item.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-glass"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{activeMedia.title}</h2>
                <p className="text-sm text-white/60">
                  {activeMedia.category} • {formatTime(activeMedia.duration)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs"
                >
                  {activeMedia.sources.map((source) => (
                    <option key={source.label} value={source.label}>
                      {source.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={togglePiP}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs"
                >
                  PiP
                </button>
              </div>
            </div>
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10">
              <video
                ref={videoRef}
                key={activeSource?.url}
                src={activeSource?.url}
                controls
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="h-72 w-full bg-black object-cover md:h-96"
              />
              <AnimatePresence>
                {autoNext && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-6 right-6 rounded-2xl border border-white/20 bg-black/70 px-4 py-3 text-sm"
                  >
                    <p className="font-semibold">Up Next</p>
                    <p className="text-white/70">{autoNext.next.title}</p>
                    <p className="text-xs text-[var(--brand-primary)]">
                      Starting in {autoNext.countdown}s
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {historyData
                  ? `Continue at ${formatTime(historyData.lastPosition)}`
                  : "Start watching"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {historyData ? `${historyData.percentComplete}% complete` : "0%"}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-glass"
          >
            <h3 className="text-lg font-semibold">My List</h3>
            <div className="mt-4 space-y-3">
              {myList.length === 0 ? (
                <p className="text-sm text-white/60">
                  No saves yet. Tap "Save for Later" to build your lineup.
                </p>
              ) : (
                myList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMedia(item)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-left"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-12 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-white/60">{item.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </section>

        <section className="mt-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Spectrum Library</h2>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <MonitorPlay className="h-4 w-4 text-[var(--brand-primary)]" />
              {filteredMedia.length} results
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredMedia.map((item) => {
              const isSaved = myList.some((saved) => saved.id === item.id);
              const isSelected = selectedIds.includes(item.id);
              const rating = ratings[item.id] || 0;
              return (
                <motion.article
                  key={item.id}
                  layout
                  className={`group relative overflow-hidden rounded-3xl border ${
                    isSelected ? "border-[var(--brand-primary)]" : "border-white/10"
                  } bg-black/40 transition`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-44 w-full object-cover opacity-80 transition group-hover:opacity-100"
                  />
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        <p className="text-xs text-white/60">{item.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateStar(item.id)}
                        className="rounded-full border border-white/10 bg-black/50 p-2 text-[var(--brand-primary)]"
                      >
                        <Star
                          className={`h-4 w-4 ${item.isStar ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-white/70">{item.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase text-white/60">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className="rounded-full bg-white/10 px-3 py-1 text-white"
                      >
                        Play
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMyList(item)}
                        className="rounded-full border border-[var(--brand-primary)] px-3 py-1 text-[var(--brand-primary)]"
                      >
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{item.viewCount.toLocaleString()} views</span>
                      <span>{formatTime(item.avgWatchTime)} avg</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateRating(item.id, star)}
                            className={`rounded-full border px-2 py-1 text-[10px] ${
                              rating >= star
                                ? "border-neon-cyan text-neon-cyan"
                                : "border-white/20 text-white/60"
                            }`}
                          >
                            {star}★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>
                        Health:{" "}
                        <span
                          className={
                            assetHealth[item.id] === undefined
                              ? "text-white/50"
                              : assetHealth[item.id]
                                ? "text-neon-cyan"
                                : "text-neon-magenta"
                          }
                        >
                          {assetHealth[item.id] === undefined
                            ? "Unknown"
                            : assetHealth[item.id]
                              ? "Healthy"
                              : "404"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => checkAssetHealth(item)}
                        className="rounded-full border border-white/20 px-2 py-1"
                      >
                        Scan
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-glass"
          >
            <h2 className="text-xl font-semibold">Shared Watch Party</h2>
            <p className="mt-2 text-sm text-white/60">
              Real-time sync preview with Firestore listeners.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <span>Room</span>
                <span className="text-[var(--brand-primary)]">
                  #{partyState.room}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <span>Host</span>
                <span>{partyState.host}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <span>Viewers</span>
                <span>{partyState.viewers}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <span>Status</span>
                <span
                  className={
                    partyState.active ? "text-neon-cyan" : "text-neon-magenta"
                  }
                >
                  {partyState.active ? "Live" : "Paused"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={updatePartyStatus}
                className="rounded-full border border-neon-cyan px-4 py-2 text-xs text-neon-cyan"
              >
                Toggle Party Status
              </button>
              <button
                type="button"
                onClick={() => pushToast("info", "Invite link copied.")}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70"
              >
                Copy Invite Link
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-glass"
          >
            <h2 className="text-xl font-semibold">Studio Feedback</h2>
            <p className="mt-2 text-sm text-white/60">
              Aggregate ratings and reaction highlights.
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {mediaItems.map((item) => {
                const rating = ratings[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                  >
                    <span>{item.title}</span>
                    <span className="text-[var(--brand-primary)]">
                      {rating}/5 ★
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {isAdmin && (
          <section className="mt-14 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-glass">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Pro-Tier Admin</h2>
                <p className="text-sm text-white/60">
                  Batch actions, analytics, and asset health overview.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                <BadgeCheck className="h-4 w-4 text-neon-cyan" />
                Admin verified
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => applyCategory("Curated")}
                className="rounded-full border border-neon-cyan px-4 py-2 text-xs text-neon-cyan"
              >
                Move to Curated
              </button>
              <button
                type="button"
                onClick={deleteSelected}
                className="flex items-center gap-2 rounded-full border border-neon-magenta px-4 py-2 text-xs text-neon-magenta"
              >
                <Trash2 className="h-3 w-3" />
                Delete Selected
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{item.title}</span>
                    <Tv className="h-4 w-4 text-[var(--brand-primary)]" />
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Views: {item.viewCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/60">
                    Avg Watch: {formatTime(item.avgWatchTime)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`pointer-events-auto rounded-2xl border bg-black/70 px-4 py-3 text-sm backdrop-blur-glass ${
                toastColors[toast.type]
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { ErrorBoundary };
export default App;
