
export default function CategoriesView({ categories = [] }) {
  // Handle if API returns { data: [...] } instead of [...]
  const categoryList = Array.isArray(categories) ? categories : (categories?.data ? categories.data : []);
  const safeCategories = Array.isArray(categoryList) ? categoryList : [];

  return (
    <div>
      {safeCategories.length === 0 ? (
        <p className="text-gray-600">No categories found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {safeCategories.map((c) => (
            <div key={c.id} className="p-3 border rounded text-center">
              <div className="font-medium text-gray-700">{c.name}</div>
              <div className="text-sm text-gray-500">{c.count ?? "-"} products</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
