'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SLIDES = [
  {
    id: 1,
    title: 'Mega Sale Live',
    subtitle: 'Up to 70% off on top brands',
    cta: 'Shop now',
    href: '/customer/products',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1a56c4 50%, #0d3d91 100%)',
  },
  {
    id: 2,
    title: 'Electronics Fest',
    subtitle: 'Phones, laptops & accessories',
    cta: 'Explore',
    href: '/customer/products?q=electronics',
    bg: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
  },
  {
    id: 3,
    title: 'Fashion Week',
    subtitle: 'Trending styles for everyone',
    cta: 'View deals',
    href: '/customer/products?q=clothing',
    bg: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="relative mb-3 overflow-hidden rounded-sm bg-white shadow-sm">
      <Link
        href={slide.href}
        className="block relative min-h-[140px] sm:min-h-[200px] md:min-h-[240px] transition-all duration-500"
        style={{ background: slide.bg }}
      >
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
            {slide.title}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/90 max-w-md">{slide.subtitle}</p>
          <span className="mt-4 inline-flex w-fit rounded-sm bg-white px-5 py-2 text-sm font-bold text-[#2563eb] shadow-md">
            {slide.cta}
          </span>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block text-8xl opacity-20 select-none">
          🛍️
        </div>
      </Link>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
