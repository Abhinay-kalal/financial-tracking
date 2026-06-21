import { NextResponse } from 'next/server';

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

export async function GET() {
  if (!NEWSDATA_API_KEY) {
    // Return placeholder news if no API key is set yet
    return NextResponse.json({
      success: true,
      data: [
        { title: 'NIFTY 50 hits all-time high amid strong FII inflows', pubDate: new Date().toISOString(), link: '#', source: 'Economic Times' },
        { title: 'RBI holds repo rate steady at 6.5% in latest MPC meet', pubDate: new Date().toISOString(), link: '#', source: 'Mint' },
        { title: 'GST collections surge to record ₹2.1 lakh crore in May 2025', pubDate: new Date().toISOString(), link: '#', source: 'Business Standard' },
        { title: 'India GDP growth forecast revised upward to 7.4% for FY26', pubDate: new Date().toISOString(), link: '#', source: 'Livemint' },
        { title: 'Rupee strengthens against dollar on positive trade data', pubDate: new Date().toISOString(), link: '#', source: 'Financial Express' },
      ]
    });
  }

  try {
    const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&country=in&category=business&language=en&size=8`;
    const res = await fetch(url, { next: { revalidate: 1800 } }); // cache 30 min

    if (!res.ok) throw new Error('NewsData API error');

    const json = await res.json();
    const articles = (json.results || []).map((item: any) => ({
      title: item.title,
      pubDate: item.pubDate,
      link: item.link,
      source: item.source_id,
      imageUrl: item.image_url,
    }));

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
