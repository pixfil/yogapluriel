'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
  Archive
} from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onDelete?: () => void
  onRestore?: () => void
  onDeselectAll: () => void
  isLoading?: boolean
  showRestore?: boolean
  variant?: 'default' | 'danger' | 'success'
}

export default function BulkActionsBar({
  selectedCount,
  onDelete,
  onRestore,
  onDeselectAll,
  isLoading = false,
  showRestore = false,
  variant = 'default'
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  const bgColors = {
    default: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className={`${bgColors[variant]} rounded-2xl shadow-2xl p-1`}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4">
            <div className="flex items-center gap-6">
              {/* Counter */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-md animate-pulse" />
                  <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-4 py-2 font-bold">
                    {selectedCount}
                  </div>
                </div>
                <span className="text-gray-700 font-medium">
                  élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                </span>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-gray-300" />

              {/* Actions */}
              <div className="flex items-center gap-3">
                {showRestore && onRestore && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRestore}
                    disabled={isLoading}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-green-500 rounded-lg blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
                    <div className="relative flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <RotateCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                      Restaurer
                    </div>
                  </motion.button>
                )}

                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDelete}
                    disabled={isLoading}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-lg blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
                    <div className="relative flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Trash2 className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
                      Supprimer
                    </div>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDeselectAll}
                  disabled={isLoading}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gray-500 rounded-lg blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
                  <div className="relative flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <X className="h-5 w-5" />
                    Annuler
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Composant Checkbox personnalisé pour le bulk select
export function BulkSelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className = ''
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
        className="peer h-5 w-5 rounded border-2 border-gray-300 text-blue-600
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all cursor-pointer"
      />
      <div className="absolute inset-0 peer-checked:bg-blue-500/20 rounded blur-sm pointer-events-none" />
    </div>
  )
}

// Badge pour afficher le statut supprimé
export function DeletedBadge({ deletedAt }: { deletedAt?: string | null }) {
  if (!deletedAt) return null

  const deletedDate = new Date(deletedAt)
  const formattedDate = deletedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100
                 text-red-700 rounded-full text-xs font-medium"
    >
      <Archive className="h-3.5 w-3.5" />
      <span>Supprimé le {formattedDate}</span>
    </motion.div>
  )
}
