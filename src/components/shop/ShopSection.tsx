import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Leaf, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClimateProduct, 
  getProducts, 
  createProduct,
  CreateProductData,
} from '@/services/shop/productService';
import ProductCard from './ProductCard';
import AddProductDialog from './AddProductDialog';

const ShopSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<ClimateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts(6);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list a product",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

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

  const handleContact = (product: ClimateProduct, method: 'phone' | 'email' | 'whatsapp') => {
    switch (method) {
      case 'phone':
        if (product.contact_phone) {
          const phone = product.contact_phone.replace(/\s+/g, '');
          window.open(`tel:${phone}`, '_self');
        }
        break;
      case 'email':
        if (product.contact_email) {
          window.location.href = `mailto:${product.contact_email}?subject=Inquiry about: ${product.title}`;
        }
        break;
      case 'whatsapp':
        if (product.contact_whatsapp) {
          // Clean and format phone number for WhatsApp
          let phone = product.contact_whatsapp.replace(/[^0-9+]/g, '');
          // Add Sierra Leone country code if not present
          if (!phone.startsWith('+') && !phone.startsWith('232')) {
            phone = '232' + phone;
          } else if (phone.startsWith('+')) {
            phone = phone.substring(1);
          }
          const message = encodeURIComponent(`Hi! I'm interested in your product: ${product.title}`);
          // Use direct WhatsApp URL scheme for mobile compatibility
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const whatsappUrl = isMobile 
            ? `whatsapp://send?phone=${phone}&text=${message}`
            : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
          window.open(whatsappUrl, '_blank');
        }
        break;
    }
  };

  return (
    <section className="space-y-4">
      {/* Professional Header Card */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Climate Shop</h2>
              <p className="text-xs text-muted-foreground">
                {products.length > 0 ? `${products.length} eco-products available` : 'Sustainable marketplace'}
              </p>
            </div>
          </div>
          
          <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product} 
              onContact={handleContact}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center bg-muted/30 border-dashed">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">No Products Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Be the first to list a climate-friendly product
              </p>
            </div>
            {user && (
              <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
            )}
          </div>
        </Card>
      )}

      {/* View All Button */}
      {products.length > 0 && (
        <div className="flex justify-center pt-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => navigate('/shop')}
          >
            View All Products
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default ShopSection;
