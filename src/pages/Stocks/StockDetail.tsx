import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import backArrow from "../../assets/arrow_back.svg";
import deleteBtn from "../../assets/delete.svg";
import editBtn from  "../../assets/edit.svg"
import { deleteProduct, stock } from "../../db/stock";
import StockDetailContent from "./components/StockDetailContent";

export default function StockDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<stock | null>(null);

  return (
    <div className="card">
      <div className="card-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <img src={backArrow} alt="back" />
        </button>
        <h2>{stock ? stock.name : "-"}</h2>
        <div className="btn-group">
          <button className="btn btn-secondary" disabled={!stock} >
            <img src={editBtn} alt="edit" />
          </button>
          <button className="btn btn-delete" disabled={!stock} onClick={async () => {
            if (stock) {
              await deleteProduct(stock.id)
              navigate(-1);
            }
          }}>
            <img src={deleteBtn} alt="delete" />
          </button>
        </div>
      </div>
      <StockDetailContent id={id} getData={(data) => {setStock(data)}}/>
    </div>
  );
}
