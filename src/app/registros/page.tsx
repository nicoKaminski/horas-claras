import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { getWorkLogs } from "@/backend/work-logs/get-work-logs";
import AppShell from "@/frontend/components/app-shell/AppShell";
import Workspace from "@/frontend/features/work-logs/components/Workspace";

export const metadata = {
  title: "Ver registros · Horas Claras",
  description: "Listado de tus registros de horas de trabajo",
};

interface RegistrosPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function RegistrosPage({ searchParams }: RegistrosPageProps) {
  const profileResult = await getCurrentProfile();

  if (profileResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (profileResult.status !== "success" || !profileResult.profile) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const currentMonth = resolvedParams.month ? Number(resolvedParams.month) : new Date().getMonth() + 1;
  const currentYear = resolvedParams.year ? Number(resolvedParams.year) : new Date().getFullYear();

  const logsResult = await getWorkLogs({
    month: currentMonth,
    year: currentYear,
  });

  return (
    <AppShell profile={profileResult.profile} activeItem="hours">
      <Workspace
        logs={logsResult.logs || []}
        currentProfile={profileResult.profile}
        initialMonth={currentMonth}
        initialYear={currentYear}
      />
    </AppShell>
  );
}
