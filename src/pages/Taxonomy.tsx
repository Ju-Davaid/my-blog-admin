import { Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { App } from "antd";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  TextInput,
} from "../components/ui";
import type { Post } from "../types";
import type { TagVO } from "@/api/types/vo";
import { addTag, getTagList } from "@/api/modules/tag";

function AddRow({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [dup, setDup] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(value);
    const ok = await onAdd(value);
    setDup(!ok);
    if (ok) setValue("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <TextInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDup(false);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <Button
        onClick={submit}
        type="submit"
        icon={Plus}
        variant="outline"
        className="shrink-0"
      >
        添加
      </Button>
      {dup && (
        <span className="self-center text-xs whitespace-nowrap text-ruby">
          已存在或为空
        </span>
      )}
    </form>
  );
}

export default function Taxonomy() {
  const { message } = App.useApp();
  const [tags, setTags] = useState<TagVO[]>([]);
  const [posts] = useState<Post[]>([]);

  const handleAddTag = async (name: string) => {
    try {
      const trimmed = name.trim();
      console.log(trimmed);
      if (!trimmed || tags.some((t) => t.name === trimmed)) return false;
      const newTag = {
        name: trimmed,
        hue: String(Math.floor(Math.random() * 360)),
      };
      const { data: newTagRes } = await addTag(newTag);
      setTags((prev) => [...prev, newTagRes]);
      console.log(newTagRes);
      message.success(`标签「${trimmed}」已添加`);
      return true;
    } catch (err) {
      message.error("添加标签失败");
      return false;
    }
  };

  const deleteTag = (id: number) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    message.success("标签已删除");
  };

  /* tagIds 现在是逗号分隔的字符串 */
  const tagCount = (id: number) =>
    posts.filter((p) => p.tagIds.split(",").includes(String(id))).length;
  useEffect(() => {
    getTagList()
      .then((res) => setTags(Array.isArray(res?.data) ? res.data : []))
      .catch(() => message.error("获取标签失败"));
  }, [message]);
  return (
    <div className="w-full">
      {/* 标签 */}
      <Card delay={1}>
        <CardHeader
          title="标签 · Tags"
          extra={<Badge tone="ember">{tags.length}</Badge>}
        />
        <div className="p-4">
          <AddRow placeholder="新标签，如：徒步" onAdd={handleAddTag} />
        </div>
        <div className="border-t border-line p-5">
          {tags.length === 0 ? (
            <EmptyState icon={TagIcon} title="还没有标签" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const count = tagCount(t.id);
                return (
                  <span
                    key={t.id}
                    className="group flex items-center gap-2 rounded-sm border border-line bg-raised py-1.5 pr-1.5 pl-3 text-[13px] text-fog transition-colors hover:border-line-strong hover:text-cream"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: `hsl(${t.hue} 65% 55%)` }}
                    />
                    {t.name}
                    <span className="tnum font-display text-[10px] text-ash">
                      {count}
                    </span>
                    <button
                      onClick={() => deleteTag(t.id)}
                      aria-label={`删除标签 ${t.name}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-ash opacity-0 transition-all group-hover:opacity-100 hover:bg-ruby/15 hover:text-ruby"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <p className="border-t border-dashed border-line px-5 py-3 text-xs text-ash">
          共 {tags.length} 个标签
        </p>
      </Card>
    </div>
  );
}
