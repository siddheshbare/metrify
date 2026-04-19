"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { IgAudienceDemographics } from "@/types/instagram";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const GENDER_LABELS: Record<string, string> = { M: "Male", F: "Female", U: "Other" };
const GENDER_COLORS: Record<string, string> = {
  M: "var(--emerald)",
  F: "oklch(0.65 0.18 330)",
  U: "oklch(0.65 0.15 220)",
};

interface IgDemographicsProps {
  demographics: IgAudienceDemographics;
  dark?: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function IgDemographics({ demographics, dark = true }: IgDemographicsProps) {
  const { age, gender, country } = demographics;

  const ageData = [...age]
    .sort((a, b) => a.range.localeCompare(b.range))
    .filter((d) => d.value > 0);

  const totalGender = gender.reduce((sum, g) => sum + g.value, 0);

  const topCountries = [...country]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const maxVal = topCountries[0]?.value ?? 1;

  const mutedColor = dark ? "oklch(0.556 0 0)" : "#9ca3af";
  const barColor = "var(--emerald)";
  const textClass = dark ? "text-muted-foreground" : "text-gray-500";
  const borderClass = dark ? "border-border/30" : "border-gray-100";

  if (ageData.length === 0 && totalGender === 0 && topCountries.length === 0) return null;

  return (
    <div className="space-y-5 pt-2">
      <p className={`text-xs uppercase tracking-wider ${textClass}`}>Instagram Audience</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {ageData.length > 0 && (
          <div className="sm:col-span-2 space-y-2">
            <p className={`text-xs font-medium ${textClass}`}>Age breakdown</p>
            <ResponsiveContainer width="100%" height={Math.min(ageData.length * 22 + 10, 160)}>
              <BarChart data={ageData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, "dataMax"]} />
                <YAxis
                  type="category"
                  dataKey="range"
                  width={48}
                  tick={{ fontSize: 11, fill: mutedColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [fmt(Number(v ?? 0)), "Reached"]}
                  contentStyle={{
                    background: dark ? "oklch(0.205 0 0)" : "#fff",
                    border: "1px solid oklch(0.3 0 0 / 30%)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  cursor={{ fill: dark ? "oklch(1 0 0 / 5%)" : "oklch(0 0 0 / 4%)" }}
                />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={barColor} fillOpacity={0.65 + i * 0.04} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-4">
          {totalGender > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${textClass}`}>Gender</p>
              <div className="space-y-1.5">
                {gender
                  .filter((g) => g.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .map((g) => {
                    const pct = Math.round((g.value / totalGender) * 100);
                    const label = GENDER_LABELS[g.label] ?? g.label;
                    const color = GENDER_COLORS[g.label] ?? "var(--emerald)";
                    return (
                      <div key={g.label} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className={dark ? "text-muted-foreground" : "text-gray-500"}>{label}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: dark ? "oklch(0.2 0 0)" : "#f3f4f6" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {topCountries.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${textClass}`}>Top markets</p>
              <div className="space-y-1.5">
                {topCountries.map(({ code, value }) => {
                  let name = code;
                  try { name = countryNames.of(code) ?? code; } catch { /* keep code */ }
                  const barWidth = Math.round((value / maxVal) * 100);
                  return (
                    <div key={code} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>{getCountryFlag(code)} {name}</span>
                        <span className={textClass}>{fmt(value)}</span>
                      </div>
                      <div className={`h-1 rounded-full border ${borderClass} overflow-hidden`}
                        style={{ background: dark ? "oklch(0.2 0 0)" : "#f3f4f6" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barWidth}%`, background: barColor, opacity: 0.65 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
