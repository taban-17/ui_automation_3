interface SaveBarProps {
  saving: boolean;
  status: { kind: "idle" | "ok" | "error"; message?: string };
  onSave: () => void;
}

export default function SaveBar({ saving, status, onSave }: SaveBarProps) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {status.kind === "ok" && (
        <span className="text-sm text-green-700">{status.message}</span>
      )}
      {status.kind === "error" && (
        <span className="text-sm text-red-700">{status.message}</span>
      )}
    </div>
  );
}