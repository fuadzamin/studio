
"use client"

import { useState, useMemo, useEffect, useContext } from "react"
import { Calendar as CalendarIcon, UserCheck, UserX, Clock, Search, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeContext, Employee, EmployeeFormValues, employeeSchema } from "@/contexts/EmployeeContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


const initialAttendanceData = [
    { id: "att-1", employeeId: "emp-1", name: "Budi Santoso", position: "Staf Produksi", date: "2024-07-28", status: "Hadir", notes: "" },
    { id: "att-2", employeeId: "emp-2", name: "Citra Lestari", position: "Staf Marketing", date: "2024-07-28", status: "Hadir", notes: "" },
    { id: "att-3", employeeId: "emp-3", name: "Doni Firmansyah", position: "Staf Gudang", date: "2024-07-28", status: "Tidak Hadir", notes: "" },
    { id: "att-4", employeeId: "emp-4", name: "Eka Putri", position: "Admin", date: "2024-07-28", status: "Telat", notes: "Bocor ban di jalan" },
    { id: "att-5", employeeId: "emp-1", name: "Budi Santoso", position: "Staf Produksi", date: "2024-07-27", status: "Hadir", notes: "" },
    { id: "att-6", employeeId: "emp-2", name: "Citra Lestari", position: "Staf Marketing", date: "2024-07-21", status: "Hadir", notes: "" },
    { id: "att-7", employeeId: "emp-3", name: "Doni Firmansyah", position: "Staf Gudang", date: "2024-06-24", status: "Hadir", notes: "" },
]

type AttendanceRecord = {
    id: string;
    employeeId: string;
    name: string;
    position: string;
    date: string;
    status: string;
    notes: string;
};

type NewAttendanceInput = Omit<AttendanceRecord, 'id' | 'name' | 'position'>;


function AttendanceTab() {
  const employeeContext = useContext(EmployeeContext);
  if (!employeeContext) {
    throw new Error("AttendanceTab must be used within an EmployeeProvider");
  }
  const { employees } = employeeContext;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceData);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newAttendanceDate, setNewAttendanceDate] = useState<string>('');
  const [newAttendanceInputs, setNewAttendanceInputs] = useState<NewAttendanceInput[]>([]);
  const [today, setToday] = useState('');

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setToday(todayStr);
    setNewAttendanceDate(todayStr);
  }, []);

  useEffect(() => {
    if (isAddDialogOpen) {
      const initialInputs = employees.map(emp => ({
        employeeId: emp.id,
        date: newAttendanceDate,
        status: 'Hadir',
        notes: ''
      }));
      setNewAttendanceInputs(initialInputs);
    }
  }, [isAddDialogOpen, newAttendanceDate, employees]);


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
        const employee = employees.find(emp => emp.id === input.employeeId);
        return {
            ...input,
            id: `att_${new Date().getTime()}_${input.employeeId}`,
            name: employee?.name || 'Unknown',
            position: employee?.position || 'Unknown',
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
                       <Button>
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
                                    min={today}
                                    max={today}
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
                                                <TableCell className="font-medium">{employees.find(e => e.id === input.employeeId)?.name}</TableCell>
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
                        <TableHead>Posisi</TableHead>
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
                                <TableCell>{employee.position}</TableCell>
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
                            <TableCell colSpan={5} className="h-24 text-center">
                                Tidak ada data absensi pada rentang tanggal yang dipilih.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
  );
}

function EmployeeListTab() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("EmployeeListTab must be used within an EmployeeProvider");
  }
  const { employees, addEmployee, updateEmployee, deleteEmployee } = context;

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: "", position: "" },
  });

  const handleAddClick = () => {
    setSelectedEmployee(null);
    form.reset({ name: "", position: "" });
    setAddEditDialogOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.reset(employee);
    setAddEditDialogOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
      toast({
        title: "Sukses",
        description: `Karyawan "${selectedEmployee.name}" berhasil dihapus.`,
      });
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const onSubmit = (data: EmployeeFormValues) => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, data);
      toast({ title: "Sukses", description: "Data karyawan berhasil diperbarui." });
    } else {
      addEmployee(data);
      toast({ title: "Sukses", description: "Karyawan baru berhasil ditambahkan." });
    }
    setAddEditDialogOpen(false);
    setSelectedEmployee(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Karyawan</CardTitle>
        <CardDescription>Kelola data karyawan di perusahaan Anda.</CardDescription>
        <div className="flex items-center justify-end pt-4">
           <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Karyawan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>{selectedEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Karyawan</FormLabel>
                          <FormControl><Input {...field} placeholder="Contoh: Budi Santoso" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posisi</FormLabel>
                          <FormControl><Input {...field} placeholder="Contoh: Staf Produksi" /></FormControl>
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Karyawan</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead><span className="sr-only">Aksi</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog open={isDeleteDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setDeleteDialogOpen}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleEditClick(employee)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteClick(employee); }} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus karyawan "{selectedEmployee?.name}" secara permanen.
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
  )
}


export default function AbsensiPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Absensi Karyawan</h1>
                <p className="text-muted-foreground mt-2">
                Catat kehadiran harian dan kelola data karyawan Anda.
                </p>
            </div>

            <Tabs defaultValue="attendance">
                <TabsList className="mb-4">
                    <TabsTrigger value="attendance">Riwayat Kehadiran</TabsTrigger>
                    <TabsTrigger value="employees">Daftar Karyawan</TabsTrigger>
                </TabsList>
                <TabsContent value="attendance">
                    <AttendanceTab />
                </TabsContent>
                <TabsContent value="employees">
                    <EmployeeListTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
