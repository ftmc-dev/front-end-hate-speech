import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShieldCheck, Ban, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { store, useStore, type UserStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Users · DiscourseGuard" }] }),
  component: UsersPage,
});

const statusConfig: Record<UserStatus, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  active:  { label: "Active",  cls: "bg-success/15 text-success border-success/30",           Icon: ShieldCheck },
  warned:  { label: "Warned",  cls: "bg-warning/20 text-warning-foreground border-warning/40",Icon: AlertTriangle },
  timeout: { label: "Timeout", cls: "bg-chart-2/15 text-chart-2 border-chart-2/30",           Icon: Clock },
  banned:  { label: "Banned",  cls: "bg-destructive/15 text-destructive border-destructive/40",Icon: Ban },
};

function UsersPage() {
  const users = useStore((s) => s.users);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return users
      .filter((u) => (status === "all" ? true : u.status === status))
      .filter((u) => (!q ? true : u.username.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => b.strikes - a.strikes);
  }, [users, q, status]);

  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    warned: users.filter((u) => u.status === "warned").length,
    timeout: users.filter((u) => u.status === "timeout").length,
    banned: users.filter((u) => u.status === "banned").length,
  }), [users]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <header>
        <div className="text-xs font-semibold text-primary uppercase tracking-widest">Community</div>
        <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">Users</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Strike counts, status, and manual moderation controls for every tracked user.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { k: "all",     l: "Total",   c: counts.all,     tone: "text-primary" },
          { k: "active",  l: "Active",  c: counts.active,  tone: "text-success" },
          { k: "warned",  l: "Warned",  c: counts.warned,  tone: "text-warning-foreground" },
          { k: "timeout", l: "Timeout", c: counts.timeout, tone: "text-chart-2" },
          { k: "banned",  l: "Banned",  c: counts.banned,  tone: "text-destructive" },
        ].map((x) => (
          <button
            key={x.k}
            onClick={() => setStatus(x.k)}
            className={`text-left p-4 rounded-xl border transition-all ${
              status === x.k
                ? "border-primary bg-primary/5 shadow-elegant"
                : "border-border/60 bg-card hover:border-primary/40"
            }`}
          >
            <div className={`text-2xl font-display font-bold ${x.tone}`}>{x.c}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{x.l}</div>
          </button>
        ))}
      </div>

      <Card className="p-4 border-border/60 shadow-card-soft">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search username..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="warned">Warned</SelectItem>
              <SelectItem value="timeout">Timeout</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-border/60 shadow-card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Strikes</TableHead>
              <TableHead className="text-right">Flagged</TableHead>
              <TableHead className="text-right hidden md:table-cell">Total msgs</TableHead>
              <TableHead className="hidden lg:table-cell">Last offense</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const s = statusConfig[u.status];
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-bold">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{u.username}</div>
                        <div className="text-[11px] text-muted-foreground">
                          since {formatDistanceToNow(u.firstSeen, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${s.cls}`}>
                      <s.Icon className="w-3 h-3" /> {s.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i < u.strikes ? "bg-destructive" : "bg-muted"}`} />
                      ))}
                      <span className="ml-1.5 text-xs tabular-nums font-medium">{u.strikes}/3</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{u.flaggedMessages}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground hidden md:table-cell">{u.totalMessages}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                    {u.lastOffense ? formatDistanceToNow(u.lastOffense, { addSuffix: true }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {u.strikes > 0 && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          store.resetUserStrikes(u.id);
                          toast.success(`Reset strikes for ${u.username}`);
                        }}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                      )}
                      {u.status !== "banned" && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                          store.updateUser(u.id, { status: "banned", strikes: 3, lastOffense: Date.now() });
                          toast.success(`Banned ${u.username}`);
                        }}>
                          <Ban className="w-3.5 h-3.5 mr-1" /> Ban
                        </Button>
                      )}
                      {u.status === "banned" && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => {
                          store.updateUser(u.id, { status: "active", strikes: 0 });
                          toast.success(`Unbanned ${u.username}`);
                        }}>
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Unban
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No users match.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
