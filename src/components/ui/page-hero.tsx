import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  height?: string;
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage = "/imgi_33_FDT-Banner-homme.webp",
  height = "min-h-[350px] md:min-h-[450px] lg:min-h-[500px]"
}: PageHeroProps) {
  return (
    <section className={`relative ${height} flex items-center justify-center -mt-20 pt-20`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4" style={{fontFamily: 'var(--font-outfit)'}}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-light opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}