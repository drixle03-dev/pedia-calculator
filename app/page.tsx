"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import PediatricArrestCalculator from "@/components/PediatricArrestCalculator";

export default function Page() {
  return (
    <main className="p-4">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <PediatricArrestCalculator />
    </main>
  );
}
