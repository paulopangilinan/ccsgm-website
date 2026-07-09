import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Building, Globe, BookOpen } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { getGivePage, type GivingMethod } from "@/lib/givePage";
import { urlFor } from "@/sanity/lib/image";
import GCashLogo from "@/components/GCashLogo";
import BPILogo from "@/components/BPILogo";

export const metadata: Metadata = {
  title: "Give",
  description: "Support the ministry of CCSGM through your generous giving.",
};

export const revalidate = 60;

const funds = [
  {
    icon: Heart,
    name: "General Fund",
    description:
      "Supports the day-to-day operations of all CCSGM congregations — pastoral ministry, Sunday services, and community outreach.",
  },
  {
    icon: Building,
    name: "Gideon 300 Building Project",
    description:
      "Contributes to our campaign to build a permanent home for gospel ministry, training, and our growing congregation.",
  },
  {
    icon: Globe,
    name: "Missions Fund",
    description:
      "Funds our missionaries reaching unreached communities in Surigao del Sur and beyond.",
  },
  {
    icon: BookOpen,
    name: "Ergartes Bible Institute",
    description:
      "Supports scholarships and operations for our theological training school, equipping the next generation of pastors and leaders.",
  },
];

const FALLBACK_METHODS: Omit<GivingMethod, "_key">[] = [
  {
    title: "Bank Transfer",
    notes:
      "You can give via bank transfer to our church account. Please contact us at ccsgm.kawit@gmail.com or call (046) 472-9443 for bank details.",
  },
  {
    title: "GCash / Digital Wallets",
    notes:
      "We accept digital giving via GCash and other e-wallets. Contact your local CCSGM congregation for the registered number.",
  },
];

function resolveQrUrl(method: Omit<GivingMethod, "_key">): string | null {
  if (!method.qrCode) return null;
  try {
    return urlFor(method.qrCode).width(400).height(400).fit("crop").url();
  } catch {
    return null;
  }
}

function GCashCard({ method }: { method: Omit<GivingMethod, "_key"> }) {
  const qrUrl = resolveQrUrl(method);
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "#0166FF" }}>
      {/* GCash logo */}
      <div className="px-6 pt-8 pb-5 flex justify-center">
        <GCashLogo />
      </div>

      {/* Inner card */}
      <div className="mx-4 mb-6 bg-[#EBEBEB] rounded-2xl px-6 py-6 flex flex-col items-center gap-4">
        {qrUrl && (
          <Image
            src={qrUrl}
            alt="GCash QR Code"
            width={210}
            height={210}
            className="rounded-lg"
          />
        )}
        <div className="text-center space-y-1 w-full">
          {method.accountName && (
            <p className="text-[#0166FF] font-bold text-lg">{method.accountName}</p>
          )}
          {method.accountNumber && (
            <p className="text-gray-500 text-sm">
              <span className="font-medium text-gray-600">Mobile No.:</span> {method.accountNumber}
            </p>
          )}
          {method.bankBranch && (
            <p className="text-gray-500 text-sm">
              <span className="font-medium text-gray-600">User ID:</span> {method.bankBranch}
            </p>
          )}
        </div>
        {method.notes && (
          <p className="text-gray-400 text-xs text-center">{method.notes}</p>
        )}
        <p className="text-gray-400 text-xs text-center">Transfer fees may apply.</p>
      </div>
    </div>
  );
}

function BPICard({ method }: { method: Omit<GivingMethod, "_key"> }) {
  const qrUrl = resolveQrUrl(method);
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "#BA272D" }}>
      {/* Inner white card */}
      <div className="m-4 bg-white rounded-2xl px-6 py-8 flex flex-col items-center gap-4">
        <BPILogo />
        <div className="text-center space-y-1 w-full">
          {method.accountName && (
            <p className="text-[#1a2e5a] font-bold text-xl">{method.accountName}</p>
          )}
          {method.accountNumber && (
            <p className="font-bold text-xl tracking-widest font-mono" style={{ color: "#BA272D" }}>{method.accountNumber}</p>
          )}
          {method.bankBranch && (
            <p className="text-gray-400 text-sm">{method.bankBranch}</p>
          )}
        </div>
        {qrUrl && (
          <Image
            src={qrUrl}
            alt="BPI QR Code"
            width={210}
            height={210}
            className="rounded-lg"
          />
        )}
        {method.notes && (
          <p className="text-gray-400 text-xs text-center">{method.notes}</p>
        )}
        <p className="text-gray-400 text-xs text-center">Transfer fees may apply.</p>
      </div>
    </div>
  );
}

