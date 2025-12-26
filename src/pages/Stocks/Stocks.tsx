import { useState, useEffect } from "react";
import filter from "../../assets/filter.svg";
import close from "../../assets/close.svg";
import search from "../../assets/search.svg";
import sort from "../../assets/sort.svg";
import add from "../../assets/add.svg";
import box from "../../assets/stocks.svg";
import boxError from "../../assets/box_error.svg";
import addBill from "../../assets/add_bill.svg";
import { AddNewStock } from "./components/AddNewStock";
import { StockList } from "./components/StockList";
import {
  getStocks,
  stock,
  stockOptions,
  searchTypes,
  searchBrands,
} from "../../db/stock";
import { AutocompleteInput } from "./components/AutocompleteInput";

export default function Stocks() {
  const [stockList, setStockList] = useState<stock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [costLowerThan, setCostLowerThan] = useState<number | null>(null);
  const [countLowerThan, setCountLowerThan] = useState<number | null>(null);
  const [costGreaterThan, setCostGreaterThan] = useState<number | null>(null);
  const [countGreaterThan, setCountGreaterThan] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<stockOptions["orderBy"]>("id");
  const [sortDir, setSortDir] = useState<stockOptions["orderDir"]>("DESC");
  const [isSearchActive, setSeacrchActive] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSortOpen, setSortOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [stocksPage, setStocksPage] = useState<
    "stocks" | "stockWarning" | "addBill"
  >("stocks");

  // Debounced stock fetching based on filters/sort
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await getStocks({
          name,
          brand,
          type,
          supplier,
          costGreaterThan,
          costLowerThan,
          countGreaterThan,
          countLowerThan,
          barcode,
          orderBy: sortBy ?? "id",
          orderDir: sortDir ?? "DESC",
        });
        if (!res.success) {
          if (active) setError(res.error as any);
          return;
        }
        if (active) setStockList(res.stocks);
      } catch (err: any) {
        console.error(err);
        if (active) setError(err);
      }
    };
    run();
  }, [
    name,
    brand,
    type,
    supplier,
    costLowerThan,
    countLowerThan,
    costGreaterThan,
    countGreaterThan,
    barcode,
    sortBy,
    sortDir,
    reloadTrigger
  ]);

  const reloadStockList = () => {
    setReloadTrigger(prev => prev + 1);
  }

  const getTitle = (page: "stocks" | "stockWarning" | "addBill") => {
    switch (page) {
      case "stocks":
        return "Stok Listesi";
      case "stockWarning":
        return "Stok Uyarıları";
      case "addBill":
        return "Fatura Ekle";
    }
  };

  const getContent = (page: "stocks" | "stockWarning" | "addBill") => {
    switch (page) {
      case "stocks":
        return <StockList stockList={stockList} error={error} />;
      case "stockWarning":
        return "Stok Uyarıları";
      case "addBill":
        return "Fatura Ekle";
    }
  };

  const handleSearchTypes = async (query: string): Promise<string[]> => {
    const result = await searchTypes(query);
    if (result.success) {
      return result.types.map((t) => t.name);
    }
    return [];
  };
  const handleSearchBrands = async (query: string): Promise<string[]> => {
    const result = await searchBrands(query);
    if (result.success) {
      return result.brands.map((t) => t.name);
    }
    return [];
  };

  return (
    <>
      <div
        className="card card-content big"
        onClick={() => {
          setSeacrchActive(false);
          setFilterOpen(false);
          setSortOpen(false);
        }}
        style={{ justifyItems: "center", alignItems: "center" }}
      >
        <div
          className="modal-header"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isSearchActive ? (
            <>
              <input
                className="input input-small"
                placeholder="Barkod"
                type="text"
                value={barcode ?? ""}
                onChange={(e) =>
                  setBarcode(e.target.value ? e.target.value : null)
                }
              />
              <input
                className="input"
                placeholder="Ürün adı"
                type="text"
                value={name ?? ""}
                onChange={(e) =>
                  setName(e.target.value ? e.target.value : null)
                }
              />

              <div className="btn-group">
                <div className="dropdown-anchor">
                  <button
                    className="btn modal-close"
                    title="Filtrele"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterOpen((v) => !v);
                      setSortOpen(false);
                    }}
                  >
                    <img src={filter} alt="" />
                  </button>
                  {isFilterOpen && (
                    <div
                      className="menu-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="dropdown-title">Filtreler</div>
                      <div className="dropdown-group">
                        <AutocompleteInput
                          size="small"
                          value={type ?? ""}
                          onChange={(value) => {
                            setType(value);
                          }}
                          onSearch={handleSearchTypes}
                          placeholder="Tür ara"
                        />
                        <AutocompleteInput
                        size="small"
                        value={brand ?? ""}
                        onChange={(value) => {
                          setBrand(value)
                        }}
                        onSearch={handleSearchBrands}
                        placeholder="Marka ara"
                        />
                        <input
                          className="input input-small"
                          placeholder="Tedarikçi"
                          value={supplier ?? ""}
                          onChange={(e) =>
                            setSupplier(e.target.value ? e.target.value : null)
                          }
                        />
                        <input
                          className="input input-small"
                          type="number"
                          placeholder="Adet min"
                          value={countGreaterThan ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCountGreaterThan(v === "" ? null : Number(v));
                          }}
                        />
                        <input
                          className="input input-small"
                          type="number"
                          placeholder="Adet max"
                          value={countLowerThan ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCountLowerThan(v === "" ? null : Number(v));
                          }}
                        />
                        <input
                          className="input input-small"
                          type="number"
                          placeholder="Maliyet min"
                          value={costGreaterThan ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCostGreaterThan(v === "" ? null : Number(v));
                          }}
                        />
                        <input
                          className="input input-small"
                          type="number"
                          placeholder="Maliyet max"
                          value={costLowerThan ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCostLowerThan(v === "" ? null : Number(v));
                          }}
                        />
                      </div>
                      <div className="menu-divider" />
                      <div className="dropdown-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setType(null);
                            setBrand(null);
                            setSupplier(null);
                            setCostGreaterThan(null);
                            setCostLowerThan(null);
                            setCountGreaterThan(null);
                            setCountLowerThan(null);
                            setFilterOpen(false);
                          }}
                        >
                          Temizle
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setFilterOpen(false)}
                        >
                          Uygula
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="dropdown-anchor">
                  <button
                    className="btn modal-close"
                    title="Sırala"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortOpen((v) => !v);
                      setFilterOpen(false);
                    }}
                  >
                    <img src={sort} alt="" />
                  </button>
                  {isSortOpen && (
                    <div
                      className="menu-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="dropdown-title">Sıralama</div>
                      <div className="sort-options">
                        {[
                          "id",
                          "name",
                          "brand",
                          "type",
                          "supplier",
                          "count",
                          "cost",
                          "barcode",
                        ].map((col) => (
                          <div
                            key={col}
                            className={
                              "sort-option " + (sortBy === col ? "active" : "")
                            }
                            onClick={() =>
                              setSortBy(col as stockOptions["orderBy"])
                            }
                          >
                            {col.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <div className="menu-divider" />
                      <div className="sort-direction">
                        <button
                          className={
                            "btn btn-secondary " +
                            (sortDir === "ASC" ? "active" : "")
                          }
                          onClick={() => setSortDir("ASC")}
                        >
                          Artan
                        </button>
                        <button
                          className={
                            "btn btn-secondary " +
                            (sortDir === "DESC" ? "active" : "")
                          }
                          onClick={() => setSortDir("DESC")}
                        >
                          Azalan
                        </button>
                      </div>
                      <div className="dropdown-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSortOpen(false)}
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn modal-close"
                  title="Aramayı kapat"
                  onClick={() => {
                    setSeacrchActive(false);
                    setFilterOpen(false);
                    setSortOpen(false);
                  }}
                >
                  <img src={close} alt="" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>{getTitle(stocksPage)}</h2>
              <div className="btn-group">
                <button
                  className={
                    "btn btn-small btn-secondary " +
                    (stocksPage === "stocks" ? "active" : "")
                  }
                  title="Stok Listesi"
                  onClick={() => setStocksPage("stocks")}
                >
                  <img style={{ width: "46px" }} src={box} alt="stock" />
                </button>
                <button
                  className={
                    "btn btn-small btn-secondary " +
                    (stocksPage === "stockWarning" ? "active" : "")
                  }
                  title="Stok Uyarıları"
                  onClick={() => setStocksPage("stockWarning")}
                >
                  <img
                    style={{ width: "46px" }}
                    src={boxError}
                    alt="stock_warnings"
                  />
                </button>
                <button
                  className={
                    "btn btn-small btn-secondary " +
                    (stocksPage === "addBill" ? "active" : "")
                  }
                  title="Fatura Ekle"
                  onClick={() => setStocksPage("addBill")}
                >
                  <img style={{ width: "46px" }} src={addBill} alt="add_bill" />
                </button>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-secondary"
                  title="Yeni Ürün Ekle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddStockModalOpen(true);
                  }}
                >
                  <img src={add} alt="" />
                </button>
                <button
                  className="btn btn-secondary"
                  title="Ara"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeacrchActive(true);
                  }}
                >
                  <img src={search} alt="" />
                </button>
              </div>
            </>
          )}
        </div>
        {getContent(stocksPage)}
      </div>
      <AddNewStock
        isOpen={isAddStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        onSuccess={reloadStockList}
      />
    </>
  );
}
