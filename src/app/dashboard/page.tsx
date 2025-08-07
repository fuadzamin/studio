
"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingCart, AlertCircle, Factory, Package, Code, CheckCircle } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useContext } from "react";
import { ProductContext } from "@/contexts/ProductContext";
import { MaterialContext } from "@/contexts/MaterialContext";

const chartData = [
  { month: "Jan", income: 45000, expense: 22000 },
  { month: "Feb", income: 48000, expense: 25000 },
  { month: "Mar", income: 52000, expense: 28000 },
  { month: "Apr", income: 55000, expense: 30000 },
  { month: "May", income: 58000, expense: 32000 },
  { month: "Jun", income: 61000, expense: 35000 },
];

export default function DashboardPage() {
  const productContext = useContext(ProductContext);
  const materialContext = useContext(MaterialContext);

  if (!productContext || !materialContext) {
    return <div>Loading...</div>; // Or a proper loading state
  }

  const { products } = productContext;
  const { materials } = materialContext;

  const productionPotential = products
    .filter(p => p.bom && p.bom.length > 0)
    .map(product => {
      let maxPossibleUnits = Infinity;

      product.bom.forEach(bomItem => {
        const material = materials.find(m => m.name === bomItem.materialName);
        const stock = material ? material.stock : 0;
        const possibleUnits = Math.floor(stock / bomItem.quantity);
        if (possibleUnits < maxPossibleUnits) {
          maxPossibleUnits = possibleUnits;
        }
      });
      
      // If a material is not in stock at all, maxPossibleUnits will be Infinity, so we reset to 0
      if(maxPossibleUnits === Infinity) maxPossibleUnits = 0;

      return {
        code: product.code,
        name: product.name,
        producibleUnits: maxPossibleUnits,
        unit: product.unit,
      };
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Berikut adalah ringkasan performa bisnis Anda.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan (Bulan Ini)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 61.000.000</div>
            <p className="text-xs text-muted-foreground">+5.2% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba (Bulan Ini)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 26.000.000</div>
            <p className="text-xs text-muted-foreground">+8.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Baru</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">di bulan ini</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Penjualan Baru</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+35</div>
            <p className="text-xs text-muted-foreground">di bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
                income: { label: "Income", color: "hsl(var(--chart-1))" },
                expense: { label: "Expense", color: "hsl(var(--chart-2))" },
            }} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${Number(value) / 1000}k`}/>
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2">
             <Factory className="h-5 w-5 text-primary" />
            <CardTitle>Potensi Produksi</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {productionPotential.map((item) => (
                    <Card key={item.code}>
                        <CardHeader>
                           <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-5 w-5" /> {item.name}
                           </CardTitle>
                           <CardDescription>
                               <span className="flex items-center gap-2"><Code className="h-4 w-4"/> {item.code}</span>
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Dapat Dibuat</span>
                            <Badge variant={item.producibleUnits > 0 ? "default" : "destructive"} className={item.producibleUnits > 0 ? 'bg-blue-600' : ''}>
                                {`${item.producibleUnits} ${item.unit}`}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead className="text-right">Dapat Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionPotential.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={item.producibleUnits > 0 ? "default" : "destructive"} className={item.producibleUnits > 0 ? 'bg-blue-600' : ''}>
                        {`${item.producibleUnits} ${item.unit}`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
