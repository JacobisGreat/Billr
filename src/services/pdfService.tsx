import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Invoice } from '../hooks/useInvoices';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'space-between'
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E75B0'
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right'
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right'
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  addressBlock: {
    flexDirection: 'column',
    width: '45%'
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 2
  },
  table: {
    width: '100%',
    marginBottom: 30
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderBottom: '2 solid #e2e8f0'
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottom: '1 solid #f1f5f9'
  },
  tableCell: {
    fontSize: 11,
    color: '#1e293b',
    flex: 1
  },
  totalSection: {
    alignItems: 'flex-end',
    marginTop: 20
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  totalAmount: {
    fontSize: 14,
    color: '#2E75B0',
    fontWeight: 'bold'
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8fafc'
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E75B0',
    marginBottom: 8
  },
  notesText: {
    fontSize: 11,
    color: '#64748b'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 20,
    borderTop: '1 solid #e2e8f0'
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8'
  }
});

// PDF Invoice Component
interface PDFInvoiceProps {
  invoice: Invoice;
  senderName: string;
  senderEmail: string;
  companyName?: string;
}

const PDFInvoice: React.FC<PDFInvoiceProps> = ({ 
  invoice, 
  senderName, 
  senderEmail, 
  companyName 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>Billr</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
        </View>
      </View>

      {/* Bill To Section */}
      <View style={styles.billToSection}>
        <View style={styles.addressBlock}>
          <Text style={styles.label}>Bill To:</Text>
          <Text style={styles.text}>{invoice.clientName || 'Client'}</Text>
          <Text style={styles.text}>{invoice.clientEmail}</Text>
          {invoice.clientPhone && <Text style={styles.text}>{invoice.clientPhone}</Text>}
        </View>
        <View style={styles.addressBlock}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.text}>{companyName || senderName}</Text>
          <Text style={styles.text}>{senderEmail}</Text>
          <Text style={styles.text}>Date: {new Date(invoice.createdAt.toDate()).toLocaleDateString()}</Text>
          <Text style={styles.text}>Due: {new Date(invoice.dueDate.toDate()).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Description</Text>
          <Text style={styles.tableHeaderText}>Qty</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
          <Text style={styles.tableHeaderText}>Total</Text>
        </View>
        
        {invoice.lineItems && invoice.lineItems.length > 0 ? (
          invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${(item.quantity * item.unitPrice).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.description}</Text>
            <Text style={styles.tableCell}>1</Text>
            <Text style={styles.tableCell}>${invoice.amount.toFixed(2)}</Text>
            <Text style={styles.tableCell}>${invoice.amount.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>${invoice.amount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Generated by Billr • {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

// PDF Generation Service
class PDFService {
  async generateInvoicePDF(
    invoice: Invoice,
    senderName: string,
    senderEmail: string,
    companyName?: string
  ): Promise<Blob> {
    try {
      console.log('📄 Generating PDF for invoice:', invoice.number);
      
      const pdfBlob = await pdf(
        <PDFInvoice 
          invoice={invoice}
          senderName={senderName}
          senderEmail={senderEmail}
          companyName={companyName}
        />
      ).toBlob();
      
      console.log('✅ PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  async downloadInvoicePDF(
    invoice: Invoice,
    senderName: string,
    senderEmail: string,
    companyName?: string
  ): Promise<void> {
    try {
      const pdfBlob = await this.generateInvoicePDF(invoice, senderName, senderEmail, companyName);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF download initiated');
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      throw error;
    }
  }

  // Generate PDF as base64 string for email attachment
  async generatePDFBase64(
    invoice: Invoice,
    senderName: string,
    senderEmail: string,
    companyName?: string
  ): Promise<string> {
    try {
      const pdfBlob = await this.generateInvoicePDF(invoice, senderName, senderEmail, companyName);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('❌ Error generating PDF base64:', error);
      throw error;
    }
  }
}

export const pdfService = new PDFService();
export { PDFInvoice }; 