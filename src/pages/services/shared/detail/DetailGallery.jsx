import React, { useState } from 'react';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../../constants/fallbackImage';

const FALLBACK_IMG = ONEVISHWAM_VERIFIED_IMAGE;

/**
 * Universal Detail Page Photo Gallery
 * Displays the active 4:3 main image with smooth transitions and thumbnail selector strip.
 */
export default function DetailGallery({
  images = [],
  video = null,
  title = '',
  aspectRatio = 'aspect-[4/3]',
  onImageClick,
  className = '',
  activeThumbnailBorder = 'border-brand-blue',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const rawImageList = Array.isArray(images) && images.length > 0
    ? images
    : typeof images === 'string' && images
      ? [images]
      : [];

  const validImages = rawImageList.filter((img) => img && !isPlaceholderImage(img));
  const rawVideo = video && typeof video === 'string' && video.trim() !== '' ? video.trim() : null;

  const mediaList = [
    ...validImages.map((img) => ({ type: 'image', url: img })),
    ...(rawVideo ? [{ type: 'video', url: rawVideo }] : []),
  ];

  if (mediaList.length === 0) {
    mediaList.push({ type: 'image', url: FALLBACK_IMG });
  }

  const currentMedia = mediaList[currentIndex] || mediaList[0] || { type: 'image', url: FALLBACK_IMG };
  const isVideo = currentMedia.type === 'video';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Media */}
      <div
        className={`${aspectRatio} overflow-hidden rounded-2xl bg-gray-900 shadow-sm relative group ${
          !isVideo && onImageClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (!isVideo && onImageClick) {
            onImageClick(currentIndex);
          }
        }}
      >
        {isVideo ? (
          <video
            src={currentMedia.url}
            controls
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        {!isVideo && onImageClick && mediaList.length > 0 && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <i className="fa-solid fa-expand text-[10px]" />
            <span>{currentIndex + 1} / {mediaList.length}</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {mediaList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mediaList.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                idx === currentIndex
                  ? activeThumbnailBorder
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center text-white">
                  <i className="fa-solid fa-play text-xs text-blue-400 mb-0.5" />
                  <span className="text-[10px] font-semibold">Video</span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`${title} view ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
