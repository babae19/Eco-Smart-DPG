import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import AddProductDialog from '@/components/shop/AddProductDialog';
import EditProductDialog from '@/components/shop/EditProductDialog';
import { 
  ClimateProduct, 
  getUserProducts, 
  deleteProduct, 
  toggleProductStatus,
  createProduct,
  updateProduct,
  formatLeonePrice,
  CreateProductData
} from '@/services/shop/productService';
import { motion, AnimatePresence } from 'framer-motion';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<ClimateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ClimateProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getUserProducts(user.id);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    if (!user) return;
    try {
      setIsCreating(true);
      await createProduct(user.id, data);
      toast({
        title: "Success!",
        description: "Your product has been listed",
      });
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to list product",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProduct = async (productId: string, data: Partial<CreateProductData>) => {
    try {
      await updateProduct(productId, data);
      toast({
        title: "Success!",
        description: "Product updated successfully",
      });
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingId(productId);
      await deleteProduct(productId);
      toast({
        title: "Deleted",
        description: "Product removed from your listings",
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setTogglingId(productId);
      await toggleProductStatus(productId, !currentStatus);
      toast({
        title: currentStatus ? "Product Hidden" : "Product Visible",
        description: currentStatus 
          ? "Your product is now hidden from the shop" 
          : "Your product is now visible in the shop",
      });
      loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="My Listings" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your Products</h2>
              <p className="text-xs text-muted-foreground">{products.length} listings</p>
            </div>
          </div>
          <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
        </div>

        {/* Products List */}
        <AnimatePresence exitBeforeEnter>
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div 
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`overflow-hidden transition-all ${!product.is_active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-0">
                      <div className="flex gap-3 p-3">
                        {/* Image */}
                        <div 
                          className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <ShoppingBag className="h-6 w-6 text-primary/50" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{product.title}</h3>
                              <p className="text-lg font-bold text-primary">{formatLeonePrice(product.price)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant={product.is_active ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {product.is_active ? 'Active' : 'Hidden'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              onClick={() => handleToggleStatus(product.id, product.is_active)}
                              disabled={togglingId === product.id}
                            >
                              {togglingId === product.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : product.is_active ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              {product.is_active ? 'Hide' : 'Show'}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingId === product.id}
                                >
                                  {deletingId === product.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove "{product.title}" from your listings. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-10 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border-dashed border-2 border-primary/20">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">No Listings Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Start selling your climate-friendly products today!
                    </p>
                  </div>
                  <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
        />
      )}

      <CustomBottomNavigation />
    </div>
  );
};

export default MyListings;