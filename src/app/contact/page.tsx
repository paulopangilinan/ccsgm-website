import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CCSGM — find a location, ask a question, or plan your visit.",
};

export default function ContactPage() {
  return <ContactClient />;
}
