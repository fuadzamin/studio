"use client";

import { createContext, useState, ReactNode } from 'react';
import * as z from "zod";

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

// --- Initial Data ---
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Nurse Call Unit",
    code: "NC001",
    purchasePrice: 1500000,
    salePrice: 1750000,
    stock: 15,
    unit: "pcs",
    bom: [
        { materialName: "Mainboard V1.2", quantity: 1, unit: "pcs" },
        { materialName: "Casing Box", quantity: 1, unit: "pcs" },
        { materialName: "Kabel Power", quantity: 1, unit: "meter" },
    ]
  },
  {
    id: "2",
    name: "Digital Mosque Clock",
    code: "JDM01",
    purchasePrice: 2000000,
    salePrice: 2500000,
    stock: 8,
    unit: "pcs",
     bom: [
        { materialName: "Panel P10", quantity: 6, unit: "pcs" },
        { materialName: "Controller JWS", quantity: 1, unit: "pcs" },
        { materialName: "Power Supply 5V", quantity: 1, unit: "pcs" },
    ]
  },
  {
    id: "3",
    name: "Queuing Machine Display",
    code: "QM003",
    purchasePrice: 800000,
    salePrice: 1000000,
    stock: 20,
    unit: "pcs",
    bom: []
  },
  {
    id: "4",
    name: "LED Running Text Board",
    code: "LED-R-5M",
    purchasePrice: 500000,
    salePrice: 650000,
    stock: 5,
    unit: "roll",
    bom: []
  },
   {
    id: "5",
    name: "Power Supply 12V 5A",
    code: "PSU-12-5",
    purchasePrice: 75000,
    salePrice: 100000,
    stock: 50,
    unit: "pcs",
    bom: []
  },
];


// --- Context Definition ---
interface ProductContextType {
  products: Product[];
  addProduct: (productData: ProductFormValues) => void;
  updateProduct: (productId: string, productData: Partial<ProductFormValues>) => void;
  deleteProduct: (productId: string) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

// --- Provider Component ---
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: ProductFormValues) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (productId: string, productData: Partial<ProductFormValues>) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, ...productData, id: p.id } : p
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
