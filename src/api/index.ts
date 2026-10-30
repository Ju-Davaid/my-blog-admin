import request from "./request";

interface CreatePostDTO {
  title: string;
  desc: string;
  content: string;
  cover: string;
  pinned: number;
  categoryId?: number;
  tagIds?: number[];
}

export const createOrUpdatePost = (data: CreatePostDTO) => {
  return request.post("/posts", data);
};

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/upload", formData);
};
