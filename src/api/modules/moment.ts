import type { CreateMommentDTO } from "@/types/dto";
import request from "./request";
import type { MomentVO, PageVO, ResponseVO } from "@/types/vo";

/**
 * 创建动态
 * @param data 创建动态DTO
 */
export const createMomment = async (data: CreateMommentDTO) => {
  return await request.post<ResponseVO<MomentVO>>("/moment/create", data);
};

/**
 * 获取动态列表
 * @param pageNum 页码
 * @param pageSize 每页数量
 */
export const getMomentList = async (
  pageNum: number = 1,
  pageSize: number = 10,
) => {
  return await request.get<ResponseVO<PageVO<MomentVO>>>(
    `/moment/list?pageNum=${pageNum}&pageSize=${pageSize}`,
  );
};

/**
 * 删除动态
 * @param id 动态ID
 */
export const deleteMomentById = async (id: number) => {
  return await request.get(`/moment/delete?id=${id}`);
};
