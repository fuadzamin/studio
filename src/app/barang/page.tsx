"use client";

import { useState, useContext, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  File,
  Trash2,
  Edit,
  MinusCircle,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ProductContext, Product, ProductFormValues, productSchema } from "@/contexts/ProductContext";
import { Badge } from "@/components/ui/badge";

const stockFormSchema = z.object({
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif."),
});

type StockFormValues = z.infer<typeof stockFormSchema>;


export default function BarangPage() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("BarangPage must be used within a ProductProvider");
  }
  const { products, addProduct, updateProduct, deleteProduct } = context;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setStockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      code: "",
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      unit: "",
      bom: [],
    },
  });

  const stockForm = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      stock: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bom",
  });

   useEffect(() => {
    if (selectedProduct) {
      stockForm.reset({ stock: selectedProduct.stock });
    }
  }, [selectedProduct, stockForm]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    form.reset(product);
    setAddEditDialogOpen(true);
  };
  
  const handleStockClick = (product: Product) => {
    setSelectedProduct(product);
    setStockDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      code: "",
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      unit: "",
      bom: [],
    });
    setAddEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
        deleteProduct(selectedProduct.id);
        toast({
            title: "Sukses",
            description: `Produk "${selectedProduct.name}" berhasil dihapus.`,
            variant: "default",
        });
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
    }
  };


  const onSubmit = (data: ProductFormValues) => {
    const isEditing = !!selectedProduct;
     if (!isEditing && products.some(p => p.code === data.code)) {
        form.setError("code", { type: "manual", message: "Kode produk sudah ada." });
        return;
    }
    
    if (isEditing && selectedProduct) {
      updateProduct(selectedProduct.id, data);
      toast({
        title: "Sukses",
        description: "Produk berhasil diperbarui.",
      });
    } else {
      addProduct(data);
       toast({
        title: "Sukses",
        description: "Produk baru berhasil ditambahkan.",
      });
    }
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const onStockSubmit = (data: StockFormValues) => {
    if (selectedProduct) {
      updateProduct(selectedProduct.id, { stock: data.stock });
      toast({
        title: "Sukses",
        description: `Stok untuk "${selectedProduct.name}" berhasil diperbarui.`,
      });
      setStockDialogOpen(false);
      setSelectedProduct(null);
    }
  };


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Manajemen Produk</h1>
        <p className="text-muted-foreground mt-2">
          Tambah, edit, dan kelola produk beserta stok dan Bill of Materials-nya.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Kelola semua produk Anda di sini.
          </CardDescription>
          <div className="flex items-center justify-between pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari produk..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <File className="mr-2 h-4 w-4" />
                Export
              </Button>
               <Button size="sm" onClick={handleAddClick}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(product.salePrice)}
                  </TableCell>
                  <TableCell>
                     <Badge variant={product.stock > 5 ? 'default' : 'destructive'}>
                        {product.stock} {product.unit}
                     </Badge>
                  </TableCell>
                  <TableCell>
                      <AlertDialog open={isDeleteDialogOpen && selectedProduct?.id === product.id} onOpenChange={setDeleteDialogOpen}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                             <DropdownMenuItem onSelect={() => handleEditClick(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStockClick(product)}>
                                <Package className="mr-2 h-4 w-4" /> Ubah Stok
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteClick(product); }} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </DropdownMenuItem>
                             </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk
                                "{selectedProduct?.name}" secara permanen.
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

           {/* Add/Edit Product Dialog */}
           <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                        <DialogTitle>{selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
                        <DialogDescription>
                            {selectedProduct ? 'Ubah detail produk dan komponen Bill of Materials (BOM) di bawah ini.' : 'Isi detail produk baru dan komponen Bill of Materials (BOM) di bawah ini.'}
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nama Produk</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Kode Produk</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!!selectedProduct} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                control={form.control}
                                name="purchasePrice"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Harga Pokok</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="salePrice"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Harga Jual</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Stok Awal</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih satuan" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            <SelectItem value="pcs">Pcs</SelectItem>
                                            <SelectItem value="roll">Roll</SelectItem>
                                            <SelectItem value="meter">Meter</SelectItem>
                                            <SelectItem value="set">Set</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <Separator />
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h4 className="font-medium">Bill of Materials (BOM)</h4>
                                        <p className="text-sm text-muted-foreground">Daftar kebutuhan material untuk membuat 1 unit produk.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ materialName: '', quantity: 1, unit: 'pcs' })}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Material</Button>
                                </div>
                                <div className="space-y-4 pt-2">
                                {fields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 items-start gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`bom.${index}.materialName`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-5">
                                                    <FormControl><Input placeholder="Nama Material" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`bom.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormControl><Input type="number" placeholder="Jumlah" {...field} /></FormControl>
                                                     <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`bom.${index}.unit`}
                                            render={({ field }) => (
                                            <FormItem className="col-span-3">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <Button type="button" variant="ghost" size="icon" className="col-span-1 mt-1" onClick={() => remove(index)}>
                                            <MinusCircle className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
           </Dialog>

           {/* Stock Edit Dialog */}
            <Dialog open={isStockDialogOpen} onOpenChange={setStockDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <Form {...stockForm}>
                        <form onSubmit={stockForm.handleSubmit(onStockSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Ubah Stok: {selectedProduct?.name}</DialogTitle>
                                <DialogDescription>
                                    Sesuaikan jumlah stok untuk produk ini.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={stockForm.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Jumlah Stok Baru</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Simpan Stok</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </CardContent>
      </Card>
    </div>
  );
}
