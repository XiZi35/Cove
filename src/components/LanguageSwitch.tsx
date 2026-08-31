"use client";

import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-xs font-medium">
      {(["zh", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2.5 py-1 rounded-md transition-all ${
            locale === l
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {l === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}