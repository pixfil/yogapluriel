import { getAllCategories } from '@/app/actions/categories';
import AdminCategoriesClient from '@/components/admin/AdminCategoriesClient';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return <AdminCategoriesClient initialCategories={categories} />;
}