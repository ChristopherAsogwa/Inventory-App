import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportSalesCsv(sales: Sale[]): Promise<void> {
  if (!FileSystem.cacheDirectory) {
    throw new Error('File system is not available on this device');
  }

  const header = ['Date', 'Product', 'Quantity', 'Revenue (#)', 'Cost (#)', 'Profit (#)'];

  const rows = sales.map((s) => {
    const saleProfit = s.totalPrice - s.costPrice * s.quantity;
    return [
      dayjs(s.createdAt).format('YYYY-MM-DD HH:mm'),
      s.productName,
      s.quantity,
      s.totalPrice.toFixed(2),
      (s.costPrice * s.quantity).toFixed(2),
      saleProfit.toFixed(2),
    ].map(escapeCsv).join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const fileName = `intellica_sales_${dayjs().format('YYYY-MM-DD')}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  try {
    await FileSystem.writeAsStringAsync(filePath, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    throw new Error('Failed to write CSV file. Check available storage.');
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Sales CSV',
    UTI: 'public.comma-separated-values-text',
  });
}
