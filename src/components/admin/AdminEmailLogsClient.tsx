"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Send,
  CheckCircle,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Clock,
  X,
  Search,
  RefreshCw,
  Trash2,
  RotateCcw,
  Archive,
} from "lucide-react";
import { EmailLog, resendEmail } from "@/app/actions/messages";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from "./BulkActionsBar";

type Props = {
  initialEmailLogs: EmailLog[];
  stats: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    bounced: number;
  };
};

const DELIVERY_STATUS_LABELS = {
  pending: "En attente",
  queued: "File d'attente",
  sent: "Envoyé",
  delivered: "Délivré",
  delayed: "Retardé",
  bounced: "Rebondi",
  complained: "Spam",
};

const DELIVERY_STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-800",
  queued: "bg-blue-100 text-blue-800",
  sent: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  delayed: "bg-orange-100 text-orange-800",
  bounced: "bg-red-100 text-red-800",
  complained: "bg-red-100 text-red-800",
};

export default function AdminEmailLogsClient({ initialEmailLogs, stats }: Props) {
  const router = useRouter();
  const [emailLogs, setEmailLogs] = useState(initialEmailLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Filter emails by deleted status
  const displayedEmails = showDeleted
    ? emailLogs.filter(e => e.deleted_at)
    : emailLogs.filter(e => !e.deleted_at);

  // Then filter by search and status
  const filteredEmails = displayedEmails.filter((email) => {
    const matchesSearch =
      email.to_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || email.delivery_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Bulk select for email logs
  const bulkSelectEmails = useBulkSelect({
    items: filteredEmails,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      const action = showDeleted ? 'permanent' : 'delete';
      await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'email_logs', ids, action }),
      });
      router.refresh();
    },
    onRestore: showDeleted
      ? async (ids: string[]) => {
          await fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'email_logs', ids, action: 'restore' }),
          });
          router.refresh();
        }
      : undefined,
  });

  // Handle resend email
  const handleResendEmail = async (emailId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir renvoyer cet email ?")) {
      return;
    }

    setResendingId(emailId);
    setAlert(null);

    try {
      const result = await resendEmail(emailId);

      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Email renvoyé avec succès',
        });
        // Refresh the page to show the new email log
        window.location.reload();
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Erreur lors du renvoi de l\'email',
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors du renvoi de l\'email',
      });
    } finally {
      setResendingId(null);
    }
  };

  // Handle individual delete
  const handleDelete = async (emailId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet email ?')) {
      return;
    }

    const action = showDeleted ? 'permanent' : 'delete';
    await fetch('/api/admin/soft-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'email_logs', ids: [emailId], action }),
    });
    router.refresh();
  };

  // Handle individual restore
  const handleRestore = async (emailId: string) => {
    await fetch('/api/admin/soft-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'email_logs', ids: [emailId], action: 'restore' }),
    });
    router.refresh();
  };

  // Calculate open rate
  const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header with Trash Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs d'emails</h2>
          <p className="text-gray-600 mt-1">
            {showDeleted ? 'Emails supprimés' : 'Tous les emails envoyés'}
          </p>
        </div>
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
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`p-4 rounded-lg border ${
            alert.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{alert.message}</p>
            <button
              onClick={() => setAlert(null)}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
            </div>
            <Mail className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Envoyés</div>
              <div className="text-3xl font-bold text-blue-600 mt-1">{stats.sent}</div>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Délivrés</div>
              <div className="text-3xl font-bold text-green-600 mt-1">{stats.delivered}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ouverts</div>
              <div className="text-3xl font-bold text-purple-600 mt-1">{stats.opened}</div>
              <div className="text-xs text-gray-500 mt-1">{openRate}% taux</div>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Bounced</div>
              <div className="text-3xl font-bold text-red-600 mt-1">{stats.bounced}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par destinataire ou sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          >
            <option value="all">Tous statuts</option>
            <option value="sent">Envoyé</option>
            <option value="delivered">Délivré</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredEmails.length} email(s) affiché(s) sur {emailLogs.length}
        </div>
      </div>

      {/* Email Logs Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-12">
                  <BulkSelectCheckbox
                    checked={bulkSelectEmails.isAllSelected}
                    indeterminate={bulkSelectEmails.isSomeSelected}
                    onChange={bulkSelectEmails.toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun email trouvé
                  </td>
                </tr>
              ) : (
                filteredEmails.map((email) => (
                  <tr key={email.id} className={email.deleted_at ? "bg-red-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4">
                      <BulkSelectCheckbox
                        checked={bulkSelectEmails.isSelected(email.id)}
                        onChange={() => bulkSelectEmails.toggleSelect(email.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(email.created_at)}
                      {email.deleted_at && <DeletedBadge deletedAt={email.deleted_at} />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.to_email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        DELIVERY_STATUS_COLORS[email.delivery_status as keyof typeof DELIVERY_STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {DELIVERY_STATUS_LABELS[email.delivery_status as keyof typeof DELIVERY_STATUS_LABELS] || email.delivery_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-4">
                        {email.delivered_at && (
                          <div className="flex items-center gap-1 text-green-600" title="Délivré">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {email.opened_at && (
                          <div className="flex items-center gap-1 text-purple-600" title={`Ouvert ${email.open_count} fois`}>
                            <Eye className="w-4 h-4" />
                            <span className="text-xs">{email.open_count}</span>
                          </div>
                        )}
                        {email.clicked_at && (
                          <div className="flex items-center gap-1 text-blue-600" title={`Cliqué ${email.click_count} fois`}>
                            <MousePointerClick className="w-4 h-4" />
                            <span className="text-xs">{email.click_count}</span>
                          </div>
                        )}
                        {email.bounced_at && (
                          <div className="flex items-center gap-1 text-red-600" title="Bounced">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        {!email.delivered_at && !email.bounced_at && (
                          <div className="flex items-center gap-1 text-gray-400" title="En attente">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedEmail(email)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!email.deleted_at && (
                          <button
                            onClick={() => handleResendEmail(email.id)}
                            disabled={resendingId === email.id}
                            className="p-1.5 text-gray-600 hover:text-yellow hover:bg-yellow/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title="Renvoyer l'email"
                          >
                            <RefreshCw className={`w-4 h-4 ${resendingId === email.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        {/* Supprimer / Restaurer */}
                        {showDeleted ? (
                          <button
                            onClick={() => handleRestore(email.id)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors cursor-pointer"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(email.id)}
                            disabled={!!email.deleted_at}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkSelectEmails.selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-lg border-2 border-yellow p-4 z-40">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-900">{bulkSelectEmails.selectedCount} email(s) sélectionné(s)</span>

            {!showDeleted && (
              <button
                onClick={bulkSelectEmails.deleteSelected}
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </button>
            )}

            {showDeleted && bulkSelectEmails.restoreSelected && (
              <button
                onClick={bulkSelectEmails.restoreSelected}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restaurer
              </button>
            )}

            <button
              onClick={bulkSelectEmails.deselectAll}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Détails de l'email</h3>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <label className="text-sm font-medium text-gray-700">De</label>
                  <p className="text-gray-900">{selectedEmail.from_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">À</label>
                  <p className="text-gray-900">{selectedEmail.to_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sujet</label>
                  <p className="text-gray-900">{selectedEmail.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date d'envoi</label>
                  <p className="text-gray-900">{formatDate(selectedEmail.sent_at || selectedEmail.created_at)}</p>
                </div>
              </div>

              {/* Status & Tracking */}
              <div className="pb-4 border-b">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut de livraison</label>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm rounded font-medium ${
                    DELIVERY_STATUS_COLORS[selectedEmail.delivery_status as keyof typeof DELIVERY_STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {DELIVERY_STATUS_LABELS[selectedEmail.delivery_status as keyof typeof DELIVERY_STATUS_LABELS] || selectedEmail.delivery_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Délivré</label>
                    <p className="text-gray-900">{formatDate(selectedEmail.delivered_at)}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Ouvert</label>
                    <p className="text-gray-900">
                      {selectedEmail.opened_at ? `${formatDate(selectedEmail.opened_at)} (${selectedEmail.open_count}×)` : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Cliqué</label>
                    <p className="text-gray-900">
                      {selectedEmail.clicked_at ? `${formatDate(selectedEmail.clicked_at)} (${selectedEmail.click_count}×)` : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Bounced</label>
                    <p className="text-gray-900">{formatDate(selectedEmail.bounced_at)}</p>
                  </div>
                </div>
              </div>

              {/* Resend ID */}
              {selectedEmail.resend_id && (
                <div className="pb-4 border-b">
                  <label className="text-sm font-medium text-gray-700">Resend ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedEmail.resend_id}</p>
                </div>
              )}

              {/* Related Message */}
              {selectedEmail.related_type && selectedEmail.related_id && (
                <div className="pb-4 border-b">
                  <label className="text-sm font-medium text-gray-700">Lié à</label>
                  <p className="text-gray-900">
                    {selectedEmail.related_type === 'contact' && 'Message contact'}
                    {selectedEmail.related_type === 'calculator' && 'Calculateur aides'}
                    {selectedEmail.related_type === 'quote' && 'Demande de devis'}
                  </p>
                </div>
              )}

              {/* Content Preview - Removed as it could be huge */}
              {/* You could add a toggle button to show/hide content if needed */}

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    handleResendEmail(selectedEmail.id);
                    setSelectedEmail(null);
                  }}
                  disabled={resendingId === selectedEmail.id}
                  className="px-4 py-2 bg-yellow text-white rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${resendingId === selectedEmail.id ? 'animate-spin' : ''}`} />
                  Renvoyer l'email
                </button>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
