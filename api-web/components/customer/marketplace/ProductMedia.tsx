'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  getCategoryEmoji,
  getProductImageUrl,
  getProductInitials,
} from '@/lib/product-display';

type Props = {
  name: string;
  categoryName: string;
  images?: string[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Overrides size-based emoji scale when set */
  emojiClassName?: string;
};

export function ProductMedia({
  name,
  categoryName,
  images,
  className = 'aspect-square w-full',
  size = 'md',
  emojiClassName,
}: Props) {
  const src = getProductImageUrl(images);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !src || imgError;
  const emoji = getCategoryEmoji(categoryName || name);
  const initials = getProductInitials(name);

  const emojiSize =
    emojiClassName ??
    (size === 'lg' ? 'text-7xl' : size === 'sm' ? 'text-3xl' : 'text-5xl');

  if (!showPlaceholder) {
    return (
      <div
        className={`relative overflow-hidden bg-white ${className}`}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImgError(true)}
          unoptimized={src.startsWith('http') && !src.includes('localhost')}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_20%,#2563eb_0%,transparent_50%)]" />
      <span className={`relative select-none ${emojiSize}`} aria-hidden>
        {emoji}
      </span>
      {initials && (
        <span className="relative mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90">
          {initials}
        </span>
      )}
    </div>
  );
}
