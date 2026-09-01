import Image from "next/image";
import { cn } from "@/lib/utils";

const ratios = {
  "16/9": "aspect-video",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
  "1/1": "aspect-square",
  "5/4": "aspect-5/4",
  portrait: "aspect-3/4",
} as const;

/**
 * Cover image frame. Uses next/image so the generated SVG artwork is served
 * with correct sizing hints and layout is reserved before paint (good CLS).
 */
export function MediaFrame({
  src,
  alt,
  ratio = "16/9",
  className,
  imgClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px",
  overlay = false,
  children,
}: {
  src: string;
  alt: string;
  ratio?: keyof typeof ratios;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-900",
        ratios[ratio],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover transition-transform duration-700", imgClassName)}
      />
      {overlay && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/25 to-transparent"
        />
      )}
      {children}
    </div>
  );
}
