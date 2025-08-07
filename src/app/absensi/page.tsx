
"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar as CalendarIcon, UserCheck, UserX, Clock, Search, PlusCircle } from "lucide-react"
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns"
import { id as indonesiaLocale } from "date-fns/locale"
import { DateRange } from "react-day-picker"

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
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"


const employeeList = [
    { id: "emp-1", name: "Budi Santoso" },
    { id: "emp-2", name: "Citra Lestari" },
    { id: "emp-3", name: "Doni Firmansyah" },
    { id: "emp-4", name: "Eka Putri" },
];

const initialAttendanceData = [
    { id: "1", employeeId: "emp-1", name: "Budi Santoso", date: subDays(new Date(), 1).toISOString().split('T')[0], status: "Hadir", notes: "" },
    { id: "2", employeeId: "emp-2", name: "Citra Lestari", date: subDays(new Date(), 1).toISOString().split('T')[0], status: "Hadir", notes: "" },
    { id: "3", employeeId: "emp-3", name: "Doni Firmansyah", date: subDays(new Date(), 1).toISOString().split('T')[0], status: "Tidak Hadir", notes: "" },
    { id: "4", employeeId: "emp-4", name: "Eka Putri", date: subDays(new Date(), 1).toISOString().split('T')[0], status: "Telat", notes: "Bocor ban di jalan" },
    { id: "5", employeeId: "emp-1", name: "Budi Santoso", date: subDays(new Date(), 2).toISOString().split('T')[0], status: "Hadir", notes: "" },
    { id: "6", employeeId: "emp-2", name: "Citra Lestari", date: subDays(new Date(), 8).toISOString().split('T')[0], status: "Hadir", notes: "" },
    { id: "7", employeeId: "emp-3", name: "Doni Firmansyah", date: subDays(new Date(), 35).toISOString().split('T')[0], status: "Hadir", notes: "" },
]

type AttendanceRecord = {
    id: string;
    employeeId: string;
    name: string;
    date: string;
    status: string;
    notes: string;
};

type NewAttendanceInput = Omit<AttendanceRecord, 'id' | 'name'>;


export default function AbsensiPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceData);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newAttendanceDate, setNewAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newAttendanceInputs, setNewAttendanceInputs] = useState<NewAttendanceInput[]>([]);

  useEffect(() => {
    // Initialize inputs when dialog opens for the selected date
    if (isAddDialogOpen) {
      const initialInputs = employeeList.map(emp => ({
        employeeId: emp.id,
        date: newAttendanceDate,
        status: 'Hadir', // Default status
        notes: ''
      }));
      setNewAttendanceInputs(initialInputs);
    }
  }, [isAddDialogOpen, newAttendanceDate]);


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
  
  const handleNewAttendanceInputChange = (employeeId: string, field: 'status' | 'notes', value: string) => {
    setNewAttendanceInputs(prev =>
      prev.map(input =>
        input.employeeId === employeeId ? { ...input, [field]: value } : input
      )
    );
  };

  const handleSaveNewAttendance = () => {
    const recordsForDateExist = attendance.some(record => record.date === newAttendanceDate);
    if(recordsForDateExist) {
        toast({
            title: "Gagal",
            description: `Data absensi untuk tanggal ${format(parseISO(newAttendanceDate), "dd MMM yyyy")} sudah ada.`,
            variant: "destructive"
        });
        return;
    }
    
    const newRecords: AttendanceRecord[] = newAttendanceInputs.map(input => {
        const employee = employeeList.find(emp => emp.id === input.employeeId);
        return {
            ...input,
            id: `att_${new Date().getTime()}_${input.employeeId}`,
            name: employee?.name || 'Unknown',
        }
    });

    setAttendance(prev => [...newRecords, ...prev]);
    toast({
        title: "Sukses",
        description: `Absensi untuk tanggal ${format(parseISO(newAttendanceDate), "dd MMM yyyy")} berhasil disimpan.`
    });
    setAddDialogOpen(false);
  }


  const filteredAttendance = useMemo(() => {
    let filtered = attendance.filter(record => 
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateRange?.from) {
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        filtered = filtered.filter((record) => {
            const recordDate = parseISO(record.date);
            return isWithinInterval(recordDate, { start: startOfDay(dateRange.from!), end: toDate });
        });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, searchTerm, dateRange]);
  
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
        <h1 className="text-3xl font-bold">Absensi Karyawan</h1>
        <p className="text-muted-foreground mt-2">
          Catat dan kelola kehadiran harian karyawan.
        </p>
      </div>

      <Card>
         <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
          <CardDescription>Pilih tanggal untuk melihat atau mengubah absensi. Status dan keterangan dapat diubah langsung di tabel.</CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
             <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
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
                            <span>Pilih rentang tanggal</span>
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
                       <Button className="w-full">
                           <PlusCircle className="mr-2 h-4 w-4"/> Input Absensi Baru
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Input Absensi Karyawan</DialogTitle>
                            <DialogDescription>
                               Pilih tanggal dan isi status kehadiran untuk semua karyawan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="attendance-date" className="whitespace-nowrap">Tanggal Absensi</Label>
                                <Input 
                                    id="attendance-date" 
                                    type="date" 
                                    value={newAttendanceDate} 
                                    onChange={(e) => setNewAttendanceDate(e.target.value)} 
                                    className="w-full sm:w-auto"
                                />
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto pr-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Karyawan</TableHead>
                                            <TableHead className="w-[180px]">Status</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {newAttendanceInputs.map(input => (
                                            <TableRow key={input.employeeId}>
                                                <TableCell className="font-medium">{employeeList.find(e => e.id === input.employeeId)?.name}</TableCell>
                                                <TableCell>
                                                    <Select value={input.status} onValueChange={(value) => handleNewAttendanceInputChange(input.employeeId, 'status', value)}>
                                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="Hadir"><div className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-green-600"/> Hadir</div></SelectItem>
                                                          <SelectItem value="Telat"><div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-yellow-600"/> Telat</div></SelectItem>
                                                          <SelectItem value="Tidak Hadir"><div className="flex items-center"><UserX className="mr-2 h-4 w-4 text-red-600"/> Tidak Hadir</div></SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {input.status === 'Telat' ? (
                                                        <Input 
                                                            placeholder="Alasan telat..."
                                                            value={input.notes}
                                                            onChange={(e) => handleNewAttendanceInputChange(input.employeeId, 'notes', e.target.value)}
                                                        />
                                                    ) : (<span className="text-muted-foreground">-</span>)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveNewAttendance}>Simpan Absensi</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            </div>
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
                    {filteredAttendance.length > 0 ? (
                        filteredAttendance.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{format(parseISO(employee.date), "dd MMM yyyy", { locale: indonesiaLocale })}</TableCell>
                                <TableCell>
                                    <Select 
                                        value={employee.status} 
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
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Tidak ada data absensi pada rentang tanggal yang dipilih.
                            </TableCell>
                        </TableRow>
                    )}
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


    