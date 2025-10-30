'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Send,
  Archive,
  Trash2,
  Search,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  RotateCcw,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import {
  UnifiedMessage,
  MessagesStats,
  EmailLog,
  archiveMessages,
  unarchiveMessages,
  bulkMarkAsRead,
  sendManualEmail,
} from '@/app/actions/messages';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from './BulkActionsBar';

type Props = {
  initialMessages: UnifiedMessage[];
  initialSentEmails: EmailLog[];
  stats: MessagesStats;
};

type TabId = 'received' | 'sent' | 'archived' | 'trash';

const TYPE_LABELS = {
  contact: 'Contact',
  calculator: 'Calculateur',
  quote: 'Devis',
  'detailed-quote': 'Demande détaillée',
  'job-application': 'Candidature',
  email: 'Email envoyé',
};

const TYPE_COLORS = {
  contact: 'bg-blue-100 text-blue-800',
  calculator: 'bg-green-100 text-green-800',
  quote: 'bg-purple-100 text-purple-800',
  'detailed-quote': 'bg-orange-100 text-orange-800',
  'job-application': 'bg-indigo-100 text-indigo-800',
  email: 'bg-gray-100 text-gray-800',
};

// Helper pour obtenir le label complet en fonction du type et du source
function getMessageLabel(message: UnifiedMessage): string {
  const baseLabel = TYPE_LABELS[message.type];

  // Détection pour les formulaires "Devis" (quote)
  if (message.type === 'quote' && message.source) {
    if (message.source === 'website_urgent_form') {
      return 'Urgence';
    } else if (message.source === 'website_quote_form') {
      return 'Contact simple';
    }
  }

  // Détection pour les formulaires "Contact"
  if (message.type === 'contact' && message.source) {
    if (message.source === 'website_contact_form') {
      return 'Contact';
    }
  }

  return baseLabel;
}

// Helper pour obtenir la couleur en fonction du type et du source
function getMessageColor(message: UnifiedMessage): string {
  // Urgence = Rouge
  if (message.type === 'quote' && message.source === 'website_urgent_form') {
    return 'bg-red-100 text-red-800';
  }

  // Contact simple = Bleu clair
  if (message.type === 'quote' && message.source === 'website_quote_form') {
    return 'bg-blue-100 text-blue-800';
  }

  return TYPE_COLORS[message.type];
}

const STATUS_LABELS = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
  contacted: 'Contacté',
  quote_sent: 'Devis envoyé',
  converted: 'Converti',
  reviewed: 'Examiné',
  accepted: 'Accepté',
  rejected: 'Rejeté',
  archived: 'Archivé',
  // Statuts candidatures
  interview: 'Entretien',
  hired: 'Embauché',
  // Statuts webhook (comme Email Logs)
  pending: 'En attente',
  queued: 'File d\'attente',
  sent: 'Envoyé',
  delivered: 'Délivré',
  delayed: 'Retardé',
  bounced: 'Rebondi',
  complained: 'Spam',
  failed: 'Échec',
};

const STATUS_COLORS = {
  new: 'bg-red-100 text-red-800',
  read: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800',
  contacted: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  converted: 'bg-emerald-100 text-emerald-800',
  reviewed: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-800',
  archived: 'bg-gray-100 text-gray-800',
  // Statuts candidatures
  interview: 'bg-purple-100 text-purple-800',
  hired: 'bg-green-100 text-green-800',
  // Statuts webhook (comme Email Logs)
  pending: 'bg-gray-100 text-gray-800',
  queued: 'bg-blue-100 text-blue-800',
  sent: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  delayed: 'bg-orange-100 text-orange-800',
  bounced: 'bg-red-100 text-red-800',
  complained: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
};

