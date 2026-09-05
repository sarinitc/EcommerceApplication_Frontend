import { Container } from "./Container";
import Link from "next/link";
const columns = [{ title: "Company", links: ["About Us", "Contact", "Careers"] }, { title: "Support", links: ["Shipping Policy", "Returns & Exchanges", "FAQ"] }, { title: "Legal", links: ["Terms of Service", "Privacy"] }];
export function Footer() {
  return <footer className="site-footer"><Container><div className="footer-grid"><div className="footer-intro"><Link className="brand" href="/">Indigo<span>Store</span></Link><p>Elevating your everyday lifestyle with premium, curated products.</p></div>{columns.map((column) => <div className="footer-column" key={column.title}><h3>{column.title}</h3>{column.links.map((link) => <a href="#" key={link}>{link}</a>)}</div>)}</div><div className="copyright">© 2026 IndigoStore. All rights reserved.</div></Container></footer>;
}
