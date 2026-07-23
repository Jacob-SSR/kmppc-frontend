"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Department = {
  id: string;
  dept_code: string;
  dept_name: string;
  description: string | null;
};

export type Category = {
  id: string;
  category_name: string;
  description: string | null;
  article_count: number;
  discussion_count: number;
};

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get<Department[]>("/departments")).data,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
}
