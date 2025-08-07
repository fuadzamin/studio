"use client";

import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

const productsWithBom = [
    { 
        id: "1", 
        productName: "Nurse Call Unit", 
        productCode: "NC001",
        bom: [
            { materialName: "Mainboard V1.2", quantity: 1, unit: "pcs" },
            { materialName: "Casing Box", quantity: 1, unit: "pcs" },
            { materialName: "Kabel Power", quantity: 1, unit: "meter" },
        ]
    },
    { 
        id: "2", 
        productName: "Digital Mosque Clock", 
        productCode: "JDM01",
        bom: [
            { materialName: "Panel P10", quantity: 6, unit: "pcs" },
            { materialName: "Controller JWS", quantity: 1, unit: "pcs" },
            { materialName: "Power Supply 5V", quantity: 1, unit: "pcs" },
        ]
    },
];

export default function ProduksiPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const displayBom = selectedProduct 
    ? productsWithBom.find(p => p.id === selectedProduct)?.bom || []
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bill of Materials (BOM)</h1>
        <p className="text-muted-foreground mt-2">
          Definisikan komponen atau material penyusun setiap produk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Bill of Materials</CardTitle>
          <CardDescription>
            Pilih produk untuk melihat atau mengedit Bill of Materials-nya.
          </CardDescription>
             <div className="flex items-center justify-between pt-4">
                <div className="w-full max-w-sm">
                     <Select onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productsWithBom.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.productName} ({p.productCode})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                </div>
                 <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat BOM Baru
                  </Button>
            </div>
        </CardHeader>
        <CardContent>
             {selectedProduct ? (
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
