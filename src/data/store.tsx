import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Album, AppState, CommentItem, CommentStatus, Photo, Post, Settings } from "../types";
import { slugify } from "../utils/slug";
import { StoreContext, type StoreContextValue } from "./context";
import { seedState } from "./seed";

const STORAGE_KEY = "davaid-admin-state-v1";

/* ---------- Action ---------- */

type Action =
  | { type: "post/upsert"; post: Post }
  | { type: "post/delete"; id: string }
  | { type: "category/add"; item: AppState["categories"][number] }
  | { type: "category/delete"; id: string }
  | { type: "tag/add"; item: AppState["tags"][number] }
  | { type: "tag/delete"; id: string }
  | { type: "comment/setStatus"; id: string; status: CommentStatus }
  | { type: "comment/delete"; id: string }
  | { type: "comment/add"; comment: CommentItem }
  | { type: "photo/add"; photo: Photo }
  | { type: "photo/delete"; id: string }
  | { type: "album/add"; album: Album }
  | { type: "album/delete"; id: string }
  | { type: "settings/update"; patch: Partial<Settings> }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "post/upsert": {
      const exists = state.posts.some((p) => p.id === action.post.id);
      return {
        ...state,
        posts: exists
          ? state.posts.map((p) => (p.id === action.post.id ? action.post : p))
          : [action.post, ...state.posts],
      };
    }
    case "post/delete":
      return {
        ...state,
        posts: state.posts.filter((p) => p.id !== action.id),
        comments: state.comments.filter((c) => c.postId !== action.id),
      };
    case "category/add":
      return { ...state, categories: [...state.categories, action.item] };
    case "category/delete":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.id) };
    case "tag/add":
      return { ...state, tags: [...state.tags, action.item] };
    case "tag/delete":
      return { ...state, tags: state.tags.filter((t) => t.id !== action.id) };
    case "comment/setStatus":
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c,
        ),
      };
    case "comment/delete":
      return { ...state, comments: state.comments.filter((c) => c.id !== action.id) };
    case "comment/add":
      return { ...state, comments: [action.comment, ...state.comments] };
    case "photo/add":
      return { ...state, photos: [action.photo, ...state.photos] };
    case "photo/delete":
      return { ...state, photos: state.photos.filter((p) => p.id !== action.id) };
    case "album/add":
      return { ...state, albums: [...state.albums, action.album] };
    case "album/delete":
      return {
        ...state,
        albums: state.albums.filter((a) => a.id !== action.id),
        photos: state.photos.filter((p) => p.albumId !== action.id),
      };
    case "settings/update":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "reset":
      return structuredClone(seedState);
    default:
      return state;
  }
}

/* ---------- 持久化 ---------- */

/* 从旧版（photo.album 字符串 / 缺 albums 字段）迁移到新版（albumId + albums 数组） */
function migrate(state: AppState): AppState {
  const photos = Array.isArray(state.photos) ? state.photos : [];

  // 1. 旧字段 photo.album（字符串）→ albumId + 按名称生成相册
  const anyLegacy = photos.some(
    (p) => (p as unknown as {album?: string}).album !== undefined,
  );
  if (anyLegacy) {
    const albumIdByName = new Map<string, string>();
    const albums: Album[] = [];
    for (const p of photos) {
      const legacy = (p as unknown as {album?: string}).album;
      if (!legacy) continue;
      if (!albumIdByName.has(legacy)) {
        const id = `al-${legacy}`;
        albumIdByName.set(legacy, id);
        albums.push({id, name: legacy, description: "", createdAt: new Date().toISOString()});
      }
    }
    const migratedPhotos = photos.map((p) => {
      const legacy = (p as unknown as {album?: string}).album;
      const {album: _drop, ...rest} = p as unknown as {album?: string} & Photo;
      void _drop;
      return {...rest, albumId: albumIdByName.get(legacy ?? "") ?? "al-未分类"};
    });
    return {...state, albums, photos: migratedPhotos};
  }

  // 2. 已有 albumId 但缺 albums 字段 → 兜底保证 albums 存在
  if (!Array.isArray(state.albums)) {
    const albumIdByName = new Map<string, string>();
    const albums: Album[] = [];
    for (const p of photos) {
      const id = (p as unknown as {albumId?: string}).albumId;
      if (!id) continue;
      if (!albumIdByName.has(id)) {
        albumIdByName.set(id, id);
        albums.push({id, name: id.replace(/^al-/, ""), description: "", createdAt: new Date().toISOString()});
      }
    }
    return {...state, albums};
  }

  return state;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (Array.isArray(parsed.posts)) {
        return migrate(parsed);
      }
    }
  } catch {
    /* 损坏则回退种子 */
  }
  return structuredClone(seedState);
}

