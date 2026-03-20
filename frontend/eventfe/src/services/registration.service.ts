import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";

const BASE = `${envConfig.NEXT_PUBLIC_API_URL}/registrations`;

export interface Registration {
  registrationId: number;
  status: string;
  registrationType: string;
  registrationTime: string;
  activityId: number;
  userId: number;
  activity?: {
    activityId: number;
    activityName: string;
    startTime: string | null;
    endTime: string | null;
    coverImage: string | null;
    activityStatus: string;
  };
}

export interface RegistrationsResponse {
  success: boolean;
  data: Registration[];
  meta: { total: number; page: number; limit: number };
}

export async function createRegistration(
  { activityId, registrationType = "individual" }: { activityId: number; registrationType?: string },
  token?: string
) {
  return http.post<{ success: boolean; data: Registration }>(
    BASE,
    { activityId, registrationType },
    token
  );
}

export async function getMyRegistrations(token?: string) {
  return http.get<RegistrationsResponse>(`${BASE}/my`, token);
}

export async function cancelRegistration(id: number, token?: string) {
  return http.put<{ success: boolean }>(`${BASE}/${id}/cancel`, {}, token);
}

export interface RegistrationDetail {
  registrationId: number;
  status: string;
  registrationType: string;
  registrationTime: string;
  activityId: number;
  userId: number;
  user?: {
    userId: number;
    userName: string;
    email: string;
    studentId: string | null;
    avatarUrl: string | null;
  };
  teamMembers?: { teamMemberId: number; user: { userId: number; userName: string } }[];
}

export interface ActivityStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  checkedIn: number;
  maxParticipants: number | null;
}

export async function getRegistrationsByActivity(
  activityId: number | string,
  params?: { page?: number; limit?: number; status?: string },
  token?: string
) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.status) search.set("status", params.status);
  const qs = search.toString() ? `?${search}` : "";
  return http.get<{
    success: boolean;
    data: { data: RegistrationDetail[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  }>(`${BASE}/activity/${activityId}${qs}`, token);
}

export async function getActivityStats(activityId: number | string, token?: string) {
  return http.get<{ success: boolean; data: ActivityStats }>(`${BASE}/activity/${activityId}/stats`, token);
}

export async function updateRegistrationStatus(
  id: number,
  status: "approved" | "rejected",
  token?: string
) {
  return http.put<{ success: boolean }>(`${BASE}/${id}/status`, { status }, token);
}
