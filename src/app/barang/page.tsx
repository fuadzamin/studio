
"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  File,
  Trash2,
  Edit,
  MinusCircle,
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
import { Label } from "@/components/ui/label";
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

type BomItem = {
  materialName: string;
  quantity: number;
  unit: string;
};

type Product = {
  id: string;
  name: string;
  code: string;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  bom: BomItem[];
};

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Nurse Call Unit",
    code: "NC001",
    purchasePrice: 1500000,
    salePrice: 1750000,
    unit: "pcs",
    bom: [
        { materialName: "Mainboard V1.2", quantity: 1, unit: "pcs" },
        { materialName: "Casing Box", quantity: 1, unit: "pcs" },
        { materialName: "Kabel Power", quantity: 1, unit: "meter" },
    ]
  },
  {
    id: "2",
    name: "Digital Mosque Clock",
    code: "JDM01",
    purchasePrice: 2000000,
    salePrice: 2500000,
    unit: "pcs",
     bom: [
        { materialName: "Panel P10", quantity: 6, unit: "pcs" },
        { materialName: "Controller JWS", quantity: 1, unit: "pcs" },
        { materialName: "Power Supply 5V", quantity: 1, unit: "pcs" },
    ]
  },
  {
    id: "3",
    name: "Queuing Machine Display",
    code: "QM003",
    purchasePrice: 800000,
    salePrice: 1000000,
    unit: "pcs",
    bom: []
  },
  {
    id: "4",
    name: "LED Running Text Board",
    code: "LED-R-5M",
    purchasePrice: 500000,
    salePrice: 650000,
    unit: "roll",
    bom: []
  },
   {
    id: "5",
    name: "Power Supply 12V 5A",
    code: "PSU-12-5",
    purchasePrice: 75000,
    salePrice: 100000,
    unit: "pcs",
    bom: []
  },
];


