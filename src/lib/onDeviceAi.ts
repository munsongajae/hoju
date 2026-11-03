import { registerPlugin } from "@capacitor/core";

export type OnDeviceAiStatusName = "UNAVAILABLE" | "DOWNLOADABLE" | "DOWNLOADING" | "AVAILABLE";

export type OnDeviceAiStatus = {
  status: number;
  statusName: OnDeviceAiStatusName;
  available: boolean;
};

export type OnDeviceAiPrepareResult = {
  status: number;
  statusName: OnDeviceAiStatusName;
  started: boolean;
};

type OnDeviceAiPlugin = {
  getStatus: () => Promise<OnDeviceAiStatus>;
  prepare: () => Promise<OnDeviceAiPrepareResult>;
  generateText: (options: { prompt: string }) => Promise<{ text: string }>;
};

export const OnDeviceAi = registerPlugin<OnDeviceAiPlugin>("OnDeviceAi");
