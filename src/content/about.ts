import { tri, type Tri } from "./seed-helpers";

export const VISION: Tri = tri(
  "A Sri Lanka where no family faces illness, bereavement or disaster without a community standing beside them.",
  "රෝගීභාවය, මරණය හෝ ආපදාවකදී කිසිදු පවුලක් ප්‍රජාවක සහායෙන් තොරව තනි නොවන ශ්‍රී ලංකාවක්.",
  "நோய், மரணம் அல்லது பேரிடரில் எந்தக் குடும்பமும் ஒரு சமூகத்தின் ஆதரவின்றி தனியாக நில்லாத இலங்கை.",
);

export const MISSION: Tri = tri(
  "To organise members and neighbours into a transparent, well-governed welfare association that delivers emergency relief, lasting welfare schemes and community development — and accounts for every rupee in public.",
  "සාමාජිකයින් සහ අසල්වැසියන් විනිවිද පෙනෙන, හොඳින් පාලනය වන සුබසාධක සමිතියක් ලෙස සංවිධානය කර, හදිසි සහන, දිගුකාලීන සුබසාධක යෝජනා සහ ප්‍රජා සංවර්ධනය ලබා දී, සෑම රුපියලක්ම ප්‍රසිද්ධියේ ගිණුම්ගත කිරීම.",
  "உறுப்பினர்களையும் அண்டை வீட்டினரையும் வெளிப்படையான, நல்லாட்சி கொண்ட நலன்புரி சங்கமாக ஒழுங்கமைத்து, அவசர நிவாரணம், நீடித்த நலத்திட்டங்கள், சமூக அபிவிருத்தி ஆகியவற்றை வழங்கி, ஒவ்வொரு ரூபாயையும் பொதுவில் கணக்குக் காட்டுதல்.",
);

export const VALUES: { title: Tri; text: Tri }[] = [
  {
    title: tri("Transparency", "විනිවිදභාවය", "வெளிப்படைத்தன்மை"),
    text: tri(
      "Audited accounts, published annual reports and a public spending ledger. Members may inspect the books.",
      "විගණනය කළ ගිණුම්, ප්‍රකාශිත වාර්ෂික වාර්තා සහ ප්‍රසිද්ධ වියදම් ලේඛනය. සාමාජිකයින්ට පොත් පරීක්ෂා කළ හැක.",
      "தணிக்கை செய்யப்பட்ட கணக்குகள், வெளியிடப்பட்ட வருடாந்த அறிக்கைகள், பொதுச் செலவுப் பேரேடு. உறுப்பினர்கள் புத்தகங்களைப் பரிசீலிக்கலாம்.",
    ),
  },
  {
    title: tri("Dignity", "ගෞරවය", "கண்ணியம்"),
    text: tri(
      "Welfare is a right of membership, not a favour. Claims are decided by a committee, never by a single office-bearer.",
      "සුබසාධනය සාමාජිකත්වයේ අයිතියකි, උපකාරයක් නොවේ. ඉල්ලීම් තනි නිලධාරියෙකු විසින් නොව කමිටුවක් විසින් තීරණය කෙරේ.",
      "நலன் உறுப்புரிமையின் உரிமை, தயவு அல்ல. கோரிக்கைகள் ஒரு அலுவலரால் அல்ல, குழுவால் தீர்மானிக்கப்படும்.",
    ),
  },
  {
    title: tri("Proximity", "ළඟින් සිටීම", "அருகில் இருத்தல்"),
    text: tri(
      "We work in the districts we live in. Relief is delivered by neighbours, not posted from a distant office.",
      "අපි ජීවත් වන දිස්ත්‍රික්කවලම කටයුතු කරමු. සහනය දුරස්ථ කාර්යාලයකින් නොව අසල්වැසියන් විසින් බාර දෙනු ලැබේ.",
      "நாம் வாழும் மாவட்டங்களிலேயே செயற்படுகிறோம். நிவாரணம் தொலை அலுவலகத்திலிருந்து அல்ல, அண்டை வீட்டினரால் வழங்கப்படுகிறது.",
    ),
  },
  {
    title: tri("Stewardship", "භාරකාරත්වය", "பொறுப்பாண்மை"),
    text: tri(
      "Donations are ring-fenced by purpose. Administration is capped. Unused balances are reported, never quietly absorbed.",
      "පරිත්‍යාග අරමුණ අනුව වෙන් කෙරේ. පරිපාලනයට සීමාවක් ඇත. භාවිත නොකළ ශේෂයන් වාර්තා කෙරේ, නිහඬව අවශෝෂණය නොවේ.",
      "நன்கொடைகள் நோக்கத்திற்கு ஏற்ப தனியே வைக்கப்படும். நிர்வாகத்திற்கு உச்ச வரம்புண்டு. பயன்படுத்தாத மீதிகள் அறிக்கையிடப்படும், அமைதியாக உள்வாங்கப்படாது.",
    ),
  },
];

