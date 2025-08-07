
"use client"

import { useState, useContext, useMemo } from "react"
import { MoreHorizontal, PlusCircle, Search, FileText, Send, Edit, Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns"


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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ProductContext } from "@/contexts/ProductContext"
import { CustomerContext } from "@/contexts/CustomerContext"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"


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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const productContext = useContext(ProductContext);
  const customerContext = useContext(CustomerContext);

  if (!productContext || !customerContext) {
    throw new Error("PenjualanPage must be used within a ProductProvider and CustomerProvider");
  }
  const { products } = productContext;
  const { customers, addCustomer } = customerContext;
  const { toast } = useToast();

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };
  
  const handleCreateOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customerName = formData.get("customer") as string;
    
    // Check if customer exists, if not, add them
    const customerExists = customers.some(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!customerExists && customerName) {
      addCustomer({
        name: customerName,
        address: "Alamat belum diisi",
        contact: "Kontak belum diisi",
        email: "email@belumdiisi.com",
      });
      toast({
        title: "Pelanggan Baru Ditambahkan",
        description: `"${customerName}" telah ditambahkan ke daftar pelanggan.`,
      });
    }

    const newOrder: Order = {
      id: `SO-${String(salesOrders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customer: customerName,
      productName: formData.get("productName") as string,
      quantity: Number(formData.get("quantity")),
      total: Number(formData.get("total")),
      status: "Baru",
    };
    
    setSalesOrders(prevOrders => [newOrder, ...prevOrders]);
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

  const filteredOrders = useMemo(() => {
    let filtered = salesOrders.filter((order) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(searchTermLower) ||
            order.customer.toLowerCase().includes(searchTermLower) ||
            order.productName.toLowerCase().includes(searchTermLower)
        );
    });

    if (dateRange?.from) {
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        filtered = filtered.filter((order) => {
            const orderDate = parseISO(order.date);
            return isWithinInterval(orderDate, { start: startOfDay(dateRange.from!), end: toDate });
        });
    }
    
    return filtered;
  }, [salesOrders, searchTerm, dateRange]);


  const handlePresetFilterChange = (value: string) => {
    const now = new Date();
    switch (value) {
        case "today":
            setDateRange({ from: startOfDay(now), to: endOfDay(now) });
            break;
        case "this_week":
            setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
            break;
        case "this_month":
            setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
            break;
        case "this_year":
            setDateRange({ from: startOfYear(now), to: endOfYear(now) });
            break;
        default:
            setDateRange(undefined);
    }
  };

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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
             <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
                 <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari pesanan, produk, pelanggan..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select onValueChange={handlePresetFilterChange}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Filter Waktu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="this_week">Minggu Ini</SelectItem>
                            <SelectItem value="this_month">Bulan Ini</SelectItem>
                            <SelectItem value="this_year">Tahun Ini</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full sm:w-[260px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pilih tanggal</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="w-full sm:w-auto">
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
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
