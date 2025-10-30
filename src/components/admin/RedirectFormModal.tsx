"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  is_wildcard: boolean;
  notes: string | null;
}

interface RedirectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdRedirect?: { id: string }) => void;
  redirect?: Redirect | null;
  initialFromPath?: string;
  initialNotes?: string;
}

export default function RedirectFormModal({
  isOpen,
  onClose,
  onSuccess,
  redirect,
  initialFromPath,
  initialNotes,
}: RedirectFormModalProps) {
  const [formData, setFormData] = useState({
    from_path: "",
    to_path: "",
    status_code: 301,
    is_active: true,
    is_wildcard: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or redirect changes
  useEffect(() => {
    if (isOpen) {
      if (redirect) {
        setFormData({
          from_path: redirect.from_path,
          to_path: redirect.to_path,
          status_code: redirect.status_code,
          is_active: redirect.is_active,
          is_wildcard: redirect.is_wildcard || false,
          notes: redirect.notes || "",
        });
      } else {
        setFormData({
          from_path: initialFromPath || "",
          to_path: "",
          status_code: 301,
          is_active: true,
          is_wildcard: false,
          notes: initialNotes || "",
        });
      }
      setErrors({});
    }
  }, [isOpen, redirect, initialFromPath, initialNotes]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.from_path.trim()) {
      newErrors.from_path = "Le chemin source est requis";
    } else if (!formData.from_path.startsWith("/")) {
      newErrors.from_path = "Le chemin doit commencer par /";
    }

    if (!formData.to_path.trim()) {
      newErrors.to_path = "Le chemin de destination est requis";
    } else if (!formData.to_path.startsWith("/") && !formData.to_path.startsWith("http")) {
      newErrors.to_path = "Le chemin doit commencer par / ou http";
    }

    if (formData.from_path === formData.to_path) {
      newErrors.to_path = "La destination doit être différente de la source";
    }

    if (![301, 302, 307, 308].includes(formData.status_code)) {
      newErrors.status_code = "Code de statut invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url = redirect
        ? `/api/admin/redirects/${redirect.id}`
        : "/api/admin/redirects";

      const method = redirect ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.redirect); // Passer la redirection créée
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || "Une erreur est survenue" });
      }
    } catch (error) {
      console.error("Error submitting redirect:", error);
      setErrors({ submit: "Une erreur est survenue lors de l'enregistrement" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {redirect ? "Modifier la redirection" : "Nouvelle redirection"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* From Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chemin source (ancien URL)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.from_path}
                    onChange={(e) =>
                      setFormData({ ...formData, from_path: e.target.value })
                    }
                    placeholder="/ancien-chemin/"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent ${
                      errors.from_path ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.from_path && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.from_path}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Commencez par / (ex: /ancien-chemin/ ou /page.html)
                  </p>
                </div>

                {/* To Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chemin de destination (nouveau URL)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.to_path}
                    onChange={(e) =>
                      setFormData({ ...formData, to_path: e.target.value })
                    }
                    placeholder="/nouveau-chemin/"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent ${
                      errors.to_path ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.to_path && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.to_path}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Chemin relatif (/) ou URL absolue (http://)
                  </p>
                </div>

                {/* Status Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de statut HTTP
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.status_code}
                    onChange={(e) =>
                      setFormData({ ...formData, status_code: parseInt(e.target.value) })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent ${
                      errors.status_code ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value={301}>301 - Redirection permanente (recommandé pour SEO)</option>
                    <option value={302}>302 - Redirection temporaire</option>
                    <option value={307}>307 - Redirection temporaire (préserve méthode)</option>
                    <option value={308}>308 - Redirection permanente (préserve méthode)</option>
                  </select>
                  {errors.status_code && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.status_code}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Utilisez 301 pour les redirections SEO permanentes
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notes internes sur cette redirection..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ajoutez une description pour vous souvenir de la raison de cette redirection
                  </p>
                </div>

                {/* Is Wildcard */}
                <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="is_wildcard"
                      checked={formData.is_wildcard}
                      onChange={(e) =>
                        setFormData({ ...formData, is_wildcard: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-yellow focus:ring-yellow mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="is_wildcard" className="text-sm font-medium text-blue-900">
                        Mode wildcard (utiliser * pour rediriger plusieurs URLs)
                      </label>
                      <p className="mt-1 text-xs text-blue-700">
                        Exemples :<br />
                        • <code className="bg-blue-100 px-1 rounded">/portfolio/*</code> → <code className="bg-blue-100 px-1 rounded">/nos-realisations</code> (tous vers la même page)<br />
                        • <code className="bg-blue-100 px-1 rounded">/portfolio/*</code> → <code className="bg-blue-100 px-1 rounded">/nos-realisations/*</code> (préserve le slug)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-yellow focus:ring-yellow"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Activer immédiatement cette redirection
                  </label>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Bonnes pratiques SEO
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Utilisez des redirections 301 pour préserver le référencement</li>
                    <li>• Évitez les chaînes de redirections (A → B → C)</li>
                    <li>• Assurez-vous que la destination est pertinente</li>
                    <li>• Vérifiez régulièrement les compteurs de hits</li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting
                      ? "Enregistrement..."
                      : redirect
                      ? "Mettre à jour"
                      : "Créer la redirection"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
