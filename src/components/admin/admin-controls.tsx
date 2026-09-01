import { MEDIA_OPTIONS } from "@/lib/media";

export function MediaSelect({
  name = "coverImage",
  label = "Cover image",
  defaultValue,
}: {
  name?: string;
  label?: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? MEDIA_OPTIONS[0]}
        className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm dark:border-white/15 dark:bg-ink-900/60"
      >
        {MEDIA_OPTIONS.map((src) => (
          <option key={src} value={src}>
            {src.replace("/media/", "")}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-brand-700"
      />
      {label}
    </label>
  );
}
