import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Leaf, 
  Loader2, 
  ArrowLeft,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClimateProduct, 
  searchProducts, 
  createProduct,
  PRODUCT_CATEGORIES,
  formatLeonePrice,
  CreateProductData 
} from '@/services/shop/productService';
import ProductCard from '@/components/shop/ProductCard';
import AddProductDialog from '@/components/shop/AddProductDialog';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import { motion } from 'framer-motion';

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: undefined },
  { label: 'Under Le 100,000', min: 0, max: 100000 },
  { label: 'Le 100,000 - 500,000', min: 100000, max: 500000 },
  { label: 'Le 500,000 - 1,000,000', min: 500000, max: 1000000 },
  { label: 'Over Le 1,000,000', min: 1000000, max: undefined },
];

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<ClimateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await searchProducts({});
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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

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
          window.location.href = `tel:${product.contact_phone}`;
        }
        break;
      case 'email':
        if (product.contact_email) {
          window.location.href = `mailto:${product.contact_email}?subject=Inquiry about: ${product.title}`;
        }
        break;
      case 'whatsapp':
        if (product.contact_whatsapp) {
          const phone = product.contact_whatsapp.replace(/[^0-9]/g, '');
          const message = encodeURIComponent(`Hi! I'm interested in your product: ${product.title}`);
          window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 5000000]);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 5000000;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="p-4 space-y-4">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Climate Shop</h1>
              <p className="text-xs text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div>
          </div>
          <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Filters
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={0}
                      max={5000000}
                      step={50000}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatLeonePrice(priceRange[0])}</span>
                    <span>{formatLeonePrice(priceRange[1])}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedCategory('all')}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 5000000) && (
              <Badge variant="secondary" className="gap-1">
                {formatLeonePrice(priceRange[0])} - {formatLeonePrice(priceRange[1])}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setPriceRange([0, 5000000])}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard 
                  product={product} 
                  onContact={handleContact}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Leaf className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {hasActiveFilters ? 'No Products Found' : 'No Products Yet'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to find what you\'re looking for'
                    : 'Be the first to list a climate-friendly product!'
                  }
                </p>
              </div>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : user ? (
                <AddProductDialog onSubmit={handleCreateProduct} isLoading={isCreating} />
              ) : null}
            </div>
          </Card>
        )}
      </div>

      <CustomBottomNavigation />
    </div>
  );
};

export default Shop;
