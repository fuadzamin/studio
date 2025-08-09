
"use client";

import { useState, useContext, useEffect, useMemo } from "react";
import { ProductContext, Product } from "@/contexts/ProductContext";
import {
  MaterialContext,
  Material,
  MaterialFormValues,
  materialSchema,
} from "@/contexts/MaterialContext";
import { useForm, useWatch } from "react-hook-form";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Factory, Package, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


type ProductionOrder = {
    id: string;
    date: string;
    productName: string;
    quantity: number;
    status: 'Selesai';
    materialsUsed: {
        materialName: string;
        quantity: number;
        unit: string;
    }[];
}

const productionOrderSchema = z.object({
    productId: z.string().min(1, "Produk harus dipilih"),
    quantity: z.coerce.number().min(1, "Jumlah produksi harus lebih dari 0"),
});

type ProductionOrderFormValues = z.infer<typeof productionOrderSchema>;

type ProductionSuccessData = Omit<ProductionOrder, 'id' | 'status'>;

function ProductionOrderTab({ onProductionSuccess }: { onProductionSuccess: (order: ProductionSuccessData) => void }) {
    const { toast } = useToast();
    const productContext = useContext(ProductContext);
    const materialContext = useContext(MaterialContext);

    if (!productContext || !materialContext) {
        throw new Error("ProductionOrderTab must be used within Product and Material Providers");
    }

    const { products, increaseProductStock } = productContext;
    const { materials, reduceStockFromBom } = materialContext;

    const form = useForm<ProductionOrderFormValues>({
        resolver: zodResolver(productionOrderSchema),
        defaultValues: {
            productId: "",
            quantity: 0,
        },
    });

    const productsWithBom = products.filter(p => p.bom && p.bom.length > 0);
    
    // Watch for changes in form fields
    const watchedProductId = useWatch({ control: form.control, name: "productId" });
    const watchedQuantity = useWatch({ control: form.control, name: "quantity" });

    const materialRequirements = useMemo(() => {
        if (!watchedProductId || !watchedQuantity || watchedQuantity <= 0) {
            return [];
        }
        const product = products.find(p => p.id === watchedProductId);
        if (!product || !product.bom) {
            return [];
        }
        return product.bom.map(bomItem => {
            const materialInStock = materials.find(m => m.name === bomItem.materialName);
            const requiredQuantity = bomItem.quantity * watchedQuantity;
            return {
                name: bomItem.materialName,
                required: requiredQuantity,
                stock: materialInStock?.stock || 0,
                unit: bomItem.unit,
                isSufficient: (materialInStock?.stock || 0) >= requiredQuantity,
            };
        });
    }, [watchedProductId, watchedQuantity, products, materials]);

    const isProductionPossible = materialRequirements.length > 0 && materialRequirements.every(item => item.isSufficient);

    const onSubmit = (data: ProductionOrderFormValues) => {
        const selectedProduct = products.find(p => p.id === data.productId);
        if (!selectedProduct) {
            toast({ title: "Error", description: "Produk tidak ditemukan.", variant: "destructive" });
            return;
        }

        const bom = selectedProduct.bom;
        const quantityToProduce = data.quantity;
        const usedMaterials = bom.map(item => ({
             materialName: item.materialName,
             quantity: item.quantity * quantityToProduce,
             unit: item.unit
        }));

        // Reduce material stock, this function now also validates
        const reduceResult = reduceStockFromBom(bom, quantityToProduce);
        if (!reduceResult.success) {
            toast({ 
                title: "Produksi Gagal", 
                description: reduceResult.message, 
                variant: "destructive",
                duration: 5000,
            });
            return;
        }
        
        toast({ title: "Sukses", description: "Stok material berhasil dikurangi.", variant: "default" });

        // Increase finished product stock
        increaseProductStock(selectedProduct.id, quantityToProduce);
        toast({ title: "Sukses", description: `Stok ${selectedProduct.name} berhasil ditambah.`, variant: "default" });
        
        // Add to history
        onProductionSuccess({
            date: new Date().toISOString().split('T')[0],
            productName: selectedProduct.name,
            quantity: quantityToProduce,
            materialsUsed: usedMaterials,
        });

        form.reset({ productId: "", quantity: 0 });
    };


    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-1 flex flex-col gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Buat Perintah Produksi</CardTitle>
                        <CardDescription>Pilih produk dan jumlah yang akan diproduksi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pilih Produk</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih produk jadi..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {productsWithBom.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name}
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
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jumlah Produksi</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={!isProductionPossible || !watchedProductId || !watchedQuantity}>
                                    <Factory className="mr-2 h-4 w-4"/>
                                    Mulai Produksi
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                             <Package className="h-5 w-5"/> Kebutuhan Material
                        </CardTitle>
                        <CardDescription>
                           Berikut adalah rincian material yang dibutuhkan untuk produksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {materialRequirements.length > 0 ? (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Material</TableHead>
                                        <TableHead className="text-right">Dibutuhkan</TableHead>
                                        <TableHead className="text-right">Tersedia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materialRequirements.map(item => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.required} {item.unit}</TableCell>
                                            <TableCell className={`text-right font-semibold ${item.isSufficient ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.stock} {item.unit}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Pilih produk dan jumlah untuk melihat kebutuhan material.</p>
                            </div>
                        )}
                        {!isProductionPossible && materialRequirements.length > 0 && (
                            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="font-semibold">Stok Material Tidak Cukup!</p>
                                    <p>Produksi tidak dapat dilanjutkan karena beberapa stok material tidak mencukupi kebutuhan.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ProductionHistoryTab({ history }: { history: ProductionOrder[] }) {
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Perintah Produksi</CardTitle>
                <CardDescription>Daftar semua perintah produksi yang telah selesai. Klik baris untuk melihat detail material.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]"></TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {history.length > 0 ? (
                            history.map((order) => (
                                <Collapsible asChild key={order.id} open={openItemId === order.id} onOpenChange={() => setOpenItemId(prev => prev === order.id ? null : order.id)}>
                                    <>
                                        <TableRow className="cursor-pointer">
                                            <TableCell>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                                        {openItemId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        <span className="sr-only">Toggle Details</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </TableCell>
                                            <TableCell>{format(new Date(order.date), "dd MMM yyyy")}</TableCell>
                                            <TableCell className="font-medium">{order.productName}</TableCell>
                                            <TableCell>{order.quantity} unit</TableCell>
                                            <TableCell>
                                                <Badge>{order.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                            <tr className="bg-muted/50">
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-4">
                                                        <h4 className="font-semibold mb-2 ml-4">Material yang Digunakan:</h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="pl-8">Nama Material</TableHead>
                                                                    <TableHead>Jumlah</TableHead>
                                                                    <TableHead>Satuan</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {order.materialsUsed.map((material, index) => (
                                                                    <TableRow key={index} className="border-b-0">
                                                                        <TableCell className="pl-8">{material.materialName}</TableCell>
                                                                        <TableCell>{material.quantity}</TableCell>
                                                                        <TableCell>{material.unit}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </td>
                                            </tr>
                                        </CollapsibleContent>
                                    </>
                                </Collapsible>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Belum ada riwayat produksi.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

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
        <CardTitle>Kebutuhan Material (Bill of Materials)</CardTitle>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4">
           <div className="w-full sm:max-w-sm">
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
              <Button size="sm" onClick={handleAddClick} className="w-full sm:w-auto">
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
    const [productionHistory, setProductionHistory] = useState<ProductionOrder[]>([]);

    const handleAddProductionHistory = (order: ProductionSuccessData) => {
        const newOrder: ProductionOrder = {
            ...order,
            id: `prod_${new Date().getTime()}`,
            status: 'Selesai'
        };
        setProductionHistory(prev => [newOrder, ...prev]);
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Produksi & Material</h1>
        <p className="text-muted-foreground mt-2">
          Buat perintah produksi, lihat kebutuhan material (BOM), dan kelola stok material.
        </p>
      </div>
      <Tabs defaultValue="order">
        <TabsList className="mb-4">
          <TabsTrigger value="order">Perintah Produksi</TabsTrigger>
          <TabsTrigger value="history">Riwayat Produksi</TabsTrigger>
          <TabsTrigger value="bom">Kebutuhan Material (BOM)</TabsTrigger>
          <TabsTrigger value="stok">Stok Material</TabsTrigger>
        </TabsList>
        <TabsContent value="order">
          <ProductionOrderTab onProductionSuccess={handleAddProductionHistory} />
        </TabsContent>
         <TabsContent value="history">
          <ProductionHistoryTab history={productionHistory} />
        </TabsContent>
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
