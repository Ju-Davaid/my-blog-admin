import { ArrowLeft, ImagePlus, Save, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input, Select, type InputRef } from "antd";
import { MdEditor, type UploadImgCallBack } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  Field,
  IconButton,
  TextArea,
} from "@/components/ui";
import { useTheme } from "@/theme/useTheme";
import { seedState } from "@/data/seed";
import { type Category, type Post, type Tag, PostStatus } from "@/types";
import { createOrUpdatePost, getPostById, uploadFile } from "@/api";
import { useEffect } from "react";

interface EditorProps {
  isCreate?: boolean;
}

function EditorForm({ isCreate = false }: EditorProps) {
  const { mode } = useTheme();
  const navigate = useNavigate();

  /* 组件自身状态：分类 / 标签接真实数据时换成接口拉取 */
  const [categories] = useState<Category[]>(seedState.categories);
  const [tags] = useState<Tag[]>(seedState.tags);

  const [form, setForm] = useState<Post>({
    title: "",
    desc: "",
    content: "",
    categoryId: null,
    tagIds: [],
    status: PostStatus.Draft,
    cover: "",
    views: 0,
  });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<InputRef>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 设置表单值
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // 文章内容字符数
  const charCount = useMemo(
    () => form.content.replace(/\s/g, "").length,
    [form.content],
  );

  // 保存文章
  const save = async () => {
    if (!form.title.trim()) {
      setError("标题不能为空");
      titleRef.current?.focus();
      return;
    }
    console.log("保存文章", form);
    await createOrUpdatePost({
      title: form.title,
      desc: form.desc,
      content: form.content,
      categoryId: form.categoryId,
      tagIds: form.tagIds.join(","),
      status: form.status,
      cover: form.cover,
    });
  };

  // 上传图片
  const onUploadImg = async (
    files: Array<File>,
    callBack: UploadImgCallBack,
  ) => {
    const urls = await Promise.all(
      files.map(async (file) => {
        const result: any = await uploadFile(file);
        const data = result.data as { url: string };
        if (
          typeof data !== "object" ||
          data === null ||
          !("url" in data) ||
          typeof data.url !== "string" ||
          !data.url
        ) {
          throw new Error("文件上传接口未返回有效的 url");
        }
        return data.url;
      }),
    );
    callBack(urls);
  };
  // 切换标签
  const toggleTag = (id: number) =>
    set(
      "tagIds",
      form.tagIds?.includes(id)
        ? form.tagIds.filter((t) => t !== id)
        : [...(form.tagIds ?? []), id],
    );

  const pickCover = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const res = await uploadFile(f);
    set("cover", res.data.url);
  };

  const clearCover = () => {
    set("cover", "");
  };

  return (
    <div className="space-y-5">
      {/* 顶部操作条 */}
      <div className="reveal flex flex-wrap items-center gap-3">
        <Link
          to="/posts"
          className="flex items-center gap-1.5 font-display text-[12px] tracking-wider text-fog uppercase transition-colors hover:text-ember"
        >
          <ArrowLeft size={14} /> 返回列表
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex overflow-hidden rounded-md border border-line"
            role="radiogroup"
            aria-label="发布状态"
          >
            {(
              [
                { v: PostStatus.Draft, label: "草稿" },
                { v: PostStatus.Published, label: "发布" },
              ] as { v: PostStatus; label: string }[]
            ).map(({ v, label }) => (
              <button
                key={v}
                role="radio"
                aria-checked={form.status === v}
                onClick={() => set("status", v)}
                className={`min-h-9.5 cursor-pointer px-4 font-display text-[12px] tracking-wider uppercase transition-colors ${
                  form.status === v
                    ? v === PostStatus.Published
                      ? "bg-ember font-bold text-white"
                      : "bg-overlay font-bold text-gold"
                    : "text-fog hover:text-cream"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!isCreate && (
            <IconButton
              icon={Trash2}
              label="删除文章"
              danger
              onClick={() => setConfirmDelete(true)}
            />
          )}
          <Button icon={Save} onClick={save}>
            {isCreate
              ? "保存草稿"
              : form.status === PostStatus.Published
                ? "发布文章"
                : "保存修改"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="reveal rounded-md border border-ruby/40 bg-ruby/10 px-4 py-2 text-[13px] text-ruby">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ===== 主编辑区（左，占 2 栏） ===== */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="reveal reveal-1">
            <div className="border-b border-line px-2 transition-colors focus-within:border-ember">
              <Input
                ref={titleRef}
                variant="borderless"
                size="large"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="文章标题"
                aria-label="文章标题"
                className="py-2.5! text-xl! font-bold!"
              />
            </div>
            <TextArea
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
              maxLength={200}
              placeholder="摘要（可选）—— 一句话说明这篇文章为什么值得读"
              aria-label="文章摘要"
              rows={2}
              className="border-0 bg-transparent text-[13px] text-fog placeholder:text-ash focus:border-transparent resize-none"
            />
          </Card>

          <Card className="reveal reveal-2 overflow-hidden">
            <CardHeader
              title={`正文 · Markdown — ${charCount} 字`}
              extra={
                <span className="font-display text-[11px] tracking-wider text-ash uppercase">
                  Markdown 编辑器
                </span>
              }
            />
            <MdEditor
              value={form.content}
              onChange={(v) => set("content", v)}
              onUploadImg={onUploadImg}
              language="zh-CN"
              theme={mode === "dark" ? "dark" : "light"}
              previewTheme={mode === "dark" ? "github-dark" : "github"}
              codeTheme={mode === "dark" ? "github-dark" : "github"}
              toolbarsExclude={["github", "save", "catalog"]}
              noPrettier
              className="md-editor-root"
            />
          </Card>
        </div>

        {/* ===== 侧栏（右） ===== */}
        <div className="space-y-5">
          <Card className="reveal reveal-3 p-4">
            <div className="mt-4">
              <Field label="分类">
                <Select
                  value={form.categoryId}
                  onChange={(v) => set("categoryId", v)}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  style={{ width: "100%" }}
                  aria-label="选择分类"
                />
              </Field>
            </div>
          </Card>

          <Card className="reveal reveal-3 p-4">
            <Field label="标签" hint="点击切换，已选高亮">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => {
                  const on = form?.tagIds?.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                      aria-pressed={on}
                      className={`cursor-pointer rounded-sm border px-2 py-1 text-xs transition-all duration-150 ${
                        on
                          ? "border-ember bg-ember-dim text-ember"
                          : "border-line text-fog hover:border-line-strong hover:text-cream"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </Field>
            {form.tagIds && form.tagIds?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1 border-t border-dashed border-line pt-3">
                {form.tagIds.map((id) => (
                  <Badge key={id} tone="ember">
                    {tags.find((t) => t.id === id)?.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card className="reveal reveal-4 p-4">
            <Field
              label="封面图片"
              hint="支持 JPG / PNG / WebP，选图后即时预览"
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  pickCover(e.target.files);
                  e.target.value = "";
                }}
              />
              {form.cover ? (
                <div className="group relative mt-1 overflow-hidden rounded-lg border border-line">
                  <img
                    src={form.cover}
                    alt="文章封面预览"
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-[12px] font-medium text-black transition-transform hover:scale-105"
                    >
                      <ImagePlus size={14} /> 更换
                    </button>
                    <button
                      onClick={clearCover}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md bg-ruby/90 px-3 py-1.5 text-[12px] font-medium text-white transition-transform hover:scale-105"
                    >
                      <X size={14} /> 移除
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="mt-1 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong text-ash transition-colors hover:border-ember hover:text-ember"
                >
                  <ImagePlus size={22} strokeWidth={1.5} />
                  <span className="text-[12px]">点击上传封面</span>
                  <span className="text-[10px] text-ash/70">
                    无封面时将使用色相渐变图
                  </span>
                </button>
              )}
            </Field>
          </Card>

          {!isCreate && (
            <Card className="reveal reveal-4 p-4 font-display text-[11px] leading-relaxed text-ash">
              <div>ID · {form?.id ?? "草稿"}</div>
              <div>创建 · {form?.createdAt?.toLocaleString()}</div>
              <div>浏览 · {form?.views?.toLocaleString()}</div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="删除文章"
        body={`确定删除《${form?.title}》吗？相关评论会一并删除，此操作不可撤销。`}
        confirmText="删除"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => navigate("/posts")}
      />
    </div>
  );
}

export default function PostEditor({ isCreate = false }: EditorProps) {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!isCreate && id) {
      try {
        getPostById(id).then((res) => setPost(res.data));
      } catch (error: any) {
        console.error(error);
      }
    }
  }, [isCreate, id]);

  useEffect(() => {}, []);

  if (id && !post) {
    return (
      <div className="reveal">
        <Card className="p-10 text-center">
          <p className="font-display text-sm tracking-wider text-fog uppercase">
            404 · Post Not Found
          </p>
          <p className="mt-2 text-sm text-ash">这篇文章大概被风带走了。</p>
          <Link
            to="/posts"
            className="mt-4 inline-block text-ember underline-offset-4 hover:underline"
          >
            返回文章列表
          </Link>
        </Card>
      </div>
    );
  }

  return <EditorForm key={id ?? "new"} isCreate />;
}
