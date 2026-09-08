import { Link } from "@tanstack/react-router";
import {
  Camera,
  FileText,
  Search,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";

const STEPS = [
  { icon: Camera, label: "Receipt", desc: "Snap or upload" },
  { icon: Sparkles, label: "AI Extraction", desc: "Smart reading" },
  { icon: Search, label: "Review", desc: "Verify details" },
  { icon: Users, label: "Assign People", desc: "Who had what" },
  { icon: CheckCircle2, label: "Fair Split", desc: "Proportional math" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="rise" style={{ animationDelay: "0ms" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Bill Splitting
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.1] rise"
          style={{ animationDelay: "80ms" }}
        >
          Split bills without{" "}
          <span className="text-primary">the headache.</span>
        </h1>

        <p
          className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed rise"
          style={{ animationDelay: "160ms" }}
        >
          Snap a bill, assign what everyone had, and let SplitSnap calculate
          exactly what each person owes.
        </p>

        <div
          className="flex flex-wrap gap-3 mt-8 rise"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            to="/new/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Camera className="w-4 h-4" />
            Upload a Bill
          </Link>
          <Link
            to="/new/manual"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-semibold text-sm hover:bg-card/80 transition-all border border-border"
          >
            <FileText className="w-4 h-4" />
            Add Manually
          </Link>
        </div>
      </section>

      {/* Process pipeline */}
      <section className="px-6 pb-16">
        <div
          className="max-w-4xl mx-auto rise"
          style={{ animationDelay: "320ms" }}
        >
          <div className="panel-card p-6 md:p-8">
            <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              How it works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {step.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {step.desc}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-faint hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section
        className="px-6 pb-20 rise"
        style={{ animationDelay: "400ms" }}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4 text-primary" />
            Your bill. Your rules. A fair split.
          </div>
        </div>
      </section>
    </div>
  );
}
