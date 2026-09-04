/**
 * All menu + signature-dish content. Prices are numbers so the cart can total them;
 * formatting goes through `formatMoney` in `lib/whatsapp.ts`.
 */

export type ModelKey = "chicken" | "burger" | "ribs" | "bowl" | "dessert";

export type CategoryId =
  | "starters"
  | "mains"
  | "grill"
  | "drinks"
  | "desserts";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  /** 0–3. Rendered as flame glyphs, never as a decorative-only badge. */
  heat?: 0 | 1 | 2 | 3;
  tags?: string[];
  signature?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Editorial standfirst shown above each category block. */
  blurb: string;
}

export interface SignatureDish {
  id: string;
  /** Display index — "01", "02"… */
  index: string;
  name: string;
  /** Short line used as the big overlay word on the showcase. */
  kicker: string;
  description: string;
  ingredients: string[];
  price: number;
  heat: 0 | 1 | 2 | 3;
  model: ModelKey;
  /**
   * Drives both the 3D materials and the CSS fallback art, so the WebGL and
   * no-WebGL versions of a dish stay on the same palette.
   */
  palette: {
    /** Main body / crust colour. */
    base: string;
    /** Glaze + rim-light colour. */
    glow: string;
    /** Char + shadow colour. */
    deep: string;
    /** Section background wash while this dish is active. */
    wash: string;
  };
}

export const categories: Category[] = [
  {
    id: "starters",
    name: "Starters",
    blurb: "Small plates built for sharing, and for arguing over the last one.",
  },
  {
    id: "mains",
    name: "Main Dishes",
    blurb: "The plates the kitchen is judged on.",
  },
  {
    id: "grill",
    name: "The Grill",
    blurb: "Straight over open coals. Nothing hides here.",
  },
  {
    id: "drinks",
    name: "Drinks",
    blurb: "Cold, sharp, and built to cut through the heat.",
  },
  {
    id: "desserts",
    name: "Desserts",
    blurb: "Burnt sugar, cold cream, warm spice.",
  },
];

export const signatureDishes: SignatureDish[] = [
  {
    id: "fire-grilled-chicken",
    index: "01",
    name: "Fire Grilled Chicken",
    kicker: "The one we built the fire for",
    description:
      "Butterflied, brined for twelve hours in peri and citrus, then finished over open coals until the skin blisters and the glaze catches. Basted three times on the pass.",
    ingredients: [
      "Free-range whole chicken",
      "24-hour peri-peri marinade",
      "Charred lemon",
      "Smoked garlic butter",
      "Flat-leaf parsley",
    ],
    price: 16.5,
    heat: 2,
    model: "chicken",
    palette: {
      base: "#7B3A11",
      glow: "#FF8A3C",
      deep: "#1C0A03",
      wash: "#150E0A",
    },
  },
  {
    id: "flame-burger",
    index: "02",
    name: "Double Flame Burger",
    kicker: "Two patties, one decision",
    description:
      "Two coarse-ground patties seared hard on the plancha, aged cheddar melted between them, ember mayo and pickled chilli in a toasted potato bun.",
    ingredients: [
      "Two 90g dry-aged patties",
      "Aged cheddar",
      "Ember mayo",
      "Pickled red chilli",
      "Toasted potato bun",
    ],
    price: 14.0,
    heat: 1,
    model: "burger",
    palette: {
      base: "#B4531B",
      glow: "#FFA347",
      deep: "#241108",
      wash: "#120D0B",
    },
  },
  {
    id: "coal-ribs",
    index: "03",
    name: "Coal-Fired Ribs",
    kicker: "Six hours, then five minutes",
    description:
      "Pork ribs cooked low over oak for six hours, then hit hard over the coals with a smoked paprika and molasses glaze until the edges lacquer.",
    ingredients: [
      "Half rack pork ribs",
      "Smoked paprika rub",
      "Molasses & piri glaze",
      "Burnt orange",
      "Toasted sesame",
    ],
    price: 19.0,
    heat: 3,
    model: "ribs",
    palette: {
      base: "#8E2A14",
      glow: "#FF5A24",
      deep: "#1E0A05",
      wash: "#170B08",
    },
  },
  {
    id: "ember-bowl",
    index: "04",
    name: "Ember Grain Bowl",
    kicker: "Fire, without the meat",
    description:
      "Charred hispi cabbage and blistered peppers over saffron grains, with whipped feta, herb oil and a scatter of toasted seeds.",
    ingredients: [
      "Charred hispi cabbage",
      "Saffron grains",
      "Whipped feta",
      "Blistered peppers",
      "Toasted pumpkin seeds",
    ],
    price: 12.5,
    heat: 1,
    model: "bowl",
    palette: {
      base: "#9C7A22",
      glow: "#F2C24B",
      deep: "#1B1405",
      wash: "#121009",
    },
  },
  {
    id: "burnt-cheesecake",
    index: "05",
    name: "Burnt Basque Cheesecake",
    kicker: "Deliberately overdone",
    description:
      "Baked hot and fast until the top goes properly dark. Loose in the middle, served with a spoon of salted honey and cold cream.",
    ingredients: [
      "Basque-style baked cheesecake",
      "Salted honey",
      "Cold cream",
      "Burnt vanilla",
    ],
    price: 8.0,
    heat: 0,
    model: "dessert",
    palette: {
      base: "#B0762F",
      glow: "#F6D08A",
      deep: "#241606",
      wash: "#13100C",
    },
  },
];

