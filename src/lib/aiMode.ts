"use client";

export type AiMode = "manual" | "auto";

export const AI_MODE_STORAGE_KEY = "hoju_ai_mode";
export const DEFAULT_AI_MODE: AiMode = "manual";

export function isAiMode(value: string | null): value is AiMode {
  return value === "manual" || value === "auto";
}

export function getSavedAiMode(): AiMode {
  if (typeof window === "undefined") return DEFAULT_AI_MODE;
  const saved = localStorage.getItem(AI_MODE_STORAGE_KEY);
  return isAiMode(saved) ? saved : DEFAULT_AI_MODE;
}
