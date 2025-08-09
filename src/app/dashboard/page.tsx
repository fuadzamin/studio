
"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingCart, Factory, Package, Code, Calendar as CalendarIcon } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useContext, useState, useMemo } from "react";
import { ProductContext } from "@/contexts/ProductContext";
import { MaterialContext } from "@/contexts/MaterialContext";
import { SalesOrderContext } from "@/contexts/SalesOrderContext";
import { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomerContext } from "@/contexts/CustomerContext";
import { Calendar } from "@/components/ui/calendar";


const chartDataMonthly = [
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
  const salesOrderContext = useContext(SalesOrderContext);
  const customerContext = useContext(CustomerContext);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
  });

  if (!productContext || !materialContext || !salesOrderContext || !customerContext) {
    return <div>Loading...</div>; 
  }

  const { products } = productContext;
  const { materials } = materialContext;
  const { salesOrders } = salesOrderContext;
  const { customers } = customerContext;

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

  const filteredData = useMemo(() => {
    if (!dateRange?.from) {
        return {
            totalSales: 0,
            totalProfit: 0,
            newCustomers: 0,
            newOrders: 0,
            chartData: []
        };
    }
    const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    
    const ordersInRange = salesOrders.filter(d => isWithinInterval(parseISO(d.date), { start: startOfDay(dateRange.from!), end: toDate }));
    
    const summary = ordersInRange.reduce((acc, order) => {
        acc.totalSales += order.total;
        const product = products.find(p => p.name === order.productName);
        const cost = product ? product.purchasePrice * order.quantity : 0;
        acc.totalProfit += (order.total - cost);
        return acc;
    }, { totalSales: 0, totalProfit: 0 });

    const newCustomersInRange = customers.filter(c => c.id.startsWith('cust_') && isWithinInterval(new Date(parseInt(c.id.split('_')[1])), { start: startOfDay(dateRange.from!), end: toDate })).length;


    const dailyChartData = eachDayOfInterval({ start: startOfDay(dateRange.from), end: toDate }).map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const ordersForDay = salesOrders.filter(d => d.date === dayStr);
        const income = ordersForDay.reduce((sum, order) => sum + order.total, 0);
        const expense = ordersForDay.reduce((sum, order) => {
            const product = products.find(p => p.name === order.productName);
            const cost = product ? product.purchasePrice * order.quantity : 0;
            return sum + cost;
        }, 0);

        return {
            date: format(day, 'dd/MM'),
            income: income,
            expense: expense,
        }
    });

    return { 
        ...summary, 
        newOrders: ordersInRange.length,
        newCustomers: newCustomersInRange,
        chartData: dailyChartData,
    };

  }, [dateRange, salesOrders, products, customers]);

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
      
      if(maxPossibleUnits === Infinity) maxPossibleUnits = 0;

      return {
        code: product.code,
        name: product.name,
        producibleUnits: maxPossibleUnits,
        unit: product.unit,
        currentStock: product.stock,
      };
    });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
            Berikut adalah ringkasan performa bisnis Anda.
            </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <Select onValueChange={handlePresetFilterChange} defaultValue="this_month">
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
                    <span>Pilih rentang tanggal</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(filteredData.totalSales)}</div>
            <p className="text-xs text-muted-foreground">dalam rentang terpilih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(filteredData.totalProfit)}</div>
             <p className="text-xs text-muted-foreground">dalam rentang terpilih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Baru</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{filteredData.newCustomers}</div>
             <p className="text-xs text-muted-foreground">dalam rentang terpilih</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Penjualan Baru</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{filteredData.newOrders}</div>
             <p className="text-xs text-muted-foreground">dalam rentang terpilih</p>
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
               <div className="h-full w-full">
                 <BarChart accessibilityLayer data={dateRange ? filteredData.chartData : chartDataMonthly}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey={dateRange ? "date" : "month"} tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${Number(value) / 1000}k`}/>
                  <Tooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                </BarChart>
               </div>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2">
             <Factory className="h-5 w-5 text-primary" />
            <CardTitle>Stok & Potensi Produksi</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <CardContent className="grid grid-cols-2 gap-2 text-sm">
                           <div className="flex flex-col">
                                <span className="text-muted-foreground">Stok Tersedia</span>
                                <span className="font-bold">{item.currentStock} {item.unit}</span>
                           </div>
                           <div className="flex flex-col">
                               <span className="text-muted-foreground">Dapat Dibuat</span>
                                <Badge variant={item.producibleUnits > 0 ? "default" : "destructive"} className={`w-fit ${item.producibleUnits > 0 ? 'bg-blue-600' : ''}`}>
                                    {`${item.producibleUnits} ${item.unit}`}
                                </Badge>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                  <TableHead className="text-right">Dapat Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionPotential.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.currentStock} {item.unit}</TableCell>
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
