import { Link } from "react-router";
import {
  Shield,
  Bot,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  Github,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-shield grid place-items-center shadow-elegant">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg">DiscourseGuard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#pipeline" className="text-muted-foreground hover:text-foreground">
              Pipeline
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#metrics" className="text-muted-foreground hover:text-foreground">
              Metrics
            </a>
            <a href="#stack" className="text-muted-foreground hover:text-foreground">
              Stack
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-md text-muted-foreground hover:bg-muted"
            >
              <Github className="w-4 h-4" />
            </a>
            <Button asChild size="sm" className="bg-gradient-primary shadow-elegant">
              <Link to="/dashboard">
                Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Final Year Project · Live on Railway
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]">
              Monitor suspicious discussions with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                machine learning
              </span>
              .
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              DiscourseGuard is an end-to-end MLOps hate speech detection system: three-layer Flask
              API, Discord moderation bot with graduated enforcement, and a professional admin
              dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
                <Link to="/dashboard">
                  Launch Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/api-tester">Try the API</Link>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: "88%", l: "Accuracy" },
                { k: "0.74", l: "Macro F1" },
                { k: "27.5K", l: "Training samples" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-3xl font-display font-bold text-primary">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20" />
            <div className="relative glass-panel rounded-3xl p-8 shadow-elegant">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-shield grid place-items-center">
                    <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Classification Response</div>
                    <div className="text-[10px] text-muted-foreground">POST /classify</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-success/15 text-success">
                  200 OK
                </span>
              </div>
              <pre className="mt-4 text-[11px] leading-relaxed font-mono text-foreground/80 overflow-x-auto">
                {`{
  "prediction": "Hate Speech",
  "label":      "Hate Speech Detected",
  "warning":    "high",
  "method":     "ml_model",
  "confidence": {
    "Normal":       0.05,
    "Offensive":    0.18,
    "Hate Speech":  0.77
  }
}`}
              </pre>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { l: "Layer 1", v: "Safe phrase", cls: "bg-success/15 text-success" },
                  { l: "Layer 2", v: "Keyword", cls: "bg-warning/20 text-warning-foreground" },
                  { l: "Layer 3", v: "ML Model", cls: "bg-primary/15 text-primary" },
                ].map((x) => (
                  <div key={x.l} className={`rounded-lg p-2 ${x.cls}`}>
                    <div className="font-mono opacity-70">{x.l}</div>
                    <div className="font-semibold">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">
              Decision pipeline
            </div>
            <h2 className="mt-3 text-4xl font-display font-bold">Three layers, one decision.</h2>
            <p className="mt-4 text-muted-foreground">
              Speed and interpretability from rules; generalization from the model. Every response
              tells moderators exactly why a message was flagged.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                i: Zap,
                t: "Safe-Phrase Override",
                d: 'Whitelist idioms like "kill it with fire" so context-preserving expressions never trigger false positives.',
                tag: "Layer 1",
              },
              {
                i: Layers,
                t: "Keyword Rule Layer",
                d: "Curated unambiguous hate-speech terms. Returns a matched_keyword field for moderator interpretability.",
                tag: "Layer 2",
              },
              {
                i: Cpu,
                t: "Logistic Regression + SMOTE",
                d: "TF-IDF (5K features) → LR trained with SMOTE oversampling. 88% accuracy, 0.74 Macro F1.",
                tag: "Layer 3",
              },
            ].map(({ i: Icon, t, d, tag }) => (
              <div key={t} className="glass-panel rounded-2xl p-6 shadow-card-soft">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-shield grid place-items-center">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 border-t border-border/60 bg-gradient-to-b from-transparent to-accent/20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                i: BarChart3,
                t: "Admin dashboard",
                d: "Review queue, filter by risk, override decisions, track user strikes, visualize risk distribution and detection-method breakdowns.",
              },
              {
                i: Bot,
                t: "Discord moderation bot",
                d: "Three-strike escalation: warn → 24h timeout → ban. High-risk messages deleted before anyone sees them, logged privately.",
              },
              {
                i: Shield,
                t: "Human-in-the-loop",
                d: "Every automatic action is auditable. Moderators can override, confirm, or reset user status at any time.",
              },
              {
                i: Cpu,
                t: "MLOps discipline",
                d: "TF-IDF fitted on train split only (no leakage), stopwords intentionally kept, Macro F1 optimized for the minority Hate Speech class.",
              },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="glass-panel rounded-2xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">
              Model evaluation
            </div>
            <h2 className="mt-3 text-4xl font-display font-bold">
              Chosen on Macro F1, not accuracy.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Accuracy is dominated by the majority "Normal" class. Macro F1 weighs the minority
              "Hate Speech" class equally — the metric that actually matters for moderation.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Naïve Bayes, Logistic Regression, Random Forest, SVM — all trained with and without SMOTE",
                "Logistic Regression + SMOTE (oversampling only) chosen as the final estimator",
                "TF-IDF fitted after train/test split to prevent leakage into the test set",
                "Stopword removal deliberately excluded — it stripped context needed to distinguish offensive vs hate",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-panel rounded-2xl p-8">
            <div className="text-sm font-semibold mb-4">Per-class metrics (held-out test)</div>
            <div className="space-y-4">
              {[
                { c: "Normal", p: 0.92, r: 0.94, f: 0.93 },
                { c: "Offensive", p: 0.85, r: 0.87, f: 0.86 },
                { c: "Hate Speech", p: 0.61, r: 0.56, f: 0.58 },
              ].map((r) => (
                <div key={r.c}>
                  <div className="flex justify-between text-xs font-medium">
                    <span>{r.c}</span>
                    <span className="font-mono text-muted-foreground">
                      P {r.p} · R {r.r} · F1 {r.f}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${r.f * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-display font-bold text-primary">88%</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Accuracy
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-primary">0.74</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Macro F1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="py-24 border-t border-border/60 bg-accent/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">
            Deployment
          </div>
          <h2 className="mt-3 text-4xl font-display font-bold max-w-2xl">
            From notebook to production.
          </h2>
          <div className="mt-10 grid md:grid-cols-4 gap-4 text-sm">
            {[
              {
                t: "Data",
                v: "27,510 labeled samples · Davidson 2017 + Reddit + HackerNews · 3 classes",
              },
              { t: "Model", v: "Preprocessing → TF-IDF (5K) → Logistic Regression + SMOTE" },
              { t: "Serving", v: "Flask REST API · three-layer pipeline · deployed on Railway" },
              {
                t: "Clients",
                v: "React admin dashboard + discord.py moderation bot with strike escalation",
              },
            ].map((x) => (
              <div key={x.t} className="glass-panel rounded-xl p-5">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                  {x.t}
                </div>
                <div className="mt-2 text-sm text-foreground/80 leading-relaxed">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
              <Link to="/dashboard">
                Open the moderation dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border/60 text-center text-xs text-muted-foreground">
        DiscourseGuard · ML Hate Speech Moderation · Final Year Project
      </footer>
    </div>
  );
}
