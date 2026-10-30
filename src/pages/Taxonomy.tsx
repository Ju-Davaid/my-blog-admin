import { FolderTree, Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card, CardHeader, EmptyState, IconButton, TextInput } from "../components/ui";
import { useStore } from "../data/hooks";

function AddRow({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string) => boolean;
}) {
  const [value, setValue] = useState("");
  const [dup, setDup] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ok = onAdd(value);
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
      <Button type="submit" icon={Plus} variant="outline" className="shrink-0">
        添加
      </Button>
      {dup && <span className="self-center text-xs whitespace-nowrap text-ruby">已存在或为空</span>}
    </form>
  );
}

export default function Taxonomy() {
  const { state, addCategory, deleteCategory, addTag, deleteTag } = useStore();

  const catCount = (id: string) => state.posts.filter((p) => p.categoryId === id).length;
  const tagCount = (id: string) => state.posts.filter((p) => p.tagIds.includes(id)).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 分类 */}
      <Card className="reveal">
        <CardHeader
          title="分类 · Categories"
          extra={<Badge tone="ember">{state.categories.length}</Badge>}
        />
        <div className="p-4">
          <AddRow placeholder="新分类名称，如：旅行" onAdd={addCategory} />
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {state.categories.length === 0 && (
            <li className="p-4">
              <EmptyState icon={FolderTree} title="还没有分类" />
            </li>
          )}
          {state.categories.map((c) => {
            const count = catCount(c.id);
            return (
              <li key={c.id} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-raised/50">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-raised font-display text-xs font-bold text-ember">
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-cream">{c.name}</div>
                  <div className="font-display text-[11px] text-ash">/{c.slug}</div>
                </div>
                <span className="tnum font-display text-xs text-fog">{count} 篇</span>
                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                  <IconButton
                    icon={Trash2}
                    label={`删除分类 ${c.name}`}
                    danger
                    onClick={() => deleteCategory(c.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-dashed border-line px-5 py-3 text-xs text-ash">
          删除分类不会删除文章，文章将标记为「未分类」。
        </p>
      </Card>

      {/* 标签 */}
      <Card className="reveal reveal-1">
        <CardHeader title="标签 · Tags" extra={<Badge tone="ember">{state.tags.length}</Badge>} />
        <div className="p-4">
          <AddRow placeholder="新标签，如：徒步" onAdd={addTag} />
        </div>
        <div className="border-t border-line p-5">
          {state.tags.length === 0 ? (
            <EmptyState icon={TagIcon} title="还没有标签" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {state.tags.map((t) => {
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
                    <span className="tnum font-display text-[10px] text-ash">{count}</span>
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
          共 {state.tags.length} 个标签 · 色点由色相随机生成，用于前端标签云配色。
        </p>
      </Card>
    </div>
  );
}
