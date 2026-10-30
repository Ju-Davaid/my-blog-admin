import { createContext } from "react";
import type {
  AppState,
  CommentItem,
  CommentStatus,
  Moment,
  MomentComment,
  Photo,
  Post,
  Settings,
} from "../types";

export interface StoreContextValue {
  state: AppState;
  savePost: (post: Post) => void;
  deletePost: (id: string) => void;
  addCategory: (name: string) => boolean;
  deleteCategory: (id: string) => void;
  addTag: (name: string) => boolean;
  deleteTag: (id: string) => void;
  setCommentStatus: (id: string, status: CommentStatus) => void;
  deleteComment: (id: string) => void;
  addComment: (comment: Omit<CommentItem, "id" | "createdAt">) => void;
  addAlbum: (name: string, description?: string) => boolean;
  deleteAlbum: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  /** 发布动态（图片 / 正文 / 位置） */
  addMoment: (moment: Omit<Moment, "id" | "createdAt" | "likes" | "comments">) => void;
  deleteMoment: (id: string) => void;
  toggleMomentLike: (id: string, user: string) => void;
  addMomentComment: (id: string, comment: Omit<MomentComment, "id" | "createdAt">) => void;
  deleteMomentComment: (id: string, commentId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  toast: string | null;
  notify: (msg: string) => void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);
