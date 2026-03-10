import { supabase } from "@/integrations/supabase/client";

export interface ClimateProduct {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  images: string[];
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller_name?: string;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  category: string;
  images?: string[];
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  location?: string;
}

export const PRODUCT_CATEGORIES = [
  "Solar Equipment",
  "Recycled Products",
  "Eco-Friendly Home",
  "Sustainable Fashion",
  "Green Energy",
  "Water Conservation",
  "Organic Products",
  "Upcycled Items",
  "Electric Vehicles",
  "Other"
] as const;

export const formatLeonePrice = (price: number): string => {
  return `Le ${new Intl.NumberFormat('en-SL').format(price)}`;
};

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function getProducts(limit?: number): Promise<ClimateProduct[]> {
  let query = supabase
    .from('climate_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Fetch seller names separately
  const products = data || [];
  const userIds = [...new Set(products.map(p => p.user_id))];
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
    
    return products.map((item: any) => ({
      ...item,
      seller_name: profileMap.get(item.user_id) || 'Anonymous Seller'
    }));
  }
  
  return products.map((item: any) => ({
    ...item,
    seller_name: 'Anonymous Seller'
  }));
}

export async function searchProducts(params: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ClimateProduct[]> {
  let query = supabase
    .from('climate_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  const products = data || [];
  const userIds = [...new Set(products.map(p => p.user_id))];
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
    
    return products.map((item: any) => ({
      ...item,
      seller_name: profileMap.get(item.user_id) || 'Anonymous Seller'
    }));
  }
  
  return products.map((item: any) => ({
    ...item,
    seller_name: 'Anonymous Seller'
  }));
}

export async function getProductById(id: string): Promise<ClimateProduct | null> {
  const { data, error } = await supabase
    .from('climate_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  if (!data) return null;
  
  // Fetch seller name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.user_id)
    .single();
  
  return {
    ...data,
    seller_name: profile?.full_name || 'Anonymous Seller'
  };
}

export async function getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<ClimateProduct[]> {
  const { data, error } = await supabase
    .from('climate_products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  const products = data || [];
  const userIds = [...new Set(products.map(p => p.user_id))];
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
    
    return products.map((item: any) => ({
      ...item,
      seller_name: profileMap.get(item.user_id) || 'Anonymous Seller'
    }));
  }
  
  return products.map((item: any) => ({
    ...item,
    seller_name: 'Anonymous Seller'
  }));
}

export async function createProduct(userId: string, productData: CreateProductData): Promise<ClimateProduct> {
  const { data, error } = await supabase
    .from('climate_products')
    .insert({
      user_id: userId,
      title: productData.title,
      description: productData.description || null,
      price: productData.price,
      category: productData.category,
      images: productData.images || [],
      contact_phone: productData.contact_phone || null,
      contact_email: productData.contact_email || null,
      contact_whatsapp: productData.contact_whatsapp || null,
      location: productData.location || null
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClimateProduct;
}

export async function getUserProducts(userId: string): Promise<ClimateProduct[]> {
  const { data, error } = await supabase
    .from('climate_products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ClimateProduct[];
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('climate_products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

export async function toggleProductStatus(productId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('climate_products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) throw error;
}

export async function updateProduct(productId: string, productData: Partial<CreateProductData>): Promise<ClimateProduct> {
  const { data, error } = await supabase
    .from('climate_products')
    .update({
      title: productData.title,
      description: productData.description || null,
      price: productData.price,
      category: productData.category,
      images: productData.images || [],
      contact_phone: productData.contact_phone || null,
      contact_email: productData.contact_email || null,
      contact_whatsapp: productData.contact_whatsapp || null,
      location: productData.location || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as ClimateProduct;
}
