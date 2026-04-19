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
import type { Demographics } from "@/types/youtube";

const AGE_LABELS: Record<string, string> = {
  AGE_13_17: "13–17",
  AGE_18_24: "18–24",
  AGE_25_34: "25–34",
  AGE_35_44: "35–44",
  AGE_45_54: "45–54",
  AGE_55_64: "55–64",
  AGE_65_: "65+",
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

interface YtDemographicsProps {
  demographics: Demographics;
  dark?: boolean;
}

export function YtDemographics({ demographics, dark = true }: YtDemographicsProps) {
  const { age, gender, geography } = demographics;

  const ageData = Object.entries(AGE_LABELS)
    .map(([key, label]) => ({ label, value: Math.round((age[key] ?? 0) * 10) / 10 }))
    .filter((d) => d.value > 0);

  const totalGender = gender.male + gender.female + (gender.userSpecified ?? 0);
  const malePct = totalGender > 0 ? Math.round((gender.male / totalGender) * 100) : 0;
  const femalePct = totalGender > 0 ? Math.round((gender.female / totalGender) * 100) : 0;

  const topCountries = [...geography]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const maxViews = topCountries[0]?.views ?? 1;

  const mutedColor = dark ? "oklch(0.556 0 0)" : "#9ca3af";
  const barColor = "var(--emerald)";
  const textClass = dark ? "text-muted-foreground" : "text-gray-500";
  const borderClass = dark ? "border-border/30" : "border-gray-100";

  if (ageData.length === 0 && totalGender === 0 && topCountries.length === 0) return null;

  return (
    <div className="space-y-5 pt-2">
      <p className={`text-xs uppercase tracking-wider ${textClass}`}>Audience</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Age */}
        {ageData.length > 0 && (
          <div className="sm:col-span-2 space-y-2">
            <p className={`text-xs font-medium ${textClass}`}>Age breakdown</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={ageData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, "dataMax"]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={42}
                  tick={{ fontSize: 11, fill: mutedColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v ?? 0}%`, "Viewers"]}
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
                    <Cell key={i} fill={barColor} fillOpacity={0.7 + i * 0.04} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gender + Markets stacked */}
        <div className="space-y-4">
          {/* Gender */}
          {totalGender > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${textClass}`}>Gender</p>
              <div className="space-y-1.5">
                <GenderBar label="Male" pct={malePct} color="var(--emerald)" dark={dark} />
                <GenderBar label="Female" pct={femalePct} color="oklch(0.65 0.18 330)" dark={dark} />
              </div>
            </div>
          )}

          {/* Top markets */}
          {topCountries.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${textClass}`}>Top markets</p>
              <div className="space-y-1.5">
                {topCountries.map(({ country, views }) => {
                  let name = country;
                  try { name = countryNames.of(country) ?? country; } catch { /* keep code */ }
                  const barWidth = Math.round((views / maxViews) * 100);
                  return (
                    <div key={country} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {getCountryFlag(country)} {name}
                        </span>
                        <span className={textClass}>{fmt(views)}</span>
                      </div>
                      <div className={`h-1 rounded-full border ${borderClass} overflow-hidden`}
                        style={{ background: dark ? "oklch(0.2 0 0)" : "#f3f4f6" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barWidth}%`, background: "var(--emerald)", opacity: 0.65 }}
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

function GenderBar({ label, pct, color, dark }: { label: string; pct: number; color: string; dark: boolean }) {
  return (
    <div className="space-y-0.5">
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
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
