import { useEffect, useState } from "react";
import { getStockById, stock } from "../../../db/stock";
import ErrorState from "../../../components/ErrorState";
import { LoadingState } from "../../../components/LoadingState";


interface StockDetailContentProps {
    id: string | undefined;
    getData: (data: stock) => void;
}

export default function StockDetailContent({id, getData}: StockDetailContentProps) {

    const [stock, setStock] = useState<stock | null>(null);
      const [error, setError] = useState<string | null>(null);
    
      useEffect(() => {
        const init = async () => {
            if (!id) {
                setError("Id not avaible");
                return;
            };
            const result = await getStockById(parseFloat(id));
            if (!result.success) {
              setError(result.error);
            }
            if (!result.stocks) return;
            setStock(result.stocks);
          }
    
    
        init();
      }, [id]);
    
      if (!stock) {
        if (error) {
          return (
            <ErrorState message={error}/>
          );
        }
        return (
          <LoadingState/>
        );
      }
      getData(stock);
      return (
        <div className="stock-detail-container">
          <div className="stock-detail-grid">
            <div className="detail-card">
              <div className="detail-section">
                <h4 className="detail-section-title">Product Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Product Type</span>
                  <span className="detail-value">{stock.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{stock.brand}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Supplier</span>
                  <span className="detail-value">{stock.supplier}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-section">
                <h4 className="detail-section-title">Inventory</h4>
                <div className="detail-row">
                  <span className="detail-label">Stock Count</span>
                  <span className="detail-value detail-highlight">{stock.count} units</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Unit Cost</span>
                  <span className="detail-value detail-cost">₺ {stock.cost.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Value</span>
                  <span className="detail-value detail-total">₺ {(stock.count * stock.cost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
}