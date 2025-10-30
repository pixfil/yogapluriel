import { Suspense } from "react";
import AdminInboxClient from "@/components/admin/AdminInboxClient";
import { getAllMessages, getMessagesStats, getAllEmailLogs } from "@/app/actions/messages";

export const metadata = {
  title: "Inbox - Admin FormDeToit",
  description: "Gestion des messages clients",
};

async function InboxContent() {
  const [messages, stats, sentEmails] = await Promise.all([
    getAllMessages(true), // Include deleted messages for Trash tab
    getMessagesStats(),
    getAllEmailLogs(),
  ]);

  return (
    <AdminInboxClient
      initialMessages={messages}
      initialSentEmails={sentEmails}
      stats={stats}
    />
  );
}

export default function AdminInboxPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-600 mt-2">
          Gérez tous les messages clients (contacts, calculateurs, devis)
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
          </div>
        }
      >
        <InboxContent />
      </Suspense>
    </div>
  );
}
