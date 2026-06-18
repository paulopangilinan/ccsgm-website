import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import ValueBody from "@/components/ValueBody";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Learn about CCSGM's history, beliefs, values, and leadership.",
};

const timeline = [
  {
    year: "1980s",
    event: "Began as a humble Bible study group in Kawit, Cavite.",
  },
  {
    year: "1990s",
    event: "Church planting began in Surigao del Sur.",
  },
  {
    year: "1992",
    event:
      "Formally established as Church of the Chief Shepherd Global Ministries, with land support from the Jarin Family.",
  },
  {
    year: "2010",
    event: "Church planting in Cavite City.",
  },
  {
    year: "2012",
    event:
      "Gideon 300 Project launched — a capital fundraising campaign for property and building.",
  },
  {
    year: "2016",
    event:
      "Church Extension Fellowship started for spiritual development and community Bible study.",
  },
  {
    year: "2018",
    event: "Renamed to Cross of Christ Salvation Gospel Ministries.",
  },
  {
    year: "2022",
    event:
      "30th anniversary celebrated; Senior Pastor Jeffrey Jo ordained by Sovereign Grace Churches.",
  },
  {
    year: "2023",
    event:
      "Pastors Rey Lacbayo (Cavite City) and Francis Mariano (Imus) ordained; church planting begun in Dasmariñas, Cavite.",
  },
];

const values = [
  {
    title: "Reformed Theology",
    body: "Scripture presents the all-glorious, triune God as the source and end of all things (Romans 11:36), sovereignly working all things according to His will (Ephesians 1:11). At the centre of God's purposes in the world is the exaltation of His glory through the redemption of sinners (John 17:1–26). To this end, we believe that God sovereignly chooses men and women to be saved in order to display His immeasurable grace and glory (Ephesians 1:3–6; Romans 9:11). God's sovereign grace in salvation humbles us, fills us with gratitude, and compels us to worship Him and share the message of His grace to all people.",
  },
  {
    title: "Gospel-Centred Doctrine and Preaching",
    body: "The gospel — the good news of God's saving activity in Jesus Christ — is the pinnacle of His redemptive acts (Ephesians 1:9–12), the centre of the Bible's story (Luke 24:44–47), and the essential message for our faith, life, and witness (1 Corinthians 15:3–11). We are committed to preaching the gospel, singing the gospel, praying the gospel, and building our churches upon the gospel (2 Timothy 4:2; Colossians 3:16; Matthew 16:18). Our ultimate hope in all that we do is not our plans and labours, but the perfect life, substitutionary death, victorious resurrection, and glorious ascension of Jesus Christ.",
  },
  {
    title: "Continuationist",
    body: "With the outpouring of the Holy Spirit at Pentecost, God's purpose to dwell among His people entered a new era (Exodus 33:14–16; Leviticus 26:12; John 14:16–17; Acts 2:14–21). We believe the Holy Spirit desires to continually fill each believer with increased power for Christian life and witness, including the giving of His supernatural gifts for the building up of the church and for various works of ministry in the world (Acts 1:8; Galatians 5:16–18; 1 Corinthians 12:4–7). We are eager to pursue God's active presence in all its breadth, that Christ may be magnified in our lives, in the church, and among the nations (Psalm 105:4; 1 Corinthians 14:1; Ephesians 2:22).",
  },
  {
    title: "Complementarian Leadership in the Home and in the Church",
    body: "We believe it was God's glorious plan to create men and women in His image, giving them equal dignity and value in His sight, while appointing differing and complementary roles for them within the home and the church (Genesis 1:26–28; Ephesians 5:22–33; 1 Timothy 2:8–15). Because these roles give different expressions to God's image in humanity, they should be valued and pursued in joy and faith. As the redeemed community of God, the church has a unique opportunity and responsibility to celebrate this complementarity, to contend for it against cultural hostility, and to protect it from sinful distortions.",
  },
  {
    title: "Elder-Led Church",
    body: "Jesus Christ reigns as head over His church, and He gives to His church elders (or pastors) to govern and lead local churches under His authority (Colossians 1:18; Ephesians 4:11; Titus 1:5). We believe that men, qualified by both character and gifting, are to serve as elders, shepherding God's people as under-shepherds of Christ (1 Timothy 2:12; 1 Timothy 3:1–7; 1 Peter 5:1–3). A church's health is to a great degree dependent on the health of its elders, and so our aim is to strengthen the current elders in our churches while identifying and training new ones (Acts 20:28; 2 Timothy 2:2).",
  },
  {
    title: "Missions",
    body: "Our gospel-centrality entails not only treasuring the gospel personally but sharing it passionately. The risen Christ commissioned His church to make disciples of all nations (Matthew 28:18–20). We believe that commission falls to us and to all believers and that it is fulfilled in a primary way through church planting, whereby the gospel is proclaimed and converts are formed into communities of disciples (Acts 2:21–47; Acts 14:23). We are eager to pursue this mission, relying fully on the Holy Spirit, to see the gospel proclaimed and churches planted throughout the world, that God may be glorified among every tribe, language, people, and nation (Revelation 7:9–12).",
  },
  {
    title: "Interdependence",
    body: "We believe that the unity for which Jesus prayed among His people should find concrete expression among believers and churches. Indeed, the New Testament testifies to a vibrant interdependence among churches in the first century (John 17:20–21; Acts 16:4–5; 1 Corinthians 11:16; Galatians 2:7–10). We seek to express a similar interdependence through our common fellowship, mission, and governance. Our fellowship extends beyond mere denominational affiliation; we are committed to applying the gospel together in relationships that foster mutual encouragement, care, and a glad pursuit of Christlikeness. Our shared governance and mission protects our churches doctrinally and ethically, and enables our individual churches to do far more together than we could ever do separately.",
  },
];

