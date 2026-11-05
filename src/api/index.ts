import getFileMd5 from "@/utils/getFileMd5";
import request from "./modules/request";

export * from "./modules/auth";
export * from "./modules/tag";
export * from "./modules/post";
export * from "./modules/album";

/**
 * 上传文件
 * @param file 文件
 */
export const uploadFile = async (file: File) => {
  const md5 = await getFileMd5(file);
  const formData = new FormData();
  formData.append("md5", md5 as string);
  formData.append("file", file);
  return request.post("/upload", formData);
};
