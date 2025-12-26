// ProductSearch.tsx
import { Input } from '@/components/ui/input';
import { Product } from '@/types/pos';
import { Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';

interface ProductSearchProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductSearch({ products, onAddToCart }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {filteredProducts.length > 0 ? (
          <div className="grid gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