function DefaultCard({ method }: { method: Omit<GivingMethod, "_key"> }) {
  const qrUrl = resolveQrUrl(method);
  const bg = method.backgroundColor?.hex || "#1a4731";

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: bg }}>
      <div className="px-6 pt-8 pb-6 text-center">
        <h3 className="text-2xl font-bold text-white">{method.title}</h3>
      </div>
      {(method.accountName || method.accountNumber || method.bankBranch) && (
        <div className="px-6 pb-6 text-center space-y-1">
          {method.accountName && (
            <p className="text-white font-semibold">{method.accountName}</p>
          )}
          {method.accountNumber && (
            <p className="text-white/70 text-sm">Account number: {method.accountNumber}</p>
          )}
          {method.bankBranch && (
            <p className="text-white/70 text-sm">Branch: {method.bankBranch}</p>
          )}
        </div>
      )}
      {qrUrl && (
        <div className="flex justify-center px-6 pb-6">
          <div className="bg-white p-3 rounded-xl">
            <Image src={qrUrl} alt={`${method.title} QR Code`} width={220} height={220} className="rounded-lg" />
          </div>
        </div>
      )}
      {method.notes && (
        <div className="px-6 pb-8 text-center mt-auto">
          <p className="text-white/50 text-xs">{method.notes}</p>
        </div>
      )}
    </div>
  );
}

function GivingMethodCard({ method }: { method: Omit<GivingMethod, "_key"> }) {
  if (method.template === "gcash") return <GCashCard method={method} />;
  if (method.template === "bpi") return <BPICard method={method} />;
  return <DefaultCard method={method} />;
}

export default async function GivePage() {
  const data = await getGivePage();
  // data being non-null means the CMS document exists — honour an intentionally
  // emptied array rather than silently restoring the hardcoded fallback.
  const methods = data !== null ? (data.givingMethods ?? []) : FALLBACK_METHODS;

  return (
    <>
      <HeroSection
        eyebrow="Partner With Us"
        title="Give to the Great Commission"
        subtitle="Your generosity directly fuels church planting, biblical education, and missions to unreached communities across the Philippines."
        imageName="give"
      />

      {/* Scripture */}
      <section className="py-12 bg-[#52b788]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-white text-xl font-semibold italic leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver.&rdquo;
          </p>
          <p className="mt-3 text-white/70 text-sm">2 Corinthians 9:7</p>
        </div>
      </section>

      {/* Giving funds */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-10">
            Where Your Gift Goes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {funds.map(({ icon: Icon, name, description }) => (
              <div
                key={name}
                className="p-7 rounded-2xl border border-gray-100 hover:border-[#52b788]/40 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a4731] flex items-center justify-center mb-4">
                  <Icon size={17} className="text-[#52b788]" />
                </div>
                <h3 className="font-bold text-[#1a4731] mb-2">{name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to give */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-8">
            How to Give
          </h2>

          {/* In Person — always shown full width */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 mb-6">
            <h3 className="font-bold text-[#1a4731] mb-2">In Person</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Offerings and tithes are received during Sunday worship services
              at all CCSGM locations. Look for the offering bags or giving
              boxes at each service.
            </p>
          </div>

          {/* Bank / digital methods — portrait card grid, centered with up to 3 per row */}
          <div className="flex flex-wrap justify-center gap-6">
            {methods.map((method, i) => (
              <div key={"_key" in method ? (method as { _key: string })._key : i} className="w-full sm:w-[300px]">
                <GivingMethodCard method={method} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-400 text-center">
            For giving enquiries, reach us at{" "}
            <a
              href="mailto:ccsgm.kawit@gmail.com"
              className="text-[#52b788] hover:underline"
            >
              ccsgm.kawit@gmail.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
