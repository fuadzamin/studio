// src/contexts/CustomerContext.tsx
"use client";

import { createContext, useState, ReactNode, useContext, useEffect, useCallback } from 'react';
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

// --- Zod Schema ---
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama pelanggan tidak boleh kosong."),
  address: z.string().min(1, "Alamat tidak boleh kosong."),
  contact: z.string().min(1, "Kontak tidak boleh kosong."),
  email: z.string().email("Format email tidak valid."),
});

// --- TypeScript Types ---
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type Customer = CustomerFormValues & { id: string };


// --- Context Definition ---
interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customerData: CustomerFormValues) => Promise<void>;
  updateCustomer: (customerId: string, customerData: CustomerFormValues) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);


// --- Provider Component ---
export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Gagal mengambil data pelanggan');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);


  const addCustomer = async (customerData: CustomerFormValues) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan pelanggan');
      }
      toast({ title: "Sukses", description: "Pelanggan baru berhasil ditambahkan." });
      await fetchCustomers(); // Refresh data
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateCustomer = async (customerId: string, customerData: CustomerFormValues) => {
     try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui pelanggan');
      }
      toast({ title: "Sukses", description: "Data pelanggan berhasil diperbarui." });
      await fetchCustomers(); // Refresh data
    } catch (err: any) {
       toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteCustomer = async (customerId: string) => {
     try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus pelanggan');
      }
      toast({ title: "Sukses", description: "Pelanggan berhasil dihapus." });
      await fetchCustomers(); // Refresh data
    } catch (err: any)      {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Value provided by the context
  const contextValue = {
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      loading,
      error,
  };


  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
};

// --- Custom Hook to Use Context ---
export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