export const menu: MenuItem[] = [
  // Starters
  {
    id: "peri-wings",
    name: "Peri Wings",
    description: "Six wings, double-fried, tossed in house peri and lemon zest.",
    price: 8.5,
    category: "starters",
    heat: 2,
  },
  {
    id: "charred-corn",
    name: "Charred Corn Ribs",
    description: "Blackened over coals, brushed with chilli butter and lime.",
    price: 6.5,
    category: "starters",
    heat: 1,
    tags: ["Vegetarian"],
  },
  {
    id: "smoked-flatbread",
    name: "Smoked Flatbread",
    description: "Blistered in the grill, torn and served with whipped feta.",
    price: 6.0,
    category: "starters",
    heat: 0,
    tags: ["Vegetarian"],
  },
  {
    id: "chorizo-bites",
    name: "Chorizo & Honey",
    description: "Seared chorizo, burnt honey, sherry vinegar, toasted almond.",
    price: 9.0,
    category: "starters",
    heat: 1,
  },

  // Mains
  {
    id: "fire-grilled-chicken",
    name: "Fire Grilled Chicken",
    description:
      "Whole butterflied chicken, 24-hour peri marinade, finished over open coals.",
    price: 16.5,
    category: "mains",
    heat: 2,
    signature: true,
  },
  {
    id: "flame-burger",
    name: "Double Flame Burger",
    description: "Two seared patties, aged cheddar, ember mayo, pickled chilli.",
    price: 14.0,
    category: "mains",
    heat: 1,
    signature: true,
  },
  {
    id: "ember-bowl",
    name: "Ember Grain Bowl",
    description: "Charred cabbage, saffron grains, whipped feta, herb oil.",
    price: 12.5,
    category: "mains",
    heat: 1,
    tags: ["Vegetarian"],
    signature: true,
  },
  {
    id: "piri-wrap",
    name: "Piri Chicken Wrap",
    description: "Pulled thigh, slaw, chilli jam, wrapped and pressed on the grill.",
    price: 11.0,
    category: "mains",
    heat: 2,
  },

  // Grill
  {
    id: "coal-ribs",
    name: "Coal-Fired Ribs",
    description: "Six hours over oak, lacquered with molasses and smoked paprika.",
    price: 19.0,
    category: "grill",
    heat: 3,
    signature: true,
  },
  {
    id: "half-chicken",
    name: "Half Peri Chicken",
    description: "Same fire, smaller plate. Choose your heat at the counter.",
    price: 11.5,
    category: "grill",
    heat: 2,
  },
  {
    id: "coal-prawns",
    name: "Coal Prawns",
    description: "Head-on prawns, garlic butter, burnt lemon, sea salt.",
    price: 13.5,
    category: "grill",
    heat: 1,
  },
  {
    id: "grilled-cabbage",
    name: "Whole Charred Cabbage",
    description: "Hispi cabbage cooked down in the embers, herb oil, crisp shallot.",
    price: 9.5,
    category: "grill",
    heat: 0,
    tags: ["Vegan"],
  },

  // Drinks
  {
    id: "burnt-lemonade",
    name: "Burnt Lemonade",
    description: "Grilled lemon, cane sugar, soda, a lot of ice.",
    price: 4.5,
    category: "drinks",
  },
  {
    id: "hibiscus-cooler",
    name: "Hibiscus Cooler",
    description: "Hibiscus, ginger, lime. Sharp enough to reset your palate.",
    price: 4.5,
    category: "drinks",
  },
  {
    id: "vinho-verde",
    name: "Vinho Verde",
    description: "Cold, low alcohol, faintly fizzy. Built for chicken.",
    price: 7.0,
    category: "drinks",
    tags: ["Glass"],
  },
  {
    id: "cold-lager",
    name: "House Lager",
    description: "Brewed for us in Hackney. Poured properly cold.",
    price: 6.0,
    category: "drinks",
    tags: ["Pint"],
  },

  // Desserts
  {
    id: "burnt-cheesecake",
    name: "Burnt Basque Cheesecake",
    description: "Dark on top, loose in the middle, salted honey and cold cream.",
    price: 8.0,
    category: "desserts",
    signature: true,
  },
  {
    id: "grilled-pineapple",
    name: "Grilled Pineapple",
    description: "Caramelised over coals with chilli sugar and lime crema.",
    price: 7.0,
    category: "desserts",
    heat: 1,
  },
  {
    id: "pastel-de-nata",
    name: "Pastéis de Nata",
    description: "Two custard tarts, scorched tops, cinnamon on the side.",
    price: 5.5,
    category: "desserts",
  },
];

export const dishById = (id: string) =>
  signatureDishes.find((dish) => dish.id === id);

export const itemsByCategory = (category: CategoryId) =>
  menu.filter((item) => item.category === category);
