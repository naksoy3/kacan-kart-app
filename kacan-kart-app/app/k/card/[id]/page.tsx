import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/utils/supabase";

type CardLinkPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: CardLinkPageProps): Promise<Metadata> {
  const { data } = await supabase
    .from("cards")
    .select("target_username, from_username, soru, gif_url")
    .eq("id", params.id)
    .single();

  const sender = data?.from_username || "Bir arkadaşın";
  const target = data?.target_username || "sana";
  const title = `${sender}, ${target} için özel bir soru gönderdi 💌`;
  const description = data?.soru || "Sana özel hazırlanmış bir karta göz at!";

  return {
    title,
    description,
    icons: {
      icon: "/icon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/icon.png", width: 512, height: 512, alt: "Cardasks" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/icon.png"],
    },
  };
}

export default function CardLinkPage({ params }: CardLinkPageProps) {
  redirect(`/?id=${encodeURIComponent(params.id)}`);
}
