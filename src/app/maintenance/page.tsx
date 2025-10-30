import Image from "next/image";
import { Clock, Phone, Mail } from "lucide-react";
import { getMaintenanceSettings, getGeneralSettings } from "@/app/actions/settings";

export const metadata = {
  title: "Maintenance - FormDeToit",
  description: "Site en maintenance",
};

export default async function MaintenancePage() {
  const settings = await getMaintenanceSettings();
  const generalSettings = await getGeneralSettings();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0" style={{ top: '-250px', height: 'calc(100% + 250px)' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/doj84owtw/video/upload/v1761062800/bg-accueil_vxzpml.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <Image
                src="/formdetoit_logo_noir.webp"
                alt="FormDeToit"
                width={160}
                height={160}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {settings.title}
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
            {settings.message}
          </p>

          {/* Info box */}
          <div className="bg-yellow/5 border border-yellow/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Que se passe-t-il ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Notre équipe technique travaille actuellement sur des améliorations
                  pour vous offrir une meilleure expérience. Le site sera de nouveau
                  accessible très prochainement.
                </p>
              </div>
            </div>
          </div>

          {/* Contact d'urgence - Boutons sur fond noir */}
          <div className="bg-black rounded-xl p-6 mb-6">
            <p className="text-white text-center font-medium mb-4">
              Besoin de nous contacter en urgence ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Bouton Téléphone */}
              <a
                href={generalSettings.phone ? `tel:${generalSettings.phone.replace(/\s/g, '')}` : "tel:0388756653"}
                className="flex-1 flex items-center justify-center gap-3 bg-yellow text-black font-semibold px-6 py-4 rounded-lg hover:bg-yellow/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Phone className="w-5 h-5" />
                <span>{generalSettings.phone || "03 88 75 66 53"}</span>
              </a>

              {/* Bouton Email */}
              <a
                href={generalSettings.email ? `mailto:${generalSettings.email}` : "mailto:contact@formdetoit.fr"}
                className="flex-1 flex items-center justify-center gap-3 bg-yellow text-black font-semibold px-6 py-4 rounded-lg hover:bg-yellow/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Mail className="w-5 h-5" />
                <span>{generalSettings.email || "contact@formdetoit.fr"}</span>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              FormDeToit - Votre expert en couverture et zinguerie
            </p>
          </div>
        </div>

        {/* Decorative animation */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
            <span>Maintenance en cours...</span>
            <div className="w-2 h-2 bg-yellow rounded-full animate-pulse delay-75"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
