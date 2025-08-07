"use client";

import { useState, useMemo, useContext } from "react";
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
import { ProductContext } from "@/contexts/ProductContext";
import { MaterialContext } from "@/contexts/MaterialContext";
import { useToast } from "@/hooks/use-toast";


const initialTransactions = [
  { id: "1", date: "2024-05-01", category: "Pembelian Bahan", description: "Pembelian Panel P10 (10 pcs)", type: "expense", amount: 5000000 },
  { id: "2", date: "2024-05-03", category: "Penjualan", description: "Penjualan Nurse Call ke RS Harapan", type: "income", amount: 17500000 },
  { id: "3", date: "2024-05-05", category: "Gaji Karyawan", description: "Gaji bulan April", type: "expense", amount: 15000000 },
  { id: "4", date: "2024-05-10", category: "Penjualan", description: "Penjualan JDM ke Masjid Al-Ikhlas", type: "income", amount: 25000000 },
  { id: "5", date: "2024-05-12", category: "Operasional", description: "Bayar listrik dan internet", type: "expense", amount: 1500000 },
];

type Transaction = typeof initialTransactions[0];

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  
  const productContext = useContext(ProductContext);
  const materialContext = useContext(MaterialContext);
  const { toast } = useToast();

  const [transactionType, setTransactionType] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [description, setDescription] = useState("");
  
  const [selectedMaterial, setSelectedMaterial] = useState<{name: string, unit: string} | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);

  if (!productContext || !materialContext) {
    throw new Error("KeuanganPage must be used within a ProductProvider and MaterialProvider");
  }
  const { products } = productContext;
  const { addStock } = materialContext;
  
  const allBomMaterials = useMemo(() => {
    const materialMap = new Map<string, { name: string, unit: string }>();
    products.forEach(product => {
        product.bom.forEach(item => {
            if (!materialMap.has(item.materialName)) {
                materialMap.set(item.materialName, { name: item.materialName, unit: item.unit });
            }
        });
    });
    return Array.from(materialMap.values());
  }, [products]);


  const handleAddTransaction = () => {
    if (!transactionType || !transactionCategory || purchasePrice <= 0) {
        toast({ title: "Error", description: "Harap isi semua field yang diperlukan.", variant: "destructive" });
        return;
    }
    
    let finalDescription = "";
    
    if (transactionType === 'expense' && transactionCategory === 'Pembelian Bahan') {
        if (!selectedMaterial || purchaseQuantity <= 0) {
            toast({ title: "Error", description: "Harap pilih material dan masukkan jumlah.", variant: "destructive" });
            return;
        }
        finalDescription = `Pembelian ${selectedMaterial.name} (${purchaseQuantity} ${selectedMaterial.unit})`;
        addStock(selectedMaterial.name, purchaseQuantity, selectedMaterial.unit);
    } else {
        if (!description) {
            toast({ title: "Error", description: "Keterangan tidak boleh kosong.", variant: "destructive" });
            return;
        }
        finalDescription = description;
    }

    const newTransaction: Transaction = {
        id: `trans_${new Date().getTime()}`,
        date: new Date().toISOString().split('T')[0],
        category: transactionCategory,
        description: finalDescription,
        type: transactionType as 'income' | 'expense',
        amount: purchasePrice,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    toast({ title: "Sukses", description: "Transaksi baru berhasil ditambahkan." });
    setAddDialogOpen(false);
    // Reset form states
    setTransactionType("");
    setTransactionCategory("");
    setSelectedMaterial(null);
    setPurchaseQuantity(0);
    setPurchasePrice(0);
    setDescription("");
  };


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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Catat Transaksi Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Jenis</Label>
                  <Select onValueChange={setTransactionType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {transactionType === 'expense' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                        <Select onValueChange={setTransactionCategory}>
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih kategori pengeluaran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pembelian Bahan">Pembelian Bahan</SelectItem>
                                <SelectItem value="Gaji Karyawan">Gaji Karyawan</SelectItem>
                                <SelectItem value="Operasional">Operasional</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                 {transactionType === 'income' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                         <Select onValueChange={setTransactionCategory}>
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih kategori pemasukan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Penjualan">Penjualan</SelectItem>
                                <SelectItem value="Pendapatan Jasa">Pendapatan Jasa</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {transactionType === 'expense' && transactionCategory === 'Pembelian Bahan' ? (
                 <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="material" className="text-right">Material</Label>
                        <Select onValueChange={(value) => {
                            const material = allBomMaterials.find(m => m.name === value);
                            setSelectedMaterial(material || null);
                        }}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih material yang dibeli" />
                            </SelectTrigger>
                            <SelectContent>
                                {allBomMaterials.map(material => (
                                    <SelectItem key={material.name} value={material.name}>
                                        {material.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                        <div className="col-span-3 flex items-center gap-2">
                           <Input id="quantity" type="number" className="flex-1" value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(Number(e.target.value))} />
                           <span className="text-sm text-muted-foreground w-16">{selectedMaterial?.unit || 'Satuan'}</span>
                        </div>
                    </div>
                 </>
                ) : (
                    transactionType && transactionCategory && (
                         <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">Keterangan</Label>
                            <Textarea id="description" className="col-span-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Masukkan keterangan transaksi..."/>
                         </div>
                    )
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Total Harga</Label>
                  <Input id="amount" type="number" className="col-span-3" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Tanggal</Label>
                  <Input id="date" type="date" className="col-span-3" defaultValue={new Date().toISOString().split('T')[0]}/>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleAddTransaction}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="all">
          <TransactionTable transactions={transactions} title="Semua Transaksi" />
        </TabsContent>
        <TabsContent value="income">
          <TransactionTable transactions={transactions.filter(t => t.type === 'income')} title="Pemasukan" />
        </Tabs.Content>
        <TabsContent value="expense">
          <TransactionTable transactions={transactions.filter(t => t.type === 'expense')} title="Pengeluaran" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionTable({ transactions, title }: { transactions: typeof initialTransactions, title: string }) {
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

    