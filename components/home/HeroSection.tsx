import Image from "next/image";

interface HeroAsset {
  type: "video" | "image";
  src: string;
}

interface HeroSectionProps {
  title: string;
  intro: string;
  heroAsset: HeroAsset | null;
}

export function HeroSection({ title, intro, heroAsset }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {heroAsset?.type === "video" ? (
        <video
          src={heroAsset.src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {heroAsset?.type === "image" ? (
        <Image
          src={heroAsset.src}
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : null}
      {!heroAsset ? <div className="absolute inset-0 bg-neutral-800" /> : null}

      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85 md:text-base">{intro}</p>
      </div>

      <a
        href="#home-intro"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-[0.24em] text-white/80"
      >
        SCROLL DOWN
      </a>
    </section>
  );
}
