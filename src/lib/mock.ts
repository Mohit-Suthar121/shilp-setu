export const LANGUAGES = [
  { code: "hi", label: "हिन्दी", en: "Hindi" },
  { code: "en", label: "English", en: "English" },
  { code: "bn", label: "বাংলা", en: "Bengali" },
  { code: "mr", label: "मराठी", en: "Marathi" },
  { code: "te", label: "తెలుగు", en: "Telugu" },
  { code: "ta", label: "தமிழ்", en: "Tamil" },
  { code: "gu", label: "ગુજરાતી", en: "Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ", en: "Kannada" },
  { code: "ml", label: "മലയാളം", en: "Malayalam" },
  { code: "pa", label: "ਪੰਜਾਬੀ", en: "Punjabi" },
  { code: "or", label: "ଓଡ଼ିଆ", en: "Odia" },
  { code: "as", label: "অসমীয়া", en: "Assamese" },
  { code: "ur", label: "اردو", en: "Urdu" },
  { code: "mai", label: "मैथिली", en: "Maithili" },
];

export type Product = {
  id: string;
  name: string;
  craft: string;
  material: string;
  price: number;
  low: number;
  high: number;
  stock: number;
  status: "Live" | "Draft" | "Pending sync";
  emoji: string;
  story: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Blue Pottery Water Jug",
    craft: "Jaipur Blue Pottery",
    material: "Quartz clay, cobalt glaze",
    price: 1450,
    low: 1250,
    high: 1750,
    stock: 6,
    status: "Live",
    emoji: "🏺",
    story:
      "Jaipur blue pottery came to Rajasthan with Turko-Persian artisans in the 14th century. It is the only pottery in India made without clay — quartz powder, glass and fuller's earth are shaped by hand.",
  },
  {
    id: "p2",
    name: "Madhubani Fish Motif Wall Art",
    craft: "Madhubani / Mithila",
    material: "Handmade paper, natural pigments",
    price: 2200,
    low: 1900,
    high: 2800,
    stock: 3,
    status: "Live",
    emoji: "🎨",
    story:
      "Painted by the women of Mithila for weddings and harvest. The fish motif is a blessing for fertility and prosperity.",
  },
  {
    id: "p3",
    name: "Terracotta Diya Set (12 pc)",
    craft: "Bankura Terracotta",
    material: "River clay, wood-fired",
    price: 480,
    low: 400,
    high: 620,
    stock: 40,
    status: "Pending sync",
    emoji: "🪔",
    story: "Wood-fired in a village kiln in Panchmura, a technique unchanged for 300 years.",
  },
  {
    id: "p4",
    name: "Kantha Embroidered Stole",
    craft: "Bengal Kantha",
    material: "Tussar silk, cotton thread",
    price: 1850,
    low: 1600,
    high: 2400,
    stock: 8,
    status: "Draft",
    emoji: "🧵",
    story: "Running-stitch quilting born from reusing old saris — every stitch is a household memory.",
  },
];

export const ORDERS = [
  { id: "SS-2041", buyer: "Aarti Menon", city: "Kochi", item: "Blue Pottery Water Jug ×2", amount: 2900, status: "To pack", when: "Today" },
  { id: "SS-2038", buyer: "Craft Cart Pvt Ltd", city: "Delhi", item: "Terracotta Diya Set ×20", amount: 9600, status: "Shipped", when: "2 days ago" },
  { id: "SS-2035", buyer: "Rehan Qureshi", city: "Pune", item: "Kantha Stole ×1", amount: 1850, status: "Delivered", when: "6 days ago" },
  { id: "SS-2030", buyer: "Nisha Verma", city: "Jaipur", item: "Madhubani Wall Art ×1", amount: 2200, status: "Paid", when: "8 days ago" },
];

export const MESSAGES = [
  {
    id: "m1",
    buyer: "Aarti Menon",
    lang: "English",
    text: "Is the blue pottery jug food safe? And can you ship to Kochi by Friday?",
    draft:
      "Namaste Aarti! Yes — the jug is glazed with a lead-free food-safe glaze and can hold water. I dispatch within 24 hours, so a Friday delivery to Kochi is comfortable. Shall I pack it with extra straw padding?",
    draftLocal: "नमस्ते आरती! हाँ, यह जग खाद्य-सुरक्षित ग्लेज़ से बना है…",
  },
  {
    id: "m2",
    buyer: "Craft Cart Pvt Ltd",
    lang: "English",
    text: "Do you have 50 diya sets for Diwali stock? What is your best rate?",
    draft:
      "Thank you for asking! I can make 50 sets in 12 days. For 50 sets my rate is ₹430 per set including packing — a 10% saving on my retail price.",
    draftLocal: "धन्यवाद! 12 दिन में 50 सेट तैयार हो जाएंगे…",
  },
];

export const BULK = [
  {
    id: "b1",
    buyer: "Tanishka Home Retail",
    qty: 500,
    item: "Terracotta Diya Sets",
    offer: 330,
    recommend: 395,
    floor: 355,
    days: 25,
    note: "Their last 3 orders paid on time. Festival demand peaks in 6 weeks, so you have leverage.",
  },
  {
    id: "b2",
    buyer: "Kalaa Export House",
    qty: 120,
    item: "Kantha Stoles",
    offer: 1400,
    recommend: 1620,
    floor: 1520,
    days: 40,
    note: "Export buyer, pays 50% advance. Cost of your silk went up 8% this season — hold above ₹1,520.",
  },
];

export const LESSONS = [
  { id: "l1", title: "Taking a photo buyers trust", mins: 4, done: true, xp: 20 },
  { id: "l2", title: "Speaking a good product description", mins: 5, done: true, xp: 25 },
  { id: "l3", title: "Understanding UPI payments", mins: 6, done: true, xp: 25 },
  { id: "l4", title: "How to price without underselling", mins: 7, done: false, xp: 30 },
  { id: "l5", title: "Packing so nothing breaks", mins: 5, done: false, xp: 20 },
  { id: "l6", title: "Replying to a bulk buyer", mins: 8, done: false, xp: 35 },
];

export const BADGES = [
  { id: "g1", name: "First Listing", icon: "🌱", earned: true },
  { id: "g2", name: "Photo Pro", icon: "📸", earned: true },
  { id: "g3", name: "Fair Pricer", icon: "⚖️", earned: true },
  { id: "g4", name: "10 Orders", icon: "📦", earned: true },
  { id: "g5", name: "Bulk Negotiator", icon: "🤝", earned: false },
  { id: "g6", name: "Master Artisan", icon: "🏅", earned: true },
];

export const VOICE_SCRIPT =
  "यह नीली मिट्टी का जग है, हाथ से बनाया है, जयपुर की ब्लू पॉटरी, दो हफ्ते लगे, पानी के लिए है, छह पीस तैयार हैं";

export const VOICE_SCRIPT_EN =
  "This is a blue clay jug, handmade, Jaipur blue pottery, took two weeks, meant for water, six pieces ready.";
