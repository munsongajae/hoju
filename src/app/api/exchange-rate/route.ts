import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
    try {
        const response = await fetch('https://kr.investing.com/currencies/exchange-rates-table', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // User provided selector: <td class="pid-1494-last" id="last_1_28">977.81</td>
        // We try to find by class since ID might change dynamically in some frameworks? 
        // Actually IDs are usually more stable on old sites, but class "pid-1494-last" seems very specific to the Pair ID (1494).

        // Try multiple selectors to be safe
        let rateText = $('.pid-1494-last').text() || $('#last_1_28').text();

        // If still empty, try finding the row for AUD/KRW
        if (!rateText) {
            // Fallback or logging could go here
        }

        // Clean up the text (remove commas, whitespace)
        const rate = parseFloat(rateText.replace(/,/g, '').trim());

        if (isNaN(rate)) {
            return NextResponse.json({ error: 'Failed to parse rate' }, { status: 500 });
        }

        return NextResponse.json({
            rate,
            timestamp: new Date().toISOString(),
            source: 'Investing.com'
        });

    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
