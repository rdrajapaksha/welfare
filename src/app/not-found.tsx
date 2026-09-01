import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1>Page not found</h1>
        <p>The page you were looking for has moved or no longer exists.</p>
        <p>
          <Link href="/en">Return home</Link>
        </p>
      </body>
    </html>
  );
}
