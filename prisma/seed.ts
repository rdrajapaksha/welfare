/**
 * Demo dataset for Heart Link Allianz Welfare Association.
 * Run: npm run db:reset
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PROGRAMMES, PROJECTS } from "./seed-content";
import {
  ALL_NAMES,
  BLOOD,
  CITY_BY_DISTRICT,
  OCCUPATIONS,
  daysAgo,
  daysAhead,
  makeRng,
  monthsBack,
  pickFrom,
  randomInt,
  t3,
  tri,
} from "./seed-helpers";

const prisma = new PrismaClient();
const rng = makeRng(20261387);
const DISTRICTS = Object.keys(CITY_BY_DISTRICT);

function membershipNo(i: number) {
  return `HLA-${String(1000 + i).padStart(4, "0")}`;
}

async function main() {
  console.log("Seeding Heart Link Allianz…");

  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.benefitClaim.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.electionVote.deleteMany();
  await prisma.electionCandidate.deleteMany();
  await prisma.election.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.fundAllocation.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.committeeMember.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.project.deleteMany();
  await prisma.newsPost.deleteMany();
  await prisma.event.deleteMany();
  await prisma.annualReport.deleteMany();
  await prisma.monthlyStat.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.document.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.membershipApplication.deleteMany();
  await prisma.volunteerApplication.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.siteSetting.deleteMany();

  const passwordHash = await bcrypt.hash("Member@hla2026", 10);
  const adminHash = await bcrypt.hash("Admin@hla2026", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@heartlinkallianz.lk",
      passwordHash: adminHash,
      role: "ADMIN",
      name: "Nirmala Jayasuriya",
      locale: "en",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "member@heartlinkallianz.lk",
      passwordHash,
      role: "MEMBER",
      name: "Kamal Perera",
      locale: "si",
    },
  });

  const demoMember = await prisma.member.create({
    data: {
      membershipNo: "HLA-1001",
      fullName: "Kamal Perera",
      nameWithInitials: "K. Perera",
      nic: "198512345678",
      dateOfBirth: new Date("1985-03-12"),
      gender: "MALE",
      civilStatus: "MARRIED",
      occupation: "Teacher",
      addressLine1: "42 Temple Road",
      city: "Nugegoda",
      district: "Colombo",
      phone: "0771234501",
      whatsapp: "0771234501",
      email: "member@heartlinkallianz.lk",
      bloodGroup: "O+",
      membershipType: "ORDINARY",
      status: "ACTIVE",
      joinedAt: daysAgo(2100),
      emergencyName: "Sandya Perera",
      emergencyPhone: "0771234599",
      bio: "Member since 2018. Volunteers at medical camps in Colombo district.",
      showInDirectory: true,
      userId: demoUser.id,
    },
  });

  const committee = [
    { name: "Nirmala Jayasuriya", pos: tri("President", "සභාපතිනිය", "தலைவர்"), from: 2024, email: "president@heartlinkallianz.lk", phone: "+94 77 123 4500" },
    { name: "Ranjith Silva", pos: tri("Vice President", "උප සභාපති", "துணைத் தலைவர்"), from: 2024, email: "vicepresident@heartlinkallianz.lk" },
    { name: "Thilini Dissanayake", pos: tri("Secretary", "ලේකම්", "செயலாளர்"), from: 2023, email: "secretary@heartlinkallianz.lk" },
    { name: "Kumaran Selvarajah", pos: tri("Assistant Secretary", "සහකාර ලේකම්", "உதவிச் செயலாளர்"), from: 2025 },
    { name: "Mohamed Rizwan", pos: tri("Treasurer", "භාණ්ඩාගාරික", "பொருளாளர்"), from: 2022, email: "treasurer@heartlinkallianz.lk" },
    { name: "Malini Wickramasinghe", pos: tri("Assistant Treasurer", "සහකාර භාණ්ඩාගාරික", "உதவிப் பொருளாளர்"), from: 2024 },
    { name: "Suresh Balasubramaniam", pos: tri("Organiser", "සංවිධායක", "ஒழுங்கமைப்பாளர்"), from: 2024 },
    { name: "Chamari Gunasekara", pos: tri("Welfare Officer", "සුබසාධක නිලධාරිනිය", "நலன்புரி அலுவலர்"), from: 2023, email: "welfare@heartlinkallianz.lk" },
    { name: "Ajith Rajapaksha", pos: tri("Committee Member", "කමිටු සාමාජික", "குழு உறுப்பினர்"), from: 2025 },
  ];

  await prisma.committeeMember.createMany({
    data: committee.map((c, i) => ({
      name: c.name,
      ...t3("position", c.pos),
      ...t3(
        "bio",
        tri(
          `${c.name} serves the current executive committee and represents members at district programmes.`,
          `${c.name} වර්තමාන විධායක කමිටුවේ සේවය කරන අතර දිස්ත්‍රික් වැඩසටහන්වලදී සාමාජිකයින් නියෝජනය කරයි.`,
          `${c.name} தற்போதைய நிர்வாகக் குழுவில் பணிபுரிந்து மாவட்ட நிகழ்ச்சிகளில் உறுப்பினர்களைப் பிரதிநிதித்துவப்படுத்துகிறார்.`,
        ),
      ),
      email: c.email ?? null,
      phone: c.phone ?? null,
      termFrom: c.from,
      termTo: 2026,
      sortOrder: i,
      isCurrent: true,
    })),
  });

  for (const p of PROGRAMMES) {
    await prisma.programme.create({
      data: {
        slug: p.slug,
        category: p.category,
        icon: p.icon,
        coverImage: p.coverImage,
        benefitAmount: p.benefitAmount ?? null,
        sortOrder: p.sortOrder,
        ...t3("title", p.title),
        ...t3("summary", p.summary),
        ...t3("body", p.body),
        ...t3("eligibility", p.eligibility),
      },
    });
  }

  const projectRecords = [];
  for (const p of PROJECTS) {
    const created = await prisma.project.create({
      data: {
        slug: p.slug,
        location: p.location,
        targetAmount: p.targetAmount,
        raisedAmount: p.raisedAmount,
        spentAmount: p.spentAmount,
        beneficiaries: p.beneficiaries,
        status: p.status,
        startedAt: daysAgo(p.startedDaysAgo),
        completedAt: p.completedDaysAgo ? daysAgo(p.completedDaysAgo) : null,
        coverImage: p.coverImage,
        ...t3("title", p.title),
        ...t3("summary", p.summary),
        ...t3("body", p.body),
      },
    });
    projectRecords.push(created);
  }

  const partners = [
    { name: "Ceylon Trust Bank", slug: "ceylon-trust-bank", logo: "/partners/ceylon-trust-bank.svg", tier: "PLATINUM", since: 2019, web: "https://example.com" },
    { name: "Lanka Medicare", slug: "lanka-medicare", logo: "/partners/lanka-medicare.svg", tier: "PLATINUM", since: 2020, web: "https://example.com" },
    { name: "Sunrise Pharma", slug: "sunrise-pharma", logo: "/partners/sunrise-pharma.svg", tier: "GOLD", since: 2021 },
    { name: "Nawaloka Builders", slug: "nawaloka-builders", logo: "/partners/nawaloka-builders.svg", tier: "GOLD", since: 2022 },
    { name: "Metro Insurance", slug: "metro-insurance", logo: "/partners/metro-insurance.svg", tier: "GOLD", since: 2018 },
    { name: "Serendib Foods", slug: "serendib-foods", logo: "/partners/serendib-foods.svg", tier: "SILVER", since: 2023 },
    { name: "Orient Telecom", slug: "orient-telecom", logo: "/partners/orient-telecom.svg", tier: "SILVER", since: 2024 },
    { name: "Kandy Textiles", slug: "kandy-textiles", logo: "/partners/kandy-textiles.svg", tier: "PARTNER", since: 2021 },
    { name: "Green Agro Lanka", slug: "green-agro-lanka", logo: "/partners/green-agro-lanka.svg", tier: "PARTNER", since: 2022 },
    { name: "Divisional Secretariat Nugegoda", slug: "divisional-secretariat", logo: "/partners/divisional-secretariat.svg", tier: "GOVERNMENT", since: 2016 },
  ];

  await prisma.partner.createMany({
    data: partners.map((p, i) => ({
      name: p.name,
      slug: p.slug,
      logoUrl: p.logo,
      website: p.web ?? null,
      tier: p.tier,
      since: p.since,
      sortOrder: i,
      ...t3(
        "description",
        tri(
          `${p.name} supports Heart Link Allianz programmes through funding, in-kind gifts and technical expertise.`,
          `${p.name} අරමුදල්, ද්‍රව්‍ය දායකත්වය සහ තාක්ෂණික විශේෂඥතාව ඔස්සේ හාට් ලින්ක් අලයන්ස් වැඩසටහන්වලට සහාය දෙයි.`,
          `${p.name} நிதி, பொருள் நன்கொடை மற்றும் தொழில்நுட்ப நிபுணத்துவம் மூலம் ஹார்ட் லிங்க் அலையன்ஸ் திட்டங்களுக்கு ஆதரவளிக்கிறது.`,
        ),
      ),
    })),
  });

  const faqs: { category: string; q: ReturnType<typeof tri>; a: ReturnType<typeof tri> }[] = [
    {
      category: "MEMBERSHIP",
      q: tri("Who can join the association?", "සමිතියට එක්විය හැක්කේ කාටද?", "சங்கத்தில் யார் இணையலாம்?"),
      a: tri(
        "Any Sri Lankan aged 18 or over, or a junior member aged 12–17 with a parent or guardian. You do not need to live in Nugegoda — we have members in 18 districts.",
        "වයස අවුරුදු 18ට වැඩි ඕනෑම ශ්‍රී ලාංකිකයෙකුට, හෝ දෙමාපියෙකු සමඟ වයස 12–17 ජ්‍යෙෂ්ඨ නොවන සාමාජිකයෙකුට. නුගේගොඩේ ජීවත් වීම අවශ්‍ය නැත — අපට දිස්ත්‍රික්ක 18ක සාමාජිකයින් සිටී.",
        "18 வயதுக்கு மேற்பட்ட எந்த இலங்கையரும், அல்லது பெற்றோருடன் 12–17 வயது இளைய உறுப்பினர். நுகேகொடையில் வசிக்க வேண்டியதில்லை — 18 மாவட்டங்களில் உறுப்பினர்கள் உள்ளனர்.",
      ),
    },
    {
      category: "MEMBERSHIP",
      q: tri("How long does an application take?", "අයදුම්පතක් තීරණය වන්නේ කොපමණ කාලයකින්ද?", "விண்ணப்பம் எவ்வளவு காலம் எடுக்கும்?"),
      a: tri(
        "The membership sub-committee meets monthly. Most applications are decided within four weeks. You will receive an email and SMS with the outcome and, if approved, payment instructions.",
        "සාමාජික උපකමිටුව මාසිකව රැස්වේ. බොහෝ අයදුම්පත් සති හතරක් ඇතුළත තීරණය වේ. ප්‍රතිඵලය ඊමේල් සහ කෙටි පණිවුඩයකින් ලැබෙන අතර, අනුමත වුවහොත් ගෙවීම් උපදෙස් ලැබේ.",
        "உறுப்பினர் உபகுழு மாதாந்தம் கூடுகிறது. பெரும்பாலான விண்ணப்பங்கள் நான்கு வாரங்களில் தீர்மானிக்கப்படும். முடிவு மின்னஞ்சல் மற்றும் SMS மூலம் வரும்; அனுமதிக்கப்பட்டால் கட்டண வழிகாட்டிகளும்.",
      ),
    },
    {
      category: "MEMBERSHIP",
      q: tri("What are the membership fees?", "සාමාජික ගාස්තු කීයද?", "உறுப்பினர் கட்டணம் என்ன?"),
      a: tri(
        "A one-time registration fee of Rs. 1,000, then Rs. 300 a month. Life membership is a single payment of Rs. 25,000 and has no monthly subscription.",
        "එක් වරක් ලියාපදිංචි ගාස්තුව රු. 1,000, පසුව මසකට රු. 300. ජීවිත සාමාජිකත්වය රු. 25,000 ක එක් ගෙවීමක් වන අතර මාසික දායක මුදලක් නැත.",
        "ஒருமுறைப் பதிவுக் கட்டணம் ரூ. 1,000, பின்னர் மாதம் ரூ. 300. வாழ்நாள் உறுப்பினர் ரூ. 25,000 ஒரே கட்டணம், மாதாந்த சந்தா இல்லை.",
      ),
    },
    {
      category: "DONATIONS",
      q: tri("How do I know my donation was used as intended?", "මගේ පරිත්‍යාගය අදහස් කළ ආකාරයට භාවිත වූ බව දැනගන්නේ කෙසේද?", "என் நன்கொடை நோக்கப்படி பயன்பட்டது எப்படித் தெரியும்?"),
      a: tri(
        "Every confirmed donation is receipted and appears in Donation Updates. Annual reports break spending down by welfare, projects and administration. You can also email the treasurer with your reference number.",
        "තහවුරු කළ සෑම පරිත්‍යාගයකටම රිසිට්පතක් නිකුත් කර පරිත්‍යාග යාවත්කාලීනව පෙන්වයි. වාර්ෂික වාර්තා සුබසාධන, ව්‍යාපෘති සහ පරිපාලනය අනුව වියදම් බෙදයි. ඔබේ යොමු අංකය සමඟ භාණ්ඩාගාරිකට ඊමේල් කළ හැක.",
        "உறுதிப்படுத்தப்பட்ட ஒவ்வொரு நன்கொடைக்கும் ரசீது வழங்கப்பட்டு நன்கொடை புதுப்பிப்புகளில் தோன்றும். வருடாந்த அறிக்கைகள் நலன், திட்டங்கள், நிர்வாகம் எனச் செலவைப் பிரிக்கும். உங்கள் குறிப்பு எண்ணுடன் பொருளாளருக்கு மின்னஞ்சல் செய்யலாம்.",
      ),
    },
    {
      category: "DONATIONS",
      q: tri("Can I donate without becoming a member?", "සාමාජිකයෙකු නොවී පරිත්‍යාග කළ හැකිද?", "உறுப்பினராகாமல் நன்கொடை அளிக்கலாமா?"),
      a: tri(
        "Yes. Use the Donate Now form, make a bank transfer, or leave cash at the office against a receipt. Membership is optional.",
        "ඔව්. දැන් පරිත්‍යාග කරන්න පෝරමය, බැංකු මාරුව, හෝ කාර්යාලයේ රිසිට්පතකට මුදල් භාර දිය හැක. සාමාජිකත්වය අත්‍යවශ්‍ය නැත.",
        "ஆம். இப்போது நன்கொடை படிவம், வங்கிப் பரிமாற்றம், அல்லது அலுவலகத்தில் ரசீதுக்குப் பணம். உறுப்பினர் விருப்பமானது.",
      ),
    },
    {
      category: "DONATIONS",
      q: tri("Do you accept standing orders / monthly gifts?", "මාසික පරිත්‍යාග පිළිගන්නවාද?", "மாதாந்த நன்கொடை ஏற்றுக்கொள்கிறீர்களா?"),
      a: tri(
        "Yes. Set up a standing order to the association account and tick Monthly on the donation form so we can match the transfers and issue an annual receipt for tax records.",
        "ඔව්. සමිති ගිණුමට ස්ථාවර නියෝගයක් යොදා පෝරමයේ මාසික ලෙස සලකුණු කරන්න. එවිට මාරු ගැලපී බදු වාර්තා සඳහා වාර්ෂික රිසිට්පතක් නිකුත් කළ හැක.",
        "ஆம். சங்கக் கணக்கிற்கு நிரந்தர ஆணை அமைத்து படிவத்தில் மாதாந்தம் எனக் குறியிடுங்கள். பரிமாற்றங்களைப் பொருத்தி வரிப் பதிவுகளுக்கு வருடாந்த ரசீது வழங்குவோம்.",
      ),
    },
    {
      category: "WELFARE",
      q: tri("When does welfare cover begin?", "සුබසාධක ආවරණය ආරම්භ වන්නේ කවදාද?", "நலன் பாதுகாப்பு எப்போது தொடங்கும்?"),
      a: tri(
        "Most schemes have a six-month waiting period after your first subscription is paid. Emergency hospital transport is available from day one. See each programme page for the exact rule.",
        "බොහෝ යෝජනාවල පළමු දායක මුදල ගෙවීමෙන් පසු මාස හයක රැඳී සිටීමේ කාලයක් ඇත. හදිසි රෝහල් ප්‍රවාහනය පළමු දිනයේ සිට ලැබේ. නිශ්චිත නීතිය සඳහා එක් එක් වැඩසටහන් පිටුව බලන්න.",
        "பெரும்பாலான திட்டங்களில் முதல் சந்தா செலுத்திய பின் ஆறு மாத காத்திருப்புண்டு. அவசர வைத்தியசாலை போக்குவரத்து முதல் நாளிலிருந்தே உண்டு. சரியான விதிக்கு ஒவ்வொரு நிகழ்ச்சிப் பக்கத்தையும் பாருங்கள்.",
      ),
    },
    {
      category: "WELFARE",
      q: tri("How do I make a welfare claim?", "සුබසාධක ඉල්ලීමක් කරන්නේ කෙසේද?", "நலன் கோரிக்கையை எப்படிச் செய்வது?"),
      a: tri(
        "Log in to the member dashboard and open a welfare claim, or download the claim form from the Document Center and hand it to the secretary with supporting documents. Urgent cases: call the hotline.",
        "සාමාජික පුවරුවට පිවිස සුබසාධක ඉල්ලීමක් විවෘත කරන්න, නැතහොත් ලේඛන මධ්‍යස්ථානයෙන් පෝරමය බාගත කර සහායක ලේඛන සමඟ ලේකම්ට භාර දෙන්න. හදිසි: හොට්ලයින් අමතන්න.",
        "உறுப்பினர் பலகையில் நலன் கோரிக்கையைத் திறங்கள், அல்லது ஆவண மையத்திலிருந்து படிவத்தைப் பதிவிறக்கி ஆதார ஆவணங்களுடன் செயலாளரிடம் கொடுங்கள். அவசரம்: அவசர இலக்கை அழையுங்கள்.",
      ),
    },
    {
      category: "VOLUNTEER",
      q: tri("Do I have to be a member to volunteer?", "ස්වේච්ඡා සේවයට සාමාජිකයෙකු විය යුතුද?", "தொண்டர் ஆக உறுப்பினராக வேண்டுமா?"),
      a: tri(
        "No. The volunteer form is open to anyone aged 16 or over. Members are welcome too — many of our camp marshals are members giving extra hours.",
        "නැත. ස්වේච්ඡා පෝරමය වයස 16ට වැඩි ඕනෑම අයෙකුට විවෘතයි. සාමාජිකයින්ටත් ආරාධනා — අපගේ කඳවුරු මාෂල්වරුන් බොහෝ දෙනෙක් අමතර වේලාවන් දෙන සාමාජිකයින්ය.",
        "இல்லை. தொண்டர் படிவம் 16 வயதுக்கு மேற்பட்ட எவருக்கும் திறந்தது. உறுப்பினர்களும் வரவேற்கப்படுவர் — எமது முகாம் அமைப்பாளர்கள் பலர் கூடுதல் நேரம் தரும் உறுப்பினர்கள்.",
      ),
    },
    {
      category: "VOLUNTEER",
      q: tri("Is there training?", "පුහුණුවක් තිබේද?", "பயிற்சி உண்டா?"),
      a: tri(
        "Yes. New volunteers attend a half-day orientation covering safeguarding, first aid basics and how a distribution is run. A certificate of service is issued after 40 hours.",
        "ඔව්. නව ස්වේච්ඡා සේවකයින් ආරක්ෂාව, මූලික ප්‍රථමාධාර සහ බෙදාහැරීමක් පවත්වන ආකාරය ආවරණය කරන අර්ධ දින දිශානතියකට සහභාගී වේ. පැය 40කට පසු සේවා සහතිකයක් නිකුත් කෙරේ.",
        "ஆம். புதிய தொண்டர்கள் பாதுகாப்பு, அடிப்படை முதலுதவி, விநியோகம் நடத்தும் முறை ஆகியவற்றை உள்ளடக்கிய அரைநாள் அறிமுகத்தில் பங்கேற்கின்றனர். 40 மணி நேரத்திற்குப் பின் சேவைச் சான்றிதழ் வழங்கப்படும்.",
      ),
    },
    {
      category: "GENERAL",
      q: tri("Where is the office and when is it open?", "කාර්යාලය කොහේද, විවෘත වන්නේ කවදාද?", "அலுவலகம் எங்கே, எப்போது திறந்திருக்கும்?"),
      a: tri(
        "No. 142, Temple Road, Nugegoda. Monday to Friday 9.00 a.m. to 4.30 p.m., Saturday until noon. The welfare hotline is answered outside those hours.",
        "නුගේගොඩ, ටෙම්පල් පාර, අංක 142. සඳුදා–සිකුරාදා පෙ.ව. 9.00 – ප.ව. 4.30, සෙනසුරාදා දහවල් දක්වා. එම වේලාවෙන් පිටත සුබසාධක හොට්ලයින්ට පිළිතුරු දෙනු ලැබේ.",
        "நுகேகொடை, கோவில் வீதி, இல. 142. திங்கள்–வெள்ளி காலை 9.00 – மாலை 4.30, சனி நண்பகல் வரை. அந்த நேரத்திற்கு வெளியே நலன் அவசர இலக்கிற்குப் பதிலளிக்கப்படும்.",
      ),
    },
    {
      category: "GENERAL",
      q: tri("Is the website available in Sinhala and Tamil?", "වෙබ් අඩවිය සිංහලෙන් සහ දෙමළින් තිබේද?", "இணையதளம் சிங்களத்திலும் தமிழிலும் உள்ளதா?"),
      a: tri(
        "Yes. Use the language toggle in the header to switch between English, Sinhala and Tamil. Your choice is remembered.",
        "ඔව්. ශීර්ෂකයේ භාෂා මාරුව භාවිතයෙන් ඉංග්‍රීසි, සිංහල සහ දෙමළ අතර මාරු වන්න. ඔබේ තේරීම මතක තබා ගනී.",
        "ஆம். தலைப்பில் உள்ள மொழி மாற்றியைப் பயன்படுத்தி ஆங்கிலம், சிங்களம், தமிழ் இடையே மாறுங்கள். உங்கள் தேர்வு நினைவில் வைக்கப்படும்.",
      ),
    },
  ];

  await prisma.faq.createMany({
    data: faqs.map((f, i) => ({
      category: f.category,
      sortOrder: i,
      ...t3("question", f.q),
      ...t3("answer", f.a),
    })),
  });

  await prisma.document.createMany({
    data: [
      { slug: "membership-application", category: "APPLICATION_FORM", fileUrl: "/documents/membership-application-form.pdf", fileSizeKb: 240, version: "2026.1", membersOnly: false, ...t3("title", tri("Membership application form", "සාමාජික අයදුම්පත", "உறுப்பினர் விண்ணப்பப் படிவம்")), ...t3("description", tri("Print, complete and submit to the secretary, or apply online.", "මුද්‍රණය කර පුරවා ලේකම්ට භාර දෙන්න, නැතහොත් අන්තර්ජාලයෙන් අයදුම් කරන්න.", "அச்சிட்டு நிரப்பி செயலாளரிடம் கொடுங்கள், அல்லது இணையத்தில் விண்ணப்பிக்கவும்.")) },
      { slug: "welfare-claim-form", category: "APPLICATION_FORM", fileUrl: "/documents/welfare-claim-form.pdf", fileSizeKb: 180, version: "2026.1", membersOnly: false, ...t3("title", tri("Welfare claim form (HLA/W-04)", "සුබසාධක ඉල්ලීම් පෝරමය (HLA/W-04)", "நலன் கோரிக்கைப் படிவம் (HLA/W-04)")), ...t3("description", tri("Use for medical, hardship and other welfare claims with supporting documents.", "වෛද්‍ය, දුෂ්කරතා සහ අනෙකුත් සුබසාධක ඉල්ලීම් සඳහා සහායක ලේඛන සමඟ.", "மருத்துவ, சிரமம் மற்றும் பிற நலன் கோரிக்கைகளுக்கு ஆதார ஆவணங்களுடன்.")) },
      { slug: "constitution", category: "CONSTITUTION", fileUrl: "/documents/constitution.pdf", fileSizeKb: 890, version: "2016 as amended 2024", membersOnly: false, ...t3("title", tri("Constitution of the Association", "සමිතියේ ව්‍යවස්ථාව", "சங்கத்தின் அரசியலமைப்பு")), ...t3("description", tri("The governing document, including objects, membership rules and the powers of the committee.", "අරමුණු, සාමාජික නීති සහ කමිටු බලතල ඇතුළු පාලන ලේඛනය.", "நோக்கங்கள், உறுப்பினர் விதிகள், குழு அதிகாரங்கள் உள்ளிட்ட ஆளும் ஆவணம்.")) },
      { slug: "child-protection-policy", category: "POLICY", fileUrl: "/documents/child-protection-policy.pdf", fileSizeKb: 310, version: "3.0", membersOnly: false, ...t3("title", tri("Child protection policy", "ළමා ආරක්ෂණ ප්‍රතිපත්තිය", "குழந்தை பாதுகாப்புக் கொள்கை")), ...t3("description", tri("Safeguarding rules for all staff, volunteers and contractors working with children.", "දරුවන් සමඟ කටයුතු කරන සියලු කාර්ය මණ්ඩල, ස්වේච්ඡා සේවක සහ කොන්ත්‍රාත්කරුවන් සඳහා ආරක්ෂණ නීති.", "குழந்தைகளுடன் பணியாற்றும் அனைத்து ஊழியர், தொண்டர், ஒப்பந்ததாரருக்கான பாதுகாப்பு விதிகள்.")) },
      { slug: "grievance-procedure", category: "POLICY", fileUrl: "/documents/grievance-procedure.pdf", fileSizeKb: 210, version: "2.1", membersOnly: false, ...t3("title", tri("Grievance procedure", "පැමිණිලි ක්‍රියා පටිපාටිය", "குறைதீர்ப்பு நடைமுறை")), ...t3("description", tri("How members raise a complaint, including timelines and appeal to the general meeting.", "සාමාජිකයින් පැමිණිල්ලක් ඉදිරිපත් කරන ආකාරය, කාල සීමා සහ මහා සභාවට අභියාචනය ඇතුළුව.", "உறுப்பினர்கள் புகார் செய்யும் முறை, காலக்கெடு மற்றும் பொதுக் கூட்ட மேல்முறையீடு உட்பட.")) },
      { slug: "scholarship-guidelines", category: "GUIDE", fileUrl: "/documents/scholarship-guidelines.pdf", fileSizeKb: 260, version: "2026", membersOnly: false, ...t3("title", tri("Scholarship guidelines 2026", "ශිෂ්‍යත්ව මාර්ගෝපදේශ 2026", "உதவித்தொகை வழிகாட்டி 2026")), ...t3("description", tri("Eligibility, selection weighting and payment schedule for Pahana awards.", "පහන සම්මාන සඳහා සුදුසුකම්, තේරීම් බර සහ ගෙවීම් කාලසටහන.", "பஹன விருதுகளுக்கான தகுதி, தேர்வு எடை, கட்டண அட்டவணை.")) },
      { slug: "volunteer-handbook", category: "GUIDE", fileUrl: "/documents/volunteer-handbook.pdf", fileSizeKb: 540, version: "2025.4", membersOnly: false, ...t3("title", tri("Volunteer handbook", "ස්වේච්ඡා අත්පොත", "தொண்டர் கையேடு")), ...t3("description", tri("Orientation notes, safeguarding, camp roles and the code of conduct.", "දිශානති සටහන්, ආරක්ෂාව, කඳවුරු භූමිකා සහ හැසිරීම් සංග්‍රහය.", "அறிமுகக் குறிப்புகள், பாதுகாப்பு, முகாம் பொறுப்புகள், நடத்தை விதி.")) },
      { slug: "circular-subscriptions", category: "CIRCULAR", fileUrl: "/documents/circular-2026-01-subscriptions.pdf", fileSizeKb: 90, version: "2026/01", membersOnly: true, ...t3("title", tri("Circular 2026/01 — Subscriptions", "චක්‍රලේඛය 2026/01 — දායක මුදල්", "சுற்றறிக்கை 2026/01 — சந்தா")), ...t3("description", tri("Notice of the 2026 monthly subscription and how to set up a standing order.", "2026 මාසික දායක මුදල සහ ස්ථාවර නියෝගයක් යොදන ආකාරය පිළිබඳ දැනුම්දීම.", "2026 மாதாந்த சந்தா மற்றும் நிரந்தர ஆணை அமைக்கும் முறை பற்றிய அறிவிப்பு.")) },
    ],
  });

  const reports = [
    { year: 2021, income: 8_240_000, exp: 7_410_000, welfare: 4_820_000, project: 1_860_000, admin: 730_000, reserve: 2_110_000, members: 980, kb: 4200 },
    { year: 2022, income: 11_560_000, exp: 10_240_000, welfare: 6_410_000, project: 2_740_000, admin: 1_090_000, reserve: 3_430_000, members: 1180, kb: 4680 },
    { year: 2023, income: 14_280_000, exp: 12_960_000, welfare: 8_120_000, project: 3_480_000, admin: 1_360_000, reserve: 4_750_000, members: 1420, kb: 5120 },
    { year: 2024, income: 18_640_000, exp: 16_820_000, welfare: 10_540_000, project: 4_620_000, admin: 1_660_000, reserve: 6_570_000, members: 1640, kb: 5840 },
    { year: 2025, income: 22_410_000, exp: 20_180_000, welfare: 12_860_000, project: 5_910_000, admin: 1_410_000, reserve: 8_800_000, members: 1840, kb: 6420 },
  ];

  await prisma.annualReport.createMany({
    data: reports.map((r) => ({
      year: r.year,
      fileUrl: `/documents/annual-report-${r.year}.pdf`,
      fileSizeKb: r.kb,
      auditedBy: "Fernando, Perera & Co. Chartered Accountants",
      totalIncome: r.income,
      totalExpenditure: r.exp,
      welfareSpend: r.welfare,
      projectSpend: r.project,
      adminSpend: r.admin,
      reserveBalance: r.reserve,
      membersAtYearEnd: r.members,
      ...t3("title", tri(`Annual Report ${r.year}`, `වාර්ෂික වාර්තාව ${r.year}`, `வருடாந்த அறிக்கை ${r.year}`)),
      ...t3(
        "summary",
        tri(
          `Audited accounts for the year ended 31 December ${r.year}, covering income, welfare disbursement, community projects and the closing reserve.`,
          `${r.year} දෙසැම්බර් 31ෙන් අවසන් වූ වර්ෂයේ විගණිත ගිණුම් — ආදායම, සුබසාධක වියදම්, ප්‍රජා ව්‍යාපෘති සහ අවසන් සංචිතය.`,
          `${r.year} டிசம்பர் 31 இல் முடிவடைந்த ஆண்டின் தணிக்கை கணக்குகள் — வருமானம், நலன் செலவு, சமூகத் திட்டங்கள், இறுதி ஒதுக்கீடு.`,
        ),
      ),
    })),
  });

  const memberIds: string[] = [demoMember.id];
  for (let i = 1; i < 42; i += 1) {
    const [fullName, initials] = ALL_NAMES[i % ALL_NAMES.length];
    const district = DISTRICTS[i % DISTRICTS.length];
    const city = pickFrom(rng, CITY_BY_DISTRICT[district] ?? ["Town"]);
    const types = ["ORDINARY", "ORDINARY", "ORDINARY", "ORDINARY", "JUNIOR"] as const;
    const created = await prisma.member.create({
      data: {
        membershipNo: membershipNo(i + 1),
        fullName: i % 7 === 0 ? `${fullName} ${i}` : fullName,
        nameWithInitials: initials,
        nic: `${1980 + (i % 25)}${String(100000 + i * 17).slice(0, 6)}`,
        dateOfBirth: new Date(1968 + (i % 35), i % 12, (i % 27) + 1),
        gender: i % 3 === 0 ? "FEMALE" : "MALE",
        civilStatus: i % 4 === 0 ? "SINGLE" : "MARRIED",
        occupation: pickFrom(rng, OCCUPATIONS),
        addressLine1: `${20 + i} ${pickFrom(rng, ["Temple Road", "Galle Road", "Hill Street", "Lake Road"])}`,
        city,
        district,
        phone: `077${String(1000000 + i * 37).slice(0, 7)}`,
        email: i % 2 === 0 ? `member${i}@example.lk` : null,
        bloodGroup: pickFrom(rng, BLOOD),
        membershipType: types[i % types.length],
        status: i === 8 ? "PENDING" : "ACTIVE",
        joinedAt: daysAgo(120 + i * 40),
        showInDirectory: i % 5 !== 0,
      },
    });
    memberIds.push(created.id);
  }

  const purposes = ["GENERAL", "EMERGENCY", "EDUCATION", "MEDICAL", "PROJECT"] as const;
  const methods = ["BANK_TRANSFER", "ONLINE_CARD", "CASH", "CHEQUE"] as const;
  for (let i = 0; i < 72; i += 1) {
    const [name] = ALL_NAMES[i % ALL_NAMES.length];
    const amount = pickFrom(rng, [1000, 2500, 5000, 10000, 15000, 25000, 50000]);
    const createdAt = daysAgo(randomInt(rng, 2, 400));
    const confirmed = i % 11 !== 0;
    await prisma.donation.create({
      data: {
        reference: `DON-2026-${String(1000 + i)}`,
        donorName: name,
        email: `donor${i}@example.lk`,
        phone: i % 3 === 0 ? `071${String(2000000 + i).slice(0, 7)}` : null,
        amount,
        method: methods[i % methods.length],
        purpose: purposes[i % purposes.length],
        isAnonymous: i % 9 === 0,
        isRecurring: i % 13 === 0,
        status: confirmed ? "CONFIRMED" : "PENDING",
        createdAt,
        confirmedAt: confirmed ? createdAt : null,
        memberId: i % 4 === 0 ? memberIds[i % memberIds.length] : null,
        message: i % 6 === 0 ? "For the scholarship children. Thank you." : null,
      },
    });
  }

  for (let i = 0; i < 18; i += 1) {
    await prisma.payment.create({
      data: {
        receiptNo: `REC-2026-${String(200 + i)}`,
        memberId: memberIds[i % memberIds.length],
        amount: i % 5 === 0 ? 25000 : 300,
        type: i % 5 === 0 ? "REGISTRATION" : "MEMBERSHIP_FEE",
        periodYear: 2026,
        periodMonth: i % 5 === 0 ? null : ((i % 12) + 1),
        method: "BANK_TRANSFER",
        status: i === 3 ? "PENDING" : "PAID",
        paidAt: daysAgo(10 + i * 8),
      },
    });
  }

  const months = monthsBack(18);
  await prisma.monthlyStat.createMany({
    data: months.map((m, i) => {
      const seasonal = m.month === 4 || m.month === 12 ? 1.45 : m.month === 5 ? 1.7 : 1;
      return {
        year: m.year,
        month: m.month,
        donationTotal: Math.round((980_000 + i * 42_000) * seasonal),
        donationCount: Math.round((38 + i * 2) * seasonal),
        newMembers: 8 + (i % 7),
        welfarePaid: Math.round((620_000 + i * 28_000) * (m.month === 5 ? 1.8 : 1)),
        claimsCount: 12 + (i % 9),
        eventsHeld: 1 + (i % 3),
        volunteers: 18 + (i % 12),
      };
    }),
  });

  const programmes = await prisma.programme.findMany({ select: { id: true, slug: true } });
  const death = programmes.find((p) => p.slug === "death-donation-scheme") ?? programmes[0];
  const medical = programmes.find((p) => p.slug === "medical-assistance-fund") ?? programmes[0];

  await prisma.benefitClaim.createMany({
    data: [
      { claimNo: "CLM-2026-014", memberId: demoMember.id, programmeId: medical.id, amount: 45000, reason: "Dialysis support for January–March.", status: "PAID", submittedAt: daysAgo(80), decidedAt: daysAgo(70), paidAt: daysAgo(65) },
      { claimNo: "CLM-2026-041", memberId: demoMember.id, programmeId: medical.id, amount: 18000, reason: "Chronic medication reimbursement.", status: "UNDER_REVIEW", submittedAt: daysAgo(9) },
      { claimNo: "CLM-2026-022", memberId: memberIds[2], programmeId: death.id, amount: 150000, reason: "Death donation — registered spouse.", status: "PAID", submittedAt: daysAgo(40), decidedAt: daysAgo(38), paidAt: daysAgo(37) },
    ],
  });

  const newsItems = [
    { slug: "may-flood-response-2025", cat: "ACTIVITY_REPORT", img: "/media/flood-relief.svg", days: 110, feat: true, title: tri("How we responded to the May 2025 floods", "2025 මැයි ගංවතුරට අප ප්‍රතිචාර දැක්වූ ආකාරය", "2025 மே வெள்ளத்திற்கு நாம் பதிலளித்த விதம்"), excerpt: tri("34 families housed, 1,200 ration packs issued, and a housing project that is still running.", "පවුල් 34කට නවාතැන්, සැනකිලි ඇසුරුම් 1,200ක්, තවමත් ක්‍රියාත්මක නිවාස ව්‍යාපෘතියක්.", "34 குடும்பங்களுக்கு தங்குமிடம், 1,200 உணவுப் பொதிகள், இன்னும் நடக்கும் வீடமைப்புத் திட்டம்.") },
    { slug: "scholarship-awards-2026", cat: "NEWS", img: "/media/scholarship-award.svg", days: 28, feat: true, title: tri("96 Pahana scholarships awarded for 2026", "2026 සඳහා පහන ශිෂ්‍යත්ව 96ක් ප්‍රදානය කෙරිණි", "2026க்கு 96 பஹன உதவித்தொகைகள் வழங்கப்பட்டன"), excerpt: tri("Awards were presented at the Nugegoda hall in front of parents, mentors and the education sub-committee.", "දෙමාපියන්, උපදේශකයින් සහ අධ්‍යාපන උපකමිටුව ඉදිරියේ නුගේගොඩ ශාලාවේදී ප්‍රදානය කෙරිණි.", "பெற்றோர், வழிகாட்டிகள், கல்வி உபகுழு முன்னிலையில் நுகேகொடை மண்டபத்தில் வழங்கப்பட்டன.") },
    { slug: "agm-notice-2026", cat: "NEWS", img: "/media/general-meeting.svg", days: 12, feat: false, title: tri("Notice of the 2026 Annual General Meeting", "2026 වාර්ෂික මහා සභා රැස්වීමේ දැනුම්දීම", "2026 வருடாந்த பொதுக் கூட்ட அறிவிப்பு"), excerpt: tri("Saturday 26 September, 9.00 a.m., association hall. Agenda and audited accounts attached.", "සැප්තැම්බර් 26 සෙනසුරාදා පෙ.ව. 9.00, සමිති ශාලාව. ව්‍යවස්ථාගත න්‍යාය පත්‍රය සහ විගණිත ගිණුම්.", "செப்டம்பர் 26 சனி காலை 9.00, சங்க மண்டபம். நிகழ்ச்சி நிரல் மற்றும் தணிக்கை கணக்குகள்.") },
    { slug: "eye-clinic-homagama", cat: "ACTIVITY_REPORT", img: "/media/eye-clinic.svg", days: 45, feat: false, title: tri("Eye clinic in Homagama screens 410 residents", "හෝමාගම ඇස් සායනයේදී පදිංචිකරුවන් 410ක් පරීක්ෂා විය", "ஹோமாகம கண் முகாமில் 410 பேர் பரிசோதிக்கப்பட்டனர்"), excerpt: tri("84 cataract referrals, 190 pairs of reading glasses issued on the day.", "අක්ෂි පටල යොමු 84ක්, එදිනම කියවීමේ කණ්ණාඩි 190ක් නිකුත් විය.", "84 கண்புரை பரிந்துரைகள், அன்றே 190 வாசிப்புக் கண்ணாடிகள்.") },
    { slug: "blood-donation-drive", cat: "NEWS", img: "/media/blood-donation.svg", days: 6, feat: true, title: tri("Blood donation drive collects 112 units", "රුධිර පරිත්‍යාග කඳවුරින් ඒකක 112ක්", "இரத்த தான முகாமில் 112 அலகுகள்"), excerpt: tri("Held with the National Blood Transfusion Service at the association hall.", "ජාතික රුධිර පාරවිලයන සේවය සමඟ සමිති ශාලාවේදී.", "தேசிய இரத்தமாற்ற சேவையுடன் சங்க மண்டபத்தில்.") },
    { slug: "transparency-report-2025", cat: "PRESS", img: "/media/annual-report.svg", days: 20, feat: false, title: tri("2025 annual report published", "2025 වාර්ෂික වාර්තාව ප්‍රකාශයට පත් විය", "2025 வருடாந்த அறிக்கை வெளியிடப்பட்டது"), excerpt: tri("Rs. 20.18 million spent, 6.9% on administration. Download from Transparency.", "රු. මිලියන 20.18ක් වියදම්, පරිපාලනය 6.9%. විනිවිදභාවය පිටුවෙන් බාගත කරන්න.", "ரூ. 20.18 மில்லியன் செலவு, நிர்வாகம் 6.9%. வெளிப்படைத்தன்மை பக்கத்தில் பதிவிறக்குங்கள்.") },
  ];

  for (const n of newsItems) {
    await prisma.newsPost.create({
      data: {
        slug: n.slug,
        category: n.cat,
        coverImage: n.img,
        isFeatured: n.feat,
        publishedAt: daysAgo(n.days),
        tags: "welfare,community,sri-lanka",
        author: "Media Unit",
        ...t3("title", n.title),
        ...t3("excerpt", n.excerpt),
        ...t3(
          "body",
          tri(
            `<p>${n.excerpt.en}</p><h2>What happened</h2><p>The programme was organised by the executive committee with volunteers from three districts. Full figures will appear in the next quarterly activity report.</p><p>Members who wish to help with the follow-up can register through the volunteer form or open a support ticket from the dashboard.</p>`,
            `<p>${n.excerpt.si}</p><h2>සිදු වූ දේ</h2><p>වැඩසටහන විධායක කමිටුව සහ දිස්ත්‍රික්ක තුනක ස්වේච්ඡා සේවකයින් විසින් සංවිධානය කරන ලදී. සම්පූර්ණ ඉලක්කම් ඊළඟ කාර්තුමය වාර්තාවේ පළ වේ.</p>`,
            `<p>${n.excerpt.ta}</p><h2>நடந்தது</h2><p>நிகழ்ச்சி நிர்வாகக் குழுவும் மூன்று மாவட்டத் தொண்டர்களும் ஏற்பாடு செய்தனர். முழு எண்கள் அடுத்த காலாண்டு அறிக்கையில் வரும்.</p>`,
          ),
        ),
      },
    });
  }

  const events = [
    { slug: "mobile-medical-camp-kandy", img: "/media/medical-camp.svg", ahead: 18, venue: "Peradeniya Maha Vidyalaya grounds", city: "Kandy", title: tri("Mobile medical camp — Kandy", "ජංගම වෛද්‍ය කඳවුර — මහනුවර", "அலைமருத்துவ முகாம் — கண்டி"), summary: tri("GP, eye, dental and pharmacy stalls. Free for the public.", "සාමාන්‍ය වෛද්‍ය, ඇස්, දන්ත සහ ඖෂධ ස්ථාන. මහජනයාට නොමිලේ.", "பொது மருத்துவம், கண், பல், மருந்தகம். பொதுமக்களுக்கு இலவசம்.") },
    { slug: "agm-2026", img: "/media/general-meeting.svg", ahead: 25, venue: "HLA Association Hall", city: "Nugegoda", title: tri("Annual General Meeting 2026", "වාර්ෂික මහා සභාව 2026", "வருடாந்த பொதுக் கூட்டம் 2026"), summary: tri("Election of office bearers and adoption of the audited accounts.", "නිලධාරීන් තේරීම සහ විගණිත ගිණුම් සම්මත කිරීම.", "அலுவலர் தேர்தல் மற்றும் தணிக்கை கணக்குகள் ஏற்பு.") },
    { slug: "volunteer-orientation-sep", img: "/media/volunteer-training.svg", ahead: 9, venue: "HLA Association Hall", city: "Nugegoda", title: tri("Volunteer orientation", "ස්වේච්ඡා දිශානතිය", "தொண்டர் அறிமுகம்"), summary: tri("Half-day training for new volunteers. Certificate track starts here.", "නව ස්වේච්ඡා සේවකයින්ට අර්ධ දින පුහුණුව.", "புதிய தொண்டர்களுக்கு அரைநாள் பயிற்சி.") },
    { slug: "elders-day-2026", img: "/media/elders-day.svg", ahead: -40, venue: "HLA Association Hall", city: "Nugegoda", title: tri("Elders' Day celebration", "වැඩිහිටි දින උත්සවය", "முதியோர் நாள் விழா"), summary: tri("Lunch, music and health checks for 180 members over sixty.", "අවුරුදු හැටට වැඩි සාමාජිකයින් 180කට දිවා ආහාර, සංගීතය සහ සෞඛ්‍ය පරීක්ෂා.", "அறுபதுக்கு மேற்பட்ட 180 உறுப்பினர்களுக்கு மதிய உணவு, இசை, சுகாதாரப் பரிசோதனை.") },
    { slug: "dry-ration-drive", img: "/media/dry-rations.svg", ahead: -70, venue: "Homagama DS office", city: "Homagama", title: tri("Dry ration distribution", "වියළි සැනකිලි බෙදාහැරීම", "உலர் உணவு விநியோகம்"), summary: tri("Packs for 320 flood-affected households.", "ගංවතුරින් පීඩාවට පත් නිවෙස් 320කට ඇසුරුම්.", "வெள்ளத்தால் பாதிக்கப்பட்ட 320 வீடுகளுக்குப் பொதிகள்.") },
  ];

  for (const e of events) {
    const start = e.ahead >= 0 ? daysAhead(e.ahead, 9) : daysAgo(-e.ahead, 9);
    await prisma.event.create({
      data: {
        slug: e.slug,
        venue: e.venue,
        city: e.city,
        startsAt: start,
        endsAt: new Date(start.getTime() + 5 * 3600_000),
        coverImage: e.img,
        capacity: 250,
        registrationOpen: e.ahead >= 0,
        attendeeCount: e.ahead >= 0 ? 40 : 180,
        ...t3("title", e.title),
        ...t3("summary", e.summary),
        ...t3("body", tri(`<p>${e.summary.en}</p><p>Please bring your NIC. Volunteers should check in 45 minutes early.</p>`, `<p>${e.summary.si}</p><p>ජාතික හැඳුනුම්පත ගෙන එන්න. ස්වේච්ඡා සේවකයින් මිනිත්තු 45කට පෙර පැමිණෙන්න.</p>`, `<p>${e.summary.ta}</p><p>தேசிய அடையாள அட்டையை கொண்டு வாருங்கள். தொண்டர்கள் 45 நிமிடம் முன் வாருங்கள்.</p>`)),
      },
    });
  }

  const albums = [
    { slug: "flood-relief-2025", cat: "COMMUNITY", img: "/media/flood-relief.svg", title: tri("Flood relief, May 2025", "ගංවතුර සහනය, 2025 මැයි", "வெள்ள நிவாரணம், மே 2025") },
    { slug: "medical-camp-gallery", cat: "EVENT", img: "/media/medical-camp.svg", title: tri("Medical camps", "වෛද්‍ය කඳවුරු", "மருத்துவ முகாம்கள்") },
    { slug: "scholarship-day", cat: "HIGHLIGHT", img: "/media/scholarship-award.svg", title: tri("Scholarship awards", "ශිෂ්‍යත්ව ප්‍රදාන", "உதவித்தொகை விழா") },
    { slug: "community-days", cat: "COMMUNITY", img: "/media/elders-day.svg", title: tri("Community days", "ප්‍රජා දින", "சமூக நாட்கள்") },
    { slug: "blood-donation-album", cat: "EVENT", img: "/media/blood-donation.svg", title: tri("Blood donation drives", "රුධිර පරිත්‍යාග", "இரத்த தானம்") },
  ];

  const mediaPool = [
    "/media/flood-relief.svg",
    "/media/medical-camp.svg",
    "/media/food-distribution.svg",
    "/media/scholarship-award.svg",
    "/media/eye-clinic.svg",
    "/media/blood-donation.svg",
    "/media/elders-day.svg",
    "/media/school-supplies.svg",
    "/media/housing-project.svg",
    "/media/water-project.svg",
  ];

  for (const a of albums) {
    await prisma.galleryAlbum.create({
      data: {
        slug: a.slug,
        category: a.cat,
        coverImage: a.img,
        takenAt: daysAgo(30 + albums.indexOf(a) * 40),
        ...t3("title", a.title),
        ...t3("caption", tri("Photographs from the field, published with consent.", "ක්ෂේත්‍රයේ ඡායාරූප, අවසරය සමඟ ප්‍රකාශිතයි.", "களப் படங்கள், ஒப்புதலுடன் வெளியிடப்பட்டவை.")),
        items: {
          create: mediaPool.slice(0, 6).map((url, i) => ({
            type: i === 5 ? "VIDEO" : "PHOTO",
            url,
            thumbnail: url,
            sortOrder: i,
            ...t3("caption", tri("Field photograph", "ක්ෂේත්‍ර ඡායාරූපය", "களப் படம்")),
          })),
        },
      },
    });
  }

  const housing = projectRecords.find((p) => p.slug === "sarana-housing-2026");
  await prisma.fundAllocation.createMany({
    data: [
      { projectId: housing?.id, amount: 840000, category: "INFRASTRUCTURE", spentAt: daysAgo(60), ...t3("title", tri("Roofing sheets — Sarana houses 8–10", "වහල තහඩු — සරණ නිවෙස් 8–10", "கூரைத் தகடு — சரண வீடுகள் 8–10")), ...t3("description", tri("Measured bill of quantities, paid to the supplier against delivery notes.", "මනින ලද ප්‍රමාණ බිල්පත, බෙදාහැරීමේ ලේඛනවලට එරෙහිව සැපයුම්කරුට ගෙවන ලදී.", "அளவுப் பட்டியல், விநியோகக் குறிப்புகளுக்கு எதிராக வழங்குநருக்குச் செலுத்தப்பட்டது.")) },
      { amount: 150000, category: "WELFARE", spentAt: daysAgo(37), ...t3("title", tri("Death donation — HLA-1184", "මරණ ආධාරය — HLA-1184", "மரண நிவாரணம் — HLA-1184")), ...t3("description", tri("Paid to the nominated next of kin within 28 hours of notification.", "දැනුම් දීමෙන් පැය 28ක් ඇතුළත නම් කළ ඥාතියාට ගෙවන ලදී.", "அறிவித்த 28 மணி நேரத்தில் பெயரிடப்பட்ட உறவினருக்குச் செலுத்தப்பட்டது.")) },
      { amount: 96000, category: "EDUCATION", spentAt: daysAgo(20), ...t3("title", tri("Pahana term-2 instalment, 24 students", "පහන 2 වන වාර වාරිකය, සිසුන් 24", "பஹன 2ஆம் பருவ தவணை, 24 மாணவர்")), ...t3("description", tri("Second-term scholarship payments, banked to parent accounts.", "දෙවන වාර ශිෂ්‍යත්ව, දෙමාපිය ගිණුම්වලට බැර කෙරිණි.", "இரண்டாம் பருவ உதவித்தொகை, பெற்றோர் கணக்குகளில் வரவு.")) },
      { amount: 210000, category: "MEDICAL", spentAt: daysAgo(14), ...t3("title", tri("Eye clinic — glasses and referrals", "ඇස් සායනය — කණ්ණාඩි සහ යොමු", "கண் முகாம் — கண்ணாடி மற்றும் பரிந்துரை")), ...t3("description", tri("190 pairs of reading glasses and transport for cataract patients.", "කියවීමේ කණ්ණාඩි 190ක් සහ අක්ෂි පටල රෝගීන්ට ප්‍රවාහනය.", "190 வாசிப்புக் கண்ணாடிகள் மற்றும் கண்புரை நோயாளிகளுக்குப் போக்குவரத்து.")) },
      { amount: 74000, category: "ADMIN", spentAt: daysAgo(8), ...t3("title", tri("Hall electricity and water, Q2", "ශාලා විදුලිය සහ ජලය, 2 වන කාර්තුව", "மண்டப மின்சாரம் மற்றும் நீர், காலாண்டு 2")), ...t3("description", tri("Utility bills for the association hall used as the elders' day centre.", "වැඩිහිටි දිවා මධ්‍යස්ථානය ලෙස භාවිත වන සමිති ශාලාවේ උපයෝගිතා බිල්පත්.", "முதியோர் பகல் நிலையமாகப் பயன்படும் சங்க மண்டப பயன்பாட்டுக் கட்டணங்கள்.")) },
    ],
  });

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNo: "TCK-2026-018",
      memberId: demoMember.id,
      contactName: demoMember.fullName,
      email: demoMember.email!,
      phone: demoMember.phone,
      category: "WELFARE_CLAIM",
      subject: "When will my medication claim be reviewed?",
      description: "I submitted claim CLM-2026-041 nine days ago. Could you confirm it is in the next welfare meeting?",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      assignedTo: admin.name,
    },
  });
  await prisma.ticketMessage.createMany({
    data: [
      { ticketId: ticket.id, authorId: demoUser.id, authorName: demoMember.fullName, authorRole: "MEMBER", body: "I submitted claim CLM-2026-041 nine days ago. Could you confirm it is in the next welfare meeting?", createdAt: daysAgo(4) },
      { ticketId: ticket.id, authorId: admin.id, authorName: admin.name, authorRole: "ADMIN", body: "Confirmed — it is on the agenda for Thursday. We will update this ticket after the meeting.", createdAt: daysAgo(3) },
    ],
  });

  await prisma.supportTicket.create({
    data: {
      ticketNo: "TCK-2026-021",
      memberId: demoMember.id,
      contactName: demoMember.fullName,
      email: demoMember.email!,
      category: "PAYMENT",
      subject: "Standing order receipt for April",
      description: "The April standing order left my account but I have not received a receipt.",
      priority: "LOW",
      status: "OPEN",
    },
  });

  await prisma.announcement.createMany({
    data: [
      { audience: "MEMBERS", priority: "IMPORTANT", isPinned: true, ...t3("title", tri("AGM on 26 September", "මහා සභාව සැප්තැම්බර් 26", "பொதுக் கூட்டம் செப்டம்பர் 26")), ...t3("body", tri("Please collect your membership card from the office if you have not already. Only paid-up members may vote.", "තවමත් නැත්නම් කාර්යාලයෙන් සාමාජික කාඩ්පත ලබා ගන්න. ඡන්දය දිය හැක්කේ දායක මුදල් ගෙවූ සාමාජිකයින්ට පමණි.", "இன்னும் இல்லையென்றால் அலுவலகத்தில் உறுப்பினர் அட்டையைப் பெறுங்கள். சந்தா செலுத்திய உறுப்பினர்கள் மட்டுமே வாக்களிக்கலாம்.")) },
      { audience: "ALL", priority: "NORMAL", ...t3("title", tri("Volunteer orientation next week", "ඊළඟ සතියේ ස්වේච්ඡා දිශානතිය", "அடுத்த வாரம் தொண்டர் அறிமுகம்")), ...t3("body", tri("New volunteers: please register online. Bring your NIC and a passport photograph.", "නව ස්වේච්ඡා සේවකයින්: අන්තර්ජාලයෙන් ලියාපදිංචි වන්න. ජාතික හැඳුනුම්පත සහ ඡායාරූපයක් ගෙන එන්න.", "புதிய தொண்டர்கள்: இணையத்தில் பதிவு செய்யுங்கள். அடையாள அட்டையும் புகைப்படமும் கொண்டு வாருங்கள்.")) },
    ],
  });

  await prisma.membershipApplication.createMany({
    data: [
      { applicationNo: "APP-2026-044", fullName: "Iresha Madushani", nic: "199534567890", dateOfBirth: new Date("1995-06-02"), gender: "FEMALE", occupation: "Nurse", addressLine1: "12 Lake Road", city: "Maharagama", district: "Colombo", phone: "0775550101", email: "iresha.m@example.lk", membershipType: "ORDINARY", motivation: "I want welfare cover for my parents.", status: "PENDING" },
      { applicationNo: "APP-2026-039", fullName: "Arun Thillainathan", nic: "198823456789", dateOfBirth: new Date("1988-11-19"), gender: "MALE", occupation: "Accountant", addressLine1: "8 Hill Street", city: "Nallur", district: "Jaffna", phone: "0775550102", email: "arun.t@example.lk", membershipType: "ORDINARY", status: "UNDER_REVIEW" },
    ],
  });

  await prisma.volunteerApplication.createMany({
    data: [
      { reference: "VOL-2026-011", fullName: "Kavitha Nadarajah", email: "kavitha.n@example.lk", phone: "0775550201", city: "Batticaloa", district: "Batticaloa", interests: "MEDICAL,EDUCATION", skills: "Nursing diploma", availability: "WEEKENDS", hoursPerMonth: 12, motivation: "I can help at medical camps in the east.", status: "NEW" },
      { reference: "VOL-2026-008", fullName: "Gayan Wijesuriya", email: "gayan.w@example.lk", phone: "0775550202", city: "Galle", district: "Galle", interests: "MEDIA,IT", skills: "Photography, WordPress", availability: "EVENINGS", hoursPerMonth: 8, motivation: "I want to document field work.", status: "ACTIVE", reviewedAt: daysAgo(20) },
    ],
  });

  await prisma.contactMessage.create({
    data: {
      name: "Priyantha Dias",
      email: "priyantha@example.lk",
      phone: "0715550301",
      subject: "Corporate sponsorship for scholarships",
      message: "Our firm would like to endow a named scholarship. Please send the sponsorship pack.",
      topic: "SPONSORSHIP",
    },
  });

  await prisma.subscriber.create({
    data: { email: "news@example.lk", locale: "en", isConfirmed: true },
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "fee.monthly", valueEn: "300", valueSi: "300", valueTa: "300", group: "fees" },
      { key: "fee.registration", valueEn: "1000", valueSi: "1000", valueTa: "1000", group: "fees" },
    ],
  });

  const election = await prisma.election.create({
    data: {
      slug: "agm-2026-office-bearers",
      titleEn: "AGM 2026 — Office Bearers",
      titleSi: "2026 මහා සභාව — නිලධාරී මණ්ඩලය",
      titleTa: "AGM 2026 — அலுவலர் குழு",
      descriptionEn: "Confidential e-vote for the 2026–2028 committee. One vote per active member.",
      descriptionSi: "2026–2028 කමිටුව සඳහා රහසිගත ඊ-ඡන්දය. ක්‍රියාකාරී සාමාජිකයෙකුට එක් ඡන්දයක්.",
      descriptionTa: "2026–2028 குழுவுக்கான ரகசிய மின் வாக்களிப்பு. செயலில் உள்ள உறுப்பினருக்கு ஒரு வாக்கு.",
      status: "OPEN",
      opensAt: daysAgo(2),
      closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      candidates: {
        create: [
          {
            name: "Nimal Perera",
            positionEn: "President",
            positionSi: "සභාපති",
            positionTa: "தலைவர்",
            bio: "Committee member since 2018",
            sortOrder: 1,
          },
          {
            name: "Shanthi Fernando",
            positionEn: "President",
            positionSi: "සභාපති",
            positionTa: "தலைவர்",
            bio: "Welfare lead, Eastern Province",
            sortOrder: 2,
          },
          {
            name: "Ravi Jayasuriya",
            positionEn: "Secretary",
            positionSi: "ලේකම්",
            positionTa: "செயலாளர்",
            bio: "Former treasurer",
            sortOrder: 3,
          },
        ],
      },
    },
  });
  void election;

  await prisma.suggestion.create({
    data: {
      reference: "SUG-2026-001",
      memberId: demoMember.id,
      isAnonymous: false,
      category: "IDEA",
      subject: "Evening welfare clinic once a month",
      body: "Many working members cannot attend weekday morning clinics. A Saturday evening session would help.",
      status: "NEW",
    },
  });

  console.log("Seed complete.");
  console.log("  Admin  admin@heartlinkallianz.lk  / Admin@hla2026");
  console.log("  Member member@heartlinkallianz.lk / Member@hla2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
