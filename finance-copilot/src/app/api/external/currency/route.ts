import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch currency rates');
    const data = await res.json();
    
    const inr = data.rates.INR;
    const eur = data.rates.EUR;
    const gbp = data.rates.GBP;

    // Convert EUR -> INR and GBP -> INR
    const usdToInr = inr;
    const eurToInr = inr / eur;
    const gbpToInr = inr / gbp;

    return NextResponse.json({
      success: true,
      rates: {
        USD: Number(usdToInr.toFixed(2)),
        EUR: Number(eurToInr.toFixed(2)),
        GBP: Number(gbpToInr.toFixed(2))
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Currency API Error, using mock rates:', error.message);
    // Robust fallback to realistic rates
    return NextResponse.json({
      success: true,
      rates: {
        USD: 83.45,
        EUR: 89.20,
        GBP: 105.80
      },
      isFallback: true,
      timestamp: Date.now()
    });
  }
}
