import { createContext } from "react";
import type { AppState, CommentItem, CommentStatus, Photo, Post, Settings } from "../types";

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
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  toast: string | null;
  notify: (msg: string) => void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);
