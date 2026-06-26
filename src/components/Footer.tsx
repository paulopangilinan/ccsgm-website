import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a4731] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/ccsgm-logo.png"
                alt="CCSGM Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <div>
                <p className="text-white font-bold text-sm tracking-wide">CCSGM</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Cross of Christ Salvation Gospel Ministries
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Passionate in advancing the Great Commission through church
              planting and equipping local churches. Part of Sovereign Grace
              Churches.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "Who We Are" },
                { href: "/sermons", label: "Sermons" },
                { href: "/locations", label: "Locations" },
                { href: "/give", label: "Give" },
                { href: "/blog", label: "News" },
                { href: "/share-your-story", label: "Share Your Story" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-[#52b788] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Main Office
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin size={15} className="text-[#52b788] mt-0.5 shrink-0" />
                <span>213 Don Pedro Subdivision, Kaingen, Kawit, Cavite</span>
              </li>
              <li className="flex gap-2">
                <Phone size={15} className="text-[#52b788] mt-0.5 shrink-0" />
                <span>(046) 472-9443</span>
              </li>
              <li className="flex gap-2">
                <Mail size={15} className="text-[#52b788] mt-0.5 shrink-0" />
                <a
                  href="mailto:ccsgm.kawit@gmail.com"
                  className="hover:text-[#52b788] transition-colors"
                >
                  ccsgm.kawit@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Cross of Christ Salvation Gospel
            Ministries. All rights reserved.
          </p>
          <p>Part of Sovereign Grace Churches</p>
        </div>
      </div>
    </footer>
  );
}
