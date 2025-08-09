// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { productSchema } from '@/contexts/ProductContext';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    // MySQL JSON columns are returned as strings, so we need to parse them.
    const products = (rows as any[]).map(product => ({
        ...product,
        bom: typeof product.bom === 'string' ? JSON.parse(product.bom) : product.bom || []
    }));
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = productSchema.safeParse({ ...body, id: undefined });

        if (!validation.success) {
            return NextResponse.json({ message: 'Data tidak valid', errors: validation.error.formErrors }, { status: 400 });
        }

        const { name, code, purchasePrice, salePrice, stock, unit, bom } = validation.data;
        const id = uuidv4();
        const bomString = JSON.stringify(bom);

        const query = `
            INSERT INTO products (id, name, code, purchasePrice, salePrice, stock, unit, bom)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(query, [id, name, code, purchasePrice, salePrice, stock, unit, bomString]);

        return NextResponse.json({ message: 'Produk berhasil ditambahkan', id }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
