import loadSpin from "../assets/progress.svg"

export function LoadingState () {
    return (
        <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "400px",
        }}
      >
        <img
          src={loadSpin}
          alt="Loading"
          className="spin-animation"
          style={{ width: "48px", height: "48px" }}
        />
      </div>
    );
}