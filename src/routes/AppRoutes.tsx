import { Link, Navigate, Route, Routes, useNavigate } from "react-router";

import LoginPage from "@/pages/LoginPage";
import UsersPage from "@/pages/UsersPage";
import { AppShell } from "@/layouts/AppShell";
import SettingsPage from "@/pages/SettingsPage";
import MessagesPage from "@/pages/MessagesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ApiTesterPage from "@/pages/ApiTesterPage";
import DashboardPage from "@/pages/DashboardPage";
import DiscordBotPage from "@/pages/DiscordBotPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="api-tester" element={<ApiTesterPage />} />
        <Route path="discord-bot" element={<DiscordBotPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/_app/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-panel rounded-2xl p-10">
        <h1 className="text-6xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route isn't part of DiscourseGuard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
