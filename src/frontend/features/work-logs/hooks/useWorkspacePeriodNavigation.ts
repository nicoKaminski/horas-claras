import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useWorkspacePeriodNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleMonthYearChange = (month: number, year: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", month.toString());
      params.set("year", year.toString());
      router.push(`/registros?${params.toString()}`);
    });
  };

  return {
    isPending,
    handleMonthYearChange,
  };
}
