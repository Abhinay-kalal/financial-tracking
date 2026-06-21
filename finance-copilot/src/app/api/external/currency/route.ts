import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 300 }, // cache 5 mins
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return NextResponse.json({
      success: true,
      data: {
        USD: 1,
        INR: json.rates.INR,
        EUR: json.rates.EUR,
        GBP: json.rates.GBP,
        JPY: json.rates.JPY,
      },
    });
  } catch {
    // fallback values
    return NextResponse.json({
      success: true,
      data: { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 157.2 },
    });
  }
}
