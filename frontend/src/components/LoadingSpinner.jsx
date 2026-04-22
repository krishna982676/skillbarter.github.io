export default function LoadingSpinner({ size = 20 }) {
  return (
    <div
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(255,255,255,0.15)",
        borderTop: "2px solid var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
