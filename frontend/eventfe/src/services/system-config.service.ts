import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";

const BASE = `${envConfig.NEXT_PUBLIC_API_URL}/system-config`;

export interface SystemConfigItem {
  configId: number;
  key: string;
  value: Record<string, unknown>;
  dataType: string;
  category: string;
  label: string;
  description: string | null;
  organizationId: number | null;
  organization?: { organizationId: number; organizationName: string } | null;
}

export interface SystemConfigResponse {
  success: boolean;
  data: SystemConfigItem[];
}

export interface SingleConfigResponse {
  success: boolean;
  data: SystemConfigItem;
}

export async function getAllConfigs() {
  return http.get<SystemConfigResponse>(BASE);
}

export async function getConfigsByCategory(category: string) {
  return http.get<SystemConfigResponse>(`${BASE}/category/${category}`);
}

export async function getConfigByKey(key: string, organizationId?: number) {
  const params = organizationId ? `?organizationId=${organizationId}` : "";
  return http.get<SingleConfigResponse>(`${BASE}/${key}${params}`);
}

export async function updateConfig(
  key: string,
  value: Record<string, unknown>,
  organizationId?: number | null,
) {
  return http.put<SingleConfigResponse>(`${BASE}/${key}`, {
    value,
    ...(organizationId ? { organizationId } : {}),
  });
}

export async function getOrgOverrides(organizationId: number) {
  return http.get<SystemConfigResponse>(`${BASE}/org/${organizationId}`);
}

export async function getOverridesByKey(key: string) {
  return http.get<SystemConfigResponse>(`${BASE}/${key}/overrides`);
}

export async function deleteOrgOverride(key: string, organizationId: number) {
  return http.delete<{ success: boolean; data: { message: string } }>(
    `${BASE}/${key}/org/${organizationId}`,
    {},
  );
}
