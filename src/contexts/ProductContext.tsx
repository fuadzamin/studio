
"use client";

import { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import * as z from "zod";

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

// --- Initial Data ---
const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Nurse Call Unit",
    code: "NC-001",
    purchasePrice: 1500000,
    salePrice: 1750000,
    stock: 50,
    unit: "unit",
    bom: [
      { materialName: "Mainboard V1.2", quantity: 1, unit: "pcs" },
      { materialName: "Casing Box", quantity: 1, unit: "pcs" },
      { materialName: "Kabel Power", quantity: 2, unit: "meter" },
    ],
  },
  {
    id: "prod-2",
    name: "Digital Mosque Clock",
    code: "JWS-001",
    purchasePrice: 4500000,
    salePrice: 5000000,
    stock: 25,
    unit: "unit",
    bom: [
      { materialName: "Panel P10", quantity: 6, unit: "pcs" },
      { materialName: "Controller JWS", quantity: 1, unit: "pcs" },
      { materialName: "Power Supply 5V", quantity: 2, unit: "pcs" },
    ],
  },
   {
    id: "prod-3",
    name: "Queuing Machine Display",
    code: "QMD-001",
    purchasePrice: 1000000,
    salePrice: 1250000,
    stock: 30,
    unit: "unit",
    bom: []
  },
  {
    id: "prod-4",
    name: "LED Running Text Board",
    code: "LRT-001",
    purchasePrice: 500000,
    salePrice: 650000,
    stock: 100,
    unit: "unit",
    bom: []
  },
];


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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = async (productData: ProductFormValues) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${new Date().getTime()}`,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (productId: string, productData: ProductFormValues) => {
     setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, ...productData, id: p.id } : p
      )
    );
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
  
  const increaseProductStock = (productId: string, quantity: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, stock: p.stock + quantity } : p
      )
    );
  };
  
  const reduceProductStock = (productId: string, quantity: number): { success: boolean, message: string } => {
    let success = false;
    let message = "";
    
    setProducts(prevProducts => {
      const product = prevProducts.find(p => p.id === productId);
      if (!product) {
        message = "Produk tidak ditemukan.";
        success = false;
        return prevProducts;
      }
      if (product.stock < quantity) {
        message = `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}, Dibutuhkan: ${quantity}.`;
        success = false;
        return prevProducts;
      }
      
      success = true;
      message = "Stok berhasil dikurangi.";
      return prevProducts.map(p =>
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      );
    });

    return { success, message };
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, increaseProductStock, reduceProductStock, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};
