"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const monthlyProfitLossData = [
  { month: "Januari", income: 45000000, expense: 22000000, profit: 23000000 },
  { month: "Februari", income: 48000000, expense: 25000000, profit: 23000000 },
  { month: "Maret", income: 52000000, expense: 28000000, profit: 24000000 },
  { month: "April", income: 55000000, expense: 30000000, profit: 25000000 },
  { month: "Mei", income: 58000000, expense: 32000000, profit: 26000000 },
  { month: "Juni", income: 61000000, expense: 35000000, profit: 26000000 },
];

export default function LaporanPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Laporan Laba Rugi</h1>
        <p className="text-muted-foreground mt-2">
          Analisis ringkasan pemasukan, pengeluaran, dan laba bersih bulanan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Laba Rugi Bulanan</CardTitle>
          <CardDescription>Visualisasi performa keuangan perusahaan Anda per bulan.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={{
                income: { label: "Pemasukan", color: "hsl(var(--chart-1))" },
                expense: { label: "Pengeluaran", color: "hsl(var(--chart-2))" },
            }} className="h-[350px] w-full">
            <BarChart accessibilityLayer data={monthlyProfitLossData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${Number(value) / 1000000} Jt`}/>
                  <Tooltip 
                    cursor={false} 
                    content={<ChartTooltipContent 
                        formatter={(value, name) => (
                            <div className="flex flex-col">
                                <span>{formatCurrency(value as number)}</span>
                            </div>
                        )}
                    />} 
                   />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Rincian Laba Rugi Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bulan</TableHead>
                        <TableHead className="text-right">Pemasukan</TableHead>
                        <TableHead className="text-right">Pengeluaran</TableHead>
                        <TableHead className="text-right">Laba Bersih</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {monthlyProfitLossData.map((data) => (
                        <TableRow key={data.month}>
                            <TableCell className="font-medium">{data.month}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(data.income)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(data.expense)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(data.profit)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
