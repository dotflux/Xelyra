import { useState, useEffect } from "react";
import axios from "axios";

interface GifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (url: string) => void;
  initialSearch?: string;
}

const GifModal = ({
  isOpen,
  onClose,
  onSelectGif,
  initialSearch = "",
}: GifModalProps) => {
  const [search, setSearch] = useState(initialSearch);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [tab, setTab] = useState<"categories" | "trending">("categories");

  useEffect(() => {
    if (!isOpen) return;
    setTab("categories");
    setSearch("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (search) return;
    setCategories([]);
    setTrending([]);
    axios
      .post("http://localhost:3000/home/api/tenorcategories")
      .then((res) => {
        if (res.data && res.data.tags) setCategories(res.data.tags);
      })
      .catch((err) => {
        if (axios.isAxiosError(err))
          console.log(err.response?.data || err.message);
      });
    axios
      .post("http://localhost:3000/home/api/tenortrending")
      .then((res) => {
        if (res.data && res.data.results) setTrending(res.data.results);
      })
      .catch((err) => {
        if (axios.isAxiosError(err))
          console.log(err.response?.data || err.message);
      });
  }, [isOpen, search]);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    const handler = setTimeout(() => {
      setLoading(true);
      axios
        .post("http://localhost:3000/home/api/tenorsearch", { query: search })
        .then((res) => {
          if (res.data && res.data.results) setResults(res.data.results);
        })
        .catch((err) => {
          if (axios.isAxiosError(err))
            console.log(err.response?.data || err.message);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
    >
      <div className="p-6 bg-[#23232a] rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-700">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors"
          onClick={onClose}
          style={{ zIndex: 10 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mb-2">
          <h2 className="text-white font-bold text-xl mb-2">Tenor GIFs</h2>
        </div>
        <div className="mb-4 mt-8">
          <input
            className="w-full px-3 py-2 rounded-lg bg-[#18191c] border border-[#3a3b3e] text-white focus:outline-none focus:border-indigo-500 mb-4"
            placeholder="Search Tenor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        {!search && tab === "categories" && (
          <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
            <div
              className="bg-[#18191c] text-white font-bold rounded-lg flex items-center justify-center h-20 cursor-pointer shadow hover:brightness-110 transition relative overflow-hidden"
              onClick={() => setTab("trending")}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
              Trending GIFs
            </div>
            {categories.slice(0, Math.max(0, categories.length)).map((cat) => (
              <div
                key={cat.searchterm}
                className="relative rounded-lg flex items-center justify-center h-20 cursor-pointer shadow hover:brightness-110 transition overflow-hidden"
                style={{
                  backgroundImage: cat.image ? `url(${cat.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#23232a",
                }}
                onClick={() => setSearch(cat.searchterm)}
              >
                <div className="absolute inset-0 bg-black/40" />
                <span className="relative z-10 text-white font-bold text-center drop-shadow-lg px-2">
                  {cat.searchterm}
                </span>
              </div>
            ))}
          </div>
        )}
        {!search && tab === "trending" && (
          <>
            <div className="flex items-center mb-2">
              <button
                onClick={() => setTab("categories")}
                className="text-white hover:text-indigo-400 p-1 mr-2 rounded-full bg-transparent hover:bg-[#23232a] transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="font-bold text-white">Trending GIFs</span>
            </div>
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto grid grid-cols-3 gap-3">
              {trending.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.media_formats.tinygif.url}
                  alt="GIF"
                  className="rounded-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onSelectGif(gif.itemurl)}
                />
              ))}
            </div>
          </>
        )}
        {search && (
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto grid grid-cols-3 gap-3">
            {loading && (
              <div className="col-span-3 text-center text-gray-400">
                Loading...
              </div>
            )}
            {!loading &&
              results.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.media_formats.tinygif.url}
                  alt="GIF"
                  className="rounded-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onSelectGif(gif.itemurl)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GifModal;
