import { Database, Globe, ImagePlus, RotateCcw, Save, Trash2, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { Badge, Button, Card, CardHeader, ConfirmDialog, Field, TextArea, TextInput, UserAvatar } from "../components/ui";
import { useStore } from "../data/hooks";
import type { Settings } from "../types";

export default function SettingsPage() {
  const { state, updateSettings, resetAll, notify } = useStore();
  const [form, setForm] = useState<Settings>({ ...state.settings });
  const [confirmReset, setConfirmReset] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickAvatar = (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    set("avatar", URL.createObjectURL(f));
  };

  const clearAvatar = () => {
    if (form.avatar) URL.revokeObjectURL(form.avatar);
    set("avatar", "");
  };

  const displayName = form.username.trim() || "DAVAID";
  const liveName = state.settings.username?.trim() || "DAVAID";

  const save = () => {
    if (!form.siteTitle.trim()) {
      notify("站点标题不能为空");
      return;
    }
    if (!form.username.trim()) {
      notify("用户名不能为空");
      return;
    }
    updateSettings(form);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Card className="reveal">
          <CardHeader title="站点信息 · Site" extra={<Globe size={14} className="text-ash" />} />
          <div className="space-y-4 p-5">
            <Field label="站点标题">
              <TextInput value={form.siteTitle} onChange={(e) => set("siteTitle", e.target.value)} />
            </Field>
            <Field label="Slogan">
              <TextInput value={form.slogan} onChange={(e) => set("slogan", e.target.value)} />
            </Field>
            <Field label="站点描述">
              <TextArea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="备案号">
              <TextInput value={form.icp} onChange={(e) => set("icp", e.target.value)} />
            </Field>
            <div className="flex items-center gap-3 border-t border-dashed border-line pt-4">
              <Button icon={Save} onClick={save}>
                保存更改
              </Button>
              <span className="text-xs text-ash">更改即时持久化到浏览器本地</span>
            </div>
          </div>
        </Card>

        <Card className="reveal reveal-1">
          <CardHeader title="账号 · Account" extra={<UserRound size={14} className="text-ash" />} />
          <div className="space-y-4 p-5">
            {/* 头像 */}
            <div>
              <span className="mb-1.5 block text-[12px] font-medium text-fog">头像</span>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  aria-label="更换头像"
                  title="更换头像"
                  className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line bg-raised"
                >
                  {form.avatar ? (
                    <img src={form.avatar} alt="头像预览" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-lg font-bold text-fog">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    更换
                  </span>
                </button>

                <div className="min-w-48 flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      icon={ImagePlus}
                      className="min-h-[30px] text-xs"
                      onClick={() => avatarRef.current?.click()}
                    >
                      上传头像
                    </Button>
                    {form.avatar && (
                      <Button variant="ghost" icon={Trash2} onClick={clearAvatar}>
                        移除
                      </Button>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-ash">
                    支持 JPG / PNG，建议 1:1 方图。演示环境无真实存储，头像仅在当前会话有效，刷新后需重新上传。
                  </p>
                </div>

                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  hidden
                  aria-label="选择头像文件"
                  onChange={(e) => {
                    pickAvatar(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <Field label="用户名" hint="用于后台右上角显示与评论回复署名">
              <TextInput
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="例如：DAVAID"
                maxLength={24}
              />
            </Field>

            <div className="flex items-center gap-3 border-t border-dashed border-line pt-4">
              <Button icon={Save} onClick={save}>
                保存更改
              </Button>
              <span className="text-xs text-ash">当前：{displayName}</span>
            </div>
          </div>
        </Card>

        <Card className="reveal reveal-2">
          <CardHeader title="联系与社交 · Links" />
          <div className="space-y-4 p-5">
            <Field label="GitHub">
              <TextInput value={form.github} onChange={(e) => set("github", e.target.value)} />
            </Field>
            <Field label="邮箱">
              <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <div className="flex items-center gap-3 border-t border-dashed border-line pt-4">
              <Button icon={Save} variant="outline" onClick={save}>
                保存更改
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="reveal reveal-3">
          <CardHeader title="当前生效 · Live" />
          <div className="space-y-4 p-5">
            {/* 头像 + 用户名 */}
            <div className="flex items-center gap-3">
              <UserAvatar name={liveName} src={state.settings.avatar} size={40} />
              <div className="min-w-0">
                <div className="font-display text-[10px] tracking-[0.18em] text-ash uppercase">Author</div>
                <p className="truncate font-display text-[15px] font-bold tracking-wide">{liveName}</p>
              </div>
            </div>
            <div>
              <div className="mb-1 font-display text-[10px] tracking-[0.18em] text-ash uppercase">Title</div>
              <p className="font-display text-lg font-bold tracking-wide">{state.settings.siteTitle}</p>
            </div>
            <div>
              <div className="mb-1 font-display text-[10px] tracking-[0.18em] text-ash uppercase">Slogan</div>
              <p className="border-l-2 border-ember pl-3 text-sm text-fog italic">{state.settings.slogan}</p>
            </div>
            <div>
              <div className="mb-1 font-display text-[10px] tracking-[0.18em] text-ash uppercase">Description</div>
              <p className="text-sm leading-relaxed text-fog">{state.settings.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-dashed border-line pt-4">
              <Badge tone="neutral">{state.settings.icp}</Badge>
              <Badge tone="haze">{state.settings.github.replace(/^https?:\/\//, "")}</Badge>
              <Badge tone="haze">{state.settings.email}</Badge>
            </div>
          </div>
        </Card>

        <Card className="reveal reveal-4">
          <CardHeader
            title="数据 · Data"
            extra={<Database size={14} className="text-ash" />}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="max-w-64 text-xs leading-relaxed text-ash">
              所有演示数据（文章、评论、照片、设置）保存在浏览器 localStorage，可一键恢复初始种子数据。
            </p>
            <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
              重置演示数据
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="重置演示数据"
        body="将清除本地所有改动（新增、编辑、删除全部回滚），恢复初始演示数据。确定继续吗？"
        confirmText="重置"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          resetAll();
        }}
      />
    </div>
  );
}
