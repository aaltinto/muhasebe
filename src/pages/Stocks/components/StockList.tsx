import { useEffect, useState } from "react";
import { getStocks, stock } from "../../../db/stock";
import ErrorState from "../../../components/ErrorState";
import "../../../style/Stock.css"
import { LoadingState } from "../../../components/LoadingState";
import { Link } from "react-router-dom";

interface stockListComponents {
  stockList: stock[] | null;
  error: string | null
}

export function StockList({stockList, error}: stockListComponents) {

  if (!stockList) {
    if (error) {
      return <ErrorState message={error}/>
    }

    return <LoadingState/>;

  }
  if (stockList.length < 1) {
    return <div className="empty-state">Henüz ürün yok.</div>;
  }

  return (
    <div className="stock-grid">
      {stockList.map((item) => (
        <Link to={`/stocks/${item.id}`} style={{ textDecoration: "none", color: "inherit" }} key={item.id} className="stock-card">
          <div className="stock-card-header">
            <h3 className="stock-name">{item.name}</h3>
            {item.barcode && <span className="stock-barcode">{item.barcode}</span>}
          </div>
          
          <div className="stock-card-body">
            <div className="stock-info-row">
              <span className="stock-label">Marka</span>
              <span className="stock-value">{item.brand || "—"}</span>
            </div>
            <div className="stock-info-row">
              <span className="stock-label">Kategori</span>
              <span className="stock-value">{item.type || "—"}</span>
            </div>
            {item.supplier && (
              <div className="stock-info-row">
                <span className="stock-label">Tedarikçi</span>
                <span className="stock-value">{item.supplier}</span>
              </div>
            )}
          </div>

          <div className="stock-card-footer">
            <div className="stock-stat">
              <span className="stat-label">Stok</span>
              <span className="stat-value stock-count">{item.count ?? 0}</span>
            </div>
            <div className="stock-stat">
              <span className="stat-label">Maliyet</span>
              <span className="stat-value stock-cost">{item.cost?.toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}