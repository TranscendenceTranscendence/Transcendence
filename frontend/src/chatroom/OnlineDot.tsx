import "../css/ChatDot.css";

export const OnlineDot = ({ status }: { status: boolean }) => {
  if (status) {
    return <div className="StatusOnline"></div>;
  }
  return <div className="StatusOffline"></div>;
};
