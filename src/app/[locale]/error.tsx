"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-bold tracking-[0.16em] text-brand-700 uppercase">Heart Link Allianz</p>
      <h1 className="mt-4 text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ink-600">An unexpected error occurred. Please try again in a moment.</p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-full bg-brand-700 px-5 text-sm font-bold text-white"
        >
          Try again
        </button>
        <Link href={`/${locale}`} className="inline-flex h-11 items-center rounded-full border border-ink-300 px-5 text-sm font-bold">
          Home
        </Link>
      </div>
    </section>
  );
}
