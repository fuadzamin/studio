
"use client";

import { createContext, useState, ReactNode } from 'react';
import * as z from "zod";
import { Product } from './ProductContext';

// --- Zod Schema ---
export const materialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama material tidak boleh kosong."),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif."),
  unit: z.string().min(1, "Satuan harus dipilih."),
});

// --- TypeScript Types ---
export type MaterialFormValues = z.infer<typeof materialSchema>;
export type Material = MaterialFormValues & { id: string };
type BomItem = Product['bom'][0];

// --- Initial Data ---
const initialMaterials: Material[] = [
  { id: "mat-1", name: "Mainboard V1.2", stock: 100, unit: "pcs" },
  { id: "mat-2", name: "Casing Box", stock: 150, unit: "pcs" },
  { id: "mat-3", name: "Kabel Power", stock: 500, unit: "meter" },
  { id: "mat-4", name: "Panel P10", stock: 200, unit: "pcs" },
  { id: "mat-5", name: "Controller JWS", stock: 50, unit: "pcs" },
  { id: "mat-6", name: "Power Supply 5V", stock: 75, unit: "pcs" },
];

// --- Context Definition ---
interface MaterialContextType {
  materials: Material[];
  addMaterial: (materialData: MaterialFormValues) => void;
  updateMaterial: (materialId: string, materialData: MaterialFormValues) => void;
  deleteMaterial: (materialId: string) => void;
  addStock: (materialName: string, quantity: number, unit: string) => void;
  reduceStockFromBom: (bom: BomItem[], productQuantity: number) => { success: boolean; message: string };
}

export const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

// --- Provider Component ---
export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  const addMaterial = (materialData: MaterialFormValues) => {
    const newMaterial: Material = {
      ...materialData,
      id: `mat_${new Date().getTime()}`,
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (materialId: string, materialData: MaterialFormValues) => {
    setMaterials(prev =>
      prev.map(m =>
        m.id === materialId ? { ...m, ...materialData, id: m.id } : m
      )
    );
  };

  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };
  
  const addStock = (materialName: string, quantity: number, unit: string) => {
    setMaterials(prev => {
        const existingMaterial = prev.find(m => m.name === materialName);
        if (existingMaterial) {
            return prev.map(m => 
                m.name === materialName 
                ? { ...m, stock: m.stock + quantity } 
                : m
            );
        } else {
            const newMaterial: Material = {
                id: `mat_${new Date().getTime()}`,
                name: materialName,
                stock: quantity,
                unit: unit,
            };
            return [...prev, newMaterial];
        }
    });
  };

  const reduceStockFromBom = (bom: BomItem[], productQuantity: number): { success: boolean; message: string } => {
    let canFulfill = true;
    let missingMaterials: string[] = [];

    // First, check if there's enough stock for all materials
    bom.forEach(bomItem => {
      const requiredQty = bomItem.quantity * productQuantity;
      const materialInStock = materials.find(m => m.name === bomItem.materialName);
      if (!materialInStock || materialInStock.stock < requiredQty) {
        canFulfill = false;
        missingMaterials.push(`${bomItem.materialName} (butuh: ${requiredQty}, tersedia: ${materialInStock?.stock || 0})`);
      }
    });

    if (!canFulfill) {
      return { success: false, message: `Stok tidak cukup untuk: ${missingMaterials.join(', ')}.` };
    }

    // If stock is sufficient, reduce it
    setMaterials(prevMaterials => {
      const newMaterials = [...prevMaterials];
      bom.forEach(bomItem => {
        const requiredQty = bomItem.quantity * productQuantity;
        const materialIndex = newMaterials.findIndex(m => m.name === bomItem.materialName);
        if (materialIndex !== -1) {
          newMaterials[materialIndex].stock -= requiredQty;
        }
      });
      return newMaterials;
    });

    return { success: true, message: "Stok berhasil dikurangi." };
  };

  return (
    <MaterialContext.Provider value={{ materials, addMaterial, updateMaterial, deleteMaterial, addStock, reduceStockFromBom }}>
      {children}
    </MaterialContext.Provider>
  );
};
