import getFileMd5 from "@/utils/getFileMd5";
import request from "./request";

/**
 * 单上传文件
 * @param file 文件
 */
export const uploadFile = async (file: File) => {
  const md5 = await getFileMd5(file);
  const formData = new FormData();
  formData.append("md5", md5 as string);
  formData.append("file", file);
  return request.post("/upload", formData);
};

export const uploadMultipleFile = async (files: File[]) => {
  const md5 = await Promise.all(files.map((file) => getFileMd5(file)));
  const formData = new FormData();
  md5.forEach((item, index) => {
    formData.append("md5", item);
    formData.append("files", files[index]);
  });
  return request.post("/upload/batch", formData);
};
