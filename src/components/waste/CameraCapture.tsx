import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onFallback: () => void;
}

export function CameraCapture({ open, onClose, onCapture, onFallback }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopStream();
      setError(null);
      return;
    }

    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        onFallback();
        onClose();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setReady(true);
      } catch {
        setError("Could not access camera. Try Gallery or allow camera permission.");
      }
    }

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, onClose, onFallback, stopStream]);

  const handleSnap = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
    stopStream();
    onClose();
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] mx-auto flex max-w-md flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-semibold">Take photo</p>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          aria-label="Close camera"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="h-full w-full object-cover"
        />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Starting camera...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-white/90">{error}</p>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onFallback();
              }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Pick from Gallery
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 px-4 py-6">
        <button
          type="button"
          onClick={handleClose}
          className="text-sm font-medium text-white/70"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSnap}
          disabled={!ready}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
          aria-label="Capture photo"
        >
          <Camera size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
}
