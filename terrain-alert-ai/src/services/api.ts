export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface SensorData {
  Slope_deg: number;
  Elevation_m: number;
  Rainfall_mm: number;
  Prior_Events: number;
  Distance_to_fault_km: number;
  Fracture_Density: number;
  Rock_Hardness: number;
  Temperature_C: number;
  Humidity_percent: number;
  Wind_speed_kmh: number;
  Month: number;
  Season: string;
}

export interface TopFactor {
  feature: string;
  value: number | string;
  impact: "high" | "medium" | "low";
}

export interface Prediction {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  top_factors: TopFactor[];
  recommendation: string;
  timestamp: string;
}

export interface SimulatedReading extends Prediction {
  sensor_values: SensorData;
}

export interface HealthResponse {
  status: "ok" | "error";
  model: string;
  version: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`API ${path} failed (${response.status}): ${details}`);
  }

  return (await response.json()) as T;
}

export async function getPrediction(sensorData: SensorData): Promise<Prediction> {
  return request<Prediction>("/predict", {
    method: "POST",
    body: JSON.stringify(sensorData),
  });
}

export async function getSimulatedReading(): Promise<SimulatedReading> {
  return request<SimulatedReading>("/simulate");
}

export async function getHistory(): Promise<Prediction[]> {
  return request<Prediction[]>("/history");
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

