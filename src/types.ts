export type PostStatus = "published" | "draft";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
  hue: number; // 封面主色相（生成渐变封面，作为无上传图片时的兜底）
  cover?: string; // 封面图片（objectURL / dataURL，仅会话内有效）
  views: number;
  createdAt: string; // ISO
  updatedAt: string;
  publishedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  hue: number;
}

export type CommentStatus = "pending" | "approved" | "spam";

export interface CommentItem {
  id: string;
  postId: string;
  author: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  isAdmin?: boolean;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string;
  albumId: string; // 所属相册 id
  caption: string;
  hue: number;
  src?: string; // 本地上传的 objectURL（仅会话内有效）
  takenAt: string;
}

export interface Settings {
  siteTitle: string;
  slogan: string;
  description: string;
  icp: string;
  github: string;
  email: string;
}

export interface TrafficPoint {
  date: string; // MM-DD
  pv: number;
  uv: number;
}

export interface AppState {
  version: number;
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  comments: CommentItem[];
  albums: Album[];
  photos: Photo[];
  settings: Settings;
  traffic: TrafficPoint[];
}
