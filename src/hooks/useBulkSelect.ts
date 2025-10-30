import { useState, useCallback, useMemo } from 'react'

interface BulkSelectOptions<T> {
  items: T[]
  idField?: keyof T
  onDelete?: (ids: string[]) => Promise<void>
  onRestore?: (ids: string[]) => Promise<void>
}

export function useBulkSelect<T extends Record<string, any>>({
  items,
  idField = 'id' as keyof T,
  onDelete,
  onRestore
}: BulkSelectOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Sélectionner/désélectionner un élément
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  // Sélectionner tous les éléments
  const selectAll = useCallback(() => {
    const allIds = items.map(item => String(item[idField]))
    setSelectedIds(new Set(allIds))
  }, [items, idField])

  // Désélectionner tous les éléments
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Basculer la sélection de tous les éléments
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll()
    } else {
      selectAll()
    }
  }, [selectedIds.size, items.length, selectAll, deselectAll])

  // Vérifier si un élément est sélectionné
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  // Vérifier si tous les éléments sont sélectionnés
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length
  }, [selectedIds.size, items.length])

  // Vérifier si certains éléments sont sélectionnés (mais pas tous)
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length
  }, [selectedIds.size, items.length])

  // Supprimer les éléments sélectionnés
  const deleteSelected = useCallback(async () => {
    if (!onDelete || selectedIds.size === 0) return

    setIsLoading(true)
    try {
      await onDelete(Array.from(selectedIds))
      deselectAll()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }, [selectedIds, onDelete, deselectAll])

  // Restaurer les éléments sélectionnés
  const restoreSelected = useCallback(async () => {
    if (!onRestore || selectedIds.size === 0) return

    setIsLoading(true)
    try {
      await onRestore(Array.from(selectedIds))
      deselectAll()
    } catch (error) {
      console.error('Erreur lors de la restauration:', error)
      alert('Erreur lors de la restauration')
    } finally {
      setIsLoading(false)
    }
  }, [selectedIds, onRestore, deselectAll])

  // Sélectionner une plage d'éléments (avec Shift)
  const selectRange = useCallback((startId: string, endId: string) => {
    const startIndex = items.findIndex(item => String(item[idField]) === startId)
    const endIndex = items.findIndex(item => String(item[idField]) === endId)

    if (startIndex === -1 || endIndex === -1) return

    const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex]

    const rangeIds = items
      .slice(start, end + 1)
      .map(item => String(item[idField]))

    setSelectedIds(prev => {
      const newSet = new Set(prev)
      rangeIds.forEach(id => newSet.add(id))
      return newSet
    })
  }, [items, idField])

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isLoading,
    isSelected,
    isAllSelected,
    isSomeSelected,
    hasSelection: selectedIds.size > 0,
    toggleSelect,
    selectAll,
    deselectAll,
    clearSelection: deselectAll, // Alias pour compatibilité
    toggleSelectAll,
    selectRange,
    deleteSelected,
    restoreSelected,
    setSelectedIds
  }
}
