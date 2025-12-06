import { useState, useEffect } from "react";
import { setUser, accounts, account_type, updateUser } from "../../../db/accounts";
import "../../../style/AddAccountModal.css";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: account_type;
  onAccountAdded: (accountId: number | null) => void;
  accountData?: Omit<accounts, 'created_at' | 'account_type'> | null;
}

export default function AddAccountModal({ 
  isOpen, 
  onClose, 
  accountType,
  onAccountAdded,
  accountData = null
}: AddAccountModalProps) {

  if (!isOpen) return null;

  let lastInsertedId: number | null = null;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    adress: "",
    debt: 0,
    balance: 0,
  });
  
  useEffect(() => {
    if (accountData) {
      setFormData(accountData);
    } else {
      // Reset to default values when accountData is null
      setFormData({
        name: "",
        email: "",
        phone: "",
        adress: "",
        debt: 0,
        balance: 0,
      });
    }
  }, [accountData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!accountData) {

        lastInsertedId = await setUser({
          ...formData,
          account_type: accountType,
          last_action: new Date().toISOString().split('T')[0]
        });
        if (!lastInsertedId) {
          throw Error("User couldn't inserted");
        }
      } else {
        await updateUser({
          id: accountData.id,
          last_action: new Date().toISOString().split('T')[0],
          ...formData
        });
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        adress: "",
        debt: 0,
        balance: 0,
      });
      
      onAccountAdded(lastInsertedId);
      onClose();
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Hesap eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{accountData ? '' : 'Yeni'} {accountType == 'customer' ? 'Müşteri' : 'Tedarikçi'} {accountData ? 'Düzenle' : 'Ekle'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Ad Soyad *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
          
          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          
          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          
          <div className="form-group">
            <label>Adres</label>
            <input
              type="text"
              name="adress"
              value={formData.adress}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Borç</label>
              <input
                type="number"
                name="debt"
                value={formData.debt}
                onChange={handleInputChange}
                step="0.01"
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label>Bakiye</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                step="0.01"
                className="input"
              />
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="card-footer">
            <div className="card-flex">

            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
              >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              >
              {loading ? 'Ekleniyor...' : 'Kaydet'}
            </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
}