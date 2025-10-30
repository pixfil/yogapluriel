"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleContactFormProps {
  className?: string;
}

export default function SimpleContactForm({ className }: SimpleContactFormProps) {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    // Reset form
    setFormData({ nom: "", telephone: "", email: "", message: "" });
    setAgreed(false);
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
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-900" style={{fontFamily: 'var(--font-outfit)'}}>
          Contactez-nous
        </h3>
        <p className="text-gray-600">
          Réponse sous 24h • Conseils personnalisés
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Votre nom complet"
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
            placeholder="06 12 34 56 78"
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
            placeholder="votre@email.com"
            required
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700">
            Votre message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Décrivez votre projet ou posez-nous vos questions..."
            required
            className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
          />
        </div>

        {/* Checkbox politique */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="policy"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-yellow border-gray-300 rounded focus:ring-yellow"
          />
          <label htmlFor="policy" className="text-sm leading-relaxed text-gray-600">
            J'accepte la{" "}
            <a href="/politique-confidentialite" className="text-yellow hover:underline font-medium">
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
              ? "bg-yellow hover:bg-yellow/90 text-black shadow-lg hover:shadow-xl"
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
              Envoyer le message
              <Send className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      <p className="text-xs text-center mt-4 text-gray-500">
        Vos données sont protégées et ne seront jamais partagées.
      </p>
    </motion.div>
  );
}
