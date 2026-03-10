import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Mail, MapPin, User, Calendar, ChevronLeft, ChevronRight, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import ProductCard from '@/components/shop/ProductCard';
import { 
  ClimateProduct, 
  getProductById, 
  getRelatedProducts,
  formatLeonePrice 
} from '@/services/shop/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<ClimateProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ClimateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const data = await getProductById(productId);
      if (data) {
        setProduct(data);
        const related = await getRelatedProducts(productId, data.category);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (contactProduct: ClimateProduct, method: 'phone' | 'email' | 'whatsapp') => {
    switch (method) {
      case 'phone':
        if (contactProduct.contact_phone) {
          // Clean phone number and initiate call
          const phone = contactProduct.contact_phone.replace(/\s+/g, '');
          window.open(`tel:${phone}`, '_self');
        }
        break;
      case 'email':
        if (contactProduct.contact_email) {
          window.location.href = `mailto:${contactProduct.contact_email}?subject=Inquiry about: ${contactProduct.title}`;
        }
        break;
      case 'whatsapp':
        if (contactProduct.contact_whatsapp) {
          // Clean and format phone number for WhatsApp
          let phone = contactProduct.contact_whatsapp.replace(/[^0-9+]/g, '');
          // Add Sierra Leone country code if not present
          if (!phone.startsWith('+') && !phone.startsWith('232')) {
            phone = '232' + phone;
          } else if (phone.startsWith('+')) {
            phone = phone.substring(1);
          }
          const message = encodeURIComponent(`Hi! I'm interested in your product: ${contactProduct.title}`);
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

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this product: ${product.title} - ${formatLeonePrice(product.price)}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard"
      });
    }
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Product Details" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <CustomBottomNavigation />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Product Details" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h2 className="text-xl font-semibold text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">This product may have been removed</p>
          <Button className="mt-4" onClick={() => navigate('/shop')}>
            Browse Products
          </Button>
        </div>
        <CustomBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square">
          <AnimatePresence exitBeforeEnter>
            {product.images && product.images.length > 0 ? (
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-muted-foreground">No Image Available</span>
              </div>
            )}
          </AnimatePresence>

          {/* Image Navigation */}
          {product.images && product.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-background/60'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentImageIndex 
                    ? 'border-primary' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatLeonePrice(product.price)}
            </p>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Seller Details */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Seller Information</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.seller_name}</p>
                  {product.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {product.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Listed on {format(new Date(product.created_at), 'MMM d, yyyy')}
              </div>
            </CardContent>
          </Card>

          {/* Contact Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {product.contact_whatsapp && (
              <Button 
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => handleContact(product, 'whatsapp')}
              >
                <MessageCircle className="h-5 w-5" />
                Contact via WhatsApp
              </Button>
            )}
            {product.contact_phone && (
              <Button 
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleContact(product, 'phone')}
              >
                <Phone className="h-5 w-5" />
                Call Seller
              </Button>
            )}
            {product.contact_email && (
              <Button 
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleContact(product, 'email')}
              >
                <Mail className="h-5 w-5" />
                Send Email
              </Button>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-foreground">Related Products</h3>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onContact={handleContact}
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CustomBottomNavigation />
    </div>
  );
};

export default ProductDetail;