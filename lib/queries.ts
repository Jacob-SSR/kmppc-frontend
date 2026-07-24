"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ---------- Types (ตาม response จริงของ kmppc-backtend) ----------

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type Author = {
  id: string | null;
  fname: string;
  lname: string | null;
  position: string | null;
  profile_image: string | null;
};

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

export type Tag = {
  id: string;
  tag_name: string;
  article_count: number;
  discussion_count: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: "DRAFT" | "PUBLISHED" | string;
  is_pinned: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  author: Author;
  category: { id: string; category_name: string };
  tags?: { tag: { id: string; tag_name: string } }[];
  _count: { comments: number; likes: number };
  // มีเฉพาะหน้า detail เมื่อผู้ใช้ login อยู่
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
};

export type ArticleComment = {
  id: string;
  content: string;
  created_at: string;
  user: Author;
  _count: { likes: number };
  liked_by_me?: boolean;
};

export type Reply = {
  id: string;
  content: string;
  is_anonymous: boolean;
  is_best_answer: boolean;
  parent_reply_id: string | null;
  created_at: string;
  author: Author;
  _count: { likes: number };
};

export type Discussion = {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  is_solved: boolean;
  view_count: number;
  created_at: string;
  author: Author;
  category: { id: string; category_name: string };
  tags?: { tag: { id: string; tag_name: string } }[];
  _count: { replies?: number; likes: number };
  replies?: Reply[];
  // มีเฉพาะหน้า detail เมื่อผู้ใช้ login อยู่
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
};

export type Me = {
  id: string;
  employee_no: string;
  username: string;
  email: string;
  fname: string;
  lname: string;
  phone: string | null;
  position: string | null;
  profile_image: string | null;
  is_active: boolean;
  role: { id: string; role_name: string };
  department: { id: string; dept_name: string; dept_code: string };
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  url: string | null;
  is_read: boolean;
  created_at: string;
};

export type Bookmark = {
  id: string;
  created_at: string;
  article: { id: string; title: string; slug: string; excerpt: string | null } | null;
  discussion: { id: string; title: string } | null;
};

export type Conversation = {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  updated_at: string;
  members: {
    user: { id: string; fname: string; lname: string | null; profile_image: string | null };
  }[];
  last_message:
    | { id: string; message: string; created_at: string; sender: Author }
    | null;
  unread_count: number;
};

export type ChatMessage = {
  id: string;
  message: string;
  created_at: string;
  sender: { id: string; fname: string; lname: string | null; profile_image: string | null };
};

export type AdminReport = {
  id: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  created_at: string;
  reviewed_at: string | null;
  reporter: { id: string; fname: string; lname: string | null };
  reviewer: { id: string; fname: string; lname: string | null } | null;
  target:
    | { type: "article" | "discussion"; id: string; title: string }
    | { type: "reply" | "comment"; id: string; excerpt: string }
    | null;
};

export type SystemSetting = { key: string; value: string };

export type KnowledgeDoc = {
  id: string;
  title: string;
  doc_type: "MANUAL" | "SOP" | "FAQ";
  description: string | null;
  file_url: string | null;
  index_status: "PENDING" | "INDEXING" | "DONE" | "FAILED";
  is_active: boolean;
  updated_at: string;
  department: { id: string; dept_name: string } | null;
  uploader: { id: string; fname: string; lname: string | null } | null;
};

export type SearchResult = {
  articles: {
    items: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      published_at: string | null;
      view_count: number;
      author: Author;
      category: { id: string; category_name: string };
    }[];
    total: number;
  };
  discussions: { items: Discussion[]; total: number };
  page: number;
  limit: number;
};

// ---------- Hooks ----------

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<Me>("/auth/me")).data,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

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

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await api.get<Tag[]>("/tags")).data,
  });
}

export type ListParams = {
  page?: number;
  limit?: number;
  category_id?: string;
  q?: string;
};

export function useArticles(params: ListParams = {}) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: async () =>
      (await api.get<Paginated<Article>>("/articles", { params })).data,
    placeholderData: keepPreviousData,
  });
}

/** บทความของฉันทั้งหมด รวมฉบับร่าง (ต้อง login) */
export function useMyArticles() {
  return useQuery({
    queryKey: ["my-articles"],
    queryFn: async () => (await api.get<Article[]>("/articles/mine")).data,
    retry: false,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => (await api.get<Article>(`/articles/${slug}`)).data,
    enabled: !!slug,
  });
}

export function useComments(articleId: string | undefined) {
  return useQuery({
    queryKey: ["comments", articleId],
    queryFn: async () =>
      (await api.get<ArticleComment[]>(`/articles/${articleId}/comments`)).data,
    enabled: !!articleId,
    // เห็นคอมเมนต์คนอื่นแบบเกือบ realtime — endpoint นี้อ่านอย่างเดียว poll ได้ปลอดภัย
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useDiscussions(params: ListParams = {}) {
  return useQuery({
    queryKey: ["discussions", params],
    queryFn: async () =>
      (await api.get<Paginated<Discussion>>("/discussions", { params })).data,
    placeholderData: keepPreviousData,
  });
}

export function useDiscussion(id: string) {
  return useQuery({
    queryKey: ["discussion", id],
    queryFn: async () => (await api.get<Discussion>(`/discussions/${id}`)).data,
    enabled: !!id,
  });
}

export function useSearchResults(q: string, type: "all" | "articles" | "discussions") {
  return useQuery({
    queryKey: ["search", q, type],
    queryFn: async () =>
      (await api.get<SearchResult>("/search", { params: { q, type } })).data,
    enabled: q.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useNotifications(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () =>
      (
        await api.get<Paginated<AppNotification> & { unread_count: number }>(
          "/notifications",
          { params },
        )
      ).data,
    placeholderData: keepPreviousData,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => (await api.get<Bookmark[]>("/bookmarks")).data,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () =>
      (await api.get<Conversation[]>("/chat/conversations")).data,
    // realtime ผ่าน Socket.IO แล้ว — polling เป็นแค่ fallback
    refetchInterval: 60_000,
  });
}

export function useChatMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () =>
      (
        await api.get<Paginated<ChatMessage>>(
          `/chat/conversations/${conversationId}/messages`,
          { params: { limit: 50 } },
        )
      ).data,
    enabled: !!conversationId,
    // realtime ผ่าน Socket.IO แล้ว — polling เป็นแค่ fallback
    refetchInterval: 60_000,
  });
}

export type DirectoryUser = {
  id: string;
  fname: string;
  lname: string | null;
  position: string | null;
  profile_image: string | null;
  department: { dept_name: string } | null;
};

/** รายชื่อเพื่อนร่วมงานสำหรับเริ่มแชท (ต้อง login) */
export function useDirectory(q: string, enabled = true) {
  return useQuery({
    queryKey: ["directory", q],
    queryFn: async () =>
      (await api.get<DirectoryUser[]>("/users/directory", { params: { q } }))
        .data,
    enabled,
    placeholderData: keepPreviousData,
  });
}

// ---------- Admin ----------

export function useAdminUsers(params: { page?: number; limit?: number; q?: string } = {}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () =>
      (await api.get<Paginated<Me>>("/users", { params })).data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminReports(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-reports", params],
    queryFn: async () =>
      (await api.get<Paginated<AdminReport>>("/reports", { params })).data,
    placeholderData: keepPreviousData,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get<SystemSetting[]>("/settings")).data,
  });
}

export function useKnowledgeDocs() {
  return useQuery({
    queryKey: ["knowledge-docs"],
    queryFn: async () =>
      (await api.get<KnowledgeDoc[]>("/knowledge-documents")).data,
  });
}