export default function AdminInboxClient({ initialMessages, initialSentEmails, stats }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showSpamOnly, setShowSpamOnly] = useState(false);

  // Modal states
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);

  // New message form
  const [newEmail, setNewEmail] = useState({
    to: '',
    toName: '',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  // Filter messages based on active tab
  const getFilteredMessages = () => {
    const messages = initialMessages;

    switch (activeTab) {
      case 'received':
        return messages.filter(m => !m.data.deleted_at && m.data.status !== 'archived' && !m.data.archived_at);
      case 'archived':
        return messages.filter(m => !m.data.deleted_at && (m.data.status === 'archived' || m.data.archived_at));
      case 'trash':
        return messages.filter(m => m.data.deleted_at);
      case 'sent':
        return []; // Will use initialSentEmails instead
      default:
        return messages;
    }
  };

  const getSentEmails = () => {
    if (showDeleted) {
      return initialSentEmails.filter(e => e.deleted_at);
    }
    return initialSentEmails.filter(e => !e.deleted_at);
  };

  const displayedMessages = activeTab === 'sent' ? [] : getFilteredMessages();
  const displayedSentEmails = activeTab === 'sent' ? getSentEmails() : [];

  // Search filter + Spam filter
  const filteredMessages = displayedMessages.filter(msg => {
    // Filtre spam
    if (showSpamOnly && !msg.data.is_spam) return false;

    // Filtre recherche
    return msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const filteredSentEmails = displayedSentEmails.filter(email =>
    email.to_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bulk select for messages
  const bulkSelectMessages = useBulkSelect({
    items: filteredMessages,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      // Group by type
      const contactIds = filteredMessages.filter(m => m.type === 'contact' && ids.includes(m.id)).map(m => m.id);
      const calcIds = filteredMessages.filter(m => m.type === 'calculator' && ids.includes(m.id)).map(m => m.id);
      const quoteIds = filteredMessages.filter(m => m.type === 'quote' && ids.includes(m.id)).map(m => m.id);
      const detailedQuoteIds = filteredMessages.filter(m => m.type === 'detailed-quote' && ids.includes(m.id)).map(m => m.id);
      const jobApplicationIds = filteredMessages.filter(m => m.type === 'job-application' && ids.includes(m.id)).map(m => m.id);

      const promises = [];
      if (contactIds.length > 0) {
        const action = showDeleted ? 'permanent' : 'delete';
        promises.push(
          fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'contacts', ids: contactIds, action }),
          })
        );
      }
      if (calcIds.length > 0) {
        const action = showDeleted ? 'permanent' : 'delete';
        promises.push(
          fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'calculator_submissions', ids: calcIds, action }),
          })
        );
      }
      if (quoteIds.length > 0) {
        const action = showDeleted ? 'permanent' : 'delete';
        promises.push(
          fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'quote_requests', ids: quoteIds, action }),
          })
        );
      }
      if (detailedQuoteIds.length > 0) {
        const action = showDeleted ? 'permanent' : 'delete';
        promises.push(
          fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'detailed_quotes', ids: detailedQuoteIds, action }),
          })
        );
      }
      if (jobApplicationIds.length > 0) {
        const action = showDeleted ? 'permanent' : 'delete';
        promises.push(
          fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'job_applications', ids: jobApplicationIds, action }),
          })
        );
      }

      await Promise.all(promises);
      router.refresh();
    },
    onRestore: showDeleted
      ? async (ids: string[]) => {
          const contactIds = filteredMessages.filter(m => m.type === 'contact' && ids.includes(m.id)).map(m => m.id);
          const calcIds = filteredMessages.filter(m => m.type === 'calculator' && ids.includes(m.id)).map(m => m.id);
          const quoteIds = filteredMessages.filter(m => m.type === 'quote' && ids.includes(m.id)).map(m => m.id);
          const detailedQuoteIds = filteredMessages.filter(m => m.type === 'detailed-quote' && ids.includes(m.id)).map(m => m.id);
          const jobApplicationIds = filteredMessages.filter(m => m.type === 'job-application' && ids.includes(m.id)).map(m => m.id);

          const promises = [];
          if (contactIds.length > 0) {
            promises.push(
              fetch('/api/admin/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: 'contacts', ids: contactIds, action: 'restore' }),
              })
            );
          }
          if (calcIds.length > 0) {
            promises.push(
              fetch('/api/admin/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: 'calculator_submissions', ids: calcIds, action: 'restore' }),
              })
            );
          }
          if (quoteIds.length > 0) {
            promises.push(
              fetch('/api/admin/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: 'quote_requests', ids: quoteIds, action: 'restore' }),
              })
            );
          }
          if (detailedQuoteIds.length > 0) {
            promises.push(
              fetch('/api/admin/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: 'detailed_quotes', ids: detailedQuoteIds, action: 'restore' }),
              })
            );
          }
          if (jobApplicationIds.length > 0) {
            promises.push(
              fetch('/api/admin/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: 'job_applications', ids: jobApplicationIds, action: 'restore' }),
              })
            );
          }

          await Promise.all(promises);
          router.refresh();
        }
      : undefined,
  });

  // Bulk actions handlers
  const handleBulkArchive = async () => {
    const selectedIds = bulkSelectMessages.selectedIds;
    const contactIds = filteredMessages.filter(m => m.type === 'contact' && selectedIds.includes(m.id)).map(m => m.id);
    const calcIds = filteredMessages.filter(m => m.type === 'calculator' && selectedIds.includes(m.id)).map(m => m.id);
    const quoteIds = filteredMessages.filter(m => m.type === 'quote' && selectedIds.includes(m.id)).map(m => m.id);
    const detailedQuoteIds = filteredMessages.filter(m => m.type === 'detailed-quote' && selectedIds.includes(m.id)).map(m => m.id);
    const jobApplicationIds = filteredMessages.filter(m => m.type === 'job-application' && selectedIds.includes(m.id)).map(m => m.id);

    const promises = [];
    if (contactIds.length > 0) promises.push(archiveMessages(contactIds, 'contact'));
    if (calcIds.length > 0) promises.push(archiveMessages(calcIds, 'calculator'));
    if (quoteIds.length > 0) promises.push(archiveMessages(quoteIds, 'quote'));
    if (detailedQuoteIds.length > 0) promises.push(archiveMessages(detailedQuoteIds, 'detailed-quote'));
    if (jobApplicationIds.length > 0) promises.push(archiveMessages(jobApplicationIds, 'job-application'));

    await Promise.all(promises);
    bulkSelectMessages.deselectAll();
    router.refresh();
  };

  const handleBulkUnarchive = async () => {
    const selectedIds = bulkSelectMessages.selectedIds;
    const contactIds = filteredMessages.filter(m => m.type === 'contact' && selectedIds.includes(m.id)).map(m => m.id);
    const calcIds = filteredMessages.filter(m => m.type === 'calculator' && selectedIds.includes(m.id)).map(m => m.id);
    const quoteIds = filteredMessages.filter(m => m.type === 'quote' && selectedIds.includes(m.id)).map(m => m.id);
    const detailedQuoteIds = filteredMessages.filter(m => m.type === 'detailed-quote' && selectedIds.includes(m.id)).map(m => m.id);
    const jobApplicationIds = filteredMessages.filter(m => m.type === 'job-application' && selectedIds.includes(m.id)).map(m => m.id);

    const promises = [];
    if (contactIds.length > 0) promises.push(unarchiveMessages(contactIds, 'contact'));
    if (calcIds.length > 0) promises.push(unarchiveMessages(calcIds, 'calculator'));
    if (quoteIds.length > 0) promises.push(unarchiveMessages(quoteIds, 'quote'));
    if (detailedQuoteIds.length > 0) promises.push(unarchiveMessages(detailedQuoteIds, 'detailed-quote'));
    if (jobApplicationIds.length > 0) promises.push(unarchiveMessages(jobApplicationIds, 'job-application'));

    await Promise.all(promises);
    bulkSelectMessages.deselectAll();
    router.refresh();
  };

  const handleBulkMarkAsRead = async () => {
    const selectedIds = bulkSelectMessages.selectedIds;
    const contactIds = filteredMessages.filter(m => m.type === 'contact' && selectedIds.includes(m.id)).map(m => m.id);
    const calcIds = filteredMessages.filter(m => m.type === 'calculator' && selectedIds.includes(m.id)).map(m => m.id);
    const quoteIds = filteredMessages.filter(m => m.type === 'quote' && selectedIds.includes(m.id)).map(m => m.id);
    const detailedQuoteIds = filteredMessages.filter(m => m.type === 'detailed-quote' && selectedIds.includes(m.id)).map(m => m.id);
    const jobApplicationIds = filteredMessages.filter(m => m.type === 'job-application' && selectedIds.includes(m.id)).map(m => m.id);

    const promises = [];
    if (contactIds.length > 0) promises.push(bulkMarkAsRead(contactIds, 'contact'));
    if (calcIds.length > 0) promises.push(bulkMarkAsRead(calcIds, 'calculator'));
    if (quoteIds.length > 0) promises.push(bulkMarkAsRead(quoteIds, 'quote'));
    if (detailedQuoteIds.length > 0) promises.push(bulkMarkAsRead(detailedQuoteIds, 'detailed-quote'));
    if (jobApplicationIds.length > 0) promises.push(bulkMarkAsRead(jobApplicationIds, 'job-application'));

    await Promise.all(promises);
    bulkSelectMessages.deselectAll();
    router.refresh();
  };

  // Handle individual archive
  const handleArchive = async (message: UnifiedMessage) => {
    await archiveMessages([message.id], message.type);
    router.refresh();
  };

  // Handle individual unarchive
  const handleUnarchive = async (message: UnifiedMessage) => {
    await unarchiveMessages([message.id], message.type);
    router.refresh();
  };

  // Handle individual delete
  const handleDelete = async (message: UnifiedMessage) => {
    const table = message.type === 'contact' ? 'contacts'
      : message.type === 'calculator' ? 'calculator_submissions'
      : message.type === 'quote' ? 'quote_requests'
      : message.type === 'detailed-quote' ? 'detailed_quotes'
      : 'job_applications';

    await fetch('/api/admin/soft-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        ids: [message.id],
        action: activeTab === 'trash' ? 'permanent' : 'delete'
      }),
    });

    router.refresh();
  };

  // Handle individual restore
  const handleRestore = async (message: UnifiedMessage) => {
    const table = message.type === 'contact' ? 'contacts'
      : message.type === 'calculator' ? 'calculator_submissions'
      : message.type === 'quote' ? 'quote_requests'
      : message.type === 'detailed-quote' ? 'detailed_quotes'
      : 'job_applications';

    await fetch('/api/admin/soft-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        ids: [message.id],
        action: 'restore'
      }),
    });

    router.refresh();
  };

  // Send manual email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const result = await sendManualEmail({
      to_email: newEmail.to,
      to_name: newEmail.toName,
      subject: newEmail.subject,
      message: newEmail.message,
      related_type: 'manual',
    });

    if (result.success) {
      alert('Email envoyé avec succès !');
      setShowNewMessageModal(false);
      setNewEmail({ to: '', toName: '', subject: '', message: '' });
      router.refresh();
    } else {
      alert(`Erreur: ${result.error}`);
    }

    setIsSending(false);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate tab counts
  const receivedCount = initialMessages.filter(m => !m.data.deleted_at && m.data.status !== 'archived' && !m.data.archived_at).length;
  const archivedCount = initialMessages.filter(m => !m.data.deleted_at && (m.data.status === 'archived' || m.data.archived_at)).length;
  const deletedCount = initialMessages.filter(m => m.data.deleted_at).length;
  const sentCount = initialSentEmails.filter(e => !e.deleted_at).length;

  const tabs = [
    { id: 'received' as TabId, label: 'Reçus', icon: <Mail className="w-4 h-4" />, count: receivedCount },
    { id: 'sent' as TabId, label: 'Envoyés', icon: <Send className="w-4 h-4" />, count: sentCount },
    { id: 'archived' as TabId, label: 'Archivés', icon: <Archive className="w-4 h-4" />, count: archivedCount },
    { id: 'trash' as TabId, label: 'Corbeille', icon: <Trash2 className="w-4 h-4" />, count: deletedCount },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages & Inbox</h1>
          <p className="text-gray-600">Gérez tous les messages reçus et envoyés</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'trash') {
                setShowDeleted(false);
                setActiveTab('received');
              } else {
                setShowDeleted(true);
                setActiveTab('trash');
              }
            }}
            className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            {activeTab === 'trash' ? 'Masquer la corbeille' : 'Voir la corbeille'}
          </button>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau message
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total reçus</p>
          <p className="text-2xl font-bold text-gray-900">{receivedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Non lus</p>
          <p className="text-2xl font-bold text-red-600">{stats.newMessages}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Archivés</p>
          <p className="text-2xl font-bold text-gray-600">{archivedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Corbeille</p>
          <p className="text-2xl font-bold text-red-600">{deletedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-b-2 border-yellow text-yellow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar - Search + Spam Filter */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            />
          </div>
          {activeTab === 'received' && (
            <button
              onClick={() => setShowSpamOnly(!showSpamOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                showSpamOnly
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={showSpamOnly ? 'Afficher tous les messages' : 'Afficher seulement les spams'}
            >
              {showSpamOnly ? '🚫 Spam uniquement' : '📧 Tous'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-12">
                {activeTab !== 'sent' && (
                  <BulkSelectCheckbox
                    checked={bulkSelectMessages.isAllSelected}
                    indeterminate={bulkSelectMessages.isSomeSelected}
                    onChange={bulkSelectMessages.toggleSelectAll}
                  />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sujet / Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeTab === 'sent'
              ? filteredSentEmails.map((email) => (
                  <tr key={email.id} className={email.deleted_at ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${TYPE_COLORS.email}`}>
                        {TYPE_LABELS.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{email.to_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{email.to_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-md">{email.subject}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          STATUS_COLORS[email.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[email.status as keyof typeof STATUS_LABELS] || email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(email.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => alert(`Voir détails email: ${email.id}`)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              : filteredMessages.map((message) => (
                  <tr key={message.id} className={message.data.deleted_at ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4">
                      <BulkSelectCheckbox
                        checked={bulkSelectMessages.isSelected(message.id)}
                        onChange={() => bulkSelectMessages.toggleSelect(message.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${getMessageColor(message)} w-fit`}>
                          {getMessageLabel(message)}
                        </span>
                        {(message.data.source_url || message.data.source_form_type) && (
                          <span className="px-2 py-1 text-xs rounded font-medium bg-gray-100 text-gray-700 w-fit">
                            📍 {message.data.source_url || message.data.source_form_type}
                          </span>
                        )}
                        {message.data.is_spam && (
                          <span
                            className="px-2 py-1 text-xs rounded font-medium bg-red-500 text-white w-fit cursor-help"
                            title={`Score: ${message.data.spam_score}/100 - ${message.data.spam_reason}`}
                          >
                            🚫 SPAM
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {message.name}
                      {message.data.deleted_at && <DeletedBadge deletedAt={message.data.deleted_at} />}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{message.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                      {message.type === 'job-application' ? (
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{message.job_title}</div>
                          {message.message && <div className="text-gray-600 truncate">{message.message}</div>}
                          <div className="flex gap-2 mt-2">
                            {message.cv_url && (
                              <a
                                href={message.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                CV
                              </a>
                            )}
                            {message.cover_letter_url && (
                              <a
                                href={message.cover_letter_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                Lettre
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="truncate">{message.subject || message.message || '-'}</div>
                          {message.data.is_spam && message.data.spam_reason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                              <p className="text-red-700 font-medium">
                                <strong>Raison spam:</strong> {message.data.spam_reason}
                              </p>
                              <p className="text-red-600 mt-1">
                                Score: {message.data.spam_score}/100
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          STATUS_COLORS[message.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[message.status as keyof typeof STATUS_LABELS] || message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(message.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Voir détails */}
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Archiver / Désarchiver */}
                        {!message.data.deleted_at && (
                          activeTab === 'archived' ? (
                            <button
                              onClick={() => handleUnarchive(message)}
                              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors cursor-pointer"
                              title="Désarchiver"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : activeTab === 'received' && (
                            <button
                              onClick={() => handleArchive(message)}
                              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )
                        )}

                        {/* Supprimer / Restaurer */}
                        {activeTab === 'trash' ? (
                          <button
                            onClick={() => handleRestore(message)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors cursor-pointer"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(message)}
                            disabled={!!message.data.deleted_at}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {filteredMessages.length === 0 && filteredSentEmails.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'sent' ? 'Aucun email envoyé' : 'Aucun message'}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {activeTab !== 'sent' && (
        <>
          {bulkSelectMessages.selectedCount > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-lg border-2 border-yellow p-4 z-40">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">{bulkSelectMessages.selectedCount} message(s) sélectionné(s)</span>

                {activeTab === 'received' && (
                  <>
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Marquer lu
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archiver
                    </button>
                  </>
                )}

                {activeTab === 'archived' && (
                  <button
                    onClick={handleBulkUnarchive}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Désarchiver
                  </button>
                )}

                {activeTab !== 'trash' && (
                  <button
                    onClick={bulkSelectMessages.deleteSelected}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                )}

                {activeTab === 'trash' && bulkSelectMessages.restoreSelected && (
                  <button
                    onClick={bulkSelectMessages.restoreSelected}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restaurer
                  </button>
                )}

                <button
                  onClick={bulkSelectMessages.deselectAll}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Nouveau message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nouveau message</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinataire (email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du destinataire</label>
                <input
                  type="text"
                  value={newEmail.toName}
                  onChange={(e) => setNewEmail({ ...newEmail, toName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={newEmail.message}
                  onChange={(e) => setNewEmail({ ...newEmail, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={isSending}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Détails du message</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-sm rounded font-medium ${TYPE_COLORS[selectedMessage.type]}`}>
                  {TYPE_LABELS[selectedMessage.type]}
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded font-medium ${
                    STATUS_COLORS[selectedMessage.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[selectedMessage.status as keyof typeof STATUS_LABELS] || selectedMessage.status}
                </span>
              </div>

              {/* Affichage spécial pour les demandes détaillées avec tous les 26 champs */}
              {selectedMessage.type === 'detailed-quote' && selectedMessage.data && (() => {
                const detailedQuote = selectedMessage.data as any;
                return (
                  <div className="space-y-6">
                    {/* Coordonnées */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Coordonnées</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Nom</label>
                          <p className="text-gray-900">{detailedQuote.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{detailedQuote.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Téléphone</label>
                          <p className="text-gray-900">{detailedQuote.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date</label>
                          <p className="text-gray-900">{formatDate(detailedQuote.created_at)}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-700">Adresse du bien</label>
                          <p className="text-gray-900">{detailedQuote.property_address}</p>
                        </div>
                        {detailedQuote.discovery_source && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Comment nous avez-vous connu ?</label>
                            <p className="text-gray-900">{detailedQuote.discovery_source}{detailedQuote.discovery_source_other ? ` - ${detailedQuote.discovery_source_other}` : ''}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 1 - Nature du projet */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Étape 1 - Nature du projet</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Types de travaux</label>
                          <p className="text-gray-900">{Array.isArray(detailedQuote.project_nature) ? detailedQuote.project_nature.join(', ') : detailedQuote.project_nature}</p>
                        </div>
                        {detailedQuote.existing_tiles && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Tuiles existantes</label>
                            <p className="text-gray-900">{detailedQuote.existing_tiles}</p>
                          </div>
                        )}
                        {detailedQuote.existing_insulation && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Isolation existante</label>
                            <p className="text-gray-900">{detailedQuote.existing_insulation}</p>
                          </div>
                        )}
                        {detailedQuote.existing_zinguerie && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Zinguerie existante</label>
                            <p className="text-gray-900">{detailedQuote.existing_zinguerie}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 2 - Informations sur le bâtiment */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Étape 2 - Informations sur le bâtiment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {detailedQuote.house_year && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Année construction maison</label>
                            <p className="text-gray-900">{detailedQuote.house_year}</p>
                          </div>
                        )}
                        {detailedQuote.carpentry_year && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Année charpente</label>
                            <p className="text-gray-900">{detailedQuote.carpentry_year}</p>
                          </div>
                        )}
                        {detailedQuote.insulation_year && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Année isolation</label>
                            <p className="text-gray-900">{detailedQuote.insulation_year}</p>
                          </div>
                        )}
                        {detailedQuote.roof_year && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Année toiture</label>
                            <p className="text-gray-900">{detailedQuote.roof_year}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 3 - Besoins et préférences */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Étape 3 - Besoins et préférences</h4>
                      <div className="space-y-3">
                        {detailedQuote.objectives && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Objectifs</label>
                            <p className="text-gray-900">{Array.isArray(detailedQuote.objectives) ? detailedQuote.objectives.join(', ') : detailedQuote.objectives}</p>
                          </div>
                        )}
                        {detailedQuote.desired_materials && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Matériaux souhaités</label>
                            <p className="text-gray-900">{detailedQuote.desired_materials}</p>
                          </div>
                        )}
                        {detailedQuote.materials_reason && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Raison du choix des matériaux</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{detailedQuote.materials_reason}</p>
                          </div>
                        )}
                        {detailedQuote.special_requests && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Demandes spéciales</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{detailedQuote.special_requests}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 4 - Contraintes techniques */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Étape 4 - Contraintes techniques</h4>
                      <div className="space-y-3">
                        {detailedQuote.timeline && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Délai souhaité</label>
                            <p className="text-gray-900">{detailedQuote.timeline}</p>
                          </div>
                        )}
                        {detailedQuote.attic_access && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Accès combles</label>
                            <p className="text-gray-900">{detailedQuote.attic_access}</p>
                          </div>
                        )}
                        {detailedQuote.regulatory_constraints !== null && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Contraintes réglementaires</label>
                            <p className="text-gray-900">{detailedQuote.regulatory_constraints ? 'Oui' : 'Non'}</p>
                          </div>
                        )}
                        {detailedQuote.constraints_details && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Détails des contraintes</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{detailedQuote.constraints_details}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Étape 5 - Budget et aides */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Étape 5 - Budget et aides</h4>
                      <div className="space-y-3">
                        {detailedQuote.requested_aids && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Aides demandées</label>
                            <p className="text-gray-900">{Array.isArray(detailedQuote.requested_aids) ? detailedQuote.requested_aids.join(', ') : detailedQuote.requested_aids}</p>
                          </div>
                        )}
                        {detailedQuote.needs_aid_support !== null && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Besoin d'accompagnement pour les aides</label>
                            <p className="text-gray-900">{detailedQuote.needs_aid_support ? 'Oui' : 'Non'}</p>
                          </div>
                        )}
                        {detailedQuote.budget_range && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Fourchette de budget</label>
                            <p className="text-gray-900">{detailedQuote.budget_range}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes admin */}
                    {detailedQuote.admin_notes && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Notes administrateur</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{detailedQuote.admin_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Affichage normal pour les autres types de messages */}
              {selectedMessage.type !== 'detailed-quote' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nom</label>
                      <p className="text-gray-900">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                    {selectedMessage.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Téléphone</label>
                        <p className="text-gray-900">{selectedMessage.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                    </div>
                  </div>

                  {selectedMessage.subject && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sujet</label>
                      <p className="text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  )}

                  {selectedMessage.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={() => setSelectedMessage(null)}
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
