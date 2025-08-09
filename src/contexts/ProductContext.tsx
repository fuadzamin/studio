"use client";

import { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import * as z from "zod";
import { supabase } from '@/lib/supabase';

// --- Zod Schemas ---
const bomItemSchema = z.object({
  materialName: z.string().min(1, "Nama material tidak boleh kosong"),
  quantity: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  unit: z.string().min(1, "Satuan harus dipilih"),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  code: z.string().min(1, "Kode produk tidak boleh kosong"),
  purchasePrice: z.coerce.number().positive("Harga pokok harus positif"),
  salePrice: z.coerce.number().positive("Harga jual harus positif"),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  unit: z.string().min(1, "Satuan harus dipilih"),
  bom: z.array(bomItemSchema),
});

// --- TypeScript Types ---
export type ProductFormValues = z.infer<typeof productSchema>;
export type Product = ProductFormValues & { id: string };

// --- Context Definition ---
interface ProductContextType {
  products: Product[];
  addProduct: (productData: ProductFormValues) => Promise<void>;
  updateProduct: (productId: string, productData: ProductFormValues) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  increaseProductStock: (productId: string, quantity: number) => Promise<void>;
  reduceProductStock: (productId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

// --- Provider Component ---
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: ProductFormValues) => {
    const { id, ...rest } = productData; // Don't send undefined id to supabase
    const { data, error } = await supabase.from('products').insert([rest]).select();
    if (error) {
        setError(error.message);
        throw error;
    }
    if (data) {
        await fetchProducts(); // Refetch to get the latest list
    }
  };

  const updateProduct = async (productId: string, productData: ProductFormValues) => {
    const { id, ...rest } = productData;
    const { data, error } = await supabase.from('products').update(rest).eq('id', productId).select();
     if (error) {
        setError(error.message);
        throw error;
    }
    await fetchProducts();
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
        setError(error.message);
        throw error;
    }
    await fetchProducts();
  };
  
  const increaseProductStock = useCallback(async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
        const newStock = product.stock + quantity;
        await updateProduct(productId, {...product, stock: newStock});
    }
  }, [products]);

  const reduceProductStock = useCallback(async (productId: string, quantity: number): Promise<{ success: boolean, message: string }> => {
    const product = products.find(p => p.id === productId);
    if (!product) {
        return { success: false, message: "Produk tidak ditemukan." };
    }
    if (product.stock < quantity) {
        return { success: false, message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}, Dibutuhkan: ${quantity}.` };
    }
    const newStock = product.stock - quantity;
    await updateProduct(productId, {...product, stock: newStock});
    return { success: true, message: "Stok produk berhasil dikurangi." };
  }, [products]);

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, increaseProductStock, reduceProductStock, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};
