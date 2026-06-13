import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";

import { getRouterCount } from "@/services/routers-service";
import { getUserCount } from "@/services/users-service";
import { RouterDetailTableDashboard } from "@/components/tables/routerTableDH";

export const metadata: Metadata = {
  title:
    "Hotspot System By NT SUPAHNBURI",
  description: "บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) สาขาสุพรรณบุรี",
};

export default async function Ecommerce() {
  const countRouter = await getRouterCount();
  const countUser = await getUserCount();
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      <div className="col-span-2 space-y-6 xl:col-span-7">
        <EcommerceMetrics router={countRouter}  user={countUser}/>
      </div>

      <div className="col-span-12">
        <RouterDetailTableDashboard />
      </div>
    </div>
  );
}
