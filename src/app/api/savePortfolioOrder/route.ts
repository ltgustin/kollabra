import { NextResponse } from 'next/server';
import { updatePortfolioItemOrder } from '@/lib/portfolio';

export async function POST(request) {
    const items = await request.json();

    try {
        await Promise.all(items.map(item => {
            if (!item.id || item.order === undefined) {
                throw new Error('Invalid item structure');
            }
            return updatePortfolioItemOrder(item.id, item.order);
        }));
        return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating portfolio order:', error);
        return NextResponse.json({ error: 'Failed to update order', details: error.message }, { status: 500 });
    }
} 