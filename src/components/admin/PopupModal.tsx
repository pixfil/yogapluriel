'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Popup, CreatePopupData, createPopup, updatePopup } from '@/app/actions/popups';
import SingleImageUpload from './SingleImageUpload';
import { X, Plus } from 'lucide-react';

interface Props {
  popup: Popup | null;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'content' | 'appearance' | 'rules' | 'preview';

export default function PopupModal({ popup, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [title, setTitle] = useState('');
  const [internalName, setInternalName] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Content tab
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Appearance tab
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [overlayColor, setOverlayColor] = useState('rgba(0,0,0,0.5)');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [buttonColor, setButtonColor] = useState('#FFC803');
  const [buttonTextColor, setButtonTextColor] = useState('#000000');
  const [widthPx, setWidthPx] = useState(600);
  const [borderRadius, setBorderRadius] = useState(12);

  // Rules tab
  const [triggerType, setTriggerType] = useState<'on_load' | 'on_exit' | 'on_scroll' | 'timed'>('on_load');
  const [triggerDelay, setTriggerDelay] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(50);
  const [showOncePerSession, setShowOncePerSession] = useState(false);
  const [showOncePerUser, setShowOncePerUser] = useState(false);
  const [excludedPaths, setExcludedPaths] = useState<string[]>([]);
  const [includedPaths, setIncludedPaths] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Path input states
  const [excludedPathInput, setExcludedPathInput] = useState('');
  const [includedPathInput, setIncludedPathInput] = useState('');

  // Initialize form from popup prop
  useEffect(() => {
    if (popup) {
      setTitle(popup.title);
      setInternalName(popup.internal_name);
      setIsActive(popup.is_active);

      setHeading(popup.heading || '');
      setDescription(popup.description || '');
      setCtaText(popup.cta_text || '');
      setCtaLink(popup.cta_link || '');
      setImageUrl(popup.image_url || '');

      setPosition(popup.position);
      setOverlayColor(popup.overlay_color);
      setBackgroundColor(popup.background_color);
      setTextColor(popup.text_color);
      setButtonColor(popup.button_color);
      setButtonTextColor(popup.button_text_color);
      setWidthPx(popup.width_px);
      setBorderRadius(popup.border_radius);

      setTriggerType(popup.trigger_type);
      setTriggerDelay(popup.trigger_delay);
      setScrollPercentage(popup.scroll_percentage);
      setShowOncePerSession(popup.show_once_per_session);
      setShowOncePerUser(popup.show_once_per_user);
      setExcludedPaths(popup.excluded_paths || []);
      setIncludedPaths(popup.included_paths || []);
      setStartDate(popup.start_date ? popup.start_date.split('T')[0] : '');
      setEndDate(popup.end_date ? popup.end_date.split('T')[0] : '');
    }
  }, [popup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: CreatePopupData = {
        title,
        internal_name: internalName,
        is_active: isActive,

        heading,
        description,
        cta_text: ctaText,
        cta_link: ctaLink,
        image_url: imageUrl,

        position,
        overlay_color: overlayColor,
        background_color: backgroundColor,
        text_color: textColor,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        width_px: widthPx,
        border_radius: borderRadius,

        trigger_type: triggerType,
        trigger_delay: triggerDelay,
        scroll_percentage: scrollPercentage,
        show_once_per_session: showOncePerSession,
        show_once_per_user: showOncePerUser,
        excluded_paths: excludedPaths.length > 0 ? excludedPaths : undefined,
        included_paths: includedPaths.length > 0 ? includedPaths : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const result = popup
        ? await updatePopup(popup.id, data, imageFile || undefined)
        : await createPopup(data, imageFile || undefined);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const addExcludedPath = () => {
    if (excludedPathInput && !excludedPaths.includes(excludedPathInput)) {
      setExcludedPaths([...excludedPaths, excludedPathInput]);
      setExcludedPathInput('');
    }
  };

  const removeExcludedPath = (path: string) => {
    setExcludedPaths(excludedPaths.filter((p) => p !== path));
  };

  const addIncludedPath = () => {
    if (includedPathInput && !includedPaths.includes(includedPathInput)) {
      setIncludedPaths([...includedPaths, includedPathInput]);
      setIncludedPathInput('');
    }
  };

  const removeIncludedPath = (path: string) => {
    setIncludedPaths(includedPaths.filter((p) => p !== path));
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'content', label: 'Contenu' },
    { id: 'appearance', label: 'Apparence' },
    { id: 'rules', label: 'Règles' },
    { id: 'preview', label: 'Aperçu' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title={popup ? `Modifier : ${popup.title}` : 'Nouveau popup'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-yellow text-yellow'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <>
              {/* Title & Internal Name (in all tabs for reference) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="Mon popup promo"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nom affiché dans l'admin</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom interne <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={internalName}
                    onChange={(e) => setInternalName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                    placeholder="promo-noel-2025"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID unique (pas d'espaces)</p>
                </div>
              </div>

              {/* Heading */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du popup
                </label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Profitez de -20% !"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Offre valable jusqu'au 31 décembre sur tous nos services..."
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="J'en profite"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien du bouton
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="/contact"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (optionnelle)
                </label>
                <SingleImageUpload
                  currentImageUrl={imageUrl}
                  onImageChange={(file) => setImageFile(file)}
                  onImageUrlChange={setImageUrl}
                  bucket="popup-images"
                  path="popups"
                />
              </div>
            </>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <>
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                >
                  <option value="center">Centre</option>
                  <option value="top-left">Haut gauche</option>
                  <option value="top-right">Haut droit</option>
                  <option value="bottom-left">Bas gauche</option>
                  <option value="bottom-right">Bas droit</option>
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur overlay
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                      placeholder="rgba(0,0,0,0.5)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: rgba(0,0,0,0.5)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur fond
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur texte
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur bouton
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur texte bouton
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Largeur (px)
                  </label>
                  <input
                    type="number"
                    value={widthPx}
                    onChange={(e) => setWidthPx(parseInt(e.target.value))}
                    min="300"
                    max="1200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrondi coins (px)
                  </label>
                  <input
                    type="number"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {/* RULES TAB */}
          {activeTab === 'rules' && (
            <>
              {/* Trigger type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de déclenchement
                </label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                >
                  <option value="on_load">Au chargement de la page</option>
                  <option value="on_exit">À la sortie (exit intent)</option>
                  <option value="on_scroll">Au scroll</option>
                  <option value="timed">Temporisé</option>
                </select>
              </div>

              {/* Trigger delay (for on_load and timed) */}
              {(triggerType === 'on_load' || triggerType === 'timed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Délai (secondes)
                  </label>
                  <input
                    type="number"
                    value={triggerDelay}
                    onChange={(e) => setTriggerDelay(parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = immédiat</p>
                </div>
              )}

              {/* Scroll percentage (for on_scroll) */}
              {triggerType === 'on_scroll' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pourcentage de scroll (%)
                  </label>
                  <input
                    type="number"
                    value={scrollPercentage}
                    onChange={(e) => setScrollPercentage(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>
              )}

              {/* Show once options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_once_session"
                    checked={showOncePerSession}
                    onChange={(e) => setShowOncePerSession(e.target.checked)}
                    className="w-4 h-4 text-yellow focus:ring-yellow border-gray-300 rounded"
                  />
                  <label htmlFor="show_once_session" className="text-sm text-gray-700">
                    Afficher 1 fois par session
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_once_user"
                    checked={showOncePerUser}
                    onChange={(e) => setShowOncePerUser(e.target.checked)}
                    className="w-4 h-4 text-yellow focus:ring-yellow border-gray-300 rounded"
                  />
                  <label htmlFor="show_once_user" className="text-sm text-gray-700">
                    Afficher 1 fois définitivement (cookie 30j)
                  </label>
                </div>
              </div>

              {/* Excluded paths */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages exclues
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={excludedPathInput}
                    onChange={(e) => setExcludedPathInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedPath())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="/admin"
                  />
                  <button
                    type="button"
                    onClick={addExcludedPath}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {excludedPaths.map((path) => (
                    <span
                      key={path}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded"
                    >
                      {path}
                      <button
                        type="button"
                        onClick={() => removeExcludedPath(path)}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Le popup ne s'affichera PAS sur ces pages</p>
              </div>

              {/* Included paths */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages incluses
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={includedPathInput}
                    onChange={(e) => setIncludedPathInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludedPath())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="/"
                  />
                  <button
                    type="button"
                    onClick={addIncludedPath}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {includedPaths.map((path) => (
                    <span
                      key={path}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                    >
                      {path}
                      <button
                        type="button"
                        onClick={() => removeIncludedPath(path)}
                        className="hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Le popup s'affichera UNIQUEMENT sur ces pages (laisser vide = toutes les pages)</p>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début (optionnel)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="bg-gray-100 p-8 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">Aperçu du popup :</p>

              <div className="relative" style={{ minHeight: '400px' }}>
                {/* Overlay simulation */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: overlayColor }}
                >
                  {/* Popup */}
                  <div
                    className="relative bg-white shadow-2xl overflow-hidden"
                    style={{
                      backgroundColor,
                      color: textColor,
                      width: `${widthPx}px`,
                      maxWidth: '90%',
                      borderRadius: `${borderRadius}px`,
                    }}
                  >
                    {/* Image */}
                    {(imageUrl || imageFile) && (
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                        alt=""
                        className="w-full h-48 object-cover"
                      />
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {heading && (
                        <h3 className="text-2xl font-bold mb-3">{heading}</h3>
                      )}
                      {description && (
                        <p className="mb-4">{description}</p>
                      )}
                      {ctaText && (
                        <button
                          type="button"
                          className="px-6 py-3 rounded-md font-medium"
                          style={{
                            backgroundColor: buttonColor,
                            color: buttonTextColor,
                          }}
                        >
                          {ctaText}
                        </button>
                      )}
                    </div>

                    {/* Close button */}
                    <button
                      type="button"
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10"
                      style={{ color: textColor }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Position sélectionnée : <strong>{position}</strong> (non affiché dans l'aperçu)
              </p>
            </div>
          )}
        </div>

        {/* Active Status Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="is_active_toggle" className="text-sm font-medium text-gray-900">
                Popup actif
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Le popup sera affiché sur le site selon les règles définies
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-yellow' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow text-black rounded-md hover:bg-yellow-600 font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : popup ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
