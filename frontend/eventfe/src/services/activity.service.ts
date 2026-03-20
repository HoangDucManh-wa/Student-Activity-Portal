import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";

const BASE = `${envConfig.NEXT_PUBLIC_API_URL}/activities`;

export interface Activity {
  activityId: number;
  activityName: string;
  description: string | null;
  coverImage: string | null;
  location: string | null;
  activityType: string;
  teamMode: string;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  minParticipants: number | null;
  maxParticipants: number | null;
  activityStatus: string;
  prize: string | null;
  organizationId: number;
  categoryId: number;
  registrationFormId: number | null;
  registrationForm?: { formId: number; title: string; status: string; description?: string | null } | null;
  organization?: { organizationId: number; organizationName: string; logoUrl: string | null };
  category?: { categoryId: number; categoryName: string };
  _count?: { registrations: number };
}

export interface ActivityCategory {
  categoryId: number;
  categoryName: string;
}

// Backend returns: { success: true, data: { data: [], meta: {} } }
export interface ActivitiesResponse {
  success: boolean;
  data: {
    data: Activity[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface ActivityResponse {
  success: boolean;
  data: Activity;
}

export interface CategoriesResponse {
  success: boolean;
  data: ActivityCategory[];
}

export async function getActivities({
  page = 1,
  limit = 8,
  type,
  status,
  categoryId,
  organizationId,
  startDate,
  endDate,
  token,
}: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  categoryId?: number;
  organizationId?: number;
  startDate?: string;
  endDate?: string;
  token?: string;
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set("activityType", type);
  if (status) params.set("activityStatus", status);
  if (categoryId) params.set("categoryId", String(categoryId));
  if (organizationId) params.set("organizationId", String(organizationId));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return http.get<ActivitiesResponse>(`${BASE}?${params}`, token);
}

export async function getActivityById(id: number | string, token?: string) {
  return http.get<ActivityResponse>(`${BASE}/${id}`, token);
}

export async function getCategories(token?: string) {
  return http.get<CategoriesResponse>(`${BASE}/categories`, token);
}

export interface CreateActivityPayload {
  activityName: string;
  description?: string | null;
  coverImage?: string | null;
  location?: string | null;
  activityType: "program" | "competition" | "recruitment";
  teamMode?: "individual" | "team" | "both";
  startTime?: string | null;
  endTime?: string | null;
  registrationDeadline?: string | null;
  minParticipants?: number | null;
  maxParticipants?: number | null;
  prize?: string | null;
  organizationId: number;
  categoryId: number;
  registrationFormId?: number | null;
}

export async function createActivity(data: CreateActivityPayload) {
  return http.post<ActivityResponse>(`${BASE}`, data);
}

export async function updateActivity(id: number | string, data: Partial<CreateActivityPayload>) {
  return http.put<ActivityResponse>(`${BASE}/${id}`, data);
}

export async function updateActivityStatus(id: number | string, activityStatus: string) {
  return http.put<ActivityResponse>(`${BASE}/${id}/status`, { activityStatus });
}

export async function getMyOrgActivities({
  page = 1,
  limit = 10,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("activityStatus", status);
  return http.get<ActivitiesResponse>(`${BASE}/my-org?${params}`);
}
