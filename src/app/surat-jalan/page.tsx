"use client"

import { useState } from "react"
import { MoreHorizontal, PlusCircle, Search, Printer, FileDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const deliveryNotes = [
  {
    id: "SJ-001",
    date: "2024-05-21",
    orderId: "SO-001",
    customer: "PT Sejahtera Abadi",
    status: "Terkirim",
  },
  {
    id: "SJ-002",
    date: "2024-05-23",
    orderId: "SO-002",
    customer: "CV Maju Jaya",
    status: "Disiapkan",
  },
]

export default function SuratJalanPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Terkirim":
        return "default"
      case "Disiapkan":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Surat Jalan</h1>
        <p className="text-muted-foreground mt-2">
          Buat dan kelola surat jalan untuk pengiriman barang.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Daftar Surat Jalan</CardTitle>
          <CardDescription>
            Lacak semua surat jalan yang telah dibuat.
          </CardDescription>
          <div className="flex items-center justify-between pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari surat jalan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat dari Pesanan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SJ</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nomor SO</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>{new Date(note.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{note.orderId}</TableCell>
                  <TableCell>{note.customer}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(note.status)}>{note.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" /> Cetak
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-4 w-4" /> Unduh PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
