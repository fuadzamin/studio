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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const transactions = [
  { id: "1", date: "2024-05-01", category: "Pembelian Bahan", description: "Pembelian Panel P10", type: "expense", amount: 5000000 },
  { id: "2", date: "2024-05-03", category: "Penjualan", description: "Penjualan Nurse Call ke RS Harapan", type: "income", amount: 17500000 },
  { id: "3", date: "2024-05-05", category: "Gaji Karyawan", description: "Gaji bulan April", type: "expense", amount: 15000000 },
  { id: "4", date: "2024-05-10", category: "Penjualan", description: "Penjualan JDM ke Masjid Al-Ikhlas", type: "income", amount: 25000000 },
  { id: "5", date: "2024-05-12", category: "Operasional", description: "Bayar listrik dan internet", type: "expense", amount: 1500000 },
];

export default function KeuanganPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Keuangan</h1>
        <p className="text-muted-foreground mt-2">
          Catat pengeluaran dan pemasukan untuk memantau kesehatan finansial bisnis Anda.
        </p>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Semua Transaksi</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          </TabsList>
           <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Catat Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Catat Transaksi Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Jenis</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Tanggal</Label>
                  <Input id="date" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Nominal</Label>
                  <Input id="amount" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Kategori</Label>
                  <Input id="category" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Keterangan</Label>
                  <Textarea id="description" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="all">
          <TransactionTable transactions={transactions} title="Semua Transaksi" />
        </TabsContent>
        <TabsContent value="income">
          <TransactionTable transactions={transactions.filter(t => t.type === 'income')} title="Pemasukan" />
        </TabsContent>
        <TabsContent value="expense">
          <TransactionTable transactions={transactions.filter(t => t.type === 'expense')} title="Pengeluaran" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionTable({ transactions, title }: { transactions: typeof transactions, title: string }) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Daftar semua transaksi keuangan yang tercatat.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={transaction.type === 'income' ? 'bg-green-600' : ''}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
