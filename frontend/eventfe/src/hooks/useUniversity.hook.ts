import { getAllUniversity } from "@/services/university.service"
import { useQuery } from "@tanstack/react-query"

export function useUniversity<T>({
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
  return useQuery({
    queryKey: ["universities", { page, size, query, sort }],
    queryFn: () => getAllUniversity({ page, size, query, sort }),
    staleTime: 1000 * 60 * 5,
  })
}