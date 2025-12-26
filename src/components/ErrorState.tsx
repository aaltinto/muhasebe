import errorRed from "../assets/error_red.svg";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn’t load this account book. Please try again.",
  onRetry,
}: Props) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(255, 0, 76, 0.08)",
        textAlign: "center",
      }}
    >
      <img
        src={errorRed}
        alt="Error"
        style={{ width: 56, height: 56, filter: "drop-shadow(0 6px 12px rgba(255,0,0,0.15))" }}
      />
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
        >
          Retry
        </button>
      )}
    </div>
  );
}