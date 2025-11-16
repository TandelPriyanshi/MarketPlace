import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/helpers';
import { listProductsBySeller, deleteProduct as deleteProductApi } from '@/api/product.api';
import { ProductModal } from './ProductModal';
import { toast } from 'sonner';

export const ProductTable = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      const response = await listProductsBySeller();
      console.log('Products fetched:', response);
      setProducts(response.products);
    } catch (error: any) {
      console.error('Fetch products error:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    console.log('Attempting to delete product:', productId);
    
    toast('Are you sure you want to delete this product?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          console.log('Delete confirmed for product:', productId);
          try {
            await deleteProductApi(productId);
            console.log('Product deleted successfully, refreshing list...');
            toast.success('Product deleted successfully');
            fetchProducts();
          } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete product');
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          console.log('Delete cancelled');
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={product.status === 'published' ? 'default' : 
                              product.status === 'draft' ? 'secondary' : 
                              product.status === 'out_of_stock' ? 'destructive' : 'outline'}
                    >
                      {product.status?.replace('_', ' ') || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onProductSaved={fetchProducts}
      />
    </div>
  );
};
