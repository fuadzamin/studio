
"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Edit,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CustomerContext, Customer, CustomerFormValues, customerSchema } from "@/contexts/CustomerContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function PelangganPage() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("PelangganPage must be used within a CustomerProvider");
  }
  const { customers, addCustomer, updateCustomer, deleteCustomer } = context;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
      email: "",
    },
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddClick = () => {
    setSelectedCustomer(null);
    form.reset();
    setAddEditDialogOpen(true);
  };
  
  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.reset(customer);
    setAddEditDialogOpen(true);
  };
  
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      toast({
        title: "Sukses",
        description: `Pelanggan "${selectedCustomer.name}" berhasil dihapus.`,
      });
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const onSubmit = (data: CustomerFormValues) => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, data);
      toast({
        title: "Sukses",
        description: "Data pelanggan berhasil diperbarui.",
      });
    } else {
      addCustomer(data);
      toast({
        title: "Sukses",
        description: "Pelanggan baru berhasil ditambahkan.",
      });
    }
    setAddEditDialogOpen(false);
    setSelectedCustomer(null);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Pelanggan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola data pelanggan untuk transaksi dan pelaporan.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
          <CardDescription>
            Kelola data pelanggan Anda.
          </CardDescription>
          <div className="flex items-center justify-between pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pelanggan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Pelanggan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <DialogHeader>
                        <DialogTitle>{selectedCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alamat</FormLabel>
                              <FormControl><Textarea {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kontak</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl><Input type="email" {...field} /></FormControl>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <AlertDialog open={isDeleteDialogOpen && selectedCustomer?.id === customer.id} onOpenChange={setDeleteDialogOpen}>
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
                          <DropdownMenuItem onSelect={() => handleEditClick(customer)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteClick(customer) }} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                           </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pelanggan "{selectedCustomer?.name}" secara permanen.
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
    </div>
  );
}
