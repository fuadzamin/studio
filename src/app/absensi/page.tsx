
"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, UserCheck, UserX, Clock } from "lucide-react"
import { format } from "date-fns"
import { id as indonesiaLocale } from "date-fns/locale"

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


const initialAttendanceData = [
    { id: "1", name: "Budi Santoso", date: "2024-07-28", status: "Hadir", notes: "" },
    { id: "2", name: "Citra Lestari", date: "2024-07-28", status: "Hadir", notes: "" },
    { id: "3", name: "Doni Firmansyah", date: "2024-07-28", status: "Tidak Hadir", notes: "" },
    { id: "4", name: "Eka Putri", date: "2024-07-28", status: "Telat", notes: "Bocor ban di jalan" },
]

type AttendanceRecord = typeof initialAttendanceData[0];


export default function AbsensiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceData);

  const handleStatusChange = (id: string, newStatus: string) => {
    setAttendance(prev => 
      prev.map(record => 
        record.id === id ? { ...record, status: newStatus, notes: newStatus !== 'Telat' ? '' : record.notes } : record
      )
    );
  };
  
  const handleNotesChange = (id: string, newNotes: string) => {
    setAttendance(prev => 
      prev.map(record => 
        record.id === id ? { ...record, notes: newNotes } : record
      )
    );
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Absensi Karyawan</h1>
        <p className="text-muted-foreground mt-2">
          Catat dan kelola kehadiran harian karyawan.
        </p>
      </div>

      <Card>
         <CardHeader>
          <CardTitle>Catatan Kehadiran</CardTitle>
          <CardDescription>Pilih tanggal untuk melihat atau mencatat absensi. Status dan keterangan dapat diubah langsung di tabel.</CardDescription>
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
                    {date ? format(date, "PPP", { locale: indonesiaLocale }) : <span>Pilih tanggal</span>}
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
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="w-[180px]">Status Kehadiran</TableHead>
                        <TableHead>Keterangan (jika telat)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendance.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                             <TableCell>{format(new Date(employee.date), "dd MMM yyyy", { locale: indonesiaLocale })}</TableCell>
                            <TableCell>
                                <Select 
                                    defaultValue={employee.status} 
                                    onValueChange={(value) => handleStatusChange(employee.id, value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hadir">
                                            <div className="flex items-center">
                                                <UserCheck className="mr-2 h-4 w-4 text-green-600"/> Hadir
                                            </div>
                                        </SelectItem>
                                         <SelectItem value="Telat">
                                            <div className="flex items-center">
                                                <Clock className="mr-2 h-4 w-4 text-yellow-600"/> Telat
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
                            <TableCell>
                                {employee.status === 'Telat' ? (
                                    <Input 
                                        placeholder="Alasan telat..."
                                        value={employee.notes}
                                        onChange={(e) => handleNotesChange(employee.id, e.target.value)}
                                    />
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <div className="flex justify-end mt-6">
                <Button>Simpan Perubahan</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
