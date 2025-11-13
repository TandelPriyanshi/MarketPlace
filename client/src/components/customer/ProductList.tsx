import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/helpers';
import { RootState } from '@/app/store';
import { addToCart } from '@/app/slices/customerSlice';
import { toast } from 'sonner';

export const ProductList = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.customer);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    dispatch(
      addToCart({
        productId: product.id,
        sellerId: product.sellerId,
        productName: product.name,
        sellerName: product.sellerName,
        quantity: 1,
        price: product.price,
        unit: product.unit,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Products</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.sellerName}</p>
                  </div>
                  {product.stock > 0 ? (
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                  <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-2"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <Plus className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
