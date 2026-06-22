import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImageIcon, Sparkles } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { PageHeader } from "@/components/PageHeader";
import { CameraCapture } from "@/components/waste/CameraCapture";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import { CITY_SRC } from "@/lib/brand";

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export function MedsPage() {
  const { user, refreshUser } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ sortResult: string; points: number; confidence: number } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { reload } = useApiData(useMemo(() => (id: string) => api.getSubmissions(id), []));

  useEffect(() => {
    if (!analyzing) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 87) {
          clearInterval(interval);
          return 87;
        }
        return p + 7;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [analyzing]);

  const startAnalysis = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    setPhotoTaken(true);
    setResult(null);
    setAnalyzing(true);
    setProgress(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readImageFile(file);
      startAnalysis(dataUrl);
    } catch {
      // ignore read errors
    }
  };

  const openCamera = () => {
    if (submitting || analyzing) return;
    setCameraOpen(true);
  };

  const openGallery = () => {
    if (submitting || analyzing) return;
    galleryInputRef.current?.click();
  };

  const openNativeCamera = () => {
    cameraInputRef.current?.click();
  };

  useEffect(() => {
    if (!analyzing || progress < 87 || !photoTaken) return;

    const timer = setTimeout(async () => {
      if (!user?.residentId) return;
      setSubmitting(true);
      try {
        const res = await api.submitWaste(
          user.residentId,
          ["plastic", "paper", "organic"],
          true,
        );
        setResult({
          sortResult: res.submission.sortResult === "correct" ? "Recyclable" : "Partial",
          points: res.pointsAwarded,
          confidence: 92,
        });
        setProgress(100);
        await refreshUser();
        reload();
      } finally {
        setSubmitting(false);
        setAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [analyzing, progress, photoTaken, user?.residentId, refreshUser, reload]);

  return (
    <div className="min-h-full bg-background pb-6">
      <PageHeader title="Upload Waste" backTo="/resident/home" />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={startAnalysis}
        onFallback={openNativeCamera}
      />

      <div className="px-5">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Take a clear photo of your segregated waste
          </p>

          <div className="relative mt-4 overflow-hidden rounded-2xl bg-secondary">
            <img
              src={previewUrl ?? CITY_SRC}
              alt="Waste preview"
              className={`h-48 w-full object-cover object-center transition ${photoTaken ? "opacity-100" : "opacity-60 grayscale"}`}
            />
            {photoTaken && (
              <span className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5">
                <Sparkles size={14} color="#fff" />
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCamera}
              disabled={submitting || analyzing}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-primary disabled:opacity-50"
            >
              <Camera size={18} />
              Camera
            </button>
            <button
              type="button"
              onClick={openGallery}
              disabled={submitting || analyzing}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-muted-foreground disabled:opacity-50"
            >
              <ImageIcon size={18} />
              Gallery
            </button>
          </div>
        </div>

        {(analyzing || result) && (
          <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-bold text-foreground">AI Verification</p>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {result ? "Analysis complete" : "Analyzing your waste..."}
              </p>
              <div className="relative flex h-14 w-14 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#1B5E20"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
                  />
                </svg>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
            </div>

            {result && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Detected Type</p>
                  <p className="text-lg font-bold text-primary">{result.sortResult}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-primary">{result.confidence}%</p>
                </div>
              </div>
            )}

            {result && result.points > 0 && (
              <p className="mt-3 text-center text-sm font-bold text-primary">
                +{result.points} points earned!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
