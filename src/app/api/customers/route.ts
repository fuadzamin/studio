// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { customerSchema } from '@/contexts/CustomerContext';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = customerSchema.safeParse({ ...body, id: undefined });

        if (!validation.success) {
            return NextResponse.json({ message: 'Data tidak valid', errors: validation.error.formErrors }, { status: 400 });
        }

        const { name, address, contact, email } = validation.data;
        const id = uuidv4();

        const query = `
            INSERT INTO customers (id, name, address, contact, email)
            VALUES (?, ?, ?, ?, ?)
        `;

        await pool.query(query, [id, name, address, contact, email]);

        return NextResponse.json({ message: 'Pelanggan berhasil ditambahkan', id }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
