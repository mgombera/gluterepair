"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { savePreset } from "@/lib/profile";
import { procedureFromStart } from "@/lib/personal";

export function StartRedirect() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const p = procedureFromStart(params.get("p"));
    if (p) savePreset(p);
    router.replace("/?setup=1");
  }, [params, router]);
  return null;
}
