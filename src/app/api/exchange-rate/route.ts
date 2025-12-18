import { NextRequest, NextResponse } from 'next/server';

const CURRENCY_PAIRS: Record<string, string> = {
    'AUD': 'AUDKRW=X',
    'USD': 'USDKRW=X',
    'VND': 'VNDKRW=X',
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const currency = searchParams.get('currency') || 'AUD';
        const pair = CURRENCY_PAIRS[currency.toUpperCase()] || CURRENCY_PAIRS['AUD'];

        // Yahoo Finance API
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${pair}`, {
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
            currency: currency.toUpperCase(),
            timestamp: new Date().toISOString(),
            source: 'Yahoo Finance'
        });

    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
