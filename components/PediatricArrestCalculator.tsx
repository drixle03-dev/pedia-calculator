"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw } from "lucide-react";

/** ---------- Helpers ---------- */
function round1(n: number) { return Math.round(n * 10) / 10; }
function fmt(n: number, dp = 1) {
  let s = Number.isFinite(n) ? n.toFixed(dp) : "";
  if (!s.includes(".")) return s;
  while (s.endsWith("0")) s = s.slice(0, -1);
  if (s.endsWith(".")) s = s.slice(0, -1);
  return s;
}
function fmtA(n: number) { return Number.isFinite(n) ? n.toFixed(3) : ""; }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

/** Exposed for potential unit tests */
export function estimateWeightByAge(ageYears: number, ageMonths: number) {
  if (ageMonths <= 12) return ageMonths * 0.5 + 4;        // 0–12 months
  if (ageYears > 1 && ageYears <= 5) return ageYears * 2 + 8; // 1–5 years
  return ageYears * 3 + 7;                                 // 6–14 years
}
export function calcAdrenaline(wtKg: number) { return { mg: wtKg * 0.01, mL: wtKg * 0.1 }; }
export function calcAmiodarone(wtKg: number) { return wtKg * 5; }
export function calcFluids(wtKg: number) { return { f10: wtKg * 10, f20: wtKg * 20, fMax: wtKg * 20 * 3 }; }
export function calcEnergy(wtKg: number) { return { j4: wtKg * 4, j6: wtKg * 6, j8: wtKg * 8, j10: wtKg * 10 }; }
export function calcDextrose10(wtKg: number) { return wtKg * 2.5; }
export function calcSBP(ageYears: number) { return Math.round(ageYears * 2 + 70); }

