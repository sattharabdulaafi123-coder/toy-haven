/* ==========================================================================
   Toy Haven - product data
   All products live in this JavaScript object array. Every page reads
   from PRODUCTS, so adding a product here makes it appear everywhere.
   Images: image1-4 are hero banners, image5-20 are the 16 products.
   ========================================================================== */

const CATEGORIES = ["Figurines", "Toys", "Board Games", "Diecast Cars"];

const PRODUCTS = [
  /* ---- Figurines ---- */
  {
    id: "fig-01",
    name: "Galaxy Guardian Figure",
    category: "Figurines",
    price: 4500,
    image: "images/image5.webp",
    rating: 5,
    age: "8+",
    description: "A 15 cm hand-painted space hero with 12 points of articulation and a light-up energy shield.",
    featured: true,
    isNew: false
  },
  {
    id: "fig-02",
    name: "Dragon Knight Statue",
    category: "Figurines",
    price: 12500,
    image: "images/image6.webp",
    rating: 5,
    age: "14+",
    description: "Limited-edition resin statue of a knight riding a winged dragon, numbered on the base for collectors.",
    featured: false,
    isNew: true
  },
  {
    id: "fig-03",
    name: "Mini Samurai Cat",
    category: "Figurines",
    price: 2800,
    image: "images/image7.webp",
    rating: 4,
    age: "6+",
    description: "A cute vinyl blind-box style samurai cat with a tiny removable sword. Perfect for desk displays.",
    featured: false,
    isNew: false
  },
  {
    id: "fig-04",
    name: "Ocean Explorer Figure Set",
    category: "Figurines",
    price: 6900,
    image: "images/image8.webp",
    rating: 4,
    age: "5+",
    description: "Six sea-life figures including a diver, whale, turtle and octopus, with a fold-out reef backdrop.",
    featured: false,
    isNew: false
  },

  /* ---- Toys ---- */
  {
    id: "toy-01",
    name: "Rainbow Stacking Blocks",
    category: "Toys",
    price: 2400,
    image: "images/image9.webp",
    rating: 5,
    age: "1+",
    description: "Twenty chunky wooden blocks in bright, child-safe colours that build balance and colour recognition.",
    featured: false,
    isNew: false
  },
  {
    id: "toy-02",
    name: "Plush Bear Buddy",
    category: "Toys",
    price: 3200,
    image: "images/image10.webp",
    rating: 5,
    age: "0+",
    description: "An extra-soft 35 cm teddy bear with embroidered eyes, machine washable and made for big hugs.",
    featured: true,
    isNew: false
  },
  {
    id: "toy-03",
    name: "Wooden Train Set",
    category: "Toys",
    price: 8900,
    image: "images/image11.webp",
    rating: 4,
    age: "3+",
    description: "A 40-piece track set with a bridge, tunnel, station and a magnetic three-carriage train.",
    featured: false,
    isNew: false
  },
  {
    id: "toy-04",
    name: "Build-a-Robot Kit",
    category: "Toys",
    price: 5600,
    image: "images/image12.webp",
    rating: 4,
    age: "8+",
    description: "Snap together your own walking robot. A fun first step into engineering, with no soldering needed.",
    featured: false,
    isNew: true
  },

  /* ---- Board games ---- */
  {
    id: "bg-01",
    name: "Castle Quest Adventure",
    category: "Board Games",
    price: 7200,
    image: "images/image13.webp",
    rating: 5,
    age: "10+",
    description: "A co-operative dungeon game for 2 to 5 players. Explore rooms, collect treasure and defeat the dragon together.",
    featured: true,
    isNew: false
  },
  {
    id: "bg-02",
    name: "Word Wizards",
    category: "Board Games",
    price: 3900,
    image: "images/image14.webp",
    rating: 4,
    age: "8+",
    description: "A fast spelling game where letter tiles become magic spells. Great for family game night.",
    featured: false,
    isNew: false
  },
  {
    id: "bg-03",
    name: "Space Traders",
    category: "Board Games",
    price: 9800,
    image: "images/image15.webp",
    rating: 5,
    age: "12+",
    description: "Build trade routes across the galaxy in this strategy game with modular boards, so no two games are the same.",
    featured: false,
    isNew: true
  },
  {
    id: "bg-04",
    name: "Family Trivia Night",
    category: "Board Games",
    price: 4600,
    image: "images/image16.webp",
    rating: 4,
    age: "7+",
    description: "Over 1,000 questions in kids and adults decks so everyone can play on a level field.",
    featured: false,
    isNew: false
  },

  /* ---- Diecast cars ---- */
  {
    id: "car-01",
    name: "1967 Classic Muscle Car 1:24",
    category: "Diecast Cars",
    price: 6500,
    image: "images/image17.webp",
    rating: 5,
    age: "14+",
    description: "Detailed metal replica with opening doors and bonnet, rubber tyres and a clear display case.",
    featured: true,
    isNew: false
  },
  {
    id: "car-02",
    name: "Rally Legend Hatchback 1:43",
    category: "Diecast Cars",
    price: 3400,
    image: "images/image18.webp",
    rating: 4,
    age: "8+",
    description: "A mud-splashed rally hatchback with authentic livery and roof lights, ideal for starting a collection.",
    featured: false,
    isNew: false
  },
  {
    id: "car-03",
    name: "Formula Racer 1:18",
    category: "Diecast Cars",
    price: 11500,
    image: "images/image19.webp",
    rating: 5,
    age: "14+",
    description: "Large-scale open-wheel racer with a removable nose cone, steerable front wheels and a driver figure.",
    featured: false,
    isNew: false
  },
  {
    id: "car-04",
    name: "Vintage Fire Truck 1:32",
    category: "Diecast Cars",
    price: 5200,
    image: "images/image20.webp",
    rating: 4,
    age: "6+",
    description: "A classic red fire engine with an extending ladder and free-rolling wheels.",
    featured: false,
    isNew: false
  }
];

/* Price ranges used by the product filters */
const PRICE_RANGES = {
  "under-3000": { label: "Under Rs. 3,000", min: 0, max: 2999 },
  "3000-8000": { label: "Rs. 3,000 - 8,000", min: 3000, max: 8000 },
  "over-8000": { label: "Over Rs. 8,000", min: 8001, max: Infinity }
};
