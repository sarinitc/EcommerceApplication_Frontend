import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeSections } from "@/components/home/HomeSections";
import styles from "./page.module.css";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className={styles.page}>
      <SiteHeader appearance="home" />
      <HomeSections />
      <SiteFooter appearance="home" />
    </main>
  );
}