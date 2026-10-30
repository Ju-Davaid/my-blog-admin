import {
  ArrowLeftOutlined,
  FolderOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Empty,
  Input,
  Modal as AntModal,
  Button as AntButton,
  Image,
} from "antd";
import { useMemo, useRef, useState } from "react";
import { Card, ConfirmDialog, IconButton } from "../components/ui";
import { Trash2 } from "lucide-react";
import { useStore } from "../data/hooks";
import type { Photo } from "../types";

/* ---------- 兜底图：没有上传文件时按标题散列出色相，现造一张渐变 SVG ---------- */
/* 用 SVG dataURL 而不是纯 CSS 渐变，是为了让它成为真实图片源，
   这样 antd Image 的懒加载与放大预览对兜底图同样成立 */

const gradientCache = new Map<string, string>();

function hashHue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}

function gradientSrc(seed: string) {
  const cached = gradientCache.get(seed);
  if (cached) return cached;

  const h1 = hashHue(seed);
  const h2 = (h1 + 52) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${h1} 34% 42%)"/>` +
    `<stop offset="0.55" stop-color="hsl(${h2} 28% 26%)"/>` +
    `<stop offset="1" stop-color="hsl(${h1} 42% 15%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="600" fill="url(#g)"/>` +
    `<circle cx="632" cy="128" r="176" fill="hsl(${h2} 72% 76%)" opacity="0.16"/>` +
    `<circle cx="128" cy="516" r="212" fill="hsl(${h1} 68% 62%)" opacity="0.12"/>` +
    `</svg>`;

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  gradientCache.set(seed, url);
  return url;
}

const photoSrc = (p: Photo) => p.src ?? gradientSrc(p.id);

/* 铺满父容器的图片壳：antd Image 外层是 .ant-image，需显式撑满 */
const TILE_CLASS_NAMES = { root: "photo-tile", image: "photo-tile-img" };
const TILE_STYLES = {
  root: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
  } as const,
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as const,
};

