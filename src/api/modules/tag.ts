import type { CreateTagDTO } from "@/types/dto";
import type { ResponseVO, TagVO } from "@/types/vo";
import request from "./request";

/**
 * 获取标签列表
 */
export const getTagList = () => request.get<ResponseVO<TagVO[]>>("/tag/list");

/**
 * 添加标签
 * @param data 标签数据
 */
export const addTag = (data: CreateTagDTO) =>
  request.post<ResponseVO<TagVO>>("/tag/create", data);

/**
 * 删除标签
 * @param id 标签id
 */
export const deleteTag = (id: number) =>
  request.get<ResponseVO<TagVO>>(`/tag/delete?id=${id}`);
/**
 * 批量删除标签
 * @param ids 标签id列表
 */
export const deleteTagBatch = (ids: number[]) =>
  request.get<ResponseVO<TagVO[]>>(`/tag/delete/batch?ids=${ids.join(",")}`);
