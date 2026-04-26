import blanket from "@/assets/product-blanket.jpg";
import bunny from "@/assets/product-bunny.jpg";
import bag from "@/assets/product-bag.jpg";
import hat from "@/assets/product-hat.jpg";
import coasters from "@/assets/product-coasters.jpg";
import wallhanging from "@/assets/product-wallhanging.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: "Home" | "Toys" | "Accessories" | "Decor";
  image: string;
  yarn: string;
  madeIn: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "chunky-throw",
    name: "Cloud Chunky Throw",
    tagline: "Hand-loomed in cream merino",
    description:
      "An oversized chunky-knit throw worked in soft 100% merino. Perfect for slow Sundays and rainy afternoons by the window.",
    price: 189,
    category: "Home",
    image: blanket,
    yarn: "100% merino wool",
    madeIn: "Made to order in 7–10 days",
  },
  {
    id: "sage-bunny",
    name: "Mossie the Bunny",
    tagline: "Amigurumi heirloom plush",
    description:
      "A pocket-sized sage bunny stitched in cotton with embroidered details. Hypoallergenic stuffing, safe for little hands.",
    price: 38,
    category: "Toys",
    image: bunny,
    yarn: "Organic cotton",
    madeIn: "Ships in 3–5 days",
  },
  {
    id: "terracotta-tote",
    name: "Terracotta Market Tote",
    tagline: "Everyday carry, hand-stitched",
    description:
      "A roomy market tote with leather handles and a structured base. Holds a week of farmers' market produce — or two paperbacks and a coffee.",
    price: 76,
    category: "Accessories",
    image: bag,
    yarn: "Recycled cotton + vegetable-tanned leather",
    madeIn: "Ships in 5–7 days",
  },
  {
    id: "mustard-beanie",
    name: "Honey Pom Beanie",
    tagline: "Cabled mustard, oversized pom",
    description:
      "A chunky cabled beanie in honey-mustard with a generous hand-tied pom. Lined with fleece to keep ears toasty.",
    price: 42,
    category: "Accessories",
    image: hat,
    yarn: "Alpaca blend",
    madeIn: "Ships in 3–5 days",
  },
  {
    id: "lace-coasters",
    name: "Lace Doily Coasters",
    tagline: "Set of 4, heirloom lace",
    description:
      "Delicate lace doily coasters worked in fine cotton thread. Each set is unique. Hand-wash, lay flat to dry.",
    price: 28,
    category: "Decor",
    image: coasters,
    yarn: "Mercerized cotton",
    madeIn: "Ships in 2–4 days",
  },
  {
    id: "wall-hanging",
    name: "Sandstone Wall Hanging",
    tagline: "Macrame & crochet on oak",
    description:
      "A statement wall piece blending crochet and macrame on a hand-finished oak dowel. Ready to hang.",
    price: 124,
    category: "Decor",
    image: wallhanging,
    yarn: "Cotton rope on oak",
    madeIn: "Made to order in 7–10 days",
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
