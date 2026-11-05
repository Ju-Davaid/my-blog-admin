import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Button as AntButton, Empty, Image, Skeleton, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, ConfirmDialog, IconButton } from "../components/ui";
import { PhotoGridSkeleton } from "../components/PhotoSkeleton";
import { Reveal } from "../components/Reveal";
import { Trash2 } from "lucide-react";
import {
  createPhoto,
  deletePhotoFromAlbum,
  getAlbumList,
  getPhotoFromAlbum,
} from "@/api";
import type { AlbumVO, PhotoVO } from "@/types/vo";
import { TILE_CLASS_NAMES, TILE_STYLES } from "@/utils/photoTile";

const PAGE_SIZE = 10;

async function fetchAllPhotos(albumId: number): Promise<PhotoVO[]> {
  const first = await getPhotoFromAlbum(albumId, 1, PAGE_SIZE);
  const list = first?.data?.list ?? [];
  const total = first?.data?.total ?? list.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return list;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      getPhotoFromAlbum(albumId, i + 2, PAGE_SIZE),
    ),
  );
  return rest.reduce<PhotoVO[]>(
    (acc, res) => acc.concat(res?.data?.list ?? []),
    list,
  );
}

/** 加载骨架：返回按钮保持可用，标题与照片网格用骨架占位 */
function PhotoDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-5">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AntButton icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回相册
          </AntButton>
          <div className="space-y-1.5">
            <Skeleton.Input
              active
              size="small"
              style={{ width: 150, minWidth: 150, height: 16 }}
            />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 220, minWidth: 220, height: 12 }}
            />
          </div>
        </div>
        <Skeleton.Button active style={{ width: 104, minWidth: 104 }} />
      </Reveal>

      <PhotoGridSkeleton />
    </div>
  );
}

/** 二级页面：相册详情（路由 /photos/:id） */
export default function PhotoDetail() {
  const { id } = useParams();
  const albumId = Number(id);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<AlbumVO | null>(null);
  const [photos, setPhotos] = useState<PhotoVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [toDeletePhoto, setToDeletePhoto] = useState<number | null>(null);

  /* 拉相册信息 + 相册内全部照片 */
  useEffect(() => {
    if (!Number.isFinite(albumId)) {
      navigate("/photos", { replace: true });
      return;
    }
    let alive = true;
    Promise.all([getAlbumList(), fetchAllPhotos(albumId)])
      .then(([albumRes, photoList]) => {
        if (!alive) return;
        const list = Array.isArray(albumRes?.data) ? albumRes.data : [];
        setAlbum(list.find((a) => a.id === albumId) ?? null);
        setPhotos(photoList);
      })
      .catch((error) => {
        console.error(error);
        /* 区分「网络/接口失败」与「相册确实不存在」 */
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [albumId, navigate, reloadKey]);

  /* 重新拉取（失败后重试） */
  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((k) => k + 1);
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const res = await createPhoto({ file, albumId });
      const created = res?.data;
      if (created) {
        setPhotos((prev) => [...prev, created]);
        setAlbum((prev) =>
          prev ? { ...prev, count: (prev.count ?? 0) + 1 } : prev,
        );
      }
      message.success("上传照片成功");
    } catch (error) {
      message.error("上传照片失败");
      console.error(error);
    }
  };

  /* 后端暂无删除照片接口，先只做本地移除 */
  const deletePhoto = async (photoId: number) => {
    try {
      await deletePhotoFromAlbum(photoId, albumId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setAlbum((prev) =>
        prev ? { ...prev, count: Math.max(0, (prev.count ?? 0) - 1) } : prev,
      );
      message.success("删除照片成功");
    } catch (error) {
      message.error("删除照片失败");
      console.error(error);
    }
  };

  const countText = useMemo(
    () => `${photos.length || album?.count || 0} 张照片`,
    [photos.length, album?.count],
  );

  /* 加载中：骨架屏过渡 */
  if (loading) {
    return <PhotoDetailSkeleton onBack={() => navigate("/photos")} />;
  }

  /* 相册不存在 / 接口失败 */
  if (!album) {
    return (
      <div className="space-y-5">
        <Reveal className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AntButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/photos")}
            >
              返回相册
            </AntButton>
            <h2 className="text-[16px] font-semibold text-cream">
              {failed ? "加载失败" : "相册不存在"}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <Card className="border-dashed py-14">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-[13px] text-fog">
                  {failed
                    ? "网络异常，没能取到相册数据"
                    : "这个相册可能已被删除"}
                </span>
              }
            >
              {failed ? (
                <AntButton type="primary" onClick={retry}>
                  重新加载
                </AntButton>
              ) : (
                <AntButton type="primary" onClick={() => navigate("/photos")}>
                  回到相册列表
                </AntButton>
              )}
            </Empty>
          </Card>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AntButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/photos")}
          >
            返回相册
          </AntButton>
          <div>
            <h2 className="text-[16px] font-semibold text-cream">
              {album.name}
            </h2>
            <p className="text-[12px] text-ash">
              {album.desc || "暂无描述"} · {countText}
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
          hidden
          onChange={(e) => {
            void onUpload(e.target.files?.[0]);
            /* 允许重复选择同一文件 */
            e.target.value = "";
          }}
          aria-label="选择图片文件"
        />
      </Reveal>

      {photos.length === 0 ? (
        <Reveal delay={1}>
          <Card className="border-dashed py-14">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-[13px] text-fog">这个相册还没有图片</span>
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
        </Reveal>
      ) : (
        /* PreviewGroup 让同相册内所有图片共用一个预览器：左右切换、缩放、旋转 */
        <Image.PreviewGroup>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {photos.map((p, i) => (
              <Reveal
                as="figure"
                key={p.id}
                delay={Math.min(i, 7)}
                className="group relative aspect-4/3 overflow-hidden rounded-lg border border-line bg-raised transition-colors hover:border-line-strong"
              >
                <Image
                  src={p.path}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  placeholder={<span className="photo-skeleton" />}
                  classNames={TILE_CLASS_NAMES}
                  styles={TILE_STYLES}
                />

                {/* 底部信息条：不拦截点击，好让点图直接开预览 */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-8">
                  <span className="tnum text-[10px] text-white/60">
                    {p.createdAt}
                  </span>
                </div>

                <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <IconButton
                    icon={Trash2}
                    label=""
                    danger
                    className="border border-white/20 bg-black/50 text-white backdrop-blur"
                    onClick={() => setToDeletePhoto(p.id)}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Image.PreviewGroup>
      )}

      {/* 删除图片确认 */}
      <ConfirmDialog
        open={toDeletePhoto !== null}
        title="删除图片"
        body="确定删除这张图片吗？此操作不可撤销。"
        confirmText="删除"
        onCancel={() => setToDeletePhoto(null)}
        onConfirm={() => {
          if (toDeletePhoto !== null) deletePhoto(toDeletePhoto);
          setToDeletePhoto(null);
        }}
      />
    </div>
  );
}
