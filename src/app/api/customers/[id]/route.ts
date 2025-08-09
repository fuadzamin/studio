// src/app/api/customers/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { customerSchema } from '@/contexts/CustomerContext';

type RouteParams = {
    params: {
        id: string;
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [params.id]);
        const results = rows as any[];
        if (results.length === 0) {
            return NextResponse.json({ message: 'Pelanggan tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(results[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const body = await request.json();
        // Exclude id from validation for update
        const validation = customerSchema.safeParse({ ...body, id: undefined });

        if (!validation.success) {
            return NextResponse.json({ message: 'Data tidak valid', errors: validation.error.formErrors }, { status: 400 });
        }

        const { name, address, contact, email } = validation.data;

        const query = `
            UPDATE customers
            SET name = ?, address = ?, contact = ?, email = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [name, address, contact, email, params.id]);

        const aResult = result as any;
        if (aResult.affectedRows === 0) {
             return NextResponse.json({ message: 'Pelanggan tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Pelanggan berhasil diperbarui' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [params.id]);

        const aResult = result as any;
        if (aResult.affectedRows === 0) {
            return NextResponse.json({ message: 'Pelanggan tidak ditemukan' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Pelanggan berhasil dihapus' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
