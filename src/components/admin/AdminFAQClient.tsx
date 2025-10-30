"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FAQCategoryWithQuestions,
  createCategory,
  createQuestion,
  updateCategory,
  updateQuestion,
  softDeleteCategory,
  softDeleteQuestion,
  restoreCategory,
  restoreQuestion,
} from "@/app/actions/faq";

type Props = {
  initialCategories: FAQCategoryWithQuestions[];
  stats: {
    totalCategories: number;
    totalQuestions: number;
    deletedCategories: number;
    deletedQuestions: number;
  };
};

// Liste des icônes Lucide disponibles pour les catégories
const availableIcons = [
  "BadgeDollarSign",
  "Home",
  "Clock",
  "Shield",
  "Wrench",
  "HelpCircle",
  "FileText",
  "Settings",
];

export default function AdminFAQClient({ initialCategories, stats }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialCategories.map((c) => c.id))
  );

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategoryWithQuestions | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ categoryId: string; question?: any } | null>(null);

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    icon: "HelpCircle",
    published: true,
  });

  // Question form
  const [questionForm, setQuestionForm] = useState({
    question: "",
    answer: "",
    published: true,
  });

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Refresh data
  const refreshData = () => {
    startTransition(() => {
      window.location.reload();
    });
  };

  // Handle create/update category
  const handleSaveCategory = async () => {
    startTransition(async () => {
      if (editingCategory) {
        // Update
        await updateCategory(editingCategory.id, {
          title: categoryForm.title,
          icon: categoryForm.icon,
          published: categoryForm.published,
        });
      } else {
        // Create
        await createCategory({
          title: categoryForm.title,
          icon: categoryForm.icon,
          published: categoryForm.published,
        });
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ title: "", icon: "HelpCircle", published: true });
      refreshData();
    });
  };

  // Handle create/update question
  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    startTransition(async () => {
      if (editingQuestion.question) {
        // Update
        await updateQuestion(editingQuestion.question.id, {
          question: questionForm.question,
          answer: questionForm.answer,
          published: questionForm.published,
        });
      } else {
        // Create
        await createQuestion({
          category_id: editingQuestion.categoryId,
          question: questionForm.question,
          answer: questionForm.answer,
          published: questionForm.published,
        });
      }

      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionForm({ question: "", answer: "", published: true });
      refreshData();
    });
  };

  // Handle delete/restore category
  const handleDeleteCategory = async (categoryId: string, isDeleted: boolean) => {
    startTransition(async () => {
      if (isDeleted) {
        await restoreCategory(categoryId);
      } else {
        if (confirm("Supprimer cette catégorie et toutes ses questions ?")) {
          await softDeleteCategory(categoryId);
        }
      }
      refreshData();
    });
  };

  // Handle delete/restore question
  const handleDeleteQuestion = async (questionId: string, isDeleted: boolean) => {
    startTransition(async () => {
      if (isDeleted) {
        await restoreQuestion(questionId);
      } else {
        if (confirm("Supprimer cette question ?")) {
          await softDeleteQuestion(questionId);
        }
      }
      refreshData();
    });
  };

  // Handle toggle published
  const handleTogglePublishedCategory = async (category: FAQCategoryWithQuestions) => {
    startTransition(async () => {
      await updateCategory(category.id, { published: !category.published });
      refreshData();
    });
  };

  const handleTogglePublishedQuestion = async (question: any) => {
    startTransition(async () => {
      await updateQuestion(question.id, { published: !question.published });
      refreshData();
    });
  };

  // Open modals
  const openCategoryModal = (category?: FAQCategoryWithQuestions) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        title: category.title,
        icon: category.icon,
        published: category.published,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ title: "", icon: "HelpCircle", published: true });
    }
    setShowCategoryModal(true);
  };

  const openQuestionModal = (categoryId: string, question?: any) => {
    if (question) {
      setEditingQuestion({ categoryId, question });
      setQuestionForm({
        question: question.question,
        answer: question.answer,
        published: question.published,
      });
    } else {
      setEditingQuestion({ categoryId });
      setQuestionForm({ question: "", answer: "", published: true });
    }
    setShowQuestionModal(true);
  };

  // Filter categories by search
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.questions.some(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDeleted = showDeleted ? true : !category.deleted_at;

    return matchesSearch && matchesDeleted;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion FAQ</h1>
          <p className="text-gray-600 mt-1">
            Gérez les questions fréquentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
              showDeleted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showDeleted ? 'Masquer la corbeille' : 'Voir la corbeille'}
          </button>
          <button
            onClick={() => openCategoryModal()}
            className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Catégories</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCategories}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Questions</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalQuestions}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Cat. supprimées</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{stats.deletedCategories}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Q. supprimées</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{stats.deletedQuestions}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie ou question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune catégorie trouvée</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${
                category.deleted_at ? "opacity-60" : ""
              }`}
            >
              {/* Category Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      {!category.published && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Brouillon
                        </span>
                      )}
                      {category.deleted_at && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Supprimé
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Icône: {category.icon} • {category.question_count || 0} question(s)
                    </div>
                  </div>
                </div>

                {/* Category Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublishedCategory(category)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title={category.published ? "Dépublier" : "Publier"}
                  >
                    {category.published ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => openCategoryModal(category)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(category.id, !!category.deleted_at)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title={category.deleted_at ? "Restaurer" : "Supprimer"}
                  >
                    <Trash2
                      className={`w-4 h-4 ${
                        category.deleted_at ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => openQuestionModal(category.id)}
                    className="ml-2 px-3 py-1 bg-yellow text-black text-sm rounded hover:bg-yellow/90 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <AnimatePresence>
                {expandedCategories.has(category.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {category.questions.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          Aucune question dans cette catégorie
                        </p>
                      ) : (
                        category.questions.map((question) => (
                          <div
                            key={question.id}
                            className={`border border-gray-200 rounded p-3 ${
                              question.deleted_at ? "opacity-60 bg-gray-50" : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">{question.question}</p>
                                  {!question.published && (
                                    <span className="px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded">
                                      Brouillon
                                    </span>
                                  )}
                                  {question.deleted_at && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                      Supprimé
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{question.answer}</p>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleTogglePublishedQuestion(question)}
                                  className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                                  title={question.published ? "Dépublier" : "Publier"}
                                >
                                  {question.published ? (
                                    <Eye className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </button>

                                <button
                                  onClick={() => openQuestionModal(category.id, question)}
                                  className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                                  title="Modifier"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                                </button>

                                <button
                                  onClick={() => handleDeleteQuestion(question.id, !!question.deleted_at)}
                                  className="p-1.5 hover:bg-white rounded transition-colors cursor-pointer"
                                  title={question.deleted_at ? "Restaurer" : "Supprimer"}
                                >
                                  <Trash2
                                    className={`w-3.5 h-3.5 ${
                                      question.deleted_at ? "text-green-600" : "text-red-600"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Ex: Devis et Tarifs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icône
                </label>
                <select
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="category-published"
                  checked={categoryForm.published}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, published: e.target.checked })
                  }
                  className="rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <label htmlFor="category-published" className="text-sm text-gray-700">
                  Publier immédiatement
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!categoryForm.title || isPending}
                className="flex-1 px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow/90 transition-colors font-semibold disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "En cours..." : editingCategory ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingQuestion?.question ? "Modifier la question" : "Nouvelle question"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Ex: Le devis est-il vraiment gratuit ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réponse
                </label>
                <textarea
                  value={questionForm.answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                  placeholder="Entrez la réponse détaillée..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="question-published"
                  checked={questionForm.published}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, published: e.target.checked })
                  }
                  className="rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <label htmlFor="question-published" className="text-sm text-gray-700">
                  Publier immédiatement
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={!questionForm.question || !questionForm.answer || isPending}
                className="flex-1 px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow/90 transition-colors font-semibold disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "En cours..." : editingQuestion?.question ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
