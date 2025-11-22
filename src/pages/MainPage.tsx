import "../style/MainPage.css";
import history from "../assets/history.svg"

export default function MainPage() {
  // Sample data for scanned products
  const scannedProducts = [
    {
      id: 1,
      barcode: "8690536100842",
      name: "Ülker Çikolatalı Gofret",
      price: 15.50,
      quantity: 2,
      timestamp: "14:32",
      date: "13.11.2025"
    },
    {
      id: 2,
      barcode: "8690777230156",
      name: "Coca Cola 330ml",
      price: 8.75,
      quantity: 1,
      timestamp: "14:28",
      date: "13.11.2025"
    },
    {
      id: 3,
      barcode: "8690632018427",
      name: "Sütaş Süt 1L",
      price: 12.25,
      quantity: 3,
      timestamp: "14:25",
      date: "13.11.2025"
    },
    {
      id: 4,
      barcode: "8690504500113",
      name: "Eti Crackers",
      price: 6.90,
      quantity: 1,
      timestamp: "14:20",
      date: "13.11.2025"
    }
  ];

  return (
    <div className="card">
      <div className="card card-flex">
        <input type="text" placeholder="Barkod" className="input input-small" />
        <input type="text" placeholder="Manuel arama" className="input" />
        <button className="btn btn-primary">Ara</button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title card-flex">
            İşlem Geçmişi
            <img className="image-med" src={history} alt="History" />
          </h3>
          <span className="card-subtitle">{scannedProducts.length} ürün tarandı</span>
        </div>
        <div className="card-content">
          <div className="product-list">
            {scannedProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-main">
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-barcode">Barkod: {product.barcode}</div>
                  </div>
                  <div className="product-details">
                    <div className="product-quantity">Adet: {product.quantity}</div>
                    <div className="product-price">{(product.price * product.quantity).toFixed(2)} ₺</div>
                  </div>
                </div>
                <div className="product-meta">
                  <span className="product-time">{product.date} - {product.timestamp}</span>
                  <div className="product-actions">
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-footer">
          <div className="total-info">
            <strong>Toplam: {scannedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0).toFixed(2)} ₺</strong>
          </div>
        </div>
      </div>
    </div>
  );
}