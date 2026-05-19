"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Laporkan gangguan air, kami siap membantu!",
    description:
      "Sampaikan keluhan Anda, tim kami akan segera menindaklanjuti.",
  },
  {
    title: "Pantau status pengaduan Anda secara real-time.",
    description:
      "Lacak perkembangan laporan dari PENDING hingga RESOLVED dengan mudah.",
  },
  {
    title: "Layanan pelanggan PDAM yang cepat dan terpercaya.",
    description:
      "Teknisi berpengalaman kami siap menangani setiap gangguan distribusi air.",
  },
];

export default function SignInCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden flex-3 p-3 lg:flex">
      <div className="relative w-full overflow-hidden rounded-xl">
        <Image
          src="https://perumdatirtamusi.co.id/images/joomlart/hero/HEADER%201.jpg"
          fill
          alt=""
          className="object-cover object-center"
        />
        <div className="bg-primary/65 absolute inset-0" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-white">
          <div className="relative h-40 w-full">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
                style={{
                  opacity: i === current ? 1 : 0,
                  transform:
                    i === current ? "translateY(0)" : "translateY(8px)",
                  pointerEvents: i === current ? "auto" : "none",
                }}
              >
                <h2 className="text-3xl leading-snug font-bold">
                  {slide.title}
                </h2>
                <p className="mt-3 text-sm text-white/80">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 cursor-pointer rounded-full bg-white transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "8px",
                  opacity: i === current ? 1 : 0.5,
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
