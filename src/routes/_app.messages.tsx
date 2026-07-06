import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Filter, Check, X, MessageSquare, Trash2, ShieldOff, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { store, useStore, type RiskLevel, type FlaggedMessage } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "@/components/RiskBadge";
import { ConfidenceBars } from "@/components/ConfidenceBars";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Message Queue · DiscourseGuard" }] }),
  component: MessagesPage,
});

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2, safe: 3 };

function MessagesPage() {
  const messages = useStore((s) => s.messages);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const [status, setStatus] = useState<string>("pending");
  const [platform, setPlatform] = useState<string>("all");

  const filtered = useMemo(() => {
    return messages
      .filter((m) => (risk === "all" ? true : m.warning === risk))
      .filter((m) => (status === "all" ? true : status === "pending" ? !m.reviewed : m.reviewed))
      .filter((m) => (platform === "all" ? true : m.platform === platform))
      .filter((m) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return m.content.toLowerCase().includes(q) || m.author.toLowerCase().includes(q);
      })
      .sort((a, b) => RISK_ORDER[a.warning] - RISK_ORDER[b.warning] || b.createdAt - a.createdAt);
  }, [messages, query, risk, status, platform]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <header>
        <div className="text-xs font-semibold text-primary uppercase tracking-widest">Moderation</div>
        <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">Message Queue</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review, confirm, or override automated classifications. All decisions are logged.
        </p>
      </header>

      <Card className="p-4 border-border/60 shadow-card-soft">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search content or author..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-[150px]"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="Discord">Discord</SelectItem>
              <SelectItem value="Reddit">Reddit</SelectItem>
              <SelectItem value="HackerNews">HackerNews</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-12 text-center border-border/60">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <div className="font-medium">No messages match these filters</div>
            <div className="text-sm text-muted-foreground mt-1">Try adjusting risk level or status.</div>
          </Card>
        )}
        {filtered.map((m) => <MessageRow key={m.id} m={m} />)}
      </div>
    </div>
  );
}

function MessageRow({ m }: { m: FlaggedMessage }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(m.moderatorNote ?? "");

  const confirm = () => {
    store.updateMessage(m.id, { reviewed: true, moderatorNote: note });
    toast.success("Decision confirmed");
    setOpen(false);
  };
  const override = () => {
    store.updateMessage(m.id, { reviewed: true, overridden: true, action: "none", warning: "safe", moderatorNote: note || "Overridden by moderator" });
    toast.success("Classification overridden — user cleared");
    setOpen(false);
  };
  const del = () => {
    store.deleteMessage(m.id);
    toast.success("Message removed from queue");
  };

  return (
    <Card className="p-5 border-border/60 shadow-card-soft hover:shadow-elegant transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0">
              {m.author.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-sm">{m.author}</span>
            <span className="text-xs text-muted-foreground">· {m.platform} · {m.channel}</span>
            <span className="text-xs text-muted-foreground">· {formatDistanceToNow(m.createdAt, { addSuffix: true })}</span>
            <RiskBadge level={m.warning} />
            {m.reviewed && <Badge variant="outline" className="text-[10px] gap-1"><Check className="w-3 h-3" /> Reviewed</Badge>}
            {m.overridden && <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-[10px]">Overridden</Badge>}
          </div>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{m.content}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <Badge variant="outline" className="font-mono">method: {m.method}</Badge>
            {m.matchedKeyword && <Badge variant="outline" className="font-mono">matched: "{m.matchedKeyword}"</Badge>}
            <Badge variant="outline" className="font-mono">action: {m.action}</Badge>
          </div>
        </div>
        <div className="w-56 shrink-0 hidden md:block">
          <ConfidenceBars confidence={m.confidence} compact />
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={del} className="text-muted-foreground">
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Dismiss
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Review</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review classification</DialogTitle>
              <DialogDescription>Confirm the automated decision or override it.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                <div className="text-xs text-muted-foreground mb-1">Message</div>
                <p className="text-sm">{m.content}</p>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Model confidence</div>
                <ConfidenceBars confidence={m.confidence} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Moderator note</label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional context for the audit log..." rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={override} className="text-chart-2">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Override — mark safe
                </Button>
                <Button onClick={confirm} className="bg-gradient-primary">
                  <ShieldOff className="w-3.5 h-3.5 mr-1" /> Confirm decision
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

void X;
