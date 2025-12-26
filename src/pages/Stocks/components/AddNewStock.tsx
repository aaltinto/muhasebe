import { useState, useCallback } from "react";
import closeBtn from "../../../assets/close.svg";
import saveBtn from "../../../assets/save.svg";
import {
  checkBrandsExist,
  checkTypesExist,
  setBrands,
  setNewStock,
  setTypes,
  stock,
  searchTypes,
  searchBrands,
} from "../../../db/stock";
import { AutocompleteInput } from "./AutocompleteInput";

interface NewStockProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddNewStock({ isOpen, onClose, onSuccess }: NewStockProps) {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("");
  const [brand, setBrand] = useState("");
  const [supplier, setSupplier] = useState("");
  const [count, setCount] = useState("0");
  const [cost, setCost] = useState("0");

  type FieldErrorKey =
    | "name"
    | "kind"
    | "brand"
    | "supplier"
    | "barcode"
    | "count"
    | "cost"
    | "form";
  const initialErrors: Record<FieldErrorKey, string | null> = {
    name: null,
    kind: null,
    brand: null,
    supplier: null,
    barcode: null,
    count: null,
    cost: null,
    form: null,
  };
  const [errors, setErrors] =
    useState<Record<FieldErrorKey, string | null>>(initialErrors);

  const handleSearchTypes = useCallback(
    async (query: string): Promise<string[]> => {
      const result = await searchTypes(query);
      return result.success ? result.types.map((t) => t.name) : [];
    },
    []
  );

  const handleSearchBrands = useCallback(
    async (query: string): Promise<string[]> => {
      const result = await searchBrands(query);
      return result.success ? result.brands.map((b) => b.name) : [];
    },
    []
  );

  if (!isOpen) return null;

  // Helpers
  const isInteger = (v: string) => {
    if (v.trim() === "") return false;
    const n = Number(v);
    return Number.isFinite(n) && Number.isInteger(n);
  };
  const isNumber = (v: string) => {
    if (v.trim() === "") return false;
    const n = Number(v);
    return Number.isFinite(n);
  };
  const isDigitsOnly = (v: string) => /^\d+$/.test(v);

  const validateText = (
    value: string,
    fieldLabel: string,
    min = 2,
    max = 100
  ) => {
    const t = value.trim();
    if (!t) return `${fieldLabel} zorunludur`;
    if (t.length < min) return `${fieldLabel} en az ${min} karakter olmalı`;
    if (t.length > max) return `${fieldLabel} en fazla ${max} karakter olmalı`;
    return null;
  };

  const checkForm = () => {
    const next: Record<FieldErrorKey, string | null> = { ...initialErrors };
    // Required texts
    next.name = validateText(name, "İsim");
    next.kind = validateText(kind, "Tür");
    next.brand = validateText(brand, "Marka");
    // next.supplier = validateText(supplier, "Tedarikçi");

    // Optional barcode: if provided, digits-only and reasonable length
    const bc = barcode.trim();
    if (bc) {
      if (!isDigitsOnly(bc))
        next.barcode = "Barkod sadece rakamlardan oluşmalı";
      else if (bc.length < 8 || bc.length > 20)
        next.barcode = "Barkod 8-20 haneli olmalı";
    }

    // Count: required integer, negative allowed
    if (!isInteger(count)) {
      next.count = "Adet tam sayı olmalı (negatif olabilir)";
    }

    // Cost: required number, not negative
    if (!isNumber(cost)) {
      next.cost = "Fiyat geçerli bir sayı olmalı";
    } else if (Number(cost) < 0) {
      next.cost = "Fiyat negatif olamaz";
    }

    setErrors(next);
    return Object.values(next).every((v) => v === null);
  };

