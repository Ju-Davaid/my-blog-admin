export enum PostStatus {
  Draft,
  Published,
}

export interface Post {
  id?: string;
  title: string;
  desc: string; // 摘要
  content: string; // Markdown
  categoryId: string | null;
  tagIds: number[];
  status: PostStatus;
  cover: string;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tag {
  id: number;
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
  /** 父评论 id —— 有值表示这是一条挂在父评论下的回复 */
  parentId?: string;
}

/* ---------- 动态（朋友圈） ---------- */

export interface MomentComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isAdmin?: boolean;
  /** 回复的目标评论 id；有值表示挂在某条评论下 */
  parentId?: string;
}

export interface Moment {
  id: string;
  content: string;
  /** 配图（objectURL / dataURL，最多 9 张） */
  images: string[];
  createdAt: string;
  /** 点赞人用户名 */
  likes: string[];
  comments: MomentComment[];
  /** 位置（可选） */
  location?: string;
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
  /** 站长用户名（后台右上角 / 评论回复署名展示） */
  username: string;
  /** 头像图片（objectURL / dataURL，仅会话内有效） */
  avatar?: string;
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
  moments: Moment[];
  settings: Settings;
  traffic: TrafficPoint[];
}
