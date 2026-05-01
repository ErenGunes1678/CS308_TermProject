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

  return (
    <div className="profile-page">
      <section className="account-hero">
        <div className="account-hero__overlay" />
        <div className="container">
          <div className="account-hero__content">
            <span className="section-label">My Account</span>
            <h1 className="account-hero__title">My Profile</h1>
            <p className="account-hero__tagline">{user.email}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
