
export default function ProductTable({ products = [] }) {
  // Handle if API returns { data: [...] } instead of [...]
  const productList = Array.isArray(products) ? products : (products?.data ? products.data : []);
  const safeProducts = Array.isArray(productList) ? productList : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left table-auto">
        <thead>
          <tr className="text-sm text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">SKU</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {safeProducts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-gray-500">
                No products found.
              </td>
            </tr>
          )}
          {safeProducts.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2 font-medium text-gray-700">{p.name}</td>
              <td className="px-3 py-2 text-sm text-gray-600">{p.sku}</td>
              <td className="px-3 py-2 text-sm text-gray-600">{p.category || "-"}</td>
              <td className="px-3 py-2 text-sm text-gray-600">${p.price?.toFixed?.(2) ?? p.price}</td>
              <td className={`px-3 py-2 text-sm ${p.stock <= 5 ? "text-red-600" : "text-gray-700"}`}>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
