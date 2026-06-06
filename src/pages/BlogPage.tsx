import { useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  FileText,
  PlayCircle,
  Search,
  Video,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type BlogItem = {
  id: string;
  title: string;
  type: "video" | "post";
  category: string;
  summary: string;
  duration: string;
  views: string;
  tags: string[];
  videoUrl?: string;
  tips: string[];
};

const BLOG_ITEMS: BlogItem[] = [
  {
    id: "b1",
    title: "How to organize daily medication at home",
    type: "video",
    category: "Teaching Video",
    summary: "Simple routine for morning, noon, and evening medication safety.",
    duration: "4 min",
    views: "4.2k",
    tags: ["Medication", "Caregiver", "Routine"],
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    tips: [
      "Use one tray per day and label morning, noon, and night.",
      "Set backup alarms when caregiver is away.",
      "Mark doses immediately after taking medicine.",
    ],
  },
  {
    id: "b2",
    title: "What dosage instructions really mean",
    type: "post",
    category: "Blog Post",
    summary: "Understand dose, duration, and frequency from your prescription.",
    duration: "3 min read",
    views: "3.1k",
    tags: ["Prescription", "Dose", "Safety"],
    tips: [
      "OD means once daily, BD means twice daily.",
      "Finish full course even if symptoms improve.",
      "Contact provider if side effects are severe.",
    ],
  },
  {
    id: "b3",
    title: "Caregiver checklist for Alzheimer patients",
    type: "post",
    category: "Blog Post",
    summary: "A weekly support checklist for memory care and medication adherence.",
    duration: "5 min read",
    views: "2.4k",
    tags: ["Alzheimer", "Checklist", "Family"],
    tips: [
      "Track sleep, appetite, mood, and missed doses.",
      "Keep emergency contacts visible at home.",
      "Review medication changes each weekend.",
    ],
  },
  {
    id: "b4",
    title: "Using SOS safely in urgent situations",
    type: "video",
    category: "Teaching Video",
    summary: "When to trigger SOS and how your family gets notified quickly.",
    duration: "2 min",
    views: "5.8k",
    tags: ["SOS", "Emergency", "Family"],
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tips: [
      "Use SOS for urgent health risk, not routine reminders.",
      "Keep caregiver phone updated in your profile.",
      "After SOS, remain in safe visible location.",
    ],
  },
];

export function BlogPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "video" | "post">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_ITEMS.filter((item) => {
      if (tab !== "all" && item.type !== tab) return false;
      if (!q) return true;
      const text = `${item.title} ${item.category} ${item.summary}`.toLowerCase();
      return text.includes(q);
    });
  }, [query, tab]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id],
    );
  };

  return (
    <div className="px-5 pb-7 pt-5">
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: "linear-gradient(160deg, #1D6FE8 0%, #0FB8C3 100%)" }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} color="#fff" />
          <h1 className="text-xl font-bold text-white">{t("blogTitle")}</h1>
        </div>
        <p className="mt-1 text-xs text-white/85">{t("blogSubtitle")}</p>
        <div className="mt-3 flex gap-2 text-[11px]">
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">
            {BLOG_ITEMS.filter((item) => item.type === "video").length} videos
          </span>
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">
            {BLOG_ITEMS.filter((item) => item.type === "post").length} posts
          </span>
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">
            {savedIds.length} saved
          </span>
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ border: "1px solid rgba(29,111,232,0.14)", background: "#fff" }}
      >
        <Search size={15} color="#5A7399" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("blogSearchPlaceholder")}
          aria-label={t("blogSearchPlaceholder")}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#0F1B35",
            background: "transparent",
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { id: "all" as const, label: "All" },
          { id: "video" as const, label: "Videos" },
          { id: "post" as const, label: "Posts" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className="rounded-lg py-2 text-xs font-bold"
            style={{
              border: "1px solid rgba(29,111,232,0.16)",
              background: tab === item.id ? "#1D6FE8" : "#fff",
              color: tab === item.id ? "#fff" : "#1D6FE8",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-white px-3 py-4 text-center text-xs text-[#5A7399]">
            {t("blogNoResults")}
          </p>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border bg-white px-3 py-3"
              style={{ borderColor: "rgba(29,111,232,0.12)" }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.type === "video" ? (
                    <Video size={14} color="#1D6FE8" />
                  ) : (
                    <FileText size={14} color="#0FB8C3" />
                  )}
                  <span className="text-[11px] font-semibold text-[#5A7399]">{item.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSave(item.id)}
                  className="rounded-md p-1"
                  style={{ background: "#F4F8FF" }}
                  aria-label="Save post"
                >
                  {savedIds.includes(item.id) ? (
                    <BookmarkCheck size={14} color="#1D6FE8" />
                  ) : (
                    <Bookmark size={14} color="#5A7399" />
                  )}
                </button>
              </div>
              <div className="text-sm font-semibold text-[#0F1B35]">{item.title}</div>
              <p className="mt-1 text-xs text-[#5A7399]">{item.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "#F4F8FF", color: "#5A7399" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#5A7399]">
                <span>{item.duration}</span>
                <span>{item.views} views</span>
              </div>

              {item.type === "video" && item.videoUrl && (
                <div className="mt-3 rounded-xl p-2" style={{ background: "#F4F8FF" }}>
                  {playingId === item.id ? (
                    <video
                      controls
                      autoPlay
                      className="w-full rounded-lg"
                      src={item.videoUrl}
                      preload="metadata"
                    >
                      Your browser does not support HTML video.
                    </video>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayingId(item.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)" }}
                    >
                      <PlayCircle size={14} />
                      Run video here
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                className="mt-3 w-full rounded-lg border py-2 text-xs font-bold"
                style={{ borderColor: "rgba(29,111,232,0.16)", color: "#1D6FE8" }}
              >
                {expandedId === item.id ? "Hide quick tips" : "Show quick tips"}
              </button>

              {expandedId === item.id && (
                <ul className="mt-2 list-disc pl-5 text-xs text-[#5A7399]">
                  {item.tips.map((tip) => (
                    <li key={tip} className="mb-1">
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
