import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("karigar123", 10);

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: "baskets",
        name: "Baskets",
        nameHi: "टोकरी",
        description: "Handwoven baskets from cane, bamboo and grass."
      }
    }),
    prisma.category.create({
      data: {
        slug: "pottery",
        name: "Pottery & Vases",
        nameHi: "मिट्टी के बर्तन",
        description: "Terracotta and ceramic vessels shaped by hand."
      }
    }),
    prisma.category.create({
      data: {
        slug: "paintings",
        name: "Paintings",
        nameHi: "चित्रकला",
        description: "Folk and classical paintings on cloth and paper."
      }
    }),
    prisma.category.create({
      data: {
        slug: "wood",
        name: "Wooden Craft",
        nameHi: "लकड़ी शिल्प",
        description: "Carved wood toys, panels and home objects."
      }
    }),
    prisma.category.create({
      data: {
        slug: "lamps",
        name: "Lamps",
        nameHi: "दीपक",
        description: "Handmade lamps in brass, terracotta and fabric."
      }
    }),
    prisma.category.create({
      data: {
        slug: "textiles",
        name: "Textiles",
        nameHi: "वस्त्र",
        description: "Handloom weaves, block prints and embroidery."
      }
    })
  ]);

  const cat = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const artisans = [
    {
      name: "Meera Devi",
      email: "meera@karigar.demo",
      craft: "Bamboo weaving",
      bio: "Third-generation basket weaver from the Barak valley.",
      originState: "Assam",
      originCity: "Silchar",
      story:
        "Meera learned cane weaving from her grandmother. Each basket takes two to four days and uses locally harvested bamboo.",
      avatarUrl: "/images/artisans/meera.svg"
    },
    {
      name: "Ramesh Kumhar",
      email: "ramesh@karigar.demo",
      craft: "Terracotta",
      bio: "Potter from Khurja who works only with river clay.",
      originState: "Uttar Pradesh",
      originCity: "Khurja",
      story:
        "Ramesh's family has thrown clay on the wheel for five generations. He fires pieces in a traditional updraught kiln.",
      avatarUrl: "/images/artisans/ramesh.svg"
    },
    {
      name: "Lakshmi Soren",
      email: "lakshmi@karigar.demo",
      craft: "Pattachitra",
      bio: "Scroll painter working with natural pigments on treated cloth.",
      originState: "Odisha",
      originCity: "Raghurajpur",
      story:
        "Lakshmi paints Pattachitra using conch-shell white and lampblack. Stories of Jagannath and village life fill every panel.",
      avatarUrl: "/images/artisans/lakshmi.svg"
    },
    {
      name: "Arjun Channapatna",
      email: "arjun@karigar.demo",
      craft: "Wood turning",
      bio: "Channapatna toy maker using vegetable dyes and lac.",
      originState: "Karnataka",
      originCity: "Channapatna",
      story:
        "Arjun turns hale wood on a lathe, then coats each piece with natural lac colours that are safe for children.",
      avatarUrl: "/images/artisans/arjun.svg"
    },
    {
      name: "Fatima Bibi",
      email: "fatima@karigar.demo",
      craft: "Brass work",
      bio: "Lamp maker from Moradabad's metal-craft lanes.",
      originState: "Uttar Pradesh",
      originCity: "Moradabad",
      story:
        "Fatima hammers and etches brass sheets into lamps. The pierced patterns throw patterned light on courtyard walls.",
      avatarUrl: "/images/artisans/fatima.svg"
    },
    {
      name: "Kavita Ben",
      email: "kavita@karigar.demo",
      craft: "Ajrakh block print",
      bio: "Ajrakh printer from Kutch using natural indigo and madder.",
      originState: "Gujarat",
      originCity: "Ajrakhpur",
      story:
        "Kavita carves teak blocks and prints cotton with 14–16 resist and dye stages. Indigo vats are tended daily.",
      avatarUrl: "/images/artisans/kavita.svg"
    }
  ];

  const sellerRecords = [];
  for (const a of artisans) {
    const user = await prisma.user.create({
      data: {
        name: a.name,
        email: a.email,
        password: passwordHash,
        role: "SELLER",
        language: "hi",
        sellerProfile: {
          create: {
            craft: a.craft,
            bio: a.bio,
            originState: a.originState,
            originCity: a.originCity,
            story: a.story,
            avatarUrl: a.avatarUrl
          }
        }
      },
      include: { sellerProfile: true }
    });
    sellerRecords.push(user);
  }

  const buyers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ananya Sharma",
        email: "ananya@karigar.demo",
        password: passwordHash,
        role: "BUYER",
        language: "en",
        buyerProfile: { create: { state: "Maharashtra", city: "Mumbai" } }
      }
    }),
    prisma.user.create({
      data: {
        name: "Rohit Sen",
        email: "rohit@karigar.demo",
        password: passwordHash,
        role: "BUYER",
        language: "en",
        buyerProfile: { create: { state: "West Bengal", city: "Kolkata" } }
      }
    }),
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya@karigar.demo",
        password: passwordHash,
        role: "BUYER",
        language: "en",
        buyerProfile: { create: { state: "Kerala", city: "Kochi" } }
      }
    })
  ]);

  const productsData = [
    {
      title: "Barak Valley Bamboo Market Basket",
      shortDescription: "Handwoven bamboo basket with dual cane handles.",
      longDescription:
        "A sturdy market basket woven from split bamboo and cane. Tight hexagonal weave holds vegetables and dry goods. Natural finish, food-safe, and designed to last seasons of daily use.",
      material: "Bamboo and cane",
      craft: "Bamboo weaving",
      features: ["Dual cane handles", "Hexagonal weave", "Food-safe finish"],
      artisanStory:
        "Meera harvested this bamboo after the monsoon and split each strip by hand. The basket took three days to complete.",
      basePrice: 850,
      categorySlug: "baskets",
      sellerIndex: 0,
      originState: "Assam",
      originCity: "Silchar",
      size: "medium",
      featured: true,
      popular: true,
      image: "/images/products/basket.svg",
      caption: "Handwoven bamboo from Assam. Everyday craft, made to last. #Karigar #HandmadeIndia",
      script: "Open on Meera splitting bamboo. Cut to weave close-up. End on the finished basket in a market lane.",
      hashtags: ["#Karigar", "#BambooCraft", "#HandmadeIndia", "#AssamArtisan"]
    },
    {
      title: "Khurja Terracotta Water Vase",
      shortDescription: "Wheel-thrown terracotta vase with earth slip glaze.",
      longDescription:
        "A tall water vase thrown on the wheel from river clay. The surface is burnished and given a thin earth slip. Slight asymmetry is a mark of the hand, not a defect.",
      material: "Terracotta clay",
      craft: "Pottery",
      features: ["Wheel thrown", "Burnished surface", "Earth slip"],
      artisanStory:
        "Ramesh threw this vase in one sitting and fired it overnight in a wood kiln shared with neighbouring kumhars.",
      basePrice: 1200,
      categorySlug: "pottery",
      sellerIndex: 1,
      originState: "Uttar Pradesh",
      originCity: "Khurja",
      size: "medium",
      featured: true,
      popular: true,
      image: "/images/products/vase.svg",
      caption: "River clay, wood fire, five generations. A vase from Khurja. #Karigar #Pottery",
      script: "Hands on the wheel. Clay rising. Fire in the kiln. The vase cooling at dawn.",
      hashtags: ["#Karigar", "#Terracotta", "#Khurja", "#HandmadeIndia"]
    },
    {
      title: "Pattachitra Village Scroll",
      shortDescription: "Natural-pigment Pattachitra on treated cotton cloth.",
      longDescription:
        "A narrative scroll painted with conch-shell white, lampblack and mineral colours on cloth prepared with tamarind seed paste. Border motifs follow Raghurajpur convention.",
      material: "Cotton cloth and natural pigments",
      craft: "Pattachitra",
      features: ["Natural pigments", "Cloth ground", "Narrative border"],
      artisanStory:
        "Lakshmi ground the pigments herself and painted this panel over six days, telling a harvest story from her village.",
      basePrice: 2400,
      categorySlug: "paintings",
      sellerIndex: 2,
      originState: "Odisha",
      originCity: "Raghurajpur",
      size: "small",
      featured: true,
      popular: false,
      image: "/images/products/painting.svg",
      caption: "Stories in mineral colour. Pattachitra from Raghurajpur. #Karigar #Pattachitra",
      script: "Close-up of a brush loading lampblack. Pan across the scroll. Lakshmi signing the cloth edge.",
      hashtags: ["#Karigar", "#Pattachitra", "#OdishaArt", "#FolkPainting"]
    },
    {
      title: "Channapatna Lacquered Wooden Bird",
      shortDescription: "Turned hale-wood bird finished with vegetable lac dyes.",
      longDescription:
        "A decorative bird turned from hale wood and coated with natural lac colours. Smooth, child-safe finish. Each piece is slightly unique in grain and colour depth.",
      material: "Hale wood and lac",
      craft: "Wood turning",
      features: ["Vegetable dyes", "Lathe turned", "Child-safe lac"],
      artisanStory:
        "Arjun selected a seasoned hale blank, turned the form, and built colour in three lac layers.",
      basePrice: 650,
      categorySlug: "wood",
      sellerIndex: 3,
      originState: "Karnataka",
      originCity: "Channapatna",
      size: "small",
      featured: false,
      popular: true,
      image: "/images/products/wood.svg",
      caption: "Hale wood and lac. A Channapatna bird for your shelf. #Karigar #WoodenCraft",
      script: "Lathe spinning. Lac stick melting on the form. The finished bird in sunlight.",
      hashtags: ["#Karigar", "#Channapatna", "#WoodenToys", "#HandmadeIndia"]
    },
    {
      title: "Moradabad Pierced Brass Lamp",
      shortDescription: "Hand-pierced brass lamp that casts patterned light.",
      longDescription:
        "A table lamp of hammered brass with floral jaali piercing. Fits a standard E27 holder. The metal is unlacquered and will deepen in colour with use.",
      material: "Brass",
      craft: "Metal engraving",
      features: ["Hand pierced jaali", "E27 holder", "Unlacquered brass"],
      artisanStory:
        "Fatima marked the pattern with a needle, then punched each opening. Filing and planishing took a full day.",
      basePrice: 1800,
      categorySlug: "lamps",
      sellerIndex: 4,
      originState: "Uttar Pradesh",
      originCity: "Moradabad",
      size: "medium",
      featured: true,
      popular: true,
      image: "/images/products/lamp.svg",
      caption: "Pierced brass, patterned light. A lamp from Moradabad. #Karigar #BrassCraft",
      script: "Hammer on brass. Light through jaali at dusk. Fatima holding the finished lamp.",
      hashtags: ["#Karigar", "#BrassLamp", "#Moradabad", "#HandmadeIndia"]
    },
    {
      title: "Kutch Ajrakh Cotton Dupatta",
      shortDescription: "Natural-dye Ajrakh dupatta in indigo and madder.",
      longDescription:
        "A cotton dupatta printed with carved teak blocks through 14 stages of resist and dye. Indigo and madder on unbleached cloth. Wash separately in cold water.",
      material: "Cotton, indigo, madder",
      craft: "Ajrakh block print",
      features: ["Natural dyes", "Hand block printed", "14 process stages"],
      artisanStory:
        "Kavita printed this dupatta across two weeks, waiting on sun and wind between indigo dips.",
      basePrice: 1600,
      categorySlug: "textiles",
      sellerIndex: 5,
      originState: "Gujarat",
      originCity: "Ajrakhpur",
      size: "small",
      featured: true,
      popular: true,
      image: "/images/products/textile.svg",
      caption: "Indigo, madder, teak blocks. Ajrakh from Kutch. #Karigar #Ajrakh",
      script: "Blocks inked. Cloth laid on the table. Indigo vat. Dupatta drying on a desert line.",
      hashtags: ["#Karigar", "#Ajrakh", "#Kutch", "#HandloomIndia"]
    }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const seller = sellerRecords[p.sellerIndex].sellerProfile;
    if (!seller) throw new Error("Missing seller profile");
    const product = await prisma.product.create({
      data: {
        title: p.title,
        shortDescription: p.shortDescription,
        longDescription: p.longDescription,
        material: p.material,
        craft: p.craft,
        features: p.features,
        artisanStory: p.artisanStory,
        basePrice: p.basePrice,
        categoryId: cat[p.categorySlug].id,
        sellerId: seller.id,
        originState: p.originState,
        originCity: p.originCity,
        size: p.size,
        featured: p.featured,
        popular: p.popular,
        images: {
          create: [
            {
              url: p.image,
              alt: p.title,
              isPrimary: true,
              sortOrder: 0
            }
          ]
        },
        promotion: {
          create: {
            script: p.script,
            caption: p.caption,
            hashtags: p.hashtags,
            reelText: `${p.title} — made by ${sellerRecords[p.sellerIndex].name} in ${p.originCity}.`
          }
        }
      }
    });
    createdProducts.push(product);
  }

  const reviewTexts = [
    { rating: 5, text: "Beautiful work. Arrived well packed and exactly as described." },
    { rating: 4, text: "Warm, honest craft. Slight colour variation which I like." },
    { rating: 5, text: "Gifted this and it was the highlight of the evening." },
    { rating: 4, text: "Solid piece. Delivery took a few extra days but worth it." },
    { rating: 5, text: "You can feel the hours in every detail." },
    { rating: 5, text: "Will buy from this artisan again." }
  ];

  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const r1 = reviewTexts[i % reviewTexts.length];
    const r2 = reviewTexts[(i + 2) % reviewTexts.length];
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: buyers[i % buyers.length].id,
        rating: r1.rating,
        text: r1.text
      }
    });
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: buyers[(i + 1) % buyers.length].id,
        rating: r2.rating,
        text: r2.text
      }
    });
    const reviews = await prisma.review.findMany({ where: { productId: product.id } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.product.update({
      where: { id: product.id },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length }
    });
  }

  console.log("Seed complete:", {
    categories: categories.length,
    artisans: sellerRecords.length,
    products: createdProducts.length,
    buyers: buyers.length
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
