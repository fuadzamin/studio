
"use client";

import { createContext, useState, ReactNode, useCallback, useEffect, useContext } from 'react';
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';

// --- Zod Schema ---
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
  increaseProductStock: (productId: string, quantity: number) => void;
  reduceProductStock: (productId: string, quantity: number) => { success: boolean, message: string };
  loading: boolean;
  error: string | null;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

// --- Provider Component ---
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const addProduct = async (productData: ProductFormValues) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan produk');
      }
      toast({ title: "Sukses", description: "Produk baru berhasil ditambahkan." });
      await fetchProducts(); // Refresh data
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateProduct = async (productId: string, productData: ProductFormValues) => {
     try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui produk');
      }
      toast({ title: "Sukses", description: "Data produk berhasil diperbarui." });
      await fetchProducts(); // Refresh data
    } catch (err: any) {
       toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteProduct = async (productId: string) => {
     try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus produk');
      }
      toast({ title: "Sukses", description: "Produk berhasil dihapus." });
      await fetchProducts(); // Refresh data
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };
  
  const increaseProductStock = async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = product.stock + quantity;
      await updateProduct(productId, { ...product, stock: newStock });
    }
  };
  
  const reduceProductStock = (productId: string, quantity: number): { success: boolean, message: string } => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }
    if (product.stock < quantity) {
      return { success: false, message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}, Dibutuhkan: ${quantity}.` };
    }
    const newStock = product.stock - quantity;
    updateProduct(productId, { ...product, stock: newStock });
    return { success: true, message: "Stok berhasil dikurangi." };
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, increaseProductStock, reduceProductStock, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the context
export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
