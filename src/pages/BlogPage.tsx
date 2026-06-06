import { useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Bot,
  FileText,
  PlayCircle,
  Search,
  Send,
  Video,
  X,
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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const videoId =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.replace("/", "")
        : parsed.searchParams.get("v");

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
}

const BLOG_ITEMS: BlogItem[] = [
  {
    id: "p1",
    title: "Balancing the Basket: An Ethiopian Approach to Reimagining Diabetes Management",
    type: "post",
    category: "Nutrition & Lifestyle Innovation",
    summary:
      "When managing conditions like Type 2 diabetes or hypertension, patients often assume they must abandon culinary heritage for expensive imported meal plans. Local experts recommend using traditional whole grains like pure Teff, prioritizing high-fiber local greens, and pairing meals with pulses to stabilize blood sugar and support cardiovascular health.",
    duration: "4 min read",
    views: "1.2k",
    tags: ["Diabetes", "Teff", "Nutrition"],
    tips: [
      "Prioritize Pure Grains: Use 100% whole-grain Teff for injera instead of refined blends.",
      "The Fifty Percent Rule: Fill half your plate with high-fiber local greens before adding carbs.",
      "Leverage Plant Proteins: Pair meals with Misir (lentils) or Kik (split peas) for balanced release.",
    ],
  },
  {
    id: "p2",
    title: "Beyond the 'High-Achiever' Grind: Recognizing Burnout in Modern Urban Life",
    type: "post",
    category: "Mental Wellness & Stress Management",
    summary:
      "Chronic exhaustion is often mislabeled as dedication. Burnout is a systemic physiological collapse manifesting as brain fog, disrupted sleep, irritability, and weakened immunity. Track small behavioral shifts and introduce simple habits to protect mental clarity and resilience.",
    duration: "3 min read",
    views: "980",
    tags: ["Burnout", "Stress", "Mental Wellness"],
    tips: [
      "Digital Sunset: Disconnect from work chats and social media at least one hour before bed.",
      "Micro-Breaks: Take five-minute deep-breathing breaks between intensive tasks.",
      "Community Connection: Join local peer support or wellness spaces to reduce isolation.",
    ],
  },
  {
    id: "p3",
    title: "Culturally Rooted Recovery: Why True Wellness Requires a Community Ecosystem",
    type: "post",
    category: "Personal Wellness & Lifestyle Intelligence",
    summary:
      "Modern health tracking focuses on individual metrics, but human vitality historically thrived within community frameworks. Integrating modern tools with localized, community-driven experiences creates sustainable ecosystems for long-term recovery and wellbeing.",
    duration: "4 min read",
    views: "1.0k",
    tags: ["Community", "Recovery", "Wellness"],
    tips: [
      "Explore Local Spaces: Join neighborhood fitness groups, running clubs, or wellness retreats.",
      "Support Local Wellness Providers: Work with independent practitioners who understand local lifestyles.",
      "Listen to Constraints: Cross-reference active recovery with your physical profile and adapt accordingly.",
    ],
  },
  {
    id: "b0b",
    title: "Intermittent fasting: who should avoid it",
    type: "video",
    category: "Health Talk",
    summary:
      "Intermittent fasting has been practiced for a long time, but it is not for everyone.",
    duration: "4 min",
    views: "6.7k",
    tags: ["Fasting", "Nutrition", "Safety"],
    videoUrl: "https://youtu.be/AWKQNcHU2r4",
    tips: [
      "Intermittent fasting is not new; it has been practiced religiously and culturally for a long time.",
      "Some people use it for weight management or chronic conditions.",
      "Avoid intermittent fasting if you are under 18, pregnant, breastfeeding, or have certain medical problems.",
    ],
  },
  {
    id: "b0a",
    title: "Healthy food management",
    type: "video",
    category: "Ermiyas Amelga",
    summary:
      "A practical talk about discipline, awareness, and consistency in healthy food management.",
    duration: "5 min",
    views: "8.9k",
    tags: ["Nutrition", "Lifestyle", "Health"],
    videoUrl: "https://youtu.be/r2L7iSHzESk",
    tips: [
      "Healthy food management is about taking control of your daily choices.",
      "Food habits affect your energy, productivity, and long-term success.",
      "Build a balanced lifestyle with discipline and consistency.",
    ],
  },
  {
    id: "b0",
    title: "Where do you live? — In my body",
    type: "video",
    category: "Doctor Selam Aklilu",
    summary:
      "Many answer with a city, village, or country, but the first residence is the body: the correct answer is in my body.",
    duration: "4 min",
    views: "7.8k",
    tags: ["Wellness", "Mindset", "Doctor Selam"],
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tips: [
      "Many people answer with a city, village, or country, but the deeper answer is the body.",
      "Correct answer: in my body.",
      "Listen to Doctor Selam's brilliant description of wellness.",
    ],
  },
  {
    id: "b5",
    title: "Healthy spine structure and daily back care",
    type: "video",
    category: "Doctor Selam Aklilu",
    summary:
      "Listen to this message from Dr Selam Aklilu on keeping a healthy spine structure and daily practices for a healthy back.",
    duration: "4 min",
    views: "6.4k",
    tags: ["Spine", "Back Care", "Doctor Selam"],
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tips: [
      "Keep good posture when sitting, walking, and using your phone.",
      "Move gently every day to support your spine and back muscles.",
      "If pain lasts or worsens, get proper medical advice.",
    ],
  },
  {
    id: "b6",
    title: "Avoid inaccurate medical assumptions",
    type: "video",
    category: "Doctor Selam Aklilu",
    summary:
      "Advice from Dr Selam Aklilu on avoiding inaccurate medical assumptions and doing proper research before conclusions.",
    duration: "3 min",
    views: "5.1k",
    tags: ["Medical Facts", "Research", "Doctor Selam"],
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tips: [
      "Do not guess a diagnosis from a few symptoms alone.",
      "Check reliable sources and ask trained professionals.",
      "Proper research helps prevent dangerous misinformation.",
    ],
  },
];

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? "gemini-1.5-flash";

