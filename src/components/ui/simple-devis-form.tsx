"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface SimpleDevisFormProps {
  className?: string;
  isUrgent?: boolean;
  onSubmit: (data: {
    nom: string;
    telephone: string;
    email: string;
    message: string;
    isUrgent: boolean;
    recaptchaToken: string | null;
  }) => Promise<void>;
}

const SimpleDevisForm = ({ className, isUrgent = false, onSubmit }: SimpleDevisFormProps) => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
    try {
      // Générer token reCAPTCHA
      const recaptchaToken = await executeRecaptcha("quote_form");

      // Appeler le handler parent avec le token
      await onSubmit({
        ...formData,
        isUrgent,
        recaptchaToken,
      });

      // Reset form on success
      setFormData({ nom: "", telephone: "", email: "", message: "" });
      setAgreed(false);
    } catch (error) {
      console.error("Erreur soumission formulaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-white rounded-2xl p-8 shadow-xl border border-gray-100",
        className
      )}
    >
      <div className="text-center mb-4">
        <h3 className={cn(
          "text-xl font-bold mb-1",
          isUrgent ? "text-red-600" : "text-gray-900"
        )} style={{fontFamily: 'var(--font-outfit)'}}>
          {isUrgent ? "Demande urgente" : "Contactez-nous"}
        </h3>
        <p className="text-xs text-gray-600">
          {isUrgent ? "Remplissez ce formulaire pour une intervention rapide (rappel sous 2h)" : "Posez-nous vos questions ou décrivez votre projet (réponse sous 48h)"}
        </p>
      </div>

      {/* Alerte urgence (pas de toggle, juste l'alerte si isUrgent=true) */}
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
          <label htmlFor="nom" className="block text-sm font-medium mb-2 text-gray-700">
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
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium mb-2 text-gray-700">
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
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
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
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="Décrivez votre projet..."
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
          />
        </div>

        {/* Toggle politique */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              agreed ? "bg-yellow" : "bg-gray-200"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
              agreed ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
          <label
            className="text-sm leading-relaxed text-gray-600 cursor-pointer"
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
          whileHover={{ scale: agreed && !isSubmitting ? 1.02 : 1 }}
          whileTap={{ scale: agreed && !isSubmitting ? 0.98 : 1 }}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200",
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

      <p className="text-xs text-center mt-2 text-gray-500">
        Vos données sont protégées et ne seront jamais partagées.
      </p>
    </motion.div>
  );
};

export default SimpleDevisForm;
