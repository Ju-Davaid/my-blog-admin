import { getCaptcha, login, refreshCaptcha } from "@/api";
import type { CaptchaVO } from "@/api/types/vo";
import { setTokens } from "@/utils/token";
import {
  LockOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button as AntButton, Input, message } from "antd";
import { useState, useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("test");
  const [pass, setPass] = useState("123456");
  const [captchaCode, setCaptchaCode] = useState<string>("");
  const [captcha, setCaptcha] = useState<CaptchaVO>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!user.trim() || !pass.trim()) {
        setError("请输入用户名和密码");
        return;
      }
      if (!captchaCode.trim()) {
        setError("请输入图片验证码");
        return;
      }
      setError("");
      setLoading(true);
      const { data: loginRes } = await login({
        username: user.trim(),
        password: pass.trim(),
        captcha: captchaCode.trim(),
        captchaKey: captcha?.captchaKey || "",
      });
      setTokens({
        accessToken: loginRes.accessToken,
        refreshToken: loginRes.refreshToken,
        userInfo: {
          username: loginRes.username,
          role: loginRes.role,
        },
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      message.error("登录失败");
    } finally {
      setLoading(false);
    }
  };
  // 获取验证码
  const handleGetCaptcha = async (captchaKey?: string) => {
    let captchaData;
    if (!captchaKey) {
      captchaData = await getCaptcha({ width: 120, height: 40 });
    } else {
      captchaData = await refreshCaptcha({
        captchaKey: captchaKey,
        width: 120,
        height: 40,
      });
    }
    setCaptcha(captchaData.data);
  };
  useEffect(() => {
    handleGetCaptcha();
  }, []);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      {/* 背景装饰：右上蓝色光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 30rem at 85% 0%, rgba(64,158,255,0.08), transparent 60%), radial-gradient(32rem 26rem at 0% 100%, rgba(230,162,60,0.05), transparent 60%)",
        }}
      />

      <Reveal className="relative z-10 w-full max-w-sm">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#409eff] to-[#66b1ff] text-lg font-extrabold text-white">
            D
          </span>
          <div>
            <div className="text-base font-bold tracking-wide text-cream">
              DAVAID BLOG
            </div>
            <div className="text-[11px] tracking-[0.2em] text-ash uppercase">
              Console / 控制台
            </div>
          </div>
        </div>

        <Reveal
          as="form"
          onSubmit={submit}
          delay={1}
          className="card-shadow rounded-xl border border-line bg-surface p-7"
        >
          <h1 className="mb-1 text-[17px] font-semibold text-cream">
            欢迎回来
          </h1>
          <p className="mb-6 text-[13px] text-ash">
            登录博客后台，继续你的写作。
          </p>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12px] font-medium text-fog">
              用户名
            </span>
            <Input
              prefix={<UserOutlined style={{ color: "#8f959e" }} />}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              size="large"
              placeholder="请输入用户名"
            />
          </label>
          <label className="mb-2 block">
            <span className="mb-1.5 block text-[12px] font-medium text-fog">
              密码
            </span>
            <Input.Password
              prefix={<LockOutlined style={{ color: "#8f959e" }} />}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              size="large"
              placeholder="请输入密码"
            />
          </label>

          {/* 图片验证码 */}
          <label className="mb-2 block">
            <span className="mb-1.5 flex items-baseline justify-between text-[12px] font-medium text-fog">
              验证码
              <span className="text-[11px] font-normal text-ash">
                不区分大小写 · 点击图片刷新
              </span>
            </span>
            <div className="flex items-stretch gap-2">
              <Input
                prefix={
                  <SafetyCertificateOutlined style={{ color: "#8f959e" }} />
                }
                value={captchaCode}
                onChange={(e) => {
                  setCaptchaCode(e.target.value);
                  setError("");
                }}
                autoComplete="off"
                maxLength={4}
                size="large"
                placeholder="请输入右侧 4 位字符"
                aria-label="图片验证码"
              />
              <button
                type="button"
                onClick={() => handleGetCaptcha(captcha?.captchaKey)}
                title="看不清？换一张"
                aria-label="刷新验证码"
                className="group relative h-10 w-30 shrink-0 cursor-pointer overflow-hidden rounded-md border border-line bg-raised text-cream transition-colors hover:border-ember"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: captcha?.captchaImg || "",
                  }}
                ></div>
                {/* hover 时盖一层刷新提示 */}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1 bg-ink/80 text-[11px] text-cream opacity-0 transition-opacity group-hover:opacity-100">
                  <ReloadOutlined /> 换一张
                </span>
              </button>
            </div>
          </label>

          {error && <p className="mb-3 text-[13px] text-ruby">{error}</p>}

          <AntButton
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className="mt-4"
          >
            {loading ? "验证中…" : "进入工作台"}
          </AntButton>
        </Reveal>

        <Reveal as="p" delay={2} className="mt-6 text-center text-xs leading-relaxed text-ash">
          在这里存放一些写不完的代码、拍不满的照片、
          <br />
          和偶尔想明白的道理。
        </Reveal>
      </Reveal>
    </div>
  );
}
