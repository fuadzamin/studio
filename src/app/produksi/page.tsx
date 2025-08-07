
"use client";

import { useState, useContext, useEffect, useMemo } from "react";
import { ProductContext } from "@/contexts/ProductContext";
import {
  MaterialContext,
  Material,
  MaterialFormValues,
  materialSchema,
} from "@/contexts/MaterialContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function BomTab() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("ProduksiPage must be used within a ProductProvider");
  }
  const { products } = context;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (
      selectedProductId &&
      !products.find((p) => p.id === selectedProductId)
    ) {
      setSelectedProductId(null);
    }
  }, [products, selectedProductId]);

  const productsWithBom = products.filter((p) => p.bom && p.bom.length > 0);

  const displayBom = selectedProductId
    ? products.find((p) => p.id === selectedProductId)?.bom || []
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kebutuhan Material</CardTitle>
        <CardDescription>
          Pilih produk untuk melihat kebutuhan material untuk membuat 1 unit produk.
        </CardDescription>
        <div className="flex items-center justify-between pt-4">
          <div className="w-full max-w-sm">
            <Select
              onValueChange={setSelectedProductId}
              value={selectedProductId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk..." />
              </SelectTrigger>
              <SelectContent>
                {productsWithBom.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </SelectItem>
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
                  <TableCell className="font-medium">
                    {material.materialName}
                  </TableCell>
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
  );
}

function MaterialStockTab() {
  const materialContext = useContext(MaterialContext);
  const productContext = useContext(ProductContext);

  if (!materialContext || !productContext) {
    throw new Error(
      "MaterialStockTab must be used within a MaterialProvider and ProductProvider"
    );
  }
  const { materials, addMaterial, updateMaterial, deleteMaterial } = materialContext;
  const { products } = productContext;

  const [filterProductId, setFilterProductId] = useState<string | "all">("all");
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const allBomMaterialNames = useMemo(() => {
    const materialSet = new Set<string>();
    products.forEach(product => {
        product.bom.forEach(item => {
            materialSet.add(item.materialName);
        });
    });
    return Array.from(materialSet);
  }, [products]);
  
  const filteredMaterials = useMemo(() => {
    if (filterProductId === "all") {
      return materials;
    }
    const selectedProduct = products.find(p => p.id === filterProductId);
    if (!selectedProduct) {
      return [];
    }
    const bomMaterialNames = new Set(selectedProduct.bom.map(item => item.materialName));
    return materials.filter(material => bomMaterialNames.has(material.name));
  }, [filterProductId, materials, products]);


  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: "",
      stock: 0,
      unit: "pcs",
    },
  });

  const handleAddClick = () => {
    setSelectedMaterial(null);
    form.reset({
      name: "",
      stock: 0,
      unit: "pcs",
    });
    setAddEditDialogOpen(true);
  };

  const handleEditClick = (material: Material) => {
    setSelectedMaterial(material);
    form.reset(material);
    setAddEditDialogOpen(true);
  };
  
  const handleDeleteClick = (material: Material) => {
    setSelectedMaterial(material);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMaterial) {
      deleteMaterial(selectedMaterial.id);
      toast({
        title: "Sukses",
        description: `Material "${selectedMaterial.name}" berhasil dihapus.`,
      });
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
    }
  };

  const onSubmit = (data: MaterialFormValues) => {
    if (selectedMaterial) {
      updateMaterial(selectedMaterial.id, data);
      toast({
        title: "Sukses",
        description: "Material berhasil diperbarui.",
      });
    } else {
      addMaterial(data);
      toast({
        title: "Sukses",
        description: "Material baru berhasil ditambahkan.",
      });
    }
    setAddEditDialogOpen(false);
    setSelectedMaterial(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok Material</CardTitle>
        <CardDescription>
          Kelola inventaris semua material mentah Anda. Filter berdasarkan produk untuk melihat material yang relevan.
        </CardDescription>
        <div className="flex items-center justify-between pt-4">
           <div className="w-full max-w-sm">
            <Select onValueChange={setFilterProductId} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan produk..." />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Semua Produk</SelectItem>
                {products.filter(p => p.bom.length > 0).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedMaterial ? "Edit Material" : "Tambah Material"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                     <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Material</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!!selectedMaterial}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih nama material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allBomMaterialNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Stok</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Satuan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!selectedMaterial}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Satuan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pcs">Pcs</SelectItem>
                                    <SelectItem value="roll">Roll</SelectItem>
                                    <SelectItem value="meter">Meter</SelectItem>
                                    <SelectItem value="cm">Cm</SelectItem>
                                    <SelectItem value="liter">Liter</SelectItem>
                                    <SelectItem value="gram">Gram</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Simpan</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Material</TableHead>
              <TableHead>Stok Tersedia</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>
                  {material.stock} {material.unit}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog open={isDeleteDialogOpen && selectedMaterial?.id === material.id} onOpenChange={setDeleteDialogOpen}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditClick(material)}>
                           <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteClick(material); }} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus material
                            "{selectedMaterial?.name}" secara permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ProduksiPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Produksi & Material</h1>
        <p className="text-muted-foreground mt-2">
          Lihat kebutuhan material (BOM) dan kelola stok material mentah.
        </p>
      </div>
      <Tabs defaultValue="bom">
        <TabsList className="mb-4">
          <TabsTrigger value="bom">Kebutuhan Material</TabsTrigger>
          <TabsTrigger value="stok">Stok Material</TabsTrigger>
        </TabsList>
        <TabsContent value="bom">
          <BomTab />
        </TabsContent>
        <TabsContent value="stok">
          <MaterialStockTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
