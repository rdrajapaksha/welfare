"use client";

export function AdminDeleteButton({
  action,
  id,
  locale,
  memberId,
  label = "Delete",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  locale: string;
  memberId?: string;
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
      {memberId ? <input type="hidden" name="memberId" value={memberId} /> : null}
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
      >
        {label}
      </button>
    </form>
  );
}