// If the configured model doesn't support generateContent for the current API
// version, attempt to list available models and pick one that does, then retry.
async function pickSupportedModel(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (!res.ok) return null;
    const body = await res.json();
    const models: Array<any> = body?.models ?? [];
    for (const m of models) {
      const methods: string[] = m.supportedMethods ?? [];
      if (methods.includes("generateContent") || methods.includes("generate")) return m.name || m.model || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function askGemini(params: {
  apiKey: string;
  prompt: string;
  context: string;
  history: ChatMessage[];
}): Promise<string> {
  let modelToUse = import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_MODEL ?? GEMINI_MODEL : GEMINI_MODEL;

  const makeRequest = async (model: string) => {
    const path = model.includes("/") ? `${model}:generateContent` : `models/${model}:generateContent`;
    return fetch(`https://generativelanguage.googleapis.com/v1/${path}?key=${params.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `You are a friendly patient education assistant for a medical blog page. Use simple language, keep answers short and useful, and never claim to replace a doctor. If the user mentions urgent symptoms, advise emergency care immediately. Use the supplied blog context when relevant.\n\nBlog context:\n${params.context}`,
            },
          ],
        },
        contents: [
          ...params.history.map((message) => ({ role: message.role, parts: [{ text: message.content }] })),
          { role: "user", parts: [{ text: params.prompt }] },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
      }),
    });
  };

  let response = await makeRequest(modelToUse);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.error?.message ?? JSON.stringify(body);
    if (typeof message === "string" && /supported|not found|does not support|is not found|not allowed/i.test(message)) {
      const fallback = await pickSupportedModel(params.apiKey);
      if (fallback) {
        modelToUse = fallback;
        response = await makeRequest(modelToUse);
      }
    }
    if (!response.ok) {
      const body2 = await response.json().catch(() => ({}));
      const msg2 = body2?.error?.message ?? JSON.stringify(body2);
      throw new Error(typeof msg2 === "string" ? msg2 : "Gemini request failed");
    }
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export function BlogPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "video" | "post">("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me about the blog videos, medication routines, caregiver tips, or how to understand a post.",
    },
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_ITEMS.filter((item) => {
      if (tab !== "all" && item.type !== tab) return false;
      if (!q) return true;
      const text = `${item.title} ${item.category} ${item.summary}`.toLowerCase();
      return text.includes(q);
    });
  }, [query, tab]);

  const blogContext = useMemo(
    () =>
      BLOG_ITEMS.map(
        (item) => `${item.title} (${item.type}) - ${item.summary}. Tags: ${item.tags.join(", ")}. Tips: ${item.tips.join(" | ")}`,
      ).join("\n"),
    [],
  );

  const toggleSave = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]));
  };

  const sendChat = async () => {
    const prompt = chatInput.trim();
    if (!prompt || chatLoading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      setChatError("Add VITE_GEMINI_API_KEY in your .env file to enable Gemini chat.");
      return;
    }

    setChatError(null);
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setChatInput("");

    try {
      const reply = await askGemini({ apiKey, prompt, context: blogContext, history: chatMessages.slice(-6) });
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Gemini chat is unavailable right now.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="px-5 pb-7 pt-5">
      <div className="rounded-2xl px-4 py-4" style={{ background: "linear-gradient(160deg, #1D6FE8 0%, #0FB8C3 100%)" }}>
        <div className="flex items-center gap-2">
          <BookOpen size={18} color="#fff" />
          <h1 className="text-xl font-bold text-white">{t("blogTitle")}</h1>
        </div>
        <p className="mt-1 text-xs text-white/85">{t("blogSubtitle")}</p>
        <div className="mt-3 flex gap-2 text-[11px]">
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">{BLOG_ITEMS.filter((item) => item.type === "video").length} videos</span>
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">{BLOG_ITEMS.filter((item) => item.type === "post").length} posts</span>
          <span className="rounded-full bg-white/20 px-2 py-1 font-semibold text-white">{savedIds.length} saved</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2" style={{ border: "1px solid rgba(29,111,232,0.14)", background: "#fff" }}>
        <Search size={15} color="#5A7399" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("blogSearchPlaceholder")}
          aria-label={t("blogSearchPlaceholder")}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#0F1B35", background: "transparent" }}
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
            style={{ border: "1px solid rgba(29,111,232,0.16)", background: tab === item.id ? "#1D6FE8" : "#fff", color: tab === item.id ? "#fff" : "#1D6FE8" }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-white px-3 py-4 text-center text-xs text-[#5A7399]">{t("blogNoResults")}</p>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white px-3 py-3" style={{ borderColor: "rgba(29,111,232,0.12)" }}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.type === "video" ? <Video size={14} color="#1D6FE8" /> : <FileText size={14} color="#0FB8C3" />}
                  <span className="text-[11px] font-semibold text-[#5A7399]">{item.category}</span>
                </div>
                <button type="button" onClick={() => toggleSave(item.id)} className="rounded-md p-1" style={{ background: "#F4F8FF" }} aria-label="Save post">
                  {savedIds.includes(item.id) ? <BookmarkCheck size={14} color="#1D6FE8" /> : <Bookmark size={14} color="#5A7399" />}
                </button>
              </div>
              <div className="text-sm font-semibold text-[#0F1B35]">{item.title}</div>
              <p className="mt-1 text-xs text-[#5A7399]">{item.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#F4F8FF", color: "#5A7399" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#5A7399]">
                <span>{item.duration}</span>
                <span>{item.views} views</span>
              </div>

              <div className="mt-3 rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: "rgba(29,111,232,0.14)", background: "#F8FBFF", color: "#5A7399" }}>
                {item.summary}
              </div>

              {item.type === "video" && item.videoUrl && (
                <div className="mt-3 rounded-xl p-2" style={{ background: "#F4F8FF" }}>
                  {item.videoUrl.includes("youtu") ? (
                    <iframe
                      title={item.title}
                      className="aspect-video w-full rounded-lg"
                      src={getYouTubeEmbedUrl(item.videoUrl)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full rounded-lg" src={item.videoUrl} preload="metadata">
                      Your browser does not support HTML video.
                    </video>
                  )}
                </div>
              )}

              <button type="button" onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))} className="mt-3 w-full rounded-lg border py-2 text-xs font-bold" style={{ borderColor: "rgba(29,111,232,0.16)", color: "#1D6FE8" }}>
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

      <div className="fixed bottom-24 right-4 z-40">
        {!chatOpen ? (
          <button type="button" onClick={() => setChatOpen(true)} className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl" style={{ background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)" }} aria-label="Open AI chat">
            <Bot size={22} />
          </button>
        ) : null}

        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border bg-white shadow-2xl" style={{ borderColor: "rgba(29,111,232,0.12)" }}>
            <div className="flex items-start justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(29,111,232,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#F4F8FF" }}>
                  <Bot size={18} color="#1D6FE8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F1B35]">AI Chat Assistant</div>
                  <div className="text-[11px] text-[#5A7399]">Gemini help for blog questions</div>
                </div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="rounded-full px-2 py-1 text-xs font-bold text-[#1D6FE8]" style={{ background: "#F4F8FF" }} aria-label="Close AI chat">
                <X size={14} />
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto bg-[#F8FBFF] p-3">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-5 ${message.role === "user" ? "ml-auto bg-[#1D6FE8] text-white" : "bg-white text-[#0F1B35]"}`}
                  style={{ border: message.role === "assistant" ? "1px solid rgba(29,111,232,0.12)" : undefined }}
                >
                  {message.content}
                </div>
              ))}
              {chatLoading && <div className="max-w-[92%] rounded-2xl border border-dashed border-[#1D6FE8]/20 bg-white px-3 py-2 text-xs text-[#5A7399]">Thinking with Gemini...</div>}
            </div>

            {chatError && <p className="px-4 pt-2 text-xs text-[#C53030]">{chatError}</p>}

            <div className="flex gap-2 border-t p-3" style={{ borderColor: "rgba(29,111,232,0.08)" }}>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the AI..."
                rows={2}
                className="min-h-[52px] flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "rgba(29,111,232,0.16)" }}
              />
              <button type="button" onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-xl text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)" }} aria-label="Send AI chat message">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}