export default function BarangPage() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setBomItems(product.bom);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleAddBomItem = () => {
    setBomItems([...bomItems, { materialName: "", quantity: 1, unit: "pcs" }]);
  };

  const handleRemoveBomItem = (index: number) => {
    const newBomItems = bomItems.filter((_, i) => i !== index);
    setBomItems(newBomItems);
  };

  const handleBomItemChange = (index: number, field: keyof BomItem, value: string | number) => {
    const newBomItems = [...bomItems];
    (newBomItems[index] as any)[field] = value;
    setBomItems(newBomItems);
  };
  
  const openAddDialog = () => {
    setSelectedProduct(null);
    setBomItems([]);
    setAddDialogOpen(true);
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Manajemen Produk</h1>
        <p className="text-muted-foreground mt-2">
          Tambah, edit, dan hapus produk (build-to-order) beserta Bill of Materials-nya.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Kelola produk Anda yang dibuat berdasarkan pesanan.
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
              <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Produk
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Tambah Produk Baru</DialogTitle>
                    <DialogDescription>
                      Isi detail produk baru dan komponen Bill of Materials (BOM) di bawah ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                     <div className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="product_name" className="text-right">Nama</Label>
                          <Input id="product_name" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="product_code" className="text-right">Kode</Label>
                          <Input id="product_code" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="purchase_price" className="text-right">Harga Pokok</Label>
                          <Input id="purchase_price" type="number" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="sale_price" className="text-right">Harga Jual</Label>
                          <Input id="sale_price" type="number" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">Satuan</Label>
                           <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Pilih satuan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs">Pcs</SelectItem>
                              <SelectItem value="roll">Roll</SelectItem>
                              <SelectItem value="meter">Meter</SelectItem>
                               <SelectItem value="set">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                     </div>
                     <Separator className="my-4" />
                     <div>
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="font-medium">Bill of Materials (BOM)</h4>
                            <Button variant="outline" size="sm" onClick={handleAddBomItem}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Material</Button>
                        </div>
                        <div className="space-y-4">
                          {bomItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 items-center gap-2">
                                <Input 
                                    placeholder="Nama Material" 
                                    className="col-span-5" 
                                    value={item.materialName} 
                                    onChange={(e) => handleBomItemChange(index, 'materialName', e.target.value)}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="Jumlah" 
                                    className="col-span-3" 
                                    value={item.quantity}
                                    onChange={(e) => handleBomItemChange(index, 'quantity', parseInt(e.target.value))}
                                />
                                <Select 
                                    value={item.unit}
                                    onValueChange={(value) => handleBomItemChange(index, 'unit', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="pcs">Pcs</SelectItem>
                                    <SelectItem value="roll">Roll</SelectItem>
                                    <SelectItem value="meter">Meter</SelectItem>
                                    <SelectItem value="cm">Cm</SelectItem>
                                    <SelectItem value="liter">Liter</SelectItem>
                                    <SelectItem value="gram">Gram</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="col-span-1" onClick={() => handleRemoveBomItem(index)}>
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
                </DialogContent>
              </Dialog>
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
                <TableHead>Satuan</TableHead>
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
                    {product.unit}
                  </TableCell>
                  <TableCell>
                     <Dialog open={isEditDialogOpen && selectedProduct?.id === product.id} onOpenChange={setEditDialogOpen}>
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
                             <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={() => handleEditClick(product)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                             </DialogTrigger>
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
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                       <DialogContent className="sm:max-w-xl">
                         <DialogHeader>
                           <DialogTitle>Edit Produk</DialogTitle>
                           <DialogDescription>
                             Ubah detail produk dan komponen Bill of Materials (BOM) di bawah ini.
                           </DialogDescription>
                         </DialogHeader>
                          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                            <div className="space-y-4">
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="product_name_edit" className="text-right">Nama</Label>
                                <Input id="product_name_edit" defaultValue={selectedProduct?.name} className="col-span-3" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="product_code_edit" className="text-right">Kode</Label>
                                <Input id="product_code_edit" defaultValue={selectedProduct?.code} className="col-span-3" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="purchase_price_edit" className="text-right">Harga Pokok</Label>
                                <Input id="purchase_price_edit" type="number" defaultValue={selectedProduct?.purchasePrice} className="col-span-3" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sale_price_edit" className="text-right">Harga Jual</Label>
                                <Input id="sale_price_edit" type="number" defaultValue={selectedProduct?.salePrice} className="col-span-3" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit_edit" className="text-right">Satuan</Label>
                                 <Select defaultValue={selectedProduct?.unit}>
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih satuan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pcs">Pcs</SelectItem>
                                    <SelectItem value="roll">Roll</SelectItem>
                                    <SelectItem value="meter">Meter</SelectItem>
                                     <SelectItem value="set">Set</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <div>
                               <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">Bill of Materials (BOM)</h4>
                                   <Button variant="outline" size="sm" onClick={handleAddBomItem}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Material</Button>
                               </div>
                               <div className="space-y-4">
                                 {bomItems.map((item, index) => (
                                   <div key={index} className="grid grid-cols-12 items-center gap-2">
                                       <Input 
                                           placeholder="Nama Material" 
                                           className="col-span-5" 
                                           value={item.materialName} 
                                           onChange={(e) => handleBomItemChange(index, 'materialName', e.target.value)}
                                       />
                                       <Input 
                                           type="number" 
                                           placeholder="Jumlah" 
                                           className="col-span-3" 
                                           value={item.quantity}
                                           onChange={(e) => handleBomItemChange(index, 'quantity', parseInt(e.target.value))}
                                       />
                                       <Select 
                                           value={item.unit}
                                           onValueChange={(value) => handleBomItemChange(index, 'unit', value)}
                                       >
                                           <SelectTrigger className="col-span-3">
                                           <SelectValue placeholder="Satuan" />
                                           </SelectTrigger>
                                           <SelectContent>
                                           <SelectItem value="pcs">Pcs</SelectItem>
                                           <SelectItem value="roll">Roll</SelectItem>
                                           <SelectItem value="meter">Meter</SelectItem>
                                           <SelectItem value="cm">Cm</SelectItem>
                                           <SelectItem value="liter">Liter</SelectItem>
                                           <SelectItem value="gram">Gram</SelectItem>
                                           </SelectContent>
                                       </Select>
                                       <Button variant="ghost" size="icon" className="col-span-1" onClick={() => handleRemoveBomItem(index)}>
                                           <MinusCircle className="h-4 w-4 text-destructive"/>
                                       </Button>
                                   </div>
                                 ))}
                               </div>
                            </div>
                         </div>
                         <DialogFooter>
                           <Button type="submit">Simpan Perubahan</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    
    