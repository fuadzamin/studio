
"use client";

import { createContext, useState, ReactNode } from 'react';
import * as z from "zod";

// --- Zod Schema ---
export const salesOrderSchema = z.object({
  id: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format tanggal tidak valid" }),
  customer: z.string().min(1, "Nama pelanggan tidak boleh kosong"),
  productName: z.string().min(1, "Nama produk tidak boleh kosong"),
  quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
  total: z.number().positive("Total harus positif"),
  status: z.enum(["Baru", "Diproses", "Selesai", "Batal"]),
});

// --- TypeScript Types ---
export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;
export type SalesOrder = SalesOrderFormValues & { id: string };

// --- Initial Data ---
const initialSalesOrders: SalesOrder[] = [
  {
    id: "SO-001",
    date: "2024-05-20",
    customer: "PT Sejahtera Abadi",
    productName: "Nurse Call Unit",
    quantity: 10,
    total: 17500000,
    status: "Selesai",
  },
  {
    id: "SO-002",
    date: "2024-05-22",
    customer: "CV Maju Jaya",
    productName: "Digital Mosque Clock",
    quantity: 5,
    total: 25000000,
    status: "Diproses",
  },
  {
    id: "SO-003",
    date: "2024-05-25",
    customer: "RS Harapan Bunda",
    productName: "Queuing Machine Display",
    quantity: 7,
    total: 8750000,
    status: "Baru",
  },
  {
    id: "SO-004",
    date: "2024-06-10",
    customer: "PT Sejahtera Abadi",
    productName: "LED Running Text Board",
    quantity: 20,
    total: 13000000,
    status: "Selesai",
  },
  {
    id: "SO-005",
    date: "2024-07-01",
    customer: "Masjid Al-Hidayah",
    productName: "Digital Mosque Clock",
    quantity: 2,
    total: 5000000,
    status: "Selesai",
  },
];


// --- Context Definition ---
interface SalesOrderContextType {
  salesOrders: SalesOrder[];
  addSalesOrder: (orderData: Omit<SalesOrder, 'id'>) => void;
  updateSalesOrder: (orderId: string, orderData: Partial<SalesOrderFormValues>) => void;
}

export const SalesOrderContext = createContext<SalesOrderContextType | undefined>(undefined);

// --- Provider Component ---
export const SalesOrderProvider = ({ children }: { children: ReactNode }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(initialSalesOrders);

  const addSalesOrder = (orderData: Omit<SalesOrder, 'id'>) => {
    const newId = `SO-${String(salesOrders.length + 1).padStart(3, '0')}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: newId,
    };
    setSalesOrders(prev => [newOrder, ...prev]);
  };

  const updateSalesOrder = (orderId: string, orderData: Partial<SalesOrderFormValues>) => {
     setSalesOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, ...orderData, id: o.id } : o
      )
    );
  };

  return (
    <SalesOrderContext.Provider value={{ salesOrders, addSalesOrder, updateSalesOrder }}>
      {children}
    </SalesOrderContext.Provider>
  );
};
