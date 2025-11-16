import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/helpers';
import { getAllProducts } from '../../api/product.api';
import { ProductApi } from '../../api/product.api';
import { toast } from 'sonner';

export const ProductList = () => {
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      setProducts(response.products);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ProductApi) => {
    // TODO: Implement cart functionality
    toast.success(`${product.name} added to cart`);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Products</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {products.length === 0 && !loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Seller ID: {product.sellerId}</p>
                    </div>
                    {product.stock > 0 && product.status === 'published' ? (
                      <Badge className="bg-accent/10 text-accent border-accent/20">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {product.status === 'out_of_stock' ? 'Out of Stock' : 'Unavailable'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{product.description || 'No description available'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                    <span className="text-sm text-muted-foreground">per unit</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Stock: {product.stock} units
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || product.status !== 'published'}
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  }}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
