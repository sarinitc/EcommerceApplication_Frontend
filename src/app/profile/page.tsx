import Link from "next/link";
import { redirect } from "next/navigation";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Package2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { auth } from "@/auth";
import { LogoutButton } from "./LogoutButton";
import { ProfileIdentity } from "./ProfileIdentity";

const menuItems = [
  { label: "Personal Information", href: "#profile-summary", icon: <AccountCircleOutlinedIcon /> },
  { label: "My Orders", href: "/orders", icon: <Package2OutlinedIcon /> },
  { label: "Addresses", icon: <LocationOnOutlinedIcon /> },
  { label: "Payment Methods", icon: <CreditCardOutlinedIcon /> },
  { label: "Security", href: "#account-security", icon: <SecurityOutlinedIcon /> },
];

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const email = session.user.email ?? "";
  const displayName = session.user.name?.trim() || email;
  const role = typeof (session.user as { role?: unknown }).role === "string"
    ? (session.user as { role: string }).role
    : null;
  const image = session.user.image;

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-page-heading">
          <p>ACCOUNT</p>
          <h1>My Profile</h1>
          <span>Manage your account, orders, and security settings.</span>
        </header>

        <div className="profile-grid">
          <aside className="profile-sidebar">
            <ProfileIdentity name={displayName} email={email} role={role} image={image} />

            <nav className="profile-menu" aria-label="Account navigation">
              {menuItems.map((item) => item.href ? (
                <Link key={item.label} href={item.href} className="profile-menu-item">
                  <span className="profile-menu-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  <ChevronRightOutlinedIcon aria-hidden="true" />
                </Link>
              ) : (
                <button key={item.label} className="profile-menu-item" type="button" disabled title="This feature is not available yet">
                  <span className="profile-menu-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="profile-coming-soon">Soon</span>
                </button>
              ))}
            </nav>

            <LogoutButton />
          </aside>

          <div className="profile-main-content">
            <section className="profile-card" aria-labelledby="order-summary-title">
              <div className="profile-card-heading">
                <div><p>SHOPPING</p><h2 id="order-summary-title">Order Summary</h2></div>
                <LocalShippingOutlinedIcon aria-hidden="true" />
              </div>
              <div className="order-stats">
                <div><strong>—</strong><span>Total Orders</span></div>
                <div><strong>—</strong><span>In Transit</span></div>
              </div>
              <Link className="profile-link-button" href="/orders">View All Orders <ChevronRightOutlinedIcon aria-hidden="true" /></Link>
            </section>

            <section className="profile-card" id="account-security" aria-labelledby="security-title">
              <div className="profile-card-heading"><div><p>PROTECTION</p><h2 id="security-title">Account Security</h2></div><SecurityOutlinedIcon aria-hidden="true" /></div>
              <div className="security-row">
                <span className="security-icon" aria-hidden="true"><LockOutlinedIcon /></span>
                <div><h3>Password</h3><p>Manage your password securely.</p></div>
                <button type="button" disabled title="Password updates are not available yet">Update</button>
              </div>
              <div className="security-row">
                <span className="security-icon" aria-hidden="true"><SecurityOutlinedIcon /></span>
                <div><h3>Two-Factor Authentication</h3><p>Currently disabled</p></div>
                <button type="button" disabled title="Two-factor authentication is not available yet">Enable</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