export default function Photos() {
  const { state, addAlbum, deleteAlbum, addPhoto, deletePhoto } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  // 当前进入的相册 id；null = 一级（相册列表）
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [toDeleteAlbum, setToDeleteAlbum] = useState<string | null>(null);
  const [toDeletePhoto, setToDeletePhoto] = useState<string | null>(null);

  // 新建相册弹窗
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const currentAlbum = useMemo(
    () => state.albums?.find((a) => a.id === currentAlbumId) ?? null,
    [state.albums, currentAlbumId],
  );
  const albumPhotos = useMemo(
    () =>
      currentAlbumId
        ? state.photos.filter((p) => p.albumId === currentAlbumId)
        : [],
    [state.photos, currentAlbumId],
  );

  const photoCount = (albumId: string) =>
    state.photos.filter((p) => p.albumId === albumId).length;

  const onUpload = (files: FileList | null) => {
    if (!files || !currentAlbumId) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f, i) => {
        const photo: Photo = {
          id: `ph-${Date.now().toString(36)}-${i}`,
          title: f.name.replace(/\.[^.]+$/, ""),
          albumId: currentAlbumId,
          src: URL.createObjectURL(f),
          takenAt: new Date().toISOString().slice(0, 10),
        };
        addPhoto(photo);
      });
    if (fileRef.current) fileRef.current.value = "";
  };

  const submitCreate = () => {
    if (!addAlbum(newName, newDesc)) return;
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
  };

  /* ============ 二级：相册详情（查看图片 + 上传） ============ */
  if (currentAlbum) {
    return (
      <div className="space-y-5">
        <div className="reveal flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AntButton
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentAlbumId(null)}
            >
              返回相册
            </AntButton>
            <div>
              <h2 className="text-[16px] font-semibold text-cream">
                {currentAlbum.name}
              </h2>
              <p className="text-[12px] text-ash">
                {currentAlbum.description || "暂无描述"} · {albumPhotos.length}{" "}
                张照片
              </p>
            </div>
          </div>
          <AntButton
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileRef.current?.click()}
          >
            添加图片
          </AntButton>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onUpload(e.target.files)}
            aria-label="选择图片文件"
          />
        </div>

        {albumPhotos.length === 0 ? (
          <div className="reveal reveal-1">
            <Card className="border-dashed py-14">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-[13px] text-fog">
                    这个相册还没有图片
                  </span>
                }
              >
                <AntButton
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => fileRef.current?.click()}
                >
                  添加图片
                </AntButton>
              </Empty>
            </Card>
          </div>
        ) : (
          /* PreviewGroup 让同相册内所有图片共用一个预览器：左右切换、缩放、旋转 */
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {albumPhotos.map((p, i) => (
                <figure
                  key={p.id}
                  className="reveal group relative aspect-4/3 overflow-hidden rounded-lg border border-line bg-raised transition-colors hover:border-line-strong"
                  style={{ animationDelay: `${Math.min(i, 7) * 0.05}s` }}
                >
                  <Image
                    src={photoSrc(p)}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    placeholder={<span className="photo-skeleton" />}
                    classNames={TILE_CLASS_NAMES}
                    styles={TILE_STYLES}
                  />

                  {/* 底部信息条：不拦截点击，好让点图直接开预览 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-8">
                    <figcaption className="truncate text-[13px] font-medium text-white">
                      {p.title}
                    </figcaption>
                    <span className="tnum text-[10px] text-white/60">
                      {p.takenAt}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <IconButton
                      icon={Trash2}
                      label={`删除图片 ${p.title}`}
                      danger
                      className="border border-white/20 bg-black/50 text-white backdrop-blur"
                      onClick={() => setToDeletePhoto(p.id)}
                    />
                  </div>
                </figure>
              ))}
            </div>
          </Image.PreviewGroup>
        )}

        {/* 删除图片确认 */}
        <ConfirmDialog
          open={toDeletePhoto !== null}
          title="删除图片"
          body={`确定删除《${state.photos.find((p) => p.id === toDeletePhoto)?.title ?? ""}》吗？此操作不可撤销。`}
          confirmText="删除"
          onCancel={() => setToDeletePhoto(null)}
          onConfirm={() => {
            if (toDeletePhoto) deletePhoto(toDeletePhoto);
            setToDeletePhoto(null);
          }}
        />
      </div>
    );
  }

  /* ============ 一级：相册列表 ============ */
  return (
    <div className="space-y-5">
      <div className="reveal flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-cream">相册</h2>
          <p className="text-[12px] text-ash">
            共 {state.albums.length} 个相册 · {state.photos.length} 张照片
          </p>
        </div>
        <AntButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          新建相册
        </AntButton>
      </div>

      {state.albums.length === 0 ? (
        <div className="reveal reveal-1">
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
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {state.albums.map((a, i) => {
            const count = photoCount(a.id);
            const cover = state.photos.find((p) => p.albumId === a.id);
            return (
              <div
                key={a.id}
                className="reveal group cursor-pointer overflow-hidden rounded-lg border border-line bg-surface card-shadow transition-all hover:border-[#409eff] hover:shadow-[0_4px_16px_rgba(64,158,255,0.12)]"
                style={{ animationDelay: `${Math.min(i, 7) * 0.05}s` }}
                onClick={() => setCurrentAlbumId(a.id)}
              >
                <div className="relative aspect-4/3 overflow-hidden bg-raised">
                  {cover ? (
                    /* preview={false}：封面点击留给「进入相册」，只借 Image 的懒加载 */
                    <Image
                      src={photoSrc(cover)}
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
                      <FolderOutlined
                        style={{ fontSize: 40, color: "#c0c4cc" }}
                      />
                    </div>
                  )}
                  <span className="absolute right-2 bottom-2 z-10 rounded-md px-2 py-0.5 text-[11px] font-medium text-white">
                    {count} 张
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
                    <FolderOutlined
                      style={{ color: "#409eff", fontSize: 13 }}
                    />
                    <h3 className="truncate text-[14px] font-medium text-cream">
                      {a.name}
                    </h3>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[12px] text-ash">
                    {a.description || "暂无描述"}
                  </p>
                </div>
              </div>
            );
          })}
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
        body={`确定删除相册《${state.albums.find((a) => a.id === toDeleteAlbum)?.name ?? ""}》吗？相册内的 ${photoCount(toDeleteAlbum ?? "")} 张图片也会一并删除，此操作不可撤销。`}
        confirmText="删除"
        onCancel={() => setToDeleteAlbum(null)}
        onConfirm={() => {
          if (toDeleteAlbum) deleteAlbum(toDeleteAlbum);
          setToDeleteAlbum(null);
        }}
      />
    </div>
  );
}
