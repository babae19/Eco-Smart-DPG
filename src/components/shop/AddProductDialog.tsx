import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, CreateProductData } from '@/services/shop/productService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from './ImageUpload';

interface AddProductDialogProps {
  onSubmit: (data: CreateProductData) => Promise<void>;
  isLoading: boolean;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ onSubmit, isLoading }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateProductData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    contact_phone: '',
    contact_email: '',
    contact_whatsapp: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.contact_phone && !formData.contact_email && !formData.contact_whatsapp) {
      toast({
        title: "Contact Required",
        description: "Please provide at least one contact method",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        images: [],
        contact_phone: '',
        contact_email: '',
        contact_whatsapp: '',
        location: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-success hover:bg-success/80 text-white shadow-lg font-bold text-base px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-success/25">
          <Plus className="h-5 w-5" />
          List Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">List Your Climate Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Image Upload */}
          {user && (
            <ImageUpload
              userId={user.id}
              images={formData.images || []}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Solar Panel Kit 500W"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Le) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={formData.price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your climate-friendly product..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Freetown, Sierra Leone"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Contact Methods (at least one required)</p>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+232 xxx xxx xxx"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+232 xxx xxx xxx"
                value={formData.contact_whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="seller@example.com"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-success hover:bg-success/80 text-white shadow-lg font-bold text-base py-3 rounded-xl transition-all duration-200 hover:shadow-success/25" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Listing...
              </>
            ) : (
              'List Product'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
