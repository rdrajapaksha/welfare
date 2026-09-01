import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-bold tracking-[0.16em] text-brand-700 uppercase">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-600">The page you were looking for has moved or no longer exists.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-700 px-5 text-sm font-bold text-white"
      >
        Return to the home page
      </Link>
    </section>
  );
}
