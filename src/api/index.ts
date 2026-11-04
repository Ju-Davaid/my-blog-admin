import request from "./modules/request";

export * from "./modules/auth";
export * from "./modules/tag";
export * from "./modules/post";

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/upload", formData);
};
