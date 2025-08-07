
"use client";

import { createContext, useState, ReactNode } from 'react';
import * as z from "zod";

// --- Zod Schema ---
export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama karyawan tidak boleh kosong."),
  position: z.string().min(1, "Posisi tidak boleh kosong."),
});

// --- TypeScript Types ---
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type Employee = EmployeeFormValues & { id: string };

// --- Initial Data ---
const initialEmployees: Employee[] = [
    { id: "emp-1", name: "Budi Santoso", position: "Staf Produksi" },
    { id: "emp-2", name: "Citra Lestari", position: "Staf Marketing" },
    { id: "emp-3", name: "Doni Firmansyah", position: "Staf Gudang" },
    { id: "emp-4", name: "Eka Putri", position: "Admin" },
];

// --- Context Definition ---
interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employeeData: EmployeeFormValues) => void;
  updateEmployee: (employeeId: string, employeeData: EmployeeFormValues) => void;
  deleteEmployee: (employeeId: string) => void;
}

export const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// --- Provider Component ---
export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const addEmployee = (employeeData: EmployeeFormValues) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp_${new Date().getTime()}`,
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (employeeId: string, employeeData: EmployeeFormValues) => {
     setEmployees(prev =>
      prev.map(e =>
        e.id === employeeId ? { ...e, ...employeeData, id: e.id } : e
      )
    );
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};
