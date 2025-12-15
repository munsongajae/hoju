import { NextResponse } from 'next/server';


export async function GET() {
    try {
        // Yahoo Finance API
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AUDKRW=X', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        // Yahoo Finance response structure:
        // chart.result[0].meta.regularMarketPrice
        const rate = data?.chart?.result?.[0]?.meta?.regularMarketPrice;

        if (!rate || isNaN(rate)) {
            throw new Error('Invalid rate data received');
        }

        return NextResponse.json({
            rate,
            timestamp: new Date().toISOString(),
            source: 'Yahoo Finance'
        });

    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