const leaders = [
  {
    name: "Rev. Dr. Jeffrey T. Jo",
    role: "Senior Pastor — Kawit & Dasmariñas",
    bio: "Ordained by Sovereign Grace Churches in 2022. Leads the flagship Kawit congregation and the Dasmariñas church plant.",
  },
  {
    name: "Ptr. Rey Lacbayo",
    role: "Pastor — Cavite City",
    bio: "Ordained in 2023. Leads the Cavite City congregation, committed to reaching urban communities for Christ.",
  },
  {
    name: "Ptr. Francis Mariano",
    role: "Pastor — Imus, Cavite",
    bio: "Ordained in 2023. Leads the Imus congregation in Acacia Townhomes, Alapan.",
  },
  {
    name: "Ptr. Joseph Piamonte, Ptr. Leonor Omba, Ptr. Francisco Ombo, Ptr. Rolando Agyang, Ptr. Oscar Tagyam & Ptr. Rogelio Martinez",
    role: "Pastors — Surigao Region",
    bio: "Lead the church plant and congregations in Barangay Gamuton, Carascal, Surigao del Sur.",
  },
];

export default function AboutPage() {
  return (
    <>
      <HeroSection
        eyebrow="Who We Are"
        title="About CCSGM"
        subtitle="Cross of Christ Salvation Gospel Ministries (CCSGM) is a Christian Evangelical Church in the Philippines. We are part of Sovereign Grace Churches, a family of churches passionate in advancing the Great Commission through church planting and equipping local churches."
        imageName="about"
      />

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-5">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Cross of Christ Salvation Gospel Ministries exist in order to bring
            a harvest of people to a real, loving and personal relationship with
            Jesus Christ as Lord and Saviour.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-10">Our History</h2>
          <ol className="relative border-l-2 border-[#52b788]/30 space-y-8">
            {timeline.map(({ year, event }) => (
              <li key={year} className="pl-8 relative">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#52b788]" />
                <p className="text-xs font-bold text-[#52b788] uppercase tracking-widest mb-1">
                  {year}
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Family of Churches */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-5">
            Our Family of Churches
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            CCSGM is part of Sovereign Grace Churches — a family of churches
            passionate about advancing the Great Commission through church
            planting and equipping local churches.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our churches are gospel-centred (evangelical), Reformed, and
            charismatic, consisting of about 80 churches internationally.
            Sovereign Grace partners with pastors and church-planting networks
            across different countries.
          </p>
          <div className="mt-6">
            <a
              href="https://www.sovereigngrace.com/statement-of-faith"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#1a4731] text-white text-sm font-semibold hover:bg-[#16382a] transition-colors"
            >
              Statement of Faith
            </a>
          </div>
        </div>
      </section>

      {/* 7 Shared Values */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-10">
            Our Seven Shared Values
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {values.map(({ title, body }) => (
              <div
                key={title}
                className="p-6 bg-white rounded-2xl border border-gray-100"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle
                    size={18}
                    className="text-[#52b788] mt-0.5 shrink-0"
                  />
                  <h3 className="text-[#1a4731] font-bold text-base leading-snug">
                    {title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <ValueBody text={body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-10">Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaders.map(({ name, role, bio }) => (
              <div key={name} className="p-7 bg-[#f0fdf4] rounded-2xl border border-gray-100">
                {/* Image placeholder */}
                <div className="w-16 h-16 rounded-full bg-[#1a4731] flex items-center justify-center mb-4">
                  <span className="text-[#52b788] font-bold text-xl">
                    {name[0]}
                  </span>
                </div>
                <h3 className="font-bold text-[#1a4731] text-base">{name}</h3>
                <p className="text-[#52b788] text-xs font-semibold uppercase tracking-wide mb-3">
                  {role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
