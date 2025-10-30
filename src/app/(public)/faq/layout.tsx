import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Formdetoit | Questions Fréquentes Couverture Toiture Bas-Rhin",
  description: "Trouvez les réponses à vos questions sur les travaux de couverture, isolation, devis et garanties. FAQ complète Formdetoit, artisan couvreur Bas-Rhin.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}