"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { difficultyDescription, difficultyLabel } from "@/lib/i18n-display";
import { cn } from "@/lib/utils";

const MIN = 1;
const MAX = 5;

interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function DifficultySlider({
  value,
  onChange,
  className,
}: DifficultySliderProps) {
  const { t } = useI18n();
  const label = difficultyLabel(t, value);
  const description = difficultyDescription(t, value);
  const fillPercent = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="difficulty" className="block text-sm font-medium">
          {t("difficulty.label")}
        </label>
        <span className="text-sm font-medium text-accent tabular-nums">
          {value}/5 · {label}
        </span>
      </div>

      <div className="relative flex items-center h-6">
        <div
          className="absolute left-0 right-0 h-2 rounded-full bg-muted pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute left-0 h-2 rounded-full bg-accent pointer-events-none transition-[width] duration-150 ease-out"
          style={{ width: `${fillPercent}%` }}
          aria-hidden
        />
        <input
          id="difficulty"
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={value}
          aria-label={`${t("difficulty.label")}: ${label}`}
          className={cn(
            "relative z-10 w-full h-6 cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background",
            "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:-mt-1",
            "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-sm"
          )}
        />
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">{t("difficulty.helperDetail")}</p>
    </div>
  );
}
