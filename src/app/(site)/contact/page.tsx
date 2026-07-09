import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getContactPage } from "@/lib/contactPage";
import { getLocationsPage } from "@/lib/locationsPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CCSGM — find a location, ask a question, or plan your visit.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const [contactInfo, locationsPage] = await Promise.all([
    getContactPage(),
    getLocationsPage(),
  ]);

  return (
    <ContactClient
      contactInfo={contactInfo ?? undefined}
      locations={locationsPage?.churches ?? null}
    />
  );
}
