import yahooFinance from 'yahoo-finance2';
import axios from 'axios';

export const ExternalDataService = {
  getMarketData: async () => {
    try {
      let nifty: any = null;
      let sensex: any = null;

      try {
        nifty = await yahooFinance.quote('^NSEI');
      } catch (err) {
        console.warn('Failed to fetch NIFTY quote:', err);
      }

      try {
        sensex = await yahooFinance.quote('^BSESN');
      } catch (err) {
        console.warn('Failed to fetch SENSEX quote:', err);
      }

      return {
        nifty: nifty ? {
          price: nifty.regularMarketPrice,
          change: nifty.regularMarketChange,
          changePercent: nifty.regularMarketChangePercent,
        } : null,
        sensex: sensex ? {
          price: sensex.regularMarketPrice,
          change: sensex.regularMarketChange,
          changePercent: sensex.regularMarketChangePercent,
        } : null,
      };
    } catch (error) {
      console.error('Failed to fetch market data', error);
      return { nifty: null, sensex: null };
    }
  },

  getExchangeRates: async () => {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const rates = response.data.rates;
      return {
        USD: 1, // base
        INR: rates.INR,
        EUR: rates.EUR,
        GBP: rates.GBP,
      };
    } catch (error) {
      console.error('Failed to fetch exchange rates', error);
      // Fallback
      return { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79 };
    }
  }
};
