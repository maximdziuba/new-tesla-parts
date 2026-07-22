import React from "react";
import { api } from "../../services/api";
import FeedbackClient from "../../components/FeedbackClient";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await api.getStaticSeo();
    const seoRecord = seo.find((s) => s.slug === "feedback");
    return {
      title: seoRecord?.meta_title || "Відгуки клієнтів | TeslaFix",
      description:
        seoRecord?.meta_description ||
        "Що говорять про нас наші клієнти. Скріншоти відгуків про запчастини та сервіс TeslaFix.",
    };
  } catch (e) {
    console.error("Failed to generate feedback page metadata:", e);
    return {
      title: "Відгуки клієнтів | TeslaFix",
      description:
        "Що говорять про нас наші клієнти. Скріншоти відгуків про запчастини та сервіс TeslaFix.",
    };
  }
}

export default async function FeedbackPage() {
  let feedback = [];
  try {
    feedback = await api.getFeedback();
  } catch (e) {
    console.error("Failed to load feedback on server:", e);
  }

  return <FeedbackClient initialFeedback={feedback} />;
}
