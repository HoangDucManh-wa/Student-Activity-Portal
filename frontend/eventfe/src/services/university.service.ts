import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { UniversityGetAll } from "@/types/university/university.getall";

export async function getAllUniversity<T>({
  page = 1,
  size = 10,
  query = '',
  sort = "1"
}: {
  page?: number;
  size?: number;
  query?: string;
  sort?: "1" | "-1"
}) {
  const res = await http.get<UniversityGetAll>(
    `${envConfig.NEXT_PUBLIC_API_URL}/university?&page=${page}&size=${size}&query=${query}&sort=${sort}`,
    undefined,
    { revalidate: 60*60 }
  );
  return res
}