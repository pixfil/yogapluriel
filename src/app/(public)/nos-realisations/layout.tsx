import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Réalisations - Formdetoit | Portfolio Couvreur Bas-Rhin Strasbourg",
  description: "Découvrez nos réalisations de couverture, isolation et zinguerie dans le Bas-Rhin. Portfolio de projets ardoise, tuiles, zinc, Velux, EPDM.",
};

export default function NosRealisationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}