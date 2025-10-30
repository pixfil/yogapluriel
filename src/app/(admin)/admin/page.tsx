import { createClient, getUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen,
  Tags,
  Eye,
  Star,
  Users,
  Briefcase,
  Mail,
  AlertTriangle,
  Plus,
  ArrowRight,
  ExternalLink,
  Calendar,
  Megaphone,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import { getAllMessages } from '@/app/actions/messages';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = await createClient();

  try {
    // Projects stats
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: publishedProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    const { count: featuredProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);

    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // Recent projects
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('id, title, slug, location, date, published, featured')
      .order('created_at', { ascending: false })
      .limit(5);

    // Recent messages - Utiliser getAllMessages() pour avoir TOUS les types de messages (pas juste contacts)
    const allMessages = await getAllMessages(false); // false = ne pas montrer les supprimés
    const recentMessages = allMessages
      .filter(m => !m.data.deleted_at && m.data.status !== 'archived' && !m.data.archived_at)
      .slice(0, 3);

    // Recent 404s
    const { data: recent404s } = await supabase
      .from('404_logs')
      .select('id, path, hit_count, last_seen_at, is_resolved')
      .eq('is_resolved', false)
      .order('hit_count', { ascending: false })
      .limit(3);

    return {
      totalProjects: totalProjects || 0,
      publishedProjects: publishedProjects || 0,
      featuredProjects: featuredProjects || 0,
      categoriesCount: categoriesCount || 0,
      recentProjects: recentProjects || [],
      recentMessages: recentMessages || [],
      recent404s: recent404s || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProjects: 0,
      publishedProjects: 0,
      featuredProjects: 0,
      categoriesCount: 0,
      recentProjects: [],
      recentMessages: [],
      recent404s: [],
    };
  }
}

export default async function AdminDashboard() {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();

  const statCards = [
    {
      name: 'Total des projets',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Projets publiés',
      value: stats.publishedProjects,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      name: 'Projets à la une',
      value: stats.featuredProjects,
      icon: Star,
      color: 'bg-yellow',
    },
    {
      name: 'Catégories',
      value: stats.categoriesCount,
      icon: Tags,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de votre site et activité récente
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Projets récents
              </h2>
              <Link href="/admin/projects" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Tout voir
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stats.recentProjects.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProjects.map((project: any) => (
                  <div key={project.id} className="relative group">
                    <Link
                      href="/admin/projects"
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {project.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {project.location} • {project.date}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        {project.featured && (
                          <Star className="w-3.5 h-3.5 text-yellow fill-current" />
                        )}
                        {project.published ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Brouillon
                          </span>
                        )}
                      </div>
                    </Link>
                    {project.published && project.slug && (
                      <Link
                        href={`/nos-realisations/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-1.5 bg-white rounded hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Voir la page publique"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">
                Aucun projet trouvé
              </p>
            )}
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Messages récents
              </h2>
              <Link href="/admin/inbox" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Inbox
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stats.recentMessages.length > 0 ? (
              <div className="space-y-3">
                {stats.recentMessages.map((message: any) => {
                  // Déterminer le type et la couleur du badge
                  const isUrgent = message.type === 'quote' && message.source === 'website_urgent_form';
                  const typeLabel =
                    isUrgent ? 'Urgence' :
                    message.type === 'quote' ? 'Contact simple' :
                    message.type === 'detailed-quote' ? 'Demande détaillée' :
                    message.type === 'contact' ? 'Contact' :
                    message.type === 'calculator' ? 'Calculateur' :
                    'Autre';
                  const typeBadgeColor =
                    isUrgent ? 'bg-red-100 text-red-800' :
                    message.type === 'quote' ? 'bg-blue-100 text-blue-800' :
                    message.type === 'detailed-quote' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800';

                  return (
                    <Link
                      key={message.id}
                      href={`/admin/inbox`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {message.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColor}`}>
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {message.email}
                          </p>
                          {message.subject && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {message.subject}
                            </p>
                          )}
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          message.status === 'read' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.status === 'new' ? 'Nouveau' :
                           message.status === 'read' ? 'Lu' : 'Traité'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(message.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">
                Aucun message récent
              </p>
            )}
          </div>
        </div>

        {/* Recent 404s */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Erreurs 404
              </h2>
              <Link href="/admin/404-tracking" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Gérer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stats.recent404s.length > 0 ? (
              <div className="space-y-3">
                {stats.recent404s.map((log: any) => (
                  <Link
                    key={log.id}
                    href="/admin/404-tracking"
                    className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <code className="text-xs text-gray-900 block truncate">
                          {log.path}
                        </code>
                        <p className="text-xs text-gray-500 mt-1">
                          Vu {log.hit_count} fois
                        </p>
                      </div>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                        Non résolu
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-600 text-sm font-medium">
                  ✓ Aucune erreur 404
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Tout fonctionne parfaitement
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Row 1 */}
            <Link
              href="/admin/projects"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Nouveau projet
                </p>
                <p className="text-xs text-gray-500">
                  Ajouter une réalisation
                </p>
              </div>
            </Link>

            <Link
              href="/admin/popups"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Créer popup
                </p>
                <p className="text-xs text-gray-500">
                  Nouveau message popup
                </p>
              </div>
            </Link>

            <Link
              href="/admin/team"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Ajouter membre
                </p>
                <p className="text-xs text-gray-500">
                  Gérer l'équipe
                </p>
              </div>
            </Link>

            <Link
              href="/admin/jobs"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500 rounded-md flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Offre d'emploi
                </p>
                <p className="text-xs text-gray-500">
                  Publier une offre
                </p>
              </div>
            </Link>

            {/* Row 2 */}
            <Link
              href="/admin/inbox"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow rounded-md flex items-center justify-center group-hover:bg-yellow/90 transition-colors">
                  <Mail className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Messages
                </p>
                <p className="text-xs text-gray-500">
                  Voir l'inbox
                </p>
              </div>
            </Link>

            <Link
              href="/admin/lexique"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-500 rounded-md flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Ajouter au lexique
                </p>
                <p className="text-xs text-gray-500">
                  Nouveau terme
                </p>
              </div>
            </Link>

            <Link
              href="/admin/faq"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-teal-500 rounded-md flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Ajouter à la FAQ
                </p>
                <p className="text-xs text-gray-500">
                  Nouvelle question
                </p>
              </div>
            </Link>

            <Link
              href="/admin/certifications"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-500 rounded-md flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Certification
                </p>
                <p className="text-xs text-gray-500">
                  Ajouter une certification
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