/** ---------- Component ---------- */
export default function PediatricArrestCalculator() {
  const [years, setYears] = useState<string>("0");
  const [months, setMonths] = useState<string>("6");
  const [weightKg, setWeightKg] = useState<string>("");

  const ageYears = useMemo(() => {
    const y = Number(years) || 0;
    const m = clamp(Number(months) || 0, 0, 11);
    return y + m / 12;
  }, [years, months]);

  const ageMonths = useMemo(() => Math.round(ageYears * 12), [ageYears]);
  const estWeight = useMemo(() => estimateWeightByAge(ageYears, ageMonths), [ageYears, ageMonths]);
  const wt = useMemo(() => {
    const manual = Number(weightKg);
    return manual > 0 ? manual : estWeight;
  }, [weightKg, estWeight]);

  const adrenalineMg = useMemo(() => wt * 0.01, [wt]);
  const adrenalineMl = useMemo(() => wt * 0.1, [wt]);
  const amiodaroneMg = useMemo(() => wt * 5, [wt]);

  const fluid10 = useMemo(() => wt * 10, [wt]);
  const fluid20 = useMemo(() => wt * 20, [wt]);
  const fluidMax = useMemo(() => wt * 20 * 3, [wt]);

  const energyJ = useMemo(() => ({
    initial: round1(wt * 4),
    step2: round1(wt * 6),
    step3: round1(wt * 8),
    max: round1(wt * 10),
  }), [wt]);

  const sgaSize = useMemo(() => {
    if (wt >= 2 && wt <= 5) return "1";
    if (wt > 5 && wt <= 12) return "1.5";
    if (wt > 10 && wt <= 25) return "2";
    if (wt > 25 && wt <= 35) return "2.5";
    return "N/A";
  }, [wt]);

  const uncuffed = useMemo(() => round1(ageYears / 4 + 4), [ageYears]);
  const cuffed = useMemo(() => round1(ageYears / 4 + 3.5), [ageYears]);
  const ettDepth = useMemo(() => round1(ageYears / 2 + 12), [ageYears]);

  const dextroseMl = useMemo(() => wt * 2.5, [wt]);
  const sbp = useMemo(() => Math.round(ageYears * 2 + 70), [ageYears]);

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const reset = () => { setYears("0"); setMonths("6"); setWeightKg(""); };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pediatric Arrest Calculator - WAAFELSS
        </h1>
        <Button variant="outline" className="gap-2" onClick={reset}>
          <RefreshCw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-2">Age</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Years</label>
                <Input type="number" min={0} step={1} value={years} onChange={(e)=>setYears(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Months (0-11)</label>
                <Input type="number" min={0} max={11} step={1} value={months} onChange={(e)=>setMonths(e.target.value)} />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Computed age: <span className="font-medium">{round1(ageYears)} years</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-2">Weight</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Enter actual weight (kg) - optional</label>
                <Input type="number" min={0} step={0.1} value={weightKg} onChange={(e)=>setWeightKg(e.target.value)} placeholder="Leave blank to use estimate" />
              </div>
              <div className="text-xs">Estimated from age: <span className="font-semibold">{round1(estWeight)} kg</span></div>
              <div className="text-xs text-muted-foreground">
                Using: {ageMonths <= 12 ? "(months x 0.5) + 4" : ageYears <=5 ? "(age x 2) + 8" : "(age x 3) + 7"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-2">Quick Share</div>
            <div className="text-xs text-muted-foreground mb-2">Copy a compact summary</div>
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={()=>copyToClipboard([
                `AGE ${round1(ageYears)}y | WT ${round1(wt)}kg`,
                `Adrenaline: ${fmtA(adrenalineMg)} mg (${fmt(adrenalineMl, 1)} mL 1:10,000)`,
                `Amiodarone: ${fmt(amiodaroneMg)} mg`,
                `Fluids: 10 mL/kg=${fmt(fluid10)} mL | 20 mL/kg=${fmt(fluid20)} mL | Max (3x20)=${fmt(fluidMax)} mL`,
                `Shock: 4J=${energyJ.initial} | 6J=${energyJ.step2} | 8J=${energyJ.step3} | 10J=${energyJ.max}`,
                `SGA: ${sgaSize} | ETT uncuffed ${uncuffed} / cuffed ${cuffed} | Depth ${ettDepth} cm`,
                `Dextrose 10%: ${fmt(dextroseMl)} mL`,
                `Target SBP >= ${sbp} mmHg`,
              ].join('\n'))}
            >
              <Copy className="w-4 h-4"/> Copy summary
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OutputCard title="Adrenaline (1:10,000)" subtitle="0.01 mg/kg = 0.1 mL/kg" lines={[
          ["Dose (mg)", `${fmtA(adrenalineMg)} mg`],
          ["Volume (mL)", `${fmt(adrenalineMl, 1)} mL`],
        ]} />

        <OutputCard title="Amiodarone" subtitle="5 mg/kg" lines={[
          ["Dose (mg)", `${round1(amiodaroneMg)} mg`],
        ]} />

        <OutputCard title="Fluids (Isotonic)" subtitle="10-20 mL/kg x up to 3 boluses" lines={[
          ["10 mL/kg", `${round1(fluid10)} mL`],
          ["20 mL/kg", `${round1(fluid20)} mL`],
          ["Max (3 x 20 mL/kg)", `${round1(fluidMax)} mL`],
        ]} />

        <OutputCard title="Defibrillation Energy" subtitle="Start 4 J/kg - escalate to max 10 J/kg" lines={[
          ["Initial (4 J/kg)", `${energyJ.initial} J`],
          ["Next (6 J/kg)", `${energyJ.step2} J`],
          ["Then (8 J/kg)", `${energyJ.step3} J`],
          ["Max (10 J/kg)", `${energyJ.max} J`],
        ]} />

        <OutputCard title="Airway Aids (SGA/LMA)" subtitle="Weight-based" lines={[["Recommended size", sgaSize]]} />

        <OutputCard title="Endotracheal Tube" subtitle="Age-based" lines={[
          ["Uncuffed size", `${uncuffed} mm`],
          ["Cuffed size", `${cuffed} mm`],
          ["Depth at lips", `${ettDepth} cm`],
        ]} />

        <OutputCard title="Dextrose 10% (Hypoglycaemia)" subtitle="2.5 mL/kg" lines={[["Volume", `${round1(dextroseMl)} mL`]]} />

        <OutputCard title="Target Systolic BP" subtitle="(age x 2) + 70" lines={[["SBP >=", `${sbp} mmHg`]]} />
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        *This tool is a quick-reference calculator for education and simulation. Always follow local Clinical Practice Guidelines and clinician judgment in real patients.
      </p>
    </div>
  );
}

function OutputCard({ title, subtitle, lines }: { title: string; subtitle?: string; lines: [string, string][] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="font-semibold text-base">{title}</div>
        </div>
        {subtitle && <div className="text-xs text-muted-foreground mb-3">{subtitle}</div>}
        <div className="grid grid-cols-1 gap-2">
          {lines.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl border p-3 bg-white dark:bg-slate-900">
              <div className="text-sm text-muted-foreground">{k}</div>
              <div className="text-sm font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
