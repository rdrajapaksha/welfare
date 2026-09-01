"use client";

export function AdminDeleteButton({
  action,
  id,
  locale,
  label = "Delete",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  locale: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this record permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
      >
        {label}
      </button>
    </form>
  );
}
