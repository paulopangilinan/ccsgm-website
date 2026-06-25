"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

type NavLinkItem = {
  title: string;
  slug: { current: string };
};

type NavbarProps = {
  missionNavItems: NavLinkItem[];
  programNavItems: NavLinkItem[];
  projectNavItems: NavLinkItem[];
};

const preachingLinks = [
  { href: "/sermons", label: "Sermons" },
  { href: "/sunday-school", label: "Sunday School" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/readings", label: "Readings" },
  { href: "/blogs", label: "Blogs" },
];

const links = [
  { href: "/locations", label: "Locations" },
  { href: "/news", label: "News & Events" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ missionNavItems, programNavItems, projectNavItems }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [preachingOpen, setPreachingOpen] = useState(false);
  const preachingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [passionOpen, setPassionOpen] = useState(false);
  const passionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const missionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [programsOpen, setProgramsOpen] = useState(false);
  const programsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobilePassionOpen, setMobilePassionOpen] = useState(false);
  const [mobileMissionsOpen, setMobileMissionsOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);

  function showPreaching() {
    if (preachingTimer.current) clearTimeout(preachingTimer.current);
    setPreachingOpen(true);
  }
  function hidePreaching() {
    preachingTimer.current = setTimeout(() => setPreachingOpen(false), 150);
  }

  function showPassion() {
    if (passionTimer.current) clearTimeout(passionTimer.current);
    setPassionOpen(true);
  }
  function hidePassion() {
    passionTimer.current = setTimeout(() => {
      setPassionOpen(false);
      setMissionsOpen(false);
      setProgramsOpen(false);
      setProjectsOpen(false);
    }, 150);
  }

  function showMissions() {
    if (missionsTimer.current) clearTimeout(missionsTimer.current);
    if (passionTimer.current) clearTimeout(passionTimer.current);
    setMissionsOpen(true);
  }
  function hideMissions() {
    missionsTimer.current = setTimeout(() => setMissionsOpen(false), 150);
  }

  function showPrograms() {
    if (programsTimer.current) clearTimeout(programsTimer.current);
    if (passionTimer.current) clearTimeout(passionTimer.current);
    setProgramsOpen(true);
  }
  function hidePrograms() {
    programsTimer.current = setTimeout(() => setProgramsOpen(false), 150);
  }

  function showProjects() {
    if (projectsTimer.current) clearTimeout(projectsTimer.current);
    if (passionTimer.current) clearTimeout(passionTimer.current);
    setProjectsOpen(true);
  }
  function hideProjects() {
    projectsTimer.current = setTimeout(() => setProjectsOpen(false), 150);
  }

  const dropdownItem = "block px-4 py-2 text-sm text-gray-600 hover:bg-[#f0fdf4] hover:text-[#1a4731] transition-colors";
  const dropdownAllItem = "block px-4 py-2 text-sm font-semibold text-[#1a4731] hover:bg-[#f0fdf4] transition-colors border-t border-gray-100";

  function FlyoutLinks({ basePath, allLabel, items }: { basePath: string; allLabel: string; items: NavLinkItem[] }) {
    return (
      <>
        {items.map((item) => (
          <Link key={item.slug.current} href={`${basePath}/${item.slug.current}`} className={dropdownItem}>
            {item.title}
          </Link>
        ))}
        <Link href={basePath} className={dropdownAllItem}>{allLabel}</Link>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 group xl:flex-none">
            <Image src="/images/ccsgm-logo.png" alt="CCSGM Logo" width={36} height={36} className="shrink-0 rounded-full" />
            <div className="min-w-0 leading-tight">
              <span className="block max-w-[270px] text-sm font-bold leading-snug text-[#1a4731] tracking-wide sm:max-w-none">
                Cross of Christ Salvation Gospel Ministries (CCSGM)
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 tracking-wider uppercase">
                A Part of Sovereign Grace Churches
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-6">
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-[#1a4731] transition-colors">
              Who We Are
            </Link>

            {/* Preaching dropdown */}
            <div className="relative" onMouseEnter={showPreaching} onMouseLeave={hidePreaching}>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1a4731] transition-colors">
                Preaching <ChevronDown size={14} />
              </button>
              {preachingOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" onMouseEnter={showPreaching} onMouseLeave={hidePreaching}>
                  {preachingLinks.map((l) => (
                    <Link key={l.href} href={l.href} className={dropdownItem}>{l.label}</Link>
                  ))}
                </div>
              )}
            </div>

            {/* Our Passion dropdown */}
            <div className="relative" onMouseEnter={showPassion} onMouseLeave={hidePassion}>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1a4731] transition-colors">
                Our Passion <ChevronDown size={14} />
              </button>
              {passionOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" onMouseEnter={showPassion} onMouseLeave={hidePassion}>

                  {/* Programs flyout */}
                  <div className="relative" onMouseEnter={showPrograms} onMouseLeave={hidePrograms}>
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-[#f0fdf4] hover:text-[#1a4731] transition-colors">
                      Programs <ChevronRight size={13} />
                    </button>
                    {programsOpen && (
                      <div className="absolute top-0 left-full ml-1 w-72 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" onMouseEnter={showPrograms} onMouseLeave={hidePrograms}>
                        <FlyoutLinks basePath="/programs" allLabel="All Programs" items={programNavItems} />
                      </div>
                    )}
                  </div>

                  {/* Missions flyout */}
                  <div className="relative" onMouseEnter={showMissions} onMouseLeave={hideMissions}>
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-[#f0fdf4] hover:text-[#1a4731] transition-colors">
                      Missions <ChevronRight size={13} />
                    </button>
                    {missionsOpen && (
                      <div className="absolute top-0 left-full ml-1 w-64 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" onMouseEnter={showMissions} onMouseLeave={hideMissions}>
                        <FlyoutLinks basePath="/missions" allLabel="All Missions" items={missionNavItems} />
                      </div>
                    )}
                  </div>

                  {/* Projects flyout */}
                  <div className="relative" onMouseEnter={showProjects} onMouseLeave={hideProjects}>
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-[#f0fdf4] hover:text-[#1a4731] transition-colors">
                      Projects <ChevronRight size={13} />
                    </button>
                    {projectsOpen && (
                      <div className="absolute top-0 left-full ml-1 w-64 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" onMouseEnter={showProjects} onMouseLeave={hideProjects}>
                        <FlyoutLinks basePath="/projects" allLabel="All Projects" items={projectNavItems} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-[#1a4731] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Give CTA */}
          <div className="hidden xl:block">
            <Link href="/give" className="inline-flex items-center px-4 py-2 rounded-full bg-[#52b788] text-white text-sm font-semibold hover:bg-[#3d9971] transition-colors">
              Give
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="xl:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-600 hover:text-[#1a4731]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden border-t border-gray-100 bg-white px-4 pb-4 shadow-sm">
          <nav className="flex flex-col gap-1 mt-2">
            <Link href="/about" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors">
              Who We Are
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2" />

            {/* Preaching */}
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-2 mb-1 px-1">Preaching</p>
            {preachingLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 pl-3 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors">
                {l.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2" />

            {/* Our Passion */}
            <button className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-2 mb-1 px-1 w-full" onClick={() => setMobilePassionOpen((v) => !v)}>
              Our Passion <ChevronDown size={12} className={`transition-transform ${mobilePassionOpen ? "rotate-180" : ""}`} />
            </button>
            {mobilePassionOpen && (
              <>
                {/* Programs */}
                <button className="flex items-center justify-between py-2 pl-3 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors w-full" onClick={() => setMobileProgramsOpen((v) => !v)}>
                  Programs <ChevronDown size={13} className={`mr-1 transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileProgramsOpen && (
                  <>
                    {programNavItems.map((item) => (
                      <Link key={item.slug.current} href={`/programs/${item.slug.current}`} onClick={() => setOpen(false)} className="py-2 pl-8 text-sm text-gray-600 hover:text-[#1a4731] transition-colors block">
                        {item.title}
                      </Link>
                    ))}
                    <Link href="/programs" onClick={() => setOpen(false)} className="py-2 pl-8 text-sm font-semibold text-[#1a4731] block">
                      All Programs
                    </Link>
                  </>
                )}

                {/* Missions */}
                <button className="flex items-center justify-between py-2 pl-3 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors w-full" onClick={() => setMobileMissionsOpen((v) => !v)}>
                  Missions <ChevronDown size={13} className={`mr-1 transition-transform ${mobileMissionsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileMissionsOpen && (
                  <>
                    {missionNavItems.map((item) => (
                      <Link key={item.slug.current} href={`/missions/${item.slug.current}`} onClick={() => setOpen(false)} className="py-2 pl-8 text-sm text-gray-600 hover:text-[#1a4731] transition-colors block">
                        {item.title}
                      </Link>
                    ))}
                    <Link href="/missions" onClick={() => setOpen(false)} className="py-2 pl-8 text-sm font-semibold text-[#1a4731] block">
                      All Missions
                    </Link>
                  </>
                )}

                {/* Projects */}
                <button className="flex items-center justify-between py-2 pl-3 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors w-full" onClick={() => setMobileProjectsOpen((v) => !v)}>
                  Projects <ChevronDown size={13} className={`mr-1 transition-transform ${mobileProjectsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileProjectsOpen && (
                  <>
                    {projectNavItems.map((item) => (
                      <Link key={item.slug.current} href={`/projects/${item.slug.current}`} onClick={() => setOpen(false)} className="py-2 pl-8 text-sm text-gray-600 hover:text-[#1a4731] transition-colors block">
                        {item.title}
                      </Link>
                    ))}
                    <Link href="/projects" onClick={() => setOpen(false)} className="py-2 pl-8 text-sm font-semibold text-[#1a4731] block">
                      All Projects
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="border-t border-gray-100 mt-2 pt-2" />
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-gray-700 hover:text-[#1a4731] transition-colors">
                {l.label}
              </Link>
            ))}
            <Link href="/give" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#52b788] text-white text-sm font-semibold hover:bg-[#3d9971] transition-colors">
              Give
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
