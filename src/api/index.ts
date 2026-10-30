import type { Post } from "@/types";
import request from "./request";

type _CreatePostDTO = Omit<
  Post,
  "id" | "createdAt" | "updatedAt" | "pinned" | "views" | "tagIds"
>;

interface CreatePostDTO extends _CreatePostDTO {
  tagIds: string;
}

export const createOrUpdatePost = (data: CreatePostDTO) => {
  return request.post("/post/create", data);
};

export const getPostById = (id: string) => request.get(`/posts/${id}`);

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/upload", formData);
};
