/** Injects schema.org structured data. Arrays are emitted as an @graph. */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : data;

  return (
    <script
      type="application/ld+json"
      // Structured data is generated server-side from our own database.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}
