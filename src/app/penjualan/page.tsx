"use client"

import { useState, useContext } from "react"
import { MoreHorizontal, PlusCircle, Search, FileText, Send, Edit } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductContext } from "@/contexts/ProductContext"
import { useToast } from "@/hooks/use-toast"


const initialSalesOrders = [
  {
    id: "SO-001",
    date: "2024-05-20",
    customer: "PT Sejahtera Abadi",
    productName: "Nurse Call Unit",
    quantity: 10,
    total: 17500000,
    status: "Selesai",
  },
  {
    id: "SO-002",
    date: "2024-05-22",
    customer: "CV Maju Jaya",
    productName: "Digital Mosque Clock",
    quantity: 5,
    total: 25000000,
    status: "Diproses",
  },
  {
    id: "SO-003",
    date: "2024-05-25",
    customer: "RS Harapan Bunda",
    productName: "Queuing Machine Display",
    quantity: 7,
    total: 8750000,
    status: "Baru",
  },
];

type Order = typeof initialSalesOrders[0];

export default function PenjualanPage() {
  const [salesOrders, setSalesOrders] = useState(initialSalesOrders);
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const productContext = useContext(ProductContext);
  if (!productContext) {
    throw new Error("PenjualanPage must be used within a ProductProvider");
  }
  const { products } = productContext;
  const { toast } = useToast();

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };
  
  const handleCreateOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newOrder: Order = {
      id: `SO-${String(salesOrders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customer: formData.get("customer") as string,
      productName: formData.get("productName") as string,
      quantity: Number(formData.get("quantity")),
      total: Number(formData.get("total")),
      status: "Baru",
    };
    
    setSalesOrders(prevOrders => [...prevOrders, newOrder]);
    toast({
        title: "Sukses!",
        description: "Pesanan penjualan baru berhasil dibuat.",
    });
    setAddDialogOpen(false);
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Selesai":
        return "default"
      case "Diproses":
        return "secondary"
      case "Baru":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const filteredOrders = salesOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pesanan Penjualan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pesanan dari pelanggan, buat invoice, dan lacak status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>
            Lihat dan kelola semua pesanan penjualan.
          </CardDescription>
          <div className="flex items-center justify-between pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pesanan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Pesanan Baru
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Buat Pesanan Penjualan Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrder}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="so_id" className="text-right">Nomor SO</Label>
                                <Input id="so_id" value={`SO-${String(salesOrders.length + 1).padStart(3, '0')}`} className="col-span-3" disabled />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Tanggal</Label>
                                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="customer" className="text-right">Pelanggan</Label>
                                <Input id="customer" name="customer" placeholder="Nama pelanggan" className="col-span-3" required/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="productName" className="text-right">Produk</Label>
                                <Select name="productName">
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                                <Input id="quantity" name="quantity" type="number" placeholder="0" className="col-span-3" required/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="total" className="text-right">Total Harga</Label>
                                <Input id="total" name="total" type="number" placeholder="Rp 0" className="col-span-3" required/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Simpan Pesanan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SO</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                   <TableCell>{order.productName}</TableCell>
                   <TableCell>{order.quantity}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isEditDialogOpen && selectedOrder?.id === order.id} onOpenChange={(isOpen) => !isOpen && setEditDialogOpen(false)}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                           <DropdownMenuItem onSelect={() => handleEditClick(order)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                           </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> Buat Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" /> Buat Surat Jalan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                           <DialogTitle>Edit Pesanan Penjualan</DialogTitle>
                           <DialogDescription>
                             Ubah detail pesanan di bawah ini.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="so_id_edit" className="text-right">Nomor SO</Label>
                             <Input id="so_id_edit" defaultValue={selectedOrder?.id} className="col-span-3" disabled />
                           </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="date_edit" className="text-right">Tanggal</Label>
                              <Input id="date_edit" type="date" defaultValue={selectedOrder?.date} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="customer_edit" className="text-right">Pelanggan</Label>
                             <Input id="customer_edit" defaultValue={selectedOrder?.customer} className="col-span-3" />
                           </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="product_name_edit" className="text-right">Nama Produk</Label>
                             <Input id="product_name_edit" defaultValue={selectedOrder?.productName} className="col-span-3" />
                           </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="quantity_edit" className="text-right">Jumlah</Label>
                             <Input id="quantity_edit" type="number" defaultValue={selectedOrder?.quantity} className="col-span-3" />
                           </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="total_edit" className="text-right">Total</Label>
                             <Input id="total_edit" type="number" defaultValue={selectedOrder?.total} className="col-span-3" />
                           </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="status_edit" className="text-right">Status</Label>
                              <Select defaultValue={selectedOrder?.status}>
                               <SelectTrigger className="col-span-3">
                                 <SelectValue placeholder="Pilih status" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Baru">Baru</SelectItem>
                                 <SelectItem value="Diproses">Diproses</SelectItem>
                                 <SelectItem value="Selesai">Selesai</SelectItem>
                                  <SelectItem value="Batal">Batal</SelectItem>
                               </SelectContent>
                             </Select>
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
