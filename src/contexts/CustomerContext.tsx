// src/contexts/CustomerContext.tsx
"use client";

import { createContext, useState, ReactNode, useContext, useEffect } from 'react'; // Add useEffect and useContext
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


// --- Initial Data (Optional, can be empty if always fetching from API) ---
// If you always fetch from API, you can clear this array: const initialCustomers: Customer[] = [];
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
  loading: boolean; // Add loading state
  error: string | null; // Add error state
}

// Change default value to undefined
export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// --- Custom Hook to Use Context ---
export const useCustomer = () => { // <<< Add and Export this hook
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};


// --- Provider Component ---
export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]); // Start with empty array if fetching from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate data fetching when component mounts
  useEffect(() => {
    console.log("Fetching customer data...");
    const fetchData = async () => {
      try {
        // --- Replace with your actual API fetching logic ---
        // Example fetch:
        // const response = await fetch('/api/customers');
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data: Customer[] = await response.json();

        // Simulate network delay and use initial data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const data: Customer[] = initialCustomers; // Use initial data for simulation

        console.log("Customer data fetched:", data);
        setCustomers(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching customer data:", err);
        setError(err.message || "Failed to fetch customers");
        setLoading(false); // Ensure loading is false even on error
      }
    };

    fetchData();
  }, []); // Empty dependency array means run only once on mount


  const addCustomer = (customerData: CustomerFormValues) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${new Date().getTime()}`,
    };
    setCustomers(prev => [...prev, newCustomer]);
    // TODO: Add logic to send data to backend API if needed
  };

  const updateCustomer = (customerId: string, customerData: CustomerFormValues) => {
     setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, ...customerData, id: c.id } : c
      )
    );
     // TODO: Add logic to send update to backend API if needed
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    // TODO: Add logic to send delete request to backend API if needed
  };

  // Value provided by the context, including loading and error
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
