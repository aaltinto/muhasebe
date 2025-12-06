import LineChartIncome from "../../components/LineChart";

export default function AccountsSum() {
  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Özet</h1>
      </div>
      <div className="card-content">
        <div className="chart-layout">
          <div className="chart-section">
            <LineChartIncome />
          </div>
          <div className="info-section">
              <h3>Borçlar</h3>
              <p>Payment information goes here</p>
              <h3>Gelir</h3>
              <p>Income information goes here</p>
              <h3>Bakiye</h3>
              <p>Balance information goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
