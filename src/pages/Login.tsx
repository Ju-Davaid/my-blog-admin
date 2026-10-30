import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Button as AntButton, Input} from "antd";
import {useState, type FormEvent} from "react";

export default function Login({onLogin}: {onLogin: () => void}) {
  const [user, setUser] = useState("davaid");
  const [pass, setPass] = useState("········");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) {
      setError("请输入用户名和密码");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      sessionStorage.setItem("davaid-admin-auth", "1");
      onLogin();
    }, 450);
  };

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

      <div className="reveal relative z-10 w-full max-w-sm">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#409eff] to-[#66b1ff] text-lg font-extrabold text-white">
            D
          </span>
          <div>
            <div className="text-base font-bold tracking-wide text-cream">DAVAID BLOG</div>
            <div className="text-[11px] tracking-[0.2em] text-ash uppercase">Console / 控制台</div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="card-shadow reveal reveal-1 rounded-xl border border-line bg-surface p-7"
        >
          <h1 className="mb-1 text-[17px] font-semibold text-cream">欢迎回来</h1>
          <p className="mb-6 text-[13px] text-ash">登录博客后台，继续你的写作。</p>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12px] font-medium text-fog">用户名</span>
            <Input
              prefix={<UserOutlined style={{color: "#8f959e"}} />}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              size="large"
              placeholder="请输入用户名"
            />
          </label>
          <label className="mb-2 block">
            <span className="mb-1.5 block text-[12px] font-medium text-fog">密码</span>
            <Input.Password
              prefix={<LockOutlined style={{color: "#8f959e"}} />}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              size="large"
              placeholder="请输入密码"
            />
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

          <p className="mt-4 text-center text-[12px] text-ash">演示环境 · 任意账号密码即可登录</p>
        </form>

        <p className="reveal reveal-2 mt-6 text-center text-xs leading-relaxed text-ash">
          在这里存放一些写不完的代码、拍不满的照片、
          <br />
          和偶尔想明白的道理。
        </p>
      </div>
    </div>
  );
}
