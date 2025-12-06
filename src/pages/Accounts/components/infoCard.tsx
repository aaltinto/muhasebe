interface InfoCardProps {
    adress: string | null;
    phone: string | null;
    email: string | null;
    last_action: string | undefined;
}

export function InfoCard({adress, phone, email, last_action}: InfoCardProps) {
    return (
        <div className="account-info">
            <div className="account-info-item">
              <span className="account-info-label">Adres</span>
              <p className="account-info-value">{adress ? adress : '-'}</p>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Telefon</span>
              <p className="account-info-value">{phone ? phone : '-'}</p>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Email</span>
              <p className="account-info-value">{email ? email : '-'}</p>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Son İşlem Tarihi</span>
              <p className="account-info-value">{last_action ? last_action : '-'}</p>
            </div>
          </div>
    );
}