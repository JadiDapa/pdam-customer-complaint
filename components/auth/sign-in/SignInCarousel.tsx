"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGrv7xf4ih2MGBC2d1y_896BtF0f7TmZfuSySaCay4AA&s=10",
    title: "Laporkan gangguan air, kami siap membantu!",
    description:
      "Sampaikan keluhan Anda, tim kami akan segera menindaklanjuti.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbs3tQYZE2woaEe0K50a2ot3WkYHRUAtA21C9a7R7gLw&s=10",
    title: "Pantau status pengaduan Anda secara real-time.",
    description:
      "Lacak perkembangan laporan dari PENDING hingga RESOLVED dengan mudah.",
  },
  {
    image:
      "https://www.lbutilities.org/files/sharedassets/utilities/v/1/customer-service/images/two-people-working-on-gas-pipes-outside-home.jpg?w=400&h=267",
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
        {/* Background Images */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === current ? 1 : 0,
            }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              unoptimized
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="bg-primary/70 absolute inset-0" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end px-10 pb-10 text-center text-white">
          <div className="relative h-40 w-full">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
                style={{
                  opacity: i === current ? 1 : 0,
                  transform:
                    i === current ? "translateY(0)" : "translateY(12px)",
                }}
              >
                <h2 className="max-w-2xl text-3xl leading-snug font-medium">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-xl text-sm text-white/85">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="mt-6 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 cursor-pointer rounded-full bg-white transition-all duration-300"
                style={{
                  width: i === current ? "28px" : "8px",
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