  const saveForm = async () => {
    try {
      const newStock: Partial<stock> = {
        name: name.trim(),
        type: kind.trim(),
        barcode: barcode.trim() || undefined,
        supplier: supplier.trim(),
        brand: brand.trim(),
        cost: Number(cost),
        count: Number(count),
      };
      const isType = await checkTypesExist(kind.trim());
      if (!isType.success) {
        console.log("Types search failed");
        throw isType.error;
      }
      if (!isType.type) {
        console.log("type couldnt find. Try to save");
        const isSaved = await setTypes(kind.trim());
        if (!isSaved.success) {
          console.log("Couldnt saved a new type");
          throw isSaved.error;
        }
      }
      const isBrand = await checkBrandsExist(brand.trim());
      if (!isBrand.success) {
        console.log("Brands search failed");
        throw isBrand.error;
      }
      if (!isBrand.type) {
        console.log("brand couldnt find. Try to save");
        const isSaved = await setBrands(brand.trim());
        if (!isSaved.success) {
          console.log("Couldnt saved a new brand");
          throw isSaved.error;
        }
      }
      const result = await setNewStock(newStock);
      if (!result.success) {
        throw result.error;
      }
      return true;
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        form: "Kaydetme sırasında bir hata oluştu",
      }));
      return false;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content big card"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}
      >
        <div className="modal-header">
          <h2>Yeni Ürün Ekle</h2>

          <button className="modal-close" onClick={onClose}>
            <img src={closeBtn} alt="close" />
          </button>
        </div>

        <div className="card-content big">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div className="form-group">
              <label className="form-label">Barkod</label>
              <input
                className={
                  "input input-medium " + (errors.barcode ? "error" : "")
                }
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                  setErrors((prev) => ({ ...prev, barcode: null, form: null }));
                }}
                type="text"
                placeholder="Barkod numarası"
                inputMode="numeric"
              />
              <p className="input-error-message">{errors.barcode}</p>
            </div>

            <div className="form-group">
              <label className="form-label">İsim</label>
              <input
                className={"input input-medium " + (errors.name ? "error" : "")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: null, form: null }));
                }}
                type="text"
                placeholder="Ürün adı"
              />
              <p className="input-error-message">{errors.name}</p>
            </div>

            <AutocompleteInput
              label="Tür"
              value={kind}
              onChange={(value) => {
                setKind(value);
                setErrors((prev) => ({ ...prev, kind: null, form: null }));
              }}
              onSearch={handleSearchTypes}
              placeholder="Ürün türü"
              error={errors.kind}
            />

            <AutocompleteInput
              label="Marka"
              value={brand}
              onChange={(value) => {
                setBrand(value);
                setErrors((prev) => ({ ...prev, brand: null, form: null }));
              }}
              onSearch={handleSearchBrands}
              placeholder="Marka adı"
              error={errors.brand}
            />

            <div className="form-group">
              <label className="form-label">Tedarikçi</label>
              <input
                className={
                  "input input-medium " + (errors.supplier ? "error" : "")
                }
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    supplier: null,
                    form: null,
                  }));
                }}
                type="text"
                placeholder="Tedarikçi adı"
              />
              <p className="input-error-message">{errors.supplier}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Adet</label>
              <input
                className={
                  "input input-medium " + (errors.count ? "error" : "")
                }
                value={count}
                onChange={(e) => {
                  setCount(e.target.value);
                  setErrors((prev) => ({ ...prev, count: null, form: null }));
                }}
                type="number"
                placeholder="Stok adedi"
                step="1"
              />
              <p className="input-error-message">{errors.count}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Fiyat (Maliyet)</label>
              <input
                className={"input input-medium " + (errors.cost ? "error" : "")}
                value={cost}
                onChange={(e) => {
                  setCost(e.target.value);
                  setErrors((prev) => ({ ...prev, cost: null, form: null }));
                }}
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <p className="input-error-message">{errors.cost}</p>
            </div>
          </div>
        </div>
        {errors.form ? (
          <div className="input-error-message">{errors.form}</div>
        ) : null}

        <div className="card-footer">
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={onClose}>
              <strong>İptal</strong>
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!checkForm()) return;
                const result = await saveForm();
                if (result) {
                    onClose();
                    onSuccess();
                }
              }}
            >
              <img src={saveBtn} alt="" style={{ marginRight: "0.5rem" }} />
              <strong>Kaydet</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
