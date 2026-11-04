import request from "@/api/modules/request";
import type { LoginDTO, CaptchaDTO, RefreshCaptchaDTO } from "@/types/dto";
import type { CaptchaVO, ResponseVO, LoginVO } from "@/types/vo";

/**
 * 登录
 * @param data 登录数据
 */
export const login = (data: LoginDTO) =>
  request.post<ResponseVO<LoginVO>>("/auth/login", data);

/**
 * 获取验证码
 * @param width 验证码宽度
 * @param height 验证码高度
 */
export const getCaptcha = ({ width = 120, height = 40 }: CaptchaDTO) =>
  request.get<ResponseVO<CaptchaVO>>(
    `/auth/captcha?width=${width}&height=${height}`,
  );

/**
 * 刷新验证码
 * @param width 验证码宽度
 * @param height 验证码高度
 * @param captchaKey 验证码key
 */
export const refreshCaptcha = ({
  width = 120,
  height = 40,
  captchaKey,
}: RefreshCaptchaDTO) =>
  request.get<ResponseVO<CaptchaVO>>(
    `/auth/refreshCaptcha?width=${width}&height=${height}&captchaKey=${captchaKey}`,
  );

/**
 * 退出登录
 */
export const logout = () => request.post("/auth/logout");
