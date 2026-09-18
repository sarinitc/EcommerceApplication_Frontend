import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeShowcase } from "@/components/features/home/HomeShowcase";
import styles from "./page.module.css";

const craft = [
  "Responsibly sourced, durable materials",
  "Designed in-house by a small studio",
  "Built to be repaired, not replaced",
];

const stats = [
  { value: "12k+", label: "Orders delivered" },
  { value: "4.9", label: "Average rating" },
  { value: "98%", label: "On-time delivery" },
  { value: "30 day", label: "Easy returns" },
];

const benefits = [
  { icon: "truck" as const, title: "Free shipping", text: "On orders over $50" },
  { icon: "shield" as const, title: "Secure payment", text: "Protected checkout" },
  { icon: "support" as const, title: "Here when you need us", text: "24/7 customer care" },
];

function Icon({ name, className = "" }: { name: "arrow" | "check" | "mail" | "quote" | "shield" | "star" | "support" | "truck"; className?: string }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    quote: <path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6c0-1.7 1.3-3 3-3zM19 7c-2.8 0-5 2.2-5 5v5h5v-5h-3c0-1.7 1.3-3 3-3z" />,
    shield: <><path d="M12 3 19 6v5c0 4.6-3 7.9-7 10-4-2.1-7-5.4-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
    support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13h3v5H5a1 1 0 0 1-1-1zM20 13h-3v5h2a1 1 0 0 0 1-1z" /><path d="M17 18c0 2-1.7 3-4 3h-1" /></>,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

const gold = "#d99a24";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className={styles.page}>
      <SiteHeader appearance="home" />

      <section className={`${styles.container} ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>New collection <span className={styles.eyebrowSlash}>/</span> 2026</p>
          <h1>Objects for a <em>well-lived</em> life.</h1>
          <p className={styles.intro}>Curated pieces with enduring materials, thoughtful design, and a quieter point of view.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/products">
              Explore collection <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2" />
            </Link>
            <Link className={styles.secondaryButton} href="/new-arrivals">Explore new arrivals</Link>
          </div>
          <div className={styles.reviewLine}>
            <span className="flex gap-0.5" style={{ color: gold }} aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className="h-3.5 w-3.5 fill-current stroke-current" />)}
            </span>
            <span>4.9 from 2,300 reviews</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroPhoto} role="img" aria-label="A calm, considered workspace illustration" />
        </div>
      </section>

      <section className={styles.container} aria-label="Store benefits">
        <div className={styles.benefits}>
          {benefits.map((benefit) => (
            <div className={styles.benefit} key={benefit.title}>
              <span className={styles.benefitIcon}><Icon name={benefit.icon} className="h-5 w-5 fill-none stroke-current stroke-[1.7]" /></span>
              <span><strong>{benefit.title}</strong><small>{benefit.text}</small></span>
            </div>
          ))}
        </div>
      </section>

      <HomeShowcase />

      <section className={`${styles.container} ${styles.story}`}>
        <div className={styles.storyImage}>
          <div role="img" aria-label="A calm living space with considered furniture and natural textures" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85')" }} />
        </div>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>Our philosophy</p>
          <h2>Quiet design,<br />made to last.</h2>
          <p>We work with a small circle of makers who care about the same things we do — honest materials, considered proportions, and details that only improve with age.</p>
          <ul className={styles.craft}>
            {craft.map((point) => (
              <li key={point}><Icon name="check" className="h-4 w-4 fill-none stroke-current stroke-2" />{point}</li>
            ))}
          </ul>
          <Link className={styles.primaryButton} href="/new-arrivals">Browse new arrivals <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2" /></Link>
        </div>
      </section>

      <section className={styles.proofSection}>
        <div className={`${styles.container} ${styles.proof}`}>
          <figure>
            <Icon name="quote" className={`${styles.quoteIcon} h-8 w-8 fill-current`} />
            <blockquote>“The lamp my whole apartment now revolves around. Thoughtful, well-made, and worth more than every cent.”</blockquote>
            <figcaption className={styles.buyer}>
              <span className={styles.buyerAvatar}>AV</span>
              <span><strong>Amara V.</strong><small>Verified buyer · Home &amp; Living</small></span>
            </figcaption>
          </figure>
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${styles.container} ${styles.newsletter}`}>
        <div className={styles.newsletterCard}>
          <p className={styles.eyebrow}>Stay in the loop</p>
          <h2>Get the good stuff, first.</h2>
          <p className={styles.newsletterDescription}>New arrivals, studio notes, and subscriber-only offers — sent rarely, worth reading always.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/register"><Icon name="mail" className="h-4 w-4 fill-none stroke-current stroke-2" />Join the list</Link>
            <Link className={styles.secondaryButton} href="/products">Explore first</Link>
          </div>
          <p className={styles.finePrint}>No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <SiteFooter appearance="home" />
    </main>
  );
}