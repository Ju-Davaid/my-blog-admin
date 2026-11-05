import type { CreateAlbumDTO, CreatePhotoDTO } from "@/types/dto";
import request from "./request";
import type { AlbumVO, PageVO, PhotoVO, ResponseVO } from "@/types/vo";
import getFileMd5 from "@/utils/getFileMd5";

/**
 * 创建相册
 * @param data 相册数据
 * @returns 相册vo
 */
export const createAlbum = (data: CreateAlbumDTO) =>
  request.post<ResponseVO<AlbumVO>>("/album/create", data);

export const deleteAlbum = (id: number) =>
  request.get(`/album/delete?id=${id}`);

/**
 * 获取相册列表
 * @returns 相册列表vo
 */
export const getAlbumList = () =>
  request.get<ResponseVO<AlbumVO[]>>("/album/list");

/**
 * 创建照片
 * @param data 照片数据
 * @returns 照片vo
 */
export const createPhoto = async (data: CreatePhotoDTO) => {
  const md5 = await getFileMd5(data.file);
  const formData = new FormData();
  formData.append("md5", md5 as string);
  formData.append("file", data.file);
  formData.append("albumId", data.albumId.toString());
  return await request.post<ResponseVO<PhotoVO>>("/album/addPhoto", formData);
};

/**
 * 获取相册内照片列表
 * @param id 相册id
 * @param pageNum 页码
 * @param pageSize 每页数量
 * @returns 照片列表vo
 */
export const getPhotoFromAlbum = (id: number, pageNum = 1, pageSize = 10) =>
  request.get<ResponseVO<PageVO<PhotoVO>>>(
    `/album/getPhotoFromAlbum?pageSize=${pageSize}&pageNum=${pageNum}&id=${id}`,
  );

/**
 * 删除相册内照片
 * @param photoId 照片id
 * @param albumId 相册id
 * @returns 照片vo
 */
export const deletePhotoFromAlbum = (photoId: number, albumId: number) =>
  request.get(
    `/album/deletePhotoFromAlbum?photoId=${photoId}&albumId=${albumId}`,
  );
