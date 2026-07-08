import { useState } from "react";
import { Bot, Send, Trash2, User as UserIcon, ShieldAlert, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import { classifyText } from "@/lib/api";
import { store, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";

interface ChatMsg {
  id: string;
  author: string;
  content: string;
  ts: number;
  deleted?: boolean;
  botAction?: { type: "warn" | "delete" | "timeout" | "ban" | "log"; reason: string; risk: string };
}

const SEED_USERS = ["troll_master99", "alex_dev", "angry_user42", "jenny_writes", "curious_mind"];

export default function DiscordBotPage() {
  const settings = useStore((s) => s.settings);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "s1",
      author: "jenny_writes",
      content: "Hey everyone! Welcome to #general 👋",
      ts: Date.now() - 60000,
    },
    {
      id: "s2",
      author: "curious_mind",
      content: "Loving the new dashboard, the ML pipeline is smooth",
      ts: Date.now() - 45000,
    },
  ]);
  const [author, setAuthor] = useState("troll_master99");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const id = `c${Date.now()}`;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Track user
    store.addOrUpdateUser(author);

    // Add user message optimistically
    setMessages((prev) => [...prev, { id, author, content, ts: Date.now() }]);

    // Classify
    const res = await classifyText(content, {
      apiUrl: settings.apiUrl,
      useMock: settings.useMockApi,
    });

    let botAction: ChatMsg["botAction"] | undefined;
    let deleted = false;

    if (res.warning === "high") {
      // Delete + strike + escalate
      deleted = true;
      const updated = store.incrementStrike(author);
      const strikes = updated?.strikes ?? 1;
      if (strikes >= 3) {
        botAction = { type: "ban", reason: "3rd strike — automatic ban", risk: res.warning };
        toast.error(`${author} banned (3rd strike)`);
      } else if (strikes === 2) {
        botAction = { type: "timeout", reason: "2nd strike — 24h timeout", risk: res.warning };
        toast.warning(`${author} placed under 24h timeout`);
      } else {
        botAction = { type: "warn", reason: "1st strike — DM warning", risk: res.warning };
        toast.warning(`${author} warned via DM`);
      }
    } else if (res.warning === "medium") {
      botAction = { type: "warn", reason: "Public warning issued", risk: res.warning };
    } else if (res.warning === "low") {
      botAction = { type: "log", reason: "Logged silently", risk: res.warning };
    }

    // Log to queue if not safe
    if (res.warning !== "safe") {
      store.addMessage({
        id: `m${Date.now()}`,
        content,
        author,
        channel: "#general",
        platform: "Discord",
        createdAt: Date.now(),
        prediction: res.prediction,
        label: res.label,
        warning: res.warning,
        method: res.method,
        matchedKeyword: res.matched_keyword,
        confidence: res.confidence,
        action: deleted
          ? botAction?.type === "ban"
            ? "banned"
            : botAction?.type === "timeout"
              ? "timeout"
              : "deleted"
          : botAction?.type === "warn"
            ? "warned"
            : "logged",
        reviewed: false,
      });
    }

    // Update message with deletion state + bot action
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, deleted, botAction } : m)));
    setSending(false);
  };

  const clear = () => setMessages([]);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">
            Simulator
          </div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">
            Discord Moderation Bot
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            Live simulation of the discord.py bot. High-risk messages are deleted before anyone sees
            them, users progress through a three-strike escalation (warn → timeout → ban).
          </p>
        </div>
        <Button variant="outline" onClick={clear}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col h-[600px] border-border/60 shadow-card-soft overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center gap-2">
            <span className="text-muted-foreground">#</span>
            <span className="font-semibold">general</span>
            <Badge variant="outline" className="ml-auto text-[10px] gap-1">
              <Bot className="w-3 h-3" /> DiscourseGuard Bot online
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0">
                  {m.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{m.author}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  {m.deleted ? (
                    <div className="mt-1 text-xs italic text-muted-foreground border-l-2 border-destructive/40 pl-2">
                      Message removed by DiscourseGuard
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-foreground/90">{m.content}</p>
                  )}
                  {m.botAction && (
                    <div className="mt-2 flex items-center gap-2">
                      <BotAction action={m.botAction} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="text-xs text-muted-foreground italic">
                DiscourseGuard is classifying…
              </div>
            )}
          </div>
          <div className="border-t border-border/60 p-3 bg-card">
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border/60 bg-muted/50 text-xs">
                <UserIcon className="w-3 h-3 text-muted-foreground" />
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="bg-transparent outline-none font-medium"
                >
                  {SEED_USERS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Send a message to #general…"
                className="flex-1"
              />
              <Button onClick={send} disabled={sending} className="bg-gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Bot rules panel */}
        <Card className="p-6 border-border/60 shadow-card-soft h-fit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-shield grid place-items-center">
              <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-semibold">Enforcement rules</h3>
          </div>
          <div className="space-y-3">
            <Rule
              risk="high"
              Icon={ShieldAlert}
              title="Delete + strike"
              desc="Message removed before anyone sees it. Private warning DM'd. Logged to mod channel."
            />
            <Rule
              risk="medium"
              Icon={ShieldAlert}
              title="Public warning"
              desc="Message stays. Bot posts a public warning in-channel."
            />
            <Rule
              risk="low"
              Icon={ShieldAlert}
              title="Silent log"
              desc="No visible action. Logged to the queue for moderators."
            />
          </div>
          <div className="mt-6 pt-6 border-t border-border/60">
            <div className="text-xs font-semibold mb-2 uppercase tracking-widest text-muted-foreground">
              Strike escalation
            </div>
            <div className="space-y-2 text-sm">
              <StrikeStep n={1} Icon={ShieldAlert} text="DM warning" />
              <StrikeStep n={2} Icon={Clock} text="24h timeout" />
              <StrikeStep n={3} Icon={Ban} text="Automatic ban" />
            </div>
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
            Test the flow: try sending messages as <span className="font-mono">troll_master99</span>{" "}
            containing hate keywords — watch strikes escalate. Manage the user on the Users page.
          </p>
        </Card>
      </div>
    </div>
  );
}

function BotAction({ action }: { action: NonNullable<ChatMsg["botAction"]> }) {
  const map = {
    warn: { label: "Bot warning", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
    delete: {
      label: "Message deleted",
      cls: "bg-destructive/15 text-destructive border-destructive/40",
    },
    timeout: { label: "User timed out", cls: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
    ban: { label: "User banned", cls: "bg-destructive/15 text-destructive border-destructive/40" },
    log: { label: "Logged", cls: "bg-muted text-muted-foreground border-border" },
  }[action.type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium ${map.cls}`}
    >
      <Bot className="w-3 h-3" /> {map.label} — {action.reason}
    </span>
  );
}

function Rule({
  risk,
  Icon,
  title,
  desc,
}: {
  risk: "high" | "medium" | "low";
  Icon: typeof ShieldAlert;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
      <div className="flex items-center gap-2 mb-1">
        <RiskBadge level={risk} />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      <Icon className="hidden" />
    </div>
  );
}

function StrikeStep({ n, Icon, text }: { n: number; Icon: typeof ShieldAlert; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
        {n}
      </div>
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span>{text}</span>
    </div>
  );
}
