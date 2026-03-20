import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";

const BASE = `${envConfig.NEXT_PUBLIC_API_URL}/organizations`;

export interface Organization {
  organizationId: number;
  organizationName: string;
  organizationType: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
}

export interface OrganizationMember {
  userId: number;
  organizationId: number;
  role: string | null;
  joinDate: string | null;
  user: { userId: number; userName: string; email: string; avatarUrl: string | null };
}

// Backend returns: { success: true, data: { data: [], meta: {} } }
export interface OrganizationsResponse {
  success: boolean;
  data: {
    data: Organization[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface OrganizationResponse {
  success: boolean;
  data: Organization;
}

// Backend trả: { success: true, data: { data: OrganizationMember[], meta: {...} } }
export interface MembersResponse {
  success: boolean;
  data: {
    data: OrganizationMember[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export async function getOrganizations({
  page = 1,
  limit = 10,
  type,
  token,
}: {
  page?: number;
  limit?: number;
  type?: string;
  token?: string;
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set("organizationType", type);
  return http.get<OrganizationsResponse>(`${BASE}?${params}`, token);
}

export async function getOrganizationById(id: number | string, token?: string) {
  return http.get<OrganizationResponse>(`${BASE}/${id}`, token);
}

export async function getOrganizationMembers(id: number | string, token?: string) {
  return http.get<MembersResponse>(`${BASE}/${id}/members`, token);
}

export interface MyOrganization extends Organization {
  memberRole: string;
  _count?: { organizationMembers: number; activities: number };
}

export interface MyOrganizationResponse {
  success: boolean;
  data: MyOrganization;
}

export interface OrgStats {
  activeActivities: number;
  totalRegistrations: number;
  newMembers: number;
}

export async function getMyOrganization() {
  return http.get<MyOrganizationResponse>(`${BASE}/my`);
}

export async function getOrgStats(id: number | string) {
  return http.get<{ success: boolean; data: OrgStats }>(`${BASE}/${id}/stats`);
}

export async function updateMyOrganization(id: number | string, data: Partial<Organization>) {
  return http.put<OrganizationResponse>(`${BASE}/${id}`, data);
}
