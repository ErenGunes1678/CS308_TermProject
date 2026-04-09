import { useMemo } from "react";
import "./ProfilePage.css";

const DEFAULT_USER = {
  name: "User",
  email: "user@example.com",
};

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return DEFAULT_USER;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    return {
      name: parsedUser?.name || DEFAULT_USER.name,
      email: parsedUser?.email || DEFAULT_USER.email,
    };
  } catch {
    return DEFAULT_USER;
  }
};

function ProfilePage() {
  const user = useMemo(() => getStoredUser(), []);
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
