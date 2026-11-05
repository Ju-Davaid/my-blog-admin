import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button as AntButton,
  Empty,
  Image,
  Input,
  Modal as AntModal,
  Skeleton,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, ConfirmDialog } from "../components/ui";
import { AlbumGridSkeleton } from "../components/PhotoSkeleton";
import { Reveal } from "../components/Reveal";
import { Trash2 } from "lucide-react";
import { createAlbum, deleteAlbum, getAlbumList } from "@/api";
import type { AlbumVO } from "@/types/vo";
import { TILE_CLASS_NAMES, TILE_STYLES } from "@/utils/photoTile";

/** 一级页面：相册列表（点卡片进入 /photos/:id 详情页） */
export default function Photos() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState<AlbumVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDeleteAlbum, setToDeleteAlbum] = useState<number | null>(null);

  // 新建相册弹窗
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const totalPhotos = useMemo(
    () => albums.reduce((sum, a) => sum + (a.count ?? 0), 0),
    [albums],
  );

  /* 删除相册 */
  const handleDeleteAlbum = useCallback(async () => {
    try {
      if (toDeleteAlbum === null) return;
      await deleteAlbum(toDeleteAlbum);
      setAlbums((prev) => prev.filter((a) => a.id !== toDeleteAlbum));
      message.success("删除相册成功");
    } catch (e) {
      message.error("删除相册失败");
      console.error(e);
    } finally {
      setToDeleteAlbum(null);
    }
  }, [toDeleteAlbum]);

  /* 创建相册 */
  const submitCreate = async () => {
    const name = newName.trim();
    if (!name) {
      message.warning("相册名称不能为空");
      return;
    }
    try {
      const res = await createAlbum({ name, desc: newDesc.trim() });
      const created = res?.data;
      if (created) setAlbums((prev) => [...prev, created]);
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      message.success("创建相册成功");
    } catch (error) {
      message.error("创建相册失败");
      console.error(error);
    }
  };

  useEffect(() => {
    let alive = true;
    getAlbumList()
      .then((res) => {
        if (alive) setAlbums(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const deleteCount =
    albums.find((a) => a.id === toDeleteAlbum)?.count ?? 0;

  return (
    <div className="space-y-5">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-cream">相册</h2>
          <div className="mt-1 flex h-4 items-center">
            {loading ? (
              <Skeleton.Input
                active
                size="small"
                style={{ width: 170, minWidth: 170, height: 12 }}
              />
            ) : (
              <p className="text-[12px] leading-none text-ash">
                共 {albums.length} 个相册 · {totalPhotos} 张照片
              </p>
            )}
          </div>
        </div>
        <AntButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          新建相册
        </AntButton>
      </Reveal>

      {loading && <AlbumGridSkeleton />}

      {!loading && albums.length === 0 && (
        <Reveal delay={1}>
          <Card className="border-dashed py-14">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-[13px] text-fog">
                  还没有相册，先创建一个吧
                </span>
              }
            >
              <AntButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateOpen(true)}
              >
                新建相册
              </AntButton>
            </Empty>
          </Card>
        </Reveal>
      )}

      {!loading && albums.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albums.map((a, i) => (
            <Reveal
              key={a.id}
              delay={Math.min(i, 7)}
              className="group cursor-pointer overflow-hidden rounded-lg border border-line bg-surface card-shadow transition-[border-color,box-shadow] duration-200 hover:border-[#409eff] hover:shadow-[0_4px_16px_rgba(64,158,255,0.12)]"
              onClick={() => navigate(`/photos/${a.id}`)}
            >
              <div className="relative aspect-4/3 overflow-hidden bg-raised">
                {a.cover ? (
                  <Image
                    src={a.cover}
                    alt={a.name}
                    loading="lazy"
                    decoding="async"
                    preview={false}
                    placeholder={<span className="photo-skeleton" />}
                    classNames={TILE_CLASS_NAMES}
                    styles={TILE_STYLES}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FolderOutlined style={{ fontSize: 40, color: "#c0c4cc" }} />
                  </div>
                )}
                <span className="absolute right-2 bottom-2 z-10 rounded-md px-2 py-0.5 text-[11px] font-medium text-white">
                  {a.count} 张
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDeleteAlbum(a.id);
                  }}
                  aria-label={`删除相册 ${a.name}`}
                  className="absolute top-2 right-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-[#f56c6c]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <FolderOutlined style={{ color: "#409eff", fontSize: 13 }} />
                  <h3 className="truncate text-[14px] font-medium text-cream">
                    {a.name}
                  </h3>
                </div>
                <p className="mt-1 line-clamp-1 text-[12px] text-ash">
                  {a.desc || "暂无描述"}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* 新建相册弹窗 */}
      <AntModal
        open={createOpen}
        title="新建相册"
        onCancel={() => setCreateOpen(false)}
        onOk={submitCreate}
        okText="创建"
        cancelText="取消"
        width={420}
        destroyOnHidden
      >
        <div className="space-y-4 py-2">
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-fog">
              相册名称
            </span>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：2026 秋 · 京都"
              onPressEnter={submitCreate}
              autoFocus
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-fog">
              描述（可选）
            </span>
            <Input.TextArea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="一句话说明这个相册"
              rows={2}
            />
          </div>
        </div>
      </AntModal>

      {/* 删除相册确认 */}
      <ConfirmDialog
        open={toDeleteAlbum !== null}
        title="删除相册"
        body={`确定删除相册《${albums.find((a) => a.id === toDeleteAlbum)?.name ?? ""}》吗？相册内的 ${deleteCount} 张图片也会一并删除，此操作不可撤销。`}
        confirmText="删除"
        onCancel={() => setToDeleteAlbum(null)}
        onConfirm={handleDeleteAlbum}
      />
    </div>
  );
}
