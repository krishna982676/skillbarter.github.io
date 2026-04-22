export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "10px 12px",
        border: "1px solid rgba(240,82,82,0.35)",
        borderRadius: 10,
        background: "rgba(240,82,82,0.12)",
        color: "var(--red)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600 }}>{message}</span>
      {onRetry && (
        <button className="btn btn-d btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
