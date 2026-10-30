import { Database, Globe, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, ConfirmDialog, Field, TextArea, TextInput } from "../components/ui";
import { useStore } from "../data/hooks";
import type { Settings } from "../types";

export default function SettingsPage() {
  const { state, updateSettings, resetAll, notify } = useStore();
  const [form, setForm] = useState<Settings>({ ...state.settings });
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!form.siteTitle.trim()) {
      notify("站点标题不能为空");
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
        <Card className="reveal reveal-2">
          <CardHeader title="当前生效 · Live" />
          <div className="space-y-4 p-5">
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

        <Card className="reveal reveal-3">
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