export const HISTORY: { year: string; title: Tri; text: Tri }[] = [
  {
    year: "2013",
    title: tri("A neighbourhood collection tin", "අසල්වාසී එකතු කිරීමේ පෙට්ටිය", "அண்டை வீட்டு நன்கொடைப் பெட்டி"),
    text: tri(
      "Twelve families in Nugegoda started a weekly collection to cover funeral costs for neighbours who could not. The tin sat on a shop counter on Temple Road.",
      "නුගේගොඩේ පවුල් දොළහක්, එයට නොහැකි අසල්වැසියන්ගේ අවමංගල්‍ය වියදම් ආවරණය කිරීමට සතිපතා එකතුවක් ආරම්භ කළහ. පෙට්ටිය තිබුණේ ටෙම්පල් පාරේ කඩයක කවුන්ටරයකය.",
      "நுகேகொடையில் பன்னிரண்டு குடும்பங்கள், முடியாத அண்டை வீட்டினரின் இறுதிச் சடங்குச் செலவை ஈடுசெய்ய வாராந்திர சேகரிப்பைத் தொடங்கினர். பெட்டி கோவில் வீதியில் ஒரு கடை கவுண்டரில் இருந்தது.",
    ),
  },
  {
    year: "2016",
    title: tri("Registered as a welfare association", "සුබසාධක සමිතියක් ලෙස ලියාපදිංචිය", "நலன்புரி சங்கமாகப் பதிவு"),
    text: tri(
      "The group adopted a constitution, elected its first committee and registered as Heart Link Allianz Welfare Society - Sri Lanka (WA/2016/1187).",
      "කණ්ඩායම ව්‍යවස්ථාවක් සම්මත කර, පළමු කමිටුව තෝරා, Heart Link Allianz Welfare Society - Sri Lanka ලෙස ලියාපදිංචි විය (WA/2016/1187).",
      "குழு அரசியலமைப்பை ஏற்று, முதல் குழுவைத் தேர்ந்தெடுத்து, ஹார்ட் லிங்க் அலையன்ஸ் நலன்புரி சங்கமாகப் பதிவு செய்தது (WA/2016/1187).",
    ),
  },
  {
    year: "2018",
    title: tri("First scholarship cohort", "පළමු ශිෂ්‍යත්ව කණ්ඩායම", "முதல் உதவித்தொகைக் குழு"),
    text: tri(
      "Twenty-four Grade 5 and O/L students received the first Pahana awards. Four of that cohort later entered state universities.",
      "5 ශ්‍රේණියේ සහ සා.පෙළ සිසුන් 24 දෙනෙකුට පළමු පහන සම්මාන ලැබුණි. එම කණ්ඩායමෙන් හතර දෙනෙක් පසුව රාජ්‍ය විශ්වවිද්‍යාලවලට ඇතුළත් විය.",
      "24 ஐந்தாம் வகுப்பு மற்றும் சா.த மாணவர்கள் முதல் பஹன விருதுகளைப் பெற்றனர். அந்தக் குழுவில் நால்வர் பின்னர் அரச பல்கலைக்கழகங்களில் இணைந்தனர்.",
    ),
  },
  {
    year: "2020",
    title: tri("Pandemic relief", "වසංගත සහනය", "தொற்றுநோய் நிவாரணம்"),
    text: tri(
      "Dry-ration packs reached 1,860 households in 11 districts. Accounts for that year were published in full, including in-kind donations valued at market rate.",
      "දිස්ත්‍රික්ක 11 ක නිවෙස් 1,860 කට වියළි සැනකිලි ඇසුරුම් ළඟා විය. එම වර්ෂයේ ගිණුම්, වෙළඳපොල මිලට අගය කළ ද්‍රව්‍ය පරිත්‍යාග ඇතුළුව සම්පූර්ණයෙන් ප්‍රකාශයට පත් කෙරිණි.",
      "11 மாவட்டங்களில் 1,860 வீடுகளுக்கு உலர் உணவுப் பொதிகள் சென்றடைந்தன. அந்த ஆண்டின் கணக்குகள், சந்தை விலையில் மதிப்பிடப்பட்ட பொருள் நன்கொடைகள் உட்பட முழுமையாக வெளியிடப்பட்டன.",
    ),
  },
  {
    year: "2023",
    title: tri("One thousand members", "සාමාජිකයින් දහසක්", "ஆயிரம் உறுப்பினர்கள்"),
    text: tri(
      "Membership crossed 1,000. The association opened a second welfare desk in Kandy and began publishing a quarterly activity report.",
      "සාමාජිකත්වය 1,000 ඉක්මවීය. සමිතිය මහනුවර දෙවන සුබසාධක මේසයක් විවෘත කර කාර්තුමය ක්‍රියාකාරී වාර්තාවක් ප්‍රකාශයට පත් කිරීම ආරම්භ කළේය.",
      "உறுப்பினர் எண்ணிக்கை 1,000ஐக் கடந்தது. சங்கம் கண்டியில் இரண்டாவது நலன் மேசையைத் திறந்து காலாண்டு செயல் அறிக்கையை வெளியிடத் தொடங்கியது.",
    ),
  },
  {
    year: "2025",
    title: tri("Flood response and housing", "ගංවතුර ප්‍රතිචාරය සහ නිවාස", "வெள்ளப் பதிலும் வீடமைப்பும்"),
    text: tri(
      "The May floods triggered the largest single relief operation in our history, followed by the Sarana housing project for twelve families still under tarpaulin.",
      "මැයි ගංවතුර අපගේ ඉතිහාසයේ විශාලතම තනි සහන මෙහෙයුම අවුලුවා, තවමත් තාර්පෝලින් යට සිටින පවුල් දොළහක් සඳහා සරණ නිවාස ව්‍යාපෘතිය ආරම්භ විය.",
      "மே வெள்ளம் எமது வரலாற்றின் மிகப்பெரிய தனி நிவாரண நடவடிக்கையைத் தூண்டியது, அதைத் தொடர்ந்து இன்னும் தார்பாய் கீழ் உள்ள பன்னிரண்டு குடும்பங்களுக்கான சரண வீடமைப்புத் திட்டம்.",
    ),
  },
];
