
"use client";

import { createContext, useState, ReactNode } from 'react';
import * as z from "zod";

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


// --- Initial Data ---
const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "PT Sejahtera Abadi",
    address: "Jl. Industri Raya No. 12, Jakarta",
    contact: "081234567890",
    email: "contact@sejahteraabadi.com",
  },
  {
    id: "2",
    name: "CV Maju Jaya",
    address: "Jl. Pahlawan No. 45, Surabaya",
    contact: "081298765432",
    email: "info@majujaya.co.id",
  },
];


// --- Context Definition ---
interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customerData: CustomerFormValues) => void;
  updateCustomer: (customerId: string, customerData: CustomerFormValues) => void;
  deleteCustomer: (customerId: string) => void;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);


// --- Provider Component ---
export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customerData: CustomerFormValues) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${new Date().getTime()}`,
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (customerId: string, customerData: CustomerFormValues) => {
     setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, ...customerData, id: c.id } : c
      )
    );
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };


  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};
