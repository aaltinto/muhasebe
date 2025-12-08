import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAccounts, accounts } from "../../db/accounts";
import { account_type } from "../../db/accounts";
import { localeDate } from "./utils/localeDate";
import AddAccountModal from "./components/AddAccountModal";
import { sleep } from "./utils/sleep";
import loadSpin from "../../assets/progress.svg"

export interface AccountProps {
  id: number;
  name: string;
  totalDebt: number;
  balance: number;
  lastAction: string;
}



function GetList({ accountType }: { accountType: account_type; }) {
  const [accounts, setAccounts] = useState<Omit<accounts, "created_at" | "email" | "phone" | "adress">[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // await sleep(2000);
      const result = await getAccounts(accountType);
      setAccounts(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchAccounts();
  }, [accountType]);

  if (loading) return (<div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
          <img src={loadSpin} alt="Loading" className="spin-animation" style={{ width: "48px", height: "48px" }} />
        </div>);
  if (error) return <div>Error: {error}</div>;
  if (!accounts) return null;
  
  
  return (
    <div className="product-list">
              {accounts.length > 0 ? (accounts.map((account) => (
                <Link
                  key={account.id}
                  to={`/accounts/${accountType}s/${account.id}`}
                  className="product-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="product-main">
                    <div className="product-info">
                      <div className="product-name"> {account.name} </div>
                      <div className="account-date">
                        Son işlem: {localeDate(account.last_action)}
                      </div>
                    </div>
                    <div className="product-details">
                      <div className="account-balance">
                        Bakiye: {account.balance}
                      </div>
                      <div className="product-price">
                        Toplam Borç: {account.debt} ₺
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
            <div className="empty-state">
                <p>Henüz hesap eklenmemiş</p>
              </div>
              )}
            </div>
  );
}

const getTitle = (path: string) => {
  switch (path) {
    case "/accounts/customers":
      return "Müşteri";
    case "/accounts/suppliers":
      return "Tedarikçi";
  }
};

const getAccountType = (path: string): account_type => {
  if (path === "/accounts/customers") return "customer";
  if (path === "/accounts/suppliers") return "supplier";
  return "";
};

export default function Accounts() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountType = getAccountType(location.pathname);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">
            {getTitle(location.pathname)} Hesapları
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Yeni Kayıt Ekle
          </button>
        </div>
        <div className="card ">
          <div className="card-flex">
            <input
              className="input"
              type="text"
              placeholder={`${getTitle(location.pathname)} ara...`}
            />
            <button className="btn btn-secondary">Filtrele</button>
            <button className="btn btn-secondary">Sırala</button>
          </div>
          <div className="card-header" />
          <div className="card-content">
            <GetList accountType={accountType} />          
          </div>
        </div>
      </div>

      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountType={accountType}
        onAccountAdded={(newAccountId: number | null) => {
          setIsModalOpen(false);
          console.log("newID", newAccountId);
          if (newAccountId) {
            navigate(`${newAccountId}`)
          }
        }}
      />
    </>
  );
}
