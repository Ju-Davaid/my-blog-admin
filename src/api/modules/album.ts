import type { CreateAlbumDTO } from "@/types/dto";
import request from "./request";
import type { AlbumVO, ResponseVO } from "@/types/vo";

/**
 * 创建相册
 * @param data 相册数据
 * @returns 相册vo
 */
export const createAlbum = (data: CreateAlbumDTO) =>
  request.post<ResponseVO<AlbumVO>>("/album/create", data);
