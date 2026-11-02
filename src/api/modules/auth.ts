import request from "@/api/modules/request";
import type { LoginDTO, CaptchaDTO, RefreshCaptchaDTO } from "@/api/types/dto";
import type { CaptchaVO, ResposneVO, LoginVO } from "@/api/types/vo";

export const login = (data: LoginDTO) =>
  request.post<ResposneVO<LoginVO>>("/auth/login", data);

export const getCaptcha = ({ width = 120, height = 40 }: CaptchaDTO) =>
  request.get<ResposneVO<CaptchaVO>>(
    `/auth/captcha?width=${width}&height=${height}`,
  );

export const refreshCaptcha = ({
  width = 120,
  height = 40,
  captchaKey,
}: RefreshCaptchaDTO) =>
  request.get<ResposneVO<CaptchaVO>>(
    `/auth/refreshCaptcha?width=${width}&height=${height}&captchaKey=${captchaKey}`,
  );
