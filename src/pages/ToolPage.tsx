import { Suspense } from "react";
import { useParams } from "react-router";
import { findTool } from "@/tools/registry";
import { getCategory } from "@/tools/categories";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ToolLoading } from "@/components/brand/Orbit";
import { NotFoundPage } from "./NotFoundPage";

/**
 * página genérica de ferramenta: acha a ferramenta pelo endereço,
 * monta a moldura e carrega a tela dela só agora (lazy loading).
 */
export function ToolPage() {
  const { slug = "" } = useParams();
  const tool = findTool(slug);
  if (!tool) return <NotFoundPage />;

  const Tool = tool.component;
  return (
    <ToolLayout title={tool.name} description={tool.description} icon={tool.icon}
      categoryLabel={getCategory(tool.category).label}>
      {/* key: ao trocar de ferramenta, o estado da anterior é descartado */}
      <Suspense fallback={<ToolLoading />}>
        <Tool key={tool.slug} />
      </Suspense>
    </ToolLayout>
  );
}