
"use client"

import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, UserCheck, UserX, Search } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"


const employeeAttendance = [
    { id: "1", name: "Budi Santoso", status: "Hadir", date: "2024-05-28" },
    { id: "2", name: "Citra Lestari", status: "Hadir", date: "2024-05-28" },
    { id: "3", name: "Doni Firmansyah", status: "Tidak Hadir", date: "2024-05-28" },
    { id: "4", name: "Eka Putri", status: "Hadir", date: "2024-05-28" },
]

export default function AbsensiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = useMemo(() => {
    // In a real app, you would filter by the selected date as well
    return employeeAttendance.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, date]);

  const handlePresetChange = (value: string) => {
    const now = new Date();
    if (value === 'today') {
      setDate(now);
    }
    // Note: weekly, monthly, yearly views would require more logic for aggregation
    // For now, we just set the date to today as a placeholder for these filters
     else {
      setDate(now);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Absensi Karyawan</h1>
        <p className="text-muted-foreground mt-2">
          Catat kehadiran harian karyawan dan lihat rekapitulasi.
        </p>
      </div>

      <Card>
         <CardHeader>
          <CardTitle>Catat Kehadiran Harian</CardTitle>
          <CardDescription>Pilih tanggal dan cari karyawan untuk mencatat atau melihat absensi.</CardDescription>
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
             <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama karyawan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Select onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="this_week">Minggu Ini</SelectItem>
                        <SelectItem value="this_month">Bulan Ini</SelectItem>
                        <SelectItem value="this_year">Tahun Ini</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="w-[200px]">Status Kehadiran</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                             <TableCell>{new Date(employee.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                            <TableCell>
                                <Select defaultValue={employee.status}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hadir">
                                            <div className="flex items-center">
                                                <UserCheck className="mr-2 h-4 w-4 text-green-600"/> Hadir
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Tidak Hadir">
                                             <div className="flex items-center">
                                                <UserX className="mr-2 h-4 w-4 text-red-600"/> Tidak Hadir
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <div className="flex justify-end mt-6">
                <Button>Simpan Absensi</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
