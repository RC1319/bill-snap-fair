import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Upload, FileText, Image, CheckCircle2, AlertCircle } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { validateReceiptFile } from "@/services/billService";
import { api } from "@/services/api";
import { cx } from "@/lib/format";

export default function UploadBillPage() {
  const navigate = useNavigate();
  const { startBill } = useSplitFlow();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(null);

  const STEPS = [
    { id: "uploaded", label: "Image uploaded", icon: CheckCircle2 },
    { id: "text", label: "Detecting text", icon: CheckCircle2 },
    { id: "items", label: "Extracting items", icon: CheckCircle2 },
    { id: "charges", label: "Identifying charges", icon: CheckCircle2 },
    { id: "review", label: "Preparing for review", icon: CheckCircle2 },
  ];

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      const validation = validateReceiptFile(file);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
      setProcessing(true);
      setStep(null);
      try {
        const result = await api.extractBill(file, { onStep: setStep });
        const url = URL.createObjectURL(file);
        startBill(result, url);
        navigate({ to: "/new/review" });
      } catch (e) {
        setError(e.message || "We couldn't read this bill.");
        setProcessing(false);
      }
    },
    [startBill, navigate]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Processing state
  if (processing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center rise">
          <div className="panel-card p-8 md:p-12">
            {/* Spinner */}
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-8" />

            <h2 className="text-xl font-bold text-foreground mb-2">
              Reading your bill...
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              AI is analyzing your receipt. Finding items, prices, taxes and
              charges.
            </p>

            {/* Steps */}
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {STEPS.map((s, i) => {
                const done = i <= stepIndex;
                const active = i === stepIndex + 1;
                return (
                  <div
                    key={s.id}
                    className={cx(
                      "flex items-center gap-3 text-sm transition-all duration-300",
                      done
                        ? "text-high"
                        : active
                        ? "text-foreground"
                        : "text-faint"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : active ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary animate-pulse shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-faint shrink-0" />
                    )}
                    <span className="font-medium">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Heading */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">
          Upload your bill
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Take a photo or upload an existing receipt. We'll extract the details
          for you.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={cx(
          "panel-card p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 rise border-2 border-dashed",
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Camera className="w-7 h-7 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">
          Drop your bill here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse
        </p>
        <p className="text-xs text-faint">JPG, PNG or PDF · Max 12 MB</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 rise" style={{ animationDelay: "120ms" }}>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Image className="w-4 h-4" />
          Choose File
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="panel-card p-4 border border-low/30 bg-low/5 flex items-start gap-3 rise">
          <AlertCircle className="w-5 h-5 text-low shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">{error}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setError(null);
                  fileRef.current?.click();
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Try Another Photo
              </button>
              <button
                onClick={() => navigate({ to: "/new/manual" })}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Enter Bill Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "200ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          For better results
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Keep the entire bill visible",
            "Avoid glare",
            "Use good lighting",
            "Keep the camera straight",
          ].map((tip) => (
            <p key={tip} className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-high shrink-0" />
              {tip}
            </p>
          ))}
        </div>
      </div>

      {/* Manual entry link */}
      <div className="text-center rise" style={{ animationDelay: "280ms" }}>
        <button
          onClick={() => navigate({ to: "/new/manual" })}
          className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          Enter bill manually instead
        </button>
      </div>
    </div>
  );
}
