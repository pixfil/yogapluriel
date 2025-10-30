"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Tag, FolderOpen } from "lucide-react";
import Modal from "@/components/ui/modal";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/app/actions/categories";

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export default function AdminCategoriesClient({
  initialCategories,
}: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Handle create
  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCategory) {
        // Update
        const result = await updateCategory(editingCategory.id, formData);
        if (!result.success) {
          alert(result.error || "Erreur lors de la mise à jour");
          return;
        }
      } else {
        // Create
        const result = await createCategory(formData);
        if (!result.success) {
          alert(result.error || "Erreur lors de la création");
          return;
        }
      }

      // Refresh page to show updates
      window.location.reload();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    const projectCount = category.project_categories?.length || 0;

    if (projectCount > 0) {
      if (
        !confirm(
          `Cette catégorie est utilisée par ${projectCount} projet(s). Êtes-vous sûr de vouloir la supprimer ?`
        )
      ) {
        return;
      }
    } else {
      if (
        !confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)
      ) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await deleteCategory(category.id);
      if (!result.success) {
        alert(result.error || "Erreur lors de la suppression");
        return;
      }

      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const totalProjects = categories.reduce(
    (total, cat) => total + (cat.project_categories?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des catégories
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez vos projets par catégories
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total catégories
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Projets associés
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projets
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => {
                  const projectCount = category.project_categories?.length || 0;

                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Tag className="w-5 h-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Slug: {category.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || "Aucune description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {projectCount} projet{projectCount !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-yellow hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie
            </h3>
            <p className="text-gray-600 mb-6">
              Créez des catégories pour organiser vos projets.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une catégorie
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory
            ? `Modifier: ${editingCategory.name}`
            : "Nouvelle catégorie"
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
              placeholder="ex: Toiture traditionnelle"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
              placeholder="Description de la catégorie..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading
                ? "Enregistrement..."
                : editingCategory
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
