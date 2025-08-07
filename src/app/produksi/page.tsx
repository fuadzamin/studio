"use client";

import { useState, useContext } from "react";
import { PlusCircle } from "lucide-react";
import { ProductContext } from "@/contexts/ProductContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProduksiPage() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("ProduksiPage must be used within a ProductProvider");
  }
  const { products } = context;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const productsWithBom = products.filter(p => p.bom && p.bom.length > 0);

  const displayBom = selectedProductId
    ? products.find(p => p.id === selectedProductId)?.bom || []
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bill of Materials (BOM)</h1>
        <p className="text-muted-foreground mt-2">
          Lihat komponen atau material penyusun untuk setiap produk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Bill of Materials</CardTitle>
          <CardDescription>
            Pilih produk untuk melihat Bill of Materials-nya.
          </CardDescription>
             <div className="flex items-center justify-between pt-4">
                <div className="w-full max-w-sm">
                     <Select onValueChange={setSelectedProductId} value={selectedProductId || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productsWithBom.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
             {selectedProductId ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nama Material</TableHead>
                        <TableHead className="w-[150px]">Jumlah</TableHead>
                        <TableHead className="w-[150px]">Satuan</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayBom.map((material, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{material.materialName}</TableCell>
                                <TableCell>{material.quantity}</TableCell>
                                <TableCell>{material.unit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>Silakan pilih produk untuk menampilkan BOM.</p>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}
