"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

type UploadState = 'idle' | 'uploading' | 'submitting' | 'success' | 'error';

export default function JobApplicationModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const { executeRecaptcha } = useRecaptcha();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Le fichier est trop volumineux (max 5MB)";
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format non supporté (PDF, DOC, DOCX uniquement)";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    if (type === 'cv') {
      setCvFile(file);
    } else {
      setCoverLetterFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) return;
    if (!cvFile) {
      setErrorMessage("Le CV est obligatoire");
      return;
    }

    setUploadState('uploading');
    setErrorMessage("");

    try {
      // Générer token reCAPTCHA
      const recaptchaToken = await executeRecaptcha("job_application");

      // Préparer FormData pour l'upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('message', formData.message || '');
      formDataToSend.append('jobId', jobId);
      formDataToSend.append('jobTitle', jobTitle);
      formDataToSend.append('cv', cvFile);
      if (coverLetterFile) {
        formDataToSend.append('coverLetter', coverLetterFile);
      }
      if (recaptchaToken) {
        formDataToSend.append('recaptchaToken', recaptchaToken);
      }

      setUploadState('submitting');

      // Envoyer à l'API
      const response = await fetch('/api/job-application', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      setUploadState('success');

      // Reset form après 3 secondes
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error("Erreur soumission candidature:", error);
      setUploadState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", message: "" });
    setCvFile(null);
    setCoverLetterFile(null);
    setAgreed(false);
    setUploadState('idle');
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop avec blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4"
          >
            {/* Success State */}
            {uploadState === 'success' ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">Candidature envoyée !</h3>
                <p className="text-gray-600 mb-6">
                  Nous avons bien reçu votre candidature pour le poste de <strong>{jobTitle}</strong>.<br />
                  Notre équipe va l'étudier et vous recontacter rapidement.
                </p>
                <p className="text-sm text-gray-500">
                  Vous allez recevoir un email de confirmation dans quelques instants.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-yellow p-6 border-b border-yellow/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-black">Postuler à cette offre</h2>
                      <p className="text-sm text-gray-800 mt-1">{jobTitle}</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-black/10 rounded-full transition-colors"
                      disabled={uploadState === 'uploading' || uploadState === 'submitting'}
                    >
                      <X className="w-5 h-5 text-black" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Nom */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                      Nom et prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={uploadState !== 'idle'}
                      className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none disabled:opacity-50"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={uploadState !== 'idle'}
                      className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none disabled:opacity-50"
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={uploadState !== 'idle'}
                      className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none disabled:opacity-50"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700">
                      Message de motivation (optionnel)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={uploadState !== 'idle'}
                      maxLength={1000}
                      className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none disabled:opacity-50"
                      placeholder="Présentez votre motivation en quelques lignes..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.message.length} / 1000 caractères</p>
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      CV <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'cv')}
                      disabled={uploadState !== 'idle'}
                      className="hidden"
                    />
                    {cvFile ? (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{cvFile.name}</p>
                          <p className="text-xs text-gray-600">{(cvFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCvFile(null)}
                          disabled={uploadState !== 'idle'}
                          className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={uploadState !== 'idle'}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow hover:bg-yellow/5 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Cliquez pour uploader votre CV</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                      </button>
                    )}
                  </div>

                  {/* Cover Letter Upload (Optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Lettre de motivation (optionnel)
                    </label>
                    <input
                      ref={coverLetterInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'coverLetter')}
                      disabled={uploadState !== 'idle'}
                      className="hidden"
                    />
                    {coverLetterFile ? (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{coverLetterFile.name}</p>
                          <p className="text-xs text-gray-600">{(coverLetterFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCoverLetterFile(null)}
                          disabled={uploadState !== 'idle'}
                          className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverLetterInputRef.current?.click()}
                        disabled={uploadState !== 'idle'}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow hover:bg-yellow/5 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Cliquez pour uploader votre lettre</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                      </button>
                    )}
                  </div>

                  {/* Checkbox politique */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAgreed(!agreed)}
                      disabled={uploadState !== 'idle'}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
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
                      onClick={() => !uploadState && setAgreed(!agreed)}
                    >
                      J'accepte la{" "}
                      <a href="/politique-confidentialite" target="_blank" className="text-yellow hover:underline" onClick={(e) => e.stopPropagation()}>
                        politique de confidentialité
                      </a>
                    </label>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={!agreed || !cvFile || uploadState !== 'idle'}
                    whileHover={{ scale: agreed && cvFile && uploadState === 'idle' ? 1.02 : 1 }}
                    whileTap={{ scale: agreed && cvFile && uploadState === 'idle' ? 0.98 : 1 }}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200",
                      agreed && cvFile && uploadState === 'idle'
                        ? "bg-yellow hover:bg-yellow/90 text-black shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {uploadState === 'uploading' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Upload des fichiers...
                      </>
                    )}
                    {uploadState === 'submitting' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    )}
                    {uploadState === 'idle' && (
                      <>
                        Envoyer ma candidature
                        <Upload className="w-5 h-5" />
                      </>
                    )}
                    {uploadState === 'error' && (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Réessayer
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-center text-gray-500">
                    Vos données sont protégées et ne seront jamais partagées.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
