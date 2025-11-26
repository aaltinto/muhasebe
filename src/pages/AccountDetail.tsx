import { useParams, Link, useNavigate } from "react-router-dom";
import {
  accounts,
  getAccountById,
  deleteAccount,
  account_type,
  getAccountBooks,
  accountBook,
  deleteAccountBook,
} from "../db/accounts";
import AddAccountModal from "../components/AddAccountModal";
import { AddAccountBook } from "../components/AddAccountBook";
import { useEffect, useState } from "react";
import { InfoCard } from "../components/infoCard";
import "../style/Account.css";
import deleteIcon from "../assets/delete.svg";
import arrow_back from "../assets/arrow_back.svg";
import edit from "../assets/edit.svg";
import add from "../assets/add.svg";
import payment from "../assets/payments.svg"
import AddPayment from "../components/AddPayment";

export default function AccountDetail() {
  const [accounts, setAccounts] = useState<accounts | null>(null);
  const [accountBooks, setAccountBooks] = useState<accountBook[] | null>(null);
  const [selectedAccountBooks, setSelectedAccountBooks] =
    useState<accountBook | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);

  const navigate = useNavigate();
  const { type, id } = useParams<{ type: account_type; id: string }>();
  if (!type || !id) {
    return null;
  }

  const fethAccount = async () => {
    try {
      setLoading(true);
      const result = await getAccountById(Number(id));
      setAccounts(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching account:", err);
      setError("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountBooks = async () => {
    try {
      if (!accounts) {
        console.log("accounts empty");
        return;
      }
      setLoading(true);
      const result = await getAccountBooks(accounts.id);
      console.log(
        "account book result success",
        result.success,
        "lenght",
        result.length
      );
      if (result.success) {
        setAccountBooks(result.accountBooks);
      } else {
        throw result.error;
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching account:", err);
      setError("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fethAccount();
  }, [id]);
  useEffect(() => {
    if (accounts) {
      fetchAccountBooks();
    }
  }, [accounts?.id]);

  const handleAccountBookDelete = async (id: number) => {
    try {
      const result = await deleteAccountBook(id);
      if (!result.success) {
        throw result.message;
      }
    } catch (err) {
      console.error(err);
    } finally {
      fetchAccountBooks();
    }
  };

  const handleDelete = async () => {
    if (!accounts) {
      console.log("accounts empty");
      return;
    }
    console.log("Delete button clicked");
    try {
      setDeleting(true);
      const result = await deleteAccount(Number(id));
      if (result.success) {
        navigate(`/accounts/${type}`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error while deleting", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!accounts) return null;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <Link
            className="card-title"
            style={{ textDecoration: "none", color: "inherit" }}
            to={`/accounts/${accounts.account_type}s`}
          >
            <button
            className="btn btn-secondary"
            title={`${accounts.account_type == 'customer' ? 'Müşteri' : 'Tedarikçi'} sayfasına geri dön`}>
              <img className="image-med" src={arrow_back} alt="Back" />
            </button>
          </Link>
          <div className="card-title">{accounts.name}</div>
          <div className="btn-group">
            <button
              className="btn btn-secondary"
              title="Yeni hesap defteri ekle"
              onClick={() => setRegisterModalOpen(true)}
            >
              <img src={add} alt="Add" />
            </button>
            <button
              className="btn btn-secondary"
              title={`${accounts.account_type == 'customer' ? 'Müşteri' : 'Tedarikçi'} bilgilerini düzenle`}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <img src={edit} alt="Edit" />
            </button>
            <button
              className="btn btn-delete"
              title={`${accounts.account_type == 'customer' ? 'Müşteri' : 'Tedarikçi'}yi sil`}
              onClick={handleDelete}
              disabled={deleting}
            >
              <img src={deleteIcon} alt="Delete" />
            </button>
          </div>
        </div>
        <div className="card-content">
          <InfoCard
            adress={accounts.adress}
            phone={accounts.phone}
            email={accounts.email}
            last_action={accounts.last_action}
          />
        </div>
        <div className="card-content">
          <div className="card-flex">
            <input type="text" className="input" placeholder="Hesap ara" />
            <button className="btn btn-secondary">Filtrele</button>
            <button className="btn btn-secondary">Sırala</button>
          </div>
          <div className="card-header" />

          <div className="account-books-list">
            {accountBooks && accountBooks.length > 0 ? (
              accountBooks.map((book) => (
                <div
                  key={book.id}
                  className="account-book-item card-compact card"
                  onClick={() => {
                    setSelectedAccountBooks(book);
                    console.log("account clicked\n", "selected book:", book);
                    setRegisterModalOpen(true);
                  }}
                >
                  <div className="card-flex">
                    <div className="account-book-info">
                      <h4 className="card-title">{book.name}</h4>
                      <div className="account-book-details">
                        <span className="book-debt">Borç: {book.debt}</span>
                        <span className="book-balance">
                          Bakiye: {book.balance}
                        </span>
                      </div>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-secondary btn-small"
                        title="Ödeme Ekle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccountBooks(book);
                          setPaymentOpen(true);
                        }}
                      >
                        <img src={payment} alt="Payment" />
                      </button>
                      <button
                        className="btn btn-delete btn-small"
                        title="Hesap defterini sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccountBookDelete(book.id);
                        }}
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Henüz hesap defteri eklenmemiş</p>
              </div>
            )}
          </div>
        </div>
        <div className="card-footer card-flex">
          <p className="account-balance">Toplam Borç: {accounts.debt} </p>
          <p className="account-balance">Bakiye: {accounts.balance}</p>
        </div>
      </div>

      <AddAccountBook
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          setSelectedAccountBooks(null);
          fetchAccountBooks();
        }}
        userId={accounts.id}
        accountBookData={selectedAccountBooks}
      />
      <AddPayment
      isOpen={isPaymentOpen}
      onClose={() => {
        setPaymentOpen(false);
        setSelectedAccountBooks(null);
      }}
      accountBook={selectedAccountBooks}
      />

      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountType={type}
        onAccountAdded={() => {
          fethAccount();
        }}
        accountData={accounts}
      />
    </>
  );
}
