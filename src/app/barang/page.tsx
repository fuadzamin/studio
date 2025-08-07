"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  File,
  Trash2,
  Edit,
  Plus,
  Minus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";

const initialProducts = [
  {
    id: "1",
    name: "Nurse Call Unit",
    code: "NC001",
    purchasePrice: 1500000,
    salePrice: 1750000,
    stock: 15,
    unit: "pcs",
  },
  {
    id: "2",
    name: "Digital Mosque Clock",
    code: "JDM01",
    purchasePrice: 2000000,
    salePrice: 2500000,
    stock: 8,
    unit: "pcs",
  },
  {
    id: "3",
    name: "Queuing Machine Display",
    code: "QM003",
    purchasePrice: 800000,
    salePrice: 1000000,
    stock: 25,
    unit: "pcs",
  },
  {
    id: "4",
    name: "LED Running Text Board",
    code: "LED-R-5M",
    purchasePrice: 500000,
    salePrice: 650000,
    stock: 12,
    unit: "roll",
  },
   {
    id: "5",
    name: "Power Supply 12V 5A",
    code: "PSU-12-5",
    purchasePrice: 75000,
    salePrice: 100000,
    stock: 50,
    unit: "pcs",
  },
];


export default function BarangPage() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Manajemen Barang</h1>
        <p className="text-muted-foreground mt-2">
          Tambah, edit, hapus, dan cari produk dalam inventaris Anda.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Kelola produk Anda dan lihat status stok.
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Produk
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Produk Baru</DialogTitle>
                    <DialogDescription>
                      Isi detail produk baru di bawah ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product_name" className="text-right">Nama</Label>
                      <Input id="product_name" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product_code" className="text-right">Kode</Label>
                      <Input id="product_code" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchase_price" className="text-right">Harga Beli</Label>
                      <Input id="purchase_price" type="number" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sale_price" className="text-right">Harga Jual</Label>
                      <Input id="sale_price" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">Stok</Label>
                      <Input id="stock" type="number" className="col-span-3" />
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
                    <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                      {product.stock} {product.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                        </DialogTrigger>
                         <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Plus className="mr-2 h-4 w-4" />/<Minus className="mr-2 h-4 w-4" /> 
                                Sesuaikan Stok
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog (shared with add) */}
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Ubah detail produk di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_name_edit" className="text-right">Nama</Label>
              <Input id="product_name_edit" defaultValue="Nurse Call Unit" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_code_edit" className="text-right">Kode</Label>
              <Input id="product_code_edit" defaultValue="NC001" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase_price_edit" className="text-right">Harga Beli</Label>
              <Input id="purchase_price_edit" type="number" defaultValue="1500000" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale_price_edit" className="text-right">Harga Jual</Label>
              <Input id="sale_price_edit" type="number" defaultValue="1750000" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock_edit" className="text-right">Stok</Label>
              <Input id="stock_edit" type="number" defaultValue="15" className="col-span-3" readOnly />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit_edit" className="text-right">Satuan</Label>
               <Select defaultValue="pcs">
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
          <DialogFooter>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      
      {/* Stock Adjustment Dialog */}
       <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sesuaikan Stok Produk</DialogTitle>
             <DialogDescription>
                Produk: Nurse Call Unit (NC001) - Stok Saat Ini: 15 pcs
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adjustment_type" className="text-right">Jenis</Label>
                 <Select defaultValue="tambah">
                    <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih jenis penyesuaian" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="tambah">Tambah Stok</SelectItem>
                    <SelectItem value="kurang">Kurangi Stok</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment_quantity" className="text-right">Jumlah</Label>
              <Input id="adjustment_quantity" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adjustment_reason" className="text-right">Alasan</Label>
                <Textarea id="adjustment_reason" className="col-span-3" placeholder="Contoh: Stok opname, barang rusak, dll."/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Simpan Penyesuaian</Button>
          </DialogFooter>
        </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk
            secara permanen. Produk yang terkait dengan transaksi tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

    </div>
  );
}
