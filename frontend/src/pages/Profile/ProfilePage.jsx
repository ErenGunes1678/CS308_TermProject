import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./ProfilePage.css";

function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userInitial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="container">
        <section className="account-hero">
          <span className="account-hero__bubble account-hero__bubble--1" />
          <span className="account-hero__bubble account-hero__bubble--2" />
          <span className="account-hero__bubble account-hero__bubble--3" />
          <span className="account-hero__bubble account-hero__bubble--4" />
          <span className="account-hero__bubble account-hero__bubble--5" />

          <div className="account-hero__avatar">{userInitial}</div>

          <div className="account-hero__content">
            <p className="account-hero__eyebrow">Account</p>
            <h1>Hello, {user.name}!</h1>
            <p className="account-hero__email">{user.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
