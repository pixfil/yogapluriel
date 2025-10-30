"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface DevisFormProps {
  className?: string;
  glassmorphism?: boolean;
}

const DevisForm = ({ className, glassmorphism = false }: DevisFormProps) => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { executeRecaptcha } = useRecaptcha();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    setShowError(false);

    try {
      // Générer token reCAPTCHA
      const recaptchaToken = await executeRecaptcha("quote_form");

      // Ajouter tracking source
      const payload = {
        ...formData,
        isUrgent,
        recaptchaToken,
        sourceUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
        sourceFormType: isUrgent ? 'urgence_hero_homepage' : 'simple_devis_hero_homepage',
        referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
      };

      // Appeler l'API quote
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur envoi');
      }

      // Succès : afficher message + reset
      setShowSuccess(true);
      setFormData({ nom: "", telephone: "", email: "", message: "" });
      setAgreed(false);
      setIsUrgent(false);

      // Masquer le message après 5s
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Erreur soumission formulaire:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher le message de succès
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-2xl p-8 shadow-2xl text-center",
          glassmorphism
            ? "backdrop-blur-lg border border-white/30"
            : "bg-white border border-gray-100",
          className
        )}
        style={glassmorphism ? {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        } : {}}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            glassmorphism ? "bg-white/20" : "bg-green-100"
          )}
        >
          <CheckCircle2 className={cn(
            "w-10 h-10",
            glassmorphism ? "text-white" : "text-green-600"
          )} />
        </motion.div>
        <h3 className={cn(
          "text-xl font-bold mb-2",
          glassmorphism ? "text-white" : "text-gray-900"
        )}>
          Demande envoyée avec succès !
        </h3>
        <p className={cn(
          "text-sm",
          glassmorphism ? "text-white/80" : "text-gray-600"
        )}>
          Nous vous recontacterons sous {isUrgent ? "2h" : "24h"}.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        glassmorphism
          ? "backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8"
          : "bg-white rounded-2xl p-8 shadow-2xl border border-gray-100",
        className
      )}
      style={glassmorphism ? {
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      } : {}}
    >
      <div className="text-center mb-4">
        <h3 className={cn(
          "text-xl font-bold mb-1",
          glassmorphism ? "text-white" : "text-gray-900"
        )} style={{fontFamily: 'var(--font-outfit)'}}>
          {isUrgent ? "Demande urgente" : "Demandez un devis gratuit"}
        </h3>
        <p className={cn(
          "text-xs",
          glassmorphism ? "text-white/80" : "text-gray-600"
        )}>
          {isUrgent ? "Rappel sous 2h • Intervention rapide" : "Réponse sous 24h • Devis personnalisé"}
        </p>
      </div>

      {/* Message d'erreur */}
      {showError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Toggle Urgence */}
      <div className="mb-3 flex items-center justify-center gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setIsUrgent(false)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-xs",
            !isUrgent
              ? "bg-yellow text-black shadow-sm"
              : "bg-transparent text-black hover:bg-gray-200"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Standard</span>
        </button>
        <button
          type="button"
          onClick={() => setIsUrgent(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-xs",
            isUrgent
              ? "bg-red-600 text-white shadow-sm"
              : "bg-transparent text-red-600 hover:bg-gray-200"
          )}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Urgence ?</span>
        </button>
      </div>

      {/* Alerte urgence */}
      {isUrgent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">
                Fuite, dégât des eaux ou problème urgent ?
              </p>
              <p className="text-xs text-red-700">
                Nous vous rappelons sous 2h pour planifier une intervention rapide.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nom et prénom */}
        <div>
          <label htmlFor="nom" className={cn(
            "block text-sm font-medium mb-1.5",
            glassmorphism ? "text-white" : "text-gray-700"
          )}>
            Nom et prénom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom et prénom"
            required
            className={cn(
              "w-full px-4 py-3 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-base",
              glassmorphism
                ? "border-white/30 bg-white/10 text-white placeholder:text-white placeholder:font-semibold"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="telephone" className={cn(
            "block text-sm font-medium mb-1.5",
            glassmorphism ? "text-white" : "text-gray-700"
          )}>
            Téléphone
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            required
            className={cn(
              "w-full px-4 py-3 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-base",
              glassmorphism
                ? "border-white/30 bg-white/10 text-white placeholder:text-white placeholder:font-semibold"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={cn(
            "block text-sm font-medium mb-1.5",
            glassmorphism ? "text-white" : "text-gray-700"
          )}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className={cn(
              "w-full px-4 py-3 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-base",
              glassmorphism
                ? "border-white/30 bg-white/10 text-white placeholder:text-white placeholder:font-semibold"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={cn(
            "block text-sm font-medium mb-1.5",
            glassmorphism ? "text-white" : "text-gray-700"
          )}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="Décrivez votre projet..."
            className={cn(
              "w-full px-4 py-3 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none text-base",
              glassmorphism
                ? "border-white/30 bg-white/10 text-white placeholder:text-white placeholder:font-semibold"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>

        {/* Toggle politique */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              agreed ? "bg-yellow" : glassmorphism ? "bg-white/20" : "bg-gray-200"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
              agreed ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
          <label className={cn(
            "text-sm leading-relaxed cursor-pointer",
            glassmorphism ? "text-white/80" : "text-gray-600"
          )}
          onClick={() => setAgreed(!agreed)}
          >
            J'accepte la{" "}
            <a href="/politique-confidentialite" className="text-yellow hover:underline" onClick={(e) => e.stopPropagation()}>
              politique de confidentialité
            </a>
          </label>
        </div>

        {/* Bouton submit */}
        <motion.button
          type="submit"
          disabled={!agreed || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3.5 md:py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-base min-h-[48px]",
            agreed && !isSubmitting
              ? isUrgent
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                : "bg-yellow hover:bg-yellow/90 text-black shadow-yellow"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </div>
          ) : (
            <>
              {isUrgent ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Envoyer la demande urgente
                </>
              ) : (
                <>
                  Envoyer
                  <Send className="w-4 h-4" />
                </>
              )}
            </>
          )}
        </motion.button>
      </form>

      <p className={cn(
        "text-xs text-center mt-2",
        glassmorphism ? "text-white/60" : "text-gray-500"
      )}>
        Vos données sont protégées et ne seront jamais partagées.
      </p>
    </motion.div>
  );
};

export default DevisForm;
