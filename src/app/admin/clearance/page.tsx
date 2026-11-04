import { requirePage } from "@/lib/auth";
import { ClearanceManager } from "@/components/ClearanceManager";

export default async function AdminClearancePage() {
  await requirePage({ perm: "PRODUCTS_EDIT" });
  return <ClearanceManager />;
}
