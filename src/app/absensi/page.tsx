
"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, UserCheck, UserX } from "lucide-react"
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


const employeeAttendance = [
    { id: "1", name: "Budi Santoso", status: "Hadir" },
    { id: "2", name: "Citra Lestari", status: "Hadir" },
    { id: "3", name: "Doni Firmansyah", status: "Tidak Hadir" },
    { id: "4", name: "Eka Putri", status: "Hadir" },
]

export default function AbsensiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

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
          <CardDescription>Pilih tanggal untuk mencatat atau melihat absensi.</CardDescription>
          <div className="pt-4">
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-[280px] justify-start text-left font-normal",
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
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead className="w-[200px]">Status Kehadiran</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employeeAttendance.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
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
