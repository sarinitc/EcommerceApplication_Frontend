"use client";

import Link from "next/link";
import { Container } from "./Container";
import { UserAvatar } from "@/src/components/account/UserAvatar";

type IconName = "account" | "cart" | "search";

function Icon({ name }: { name: IconName }) {
  const paths = {
    account: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    cart: <><path d="M3 3h2l2.2 12.3a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.7L20 7H6" /><circle cx="10" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function Navbar() {
  return (
    <header className="site-header">
      <Container className="nav-content">
        <Link className="brand" href="/">Indigo<span>Store</span></Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link className="active" href="/" aria-current="page">Shop</Link>
          <Link href="/deals">Deals</Link>
          <Link href="/new-arrivals">New Arrivals</Link>
        </nav>
        <div className="nav-actions">
          <label className="search-box"><Icon name="search" /><input type="search" aria-label="Search products" placeholder="Search products..." /></label>
          <Link className="cart-link" href="/cart" aria-label="Shopping cart"><Icon name="cart" /><span className="cart-dot" aria-hidden="true" /></Link>
          <Link className="profile-link overflow-hidden" href="/profile" aria-label="Your profile"><UserAvatar className="h-full w-full object-cover" fallback={<Icon name="account" />} /></Link>
        </div>
      </Container>
    </header>
  );
}
