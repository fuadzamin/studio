"use client"

import { useState } from "react"
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

const salesOrders = [
  {
    id: "SO-001",
    date: "2024-05-20",
    customer: "PT Sejahtera Abadi",
    products: "10x Nurse Call Unit",
    total: 17500000,
    status: "Selesai",
  },
  {
    id: "SO-002",
    date: "2024-05-22",
    customer: "CV Maju Jaya",
    products: "5x Digital Mosque Clock",
    total: 25000000,
    status: "Diproses",
  },
  {
    id: "SO-003",
    date: "2024-05-25",
    customer: "RS Harapan Bunda",
    products: "7x Queuing Machine Display",
    total: 8750000,
    status: "Baru",
  },
];

type Order = typeof salesOrders[0];

export default function PenjualanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
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
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Pesanan Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SO</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Produk</TableHead>
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
                   <TableCell>{order.products}</TableCell>
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
                             <Label htmlFor="products_edit" className="text-right">Produk</Label>
                             <Textarea id="products_edit" defaultValue={selectedOrder?.products} className="col-span-3" />
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
