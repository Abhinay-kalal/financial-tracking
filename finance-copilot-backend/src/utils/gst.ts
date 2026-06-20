export interface GSTCalculationResult {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  total: number;
}

export const calculateGST = (
  quantity: number,
  rate: number,
  gstRate: number, // e.g. 18 for 18%
  gstType: 'cgst_sgst' | 'igst' | 'exempt'
): GSTCalculationResult => {
  const subtotal = quantity * rate;
  if (gstType === 'exempt') {
    return { subtotal, cgst: 0, sgst: 0, igst: 0, totalGst: 0, total: subtotal };
  }

  const totalGst = (subtotal * gstRate) / 100;
  
  if (gstType === 'cgst_sgst') {
    return {
      subtotal,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      igst: 0,
      totalGst,
      total: subtotal + totalGst,
    };
  } else {
    return {
      subtotal,
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      totalGst,
      total: subtotal + totalGst,
    };
  }
};

export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};
