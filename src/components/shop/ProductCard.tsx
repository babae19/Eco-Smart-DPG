import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClimateProduct, formatLeonePrice } from '@/services/shop/productService';
import { Phone, MessageCircle, Mail, MapPin, Leaf, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: ClimateProduct;
  onContact: (product: ClimateProduct, method: 'phone' | 'email' | 'whatsapp') => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onContact, onClick }) => {
  const hasContactMethod = product.contact_phone || product.contact_email || product.contact_whatsapp;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on contact buttons
    if ((e.target as HTMLElement).closest('button')) return;
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Product Image */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <>
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Image count indicator */}
              {product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {product.images.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="p-3 rounded-full bg-primary/10">
                <Leaf className="h-8 w-8 text-primary/60" />
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <Badge 
            className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium shadow-sm"
          >
            {product.category}
          </Badge>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-3 sm:p-4 space-y-2.5">
          {/* Title & Price */}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {formatLeonePrice(product.price)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Location & Seller */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {product.location && (
              <div className="flex items-center gap-1 truncate max-w-[60%]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{product.location}</span>
              </div>
            )}
            <span className="truncate text-right">
              by <span className="text-foreground font-medium">{product.seller_name}</span>
            </span>
          </div>

          {/* Contact Buttons */}
          {hasContactMethod && (
            <div className="flex gap-1.5 pt-2">
              {product.contact_whatsapp && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:border-green-500/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(product, 'whatsapp');
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </Button>
              )}
              {product.contact_phone && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(product, 'phone');
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
              )}
              {product.contact_email && !product.contact_phone && !product.contact_whatsapp && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(product, 'email');
                  }}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;