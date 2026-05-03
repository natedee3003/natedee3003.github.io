import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import SarabunRegular from '@fontsource/sarabun/files/sarabun-thai-400-normal.woff?url';
import SarabunBold from '@fontsource/sarabun/files/sarabun-thai-700-normal.woff?url';

Font.register({
  family: 'Sarabun',
  fonts: [
    { src: SarabunRegular, fontWeight: 400 },
    { src: SarabunBold, fontWeight: 700 },
  ],
});

export interface ProductRow {
  detail: string;
  amount: string;
  price: string;
  netPrice: string;
}

export interface DocumentFormData {
  documentType: ('ใบเสนอราคา' | 'ใบแจ้งหนี้' | 'ใบส่งของ' | 'ใบเสร็จรับเงิน')[];
  year: number;
  monthNumber: number;
  runningNumber: number;
  date: string;
  customerInfo: {
    companyName: string;
    address: string;
    taxId: string;
    phone: string;
  };
  products: ProductRow[];
  deposit: number;
}

function formatDocNo(year: number, month: number, running: number): string {
  return `RS${year}${String(month).padStart(2, '0')}${String(running).padStart(3, '0')}`;
}

function formatNum(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Sarabun',
    fontSize: 11,
    paddingTop: 40,
    paddingHorizontal: 48,
    paddingBottom: 100,
    color: '#1a1a1a',
  },
  companyHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    marginBottom: 6,
  },
  docTypeRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  docType: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'Sarabun',
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    width: 160,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: 700,
    fontFamily: 'Sarabun',
    marginBottom: 1,
  },
  docNoValue: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Sarabun',
    color: '#111827',
    marginBottom: 8,
  },
  customerValue: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  infoValue: {
    fontSize: 11,
    color: '#111827',
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a1a1a',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colDetail: { flex: 3 },
  colAmount: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1, textAlign: 'right' },
  colNetPrice: { flex: 1, textAlign: 'right' },
  colHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'Sarabun',
    color: '#1a1a1a',
  },
  colValueText: {
    fontSize: 10,
    color: '#111827',
  },
  summarySection: {
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3,
    minWidth: 220,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
  },
  summaryValue: {
    fontSize: 10,
    color: '#111827',
    minWidth: 80,
    textAlign: 'right',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    minWidth: 220,
    paddingTop: 4,
    marginTop: 2,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
  },
  summaryTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'Sarabun',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
  },
  summaryTotalValue: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'Sarabun',
    color: '#1a1a1a',
    minWidth: 80,
    textAlign: 'right',
  },
  signatureSection: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '42%',
    alignItems: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    width: '100%',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  noteText: {
    fontSize: 9,
    color: '#6b7280',
  },
});

export function DocumentPdf({ data }: { data: DocumentFormData }) {
  const total = data.products.reduce((sum, p) => sum + (parseFloat(p.netPrice) || 0), 0);
  const depositAmt = total * (data.deposit / 100);
  const payable = total - depositAmt;
  const docNo = formatDocNo(data.year, data.monthNumber, data.runningNumber);
  const docType = data.documentType[0];

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Company header */}
        <View style={styles.companyHeader}>
          <Image style={styles.logo} src='/RungratSuitLogo.png' />
          <Text style={styles.companyAddress}>
            1763 ซอยกาญจนาภิเษก008 แขวงบางแค เขตบางแค กรุงเทพมหานคร 10160
          </Text>
          <Text style={styles.companyAddress}>088-100-8550 | rungratmueankrut@gmail.com</Text>
        </View>

        {/* Document type */}
        <View style={styles.docTypeRow}>
          <Text style={styles.docType}>{data.documentType[0]}</Text>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoLabel}>เลขที่เอกสาร</Text>
            <Text style={styles.docNoValue}>{docNo}</Text>
            <Text style={styles.infoLabel}>ลูกค้า</Text>
            <Text style={styles.customerValue}>{data.customerInfo.companyName || '—'}</Text>
            <Text style={styles.customerValue}>{data.customerInfo.address || '—'}</Text>
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.infoLabel}>วันที่</Text>
            <Text style={styles.infoValue}>{data.date}</Text>
            {data.customerInfo.taxId ? (
              <>
                <Text style={styles.infoLabel}>เลขผู้เสียภาษี</Text>
                <Text style={styles.infoValue}>{data.customerInfo.taxId}</Text>
              </>
            ) : null}
            {data.customerInfo.phone ? (
              <>
                <Text style={styles.infoLabel}>เบอร์โทร</Text>
                <Text style={styles.infoValue}>{data.customerInfo.phone}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Products table */}
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeaderText, styles.colDetail]}>รายการ</Text>
            <Text style={[styles.colHeaderText, styles.colAmount]}>จำนวน </Text>
            <Text style={[styles.colHeaderText, styles.colPrice]}>ราคา/หน่วย</Text>
            <Text style={[styles.colHeaderText, styles.colNetPrice]}>ราคารวม</Text>
          </View>
          {data.products.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.colValueText, styles.colDetail]}>{row.detail}</Text>
              <Text style={[styles.colValueText, styles.colAmount]}>{row.amount}</Text>
              <Text style={[styles.colValueText, styles.colPrice]}>{row.price}</Text>
              <Text style={[styles.colValueText, styles.colNetPrice]}>{row.netPrice}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          {data.deposit > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>รวมทั้งหมด</Text>
                <Text style={styles.summaryValue}>{formatNum(total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>หักมัดจำ {data.deposit}%</Text>
                <Text style={styles.summaryValue}>-{formatNum(depositAmt)}</Text>
              </View>
            </>
          )}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>ยอดชำระ </Text>
            <Text style={styles.summaryTotalValue}>{formatNum(payable)}</Text>
          </View>
        </View>

        {/* Signatures */}
        {docType === 'ใบเสนอราคา' && (
          <View style={styles.signatureSection}>
            <View style={{ width: '55%', justifyContent: 'flex-end' }}>
              <Text style={styles.noteText}>หมายเหตุ: ค่ามัดจำล่วงหน้า 30% เครดิต 15 วัน</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้เสนอราคา</Text>
            </View>
          </View>
        )}
        {docType === 'ใบแจ้งหนี้' && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้รับแจ้งหนี้</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้แจ้งหนี้</Text>
            </View>
          </View>
        )}
        {docType === 'ใบส่งของ' && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้รับของ</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้ส่งของ</Text>
            </View>
          </View>
        )}
        {docType === 'ใบเสร็จรับเงิน' && (
          <View style={[styles.signatureSection, { justifyContent: 'flex-end' }]}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>ผู้รับเงิน</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
