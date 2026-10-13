import { HomeClient } from "@/components/cinema/home-client";

// Данные загружаются на клиенте через API — HTML остаётся лёгким
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeClient initialData={null} />;
}
