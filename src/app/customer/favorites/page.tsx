import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { customerFavorites, products } from "@/db/schema";
import { requirePage } from "@/lib/auth";
import { FavoritesGrid } from "@/components/CustomerSelfService";
import { getSettings } from "@/lib/settings";

export default async function CustomerFavoritesPage(){const [u,settings]=await Promise.all([requirePage(),getSettings()]);const rows=await db.select({id:products.id,slug:products.slug,nameFa:products.nameFa,mainImageId:products.mainImageId,brand:products.brand,basePrice:products.basePrice}).from(customerFavorites).innerJoin(products,eq(products.id,customerFavorites.productId)).where(eq(customerFavorites.userId,u.id)).orderBy(desc(customerFavorites.createdAt));return <FavoritesGrid initial={rows} siteName={settings.siteName}/>}