/* ---------- Provider ---------- */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 存储满时静默失败 */
    }
  }, [state]);

  const notify = useCallback((msg: string) => {
    window.clearTimeout(timer.current);
    setToast(msg);
    timer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      savePost: (post) => {
        dispatch({ type: "post/upsert", post });
        notify(post.status === "published" ? "文章已发布" : "草稿已保存");
      },
      deletePost: (id) => {
        dispatch({ type: "post/delete", id });
        notify("文章已删除");
      },
      addCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return false;
        if (state.categories.some((c) => c.name === trimmed)) return false;
        dispatch({
          type: "category/add",
          item: {
            id: `cat-${Date.now().toString(36)}`,
            name: trimmed,
            slug: slugify(trimmed) || trimmed,
            description: "",
          },
        });
        notify("分类已添加");
        return true;
      },
      deleteCategory: (id) => {
        dispatch({ type: "category/delete", id });
        notify("分类已删除");
      },
      addTag: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return false;
        if (state.tags.some((t) => t.name === trimmed)) return false;
        dispatch({
          type: "tag/add",
          item: {
            id: `tag-${Date.now().toString(36)}`,
            name: trimmed,
            slug: slugify(trimmed) || trimmed,
            hue: Math.floor(Math.random() * 360),
          },
        });
        notify("标签已添加");
        return true;
      },
      deleteTag: (id) => {
        dispatch({ type: "tag/delete", id });
        notify("标签已删除");
      },
      setCommentStatus: (id, status) => {
        dispatch({ type: "comment/setStatus", id, status });
        notify(
          status === "approved" ? "评论已通过" : status === "spam" ? "已移入垃圾" : "评论已更新",
        );
      },
      deleteComment: (id) => {
        dispatch({ type: "comment/delete", id });
        notify("评论已删除");
      },
      addComment: (comment) => {
        dispatch({
          type: "comment/add",
          comment: {
            ...comment,
            id: `c-${Date.now().toString(36)}`,
            createdAt: new Date().toISOString(),
          },
        });
        notify("回复已发布");
      },
      addAlbum: (name, description = "") => {
        const trimmed = name.trim();
        if (!trimmed) return false;
        if (state.albums.some((a) => a.name === trimmed)) return false;
        dispatch({
          type: "album/add",
          album: {
            id: `al-${Date.now().toString(36)}`,
            name: trimmed,
            description: description.trim(),
            createdAt: new Date().toISOString(),
          },
        });
        notify("相册已创建");
        return true;
      },
      deleteAlbum: (id) => {
        dispatch({ type: "album/delete", id });
        notify("相册已删除");
      },
      addPhoto: (photo) => {
        dispatch({ type: "photo/add", photo });
        notify("照片已上传");
      },
      deletePhoto: (id) => {
        dispatch({ type: "photo/delete", id });
        notify("照片已删除");
      },
      updateSettings: (patch) => {
        dispatch({ type: "settings/update", patch });
        notify("设置已保存");
      },
      resetAll: () => {
        dispatch({ type: "reset" });
        notify("已重置为演示数据");
      },
      toast,
      notify,
    }),
    [state, toast, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
