// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { productSchema } from '@/contexts/ProductContext';

type RouteParams = {
    params: {
        id: string;
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [params.id]);
        const results = rows as any[];
        if (results.length === 0) {
            return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
        }
        const product = results[0];
        // Parse BOM from string to JSON
        product.bom = typeof product.bom === 'string' ? JSON.parse(product.bom) : product.bom || [];
        return NextResponse.json(product);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const body = await request.json();
        // Exclude id from validation for update
        const validation = productSchema.safeParse({ ...body, id: undefined });

        if (!validation.success) {
            return NextResponse.json({ message: 'Data tidak valid', errors: validation.error.formErrors }, { status: 400 });
        }

        const { name, code, purchasePrice, salePrice, stock, unit, bom } = validation.data;
        const bomString = JSON.stringify(bom);

        const query = `
            UPDATE products
            SET name = ?, code = ?, purchasePrice = ?, salePrice = ?, stock = ?, unit = ?, bom = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [name, code, purchasePrice, salePrice, stock, unit, bomString, params.id]);

        const aResult = result as any;
        if (aResult.affectedRows === 0) {
             return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [params.id]);

        const aResult = result as any;
        if (aResult.affectedRows === 0) {
            return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
