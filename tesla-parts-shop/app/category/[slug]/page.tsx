import { api } from "../../../services/api";
import CategoryView from "../../../components/CategoryView";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const categories = await api.getCategories();
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const currentCategory = categories.find(
      (c) => slugify(c.name) === decodedSlug,
    );
    if (currentCategory) {
      return {
        title:
          currentCategory.meta_title ||
          `${currentCategory.name} | Tesla Parts UA`,
        description:
          currentCategory.meta_description ||
          `Запчастини категорії ${currentCategory.name} для Tesla з доставкою по Україні.`,
      };
    }
  } catch (e) {
    console.error("Failed to generate category page metadata:", e);
  }
  return {
    title: "Категорія товарів | Tesla Parts UA",
    description: "Запчастини для Tesla.",
  };
}

export default async function CategoryPage({ params }: PageProps) {
  let initialCategory = null;
  let initialProducts = [];

  try {
    const resolvedParams = await params;
    const categories = await api.getCategories();
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const currentCategory = categories.find(
      (c) => slugify(c.name) === decodedSlug,
    );

    if (currentCategory) {
      initialCategory = await api.getCategory(currentCategory.id);
      initialProducts = await api.getProducts({ category: decodedSlug });
    }
  } catch (e) {
    console.error("Failed to pre-fetch category details on server:", e);
  }

  return (
    <CategoryView
      initialCategory={initialCategory}
      initialProducts={initialProducts}
    />
  );
}
