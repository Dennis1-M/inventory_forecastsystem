
export default function LowStockList({ items = [] }) {
  // Handle if API returns { data: [...] } instead of [...]
  const itemList = Array.isArray(items) ? items : (items?.data ? items.data : []);
  const safeItems = Array.isArray(itemList) ? itemList : [];

  return (
    <div>
      {safeItems.length === 0 ? (
        <p className="text-gray-600">No low-stock items.</p>
      ) : (
        <ul className="space-y-2">
          {safeItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium text-gray-700">{it.name}</div>
                <div className="text-sm text-gray-500">SKU: {it.sku}</div>
              </div>
              <div className="text-red-600 font-semibold">{it.stock}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
