import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useInvoices, Invoice } from '../hooks/useInvoices';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetails } from './InvoiceDetails';
import { CustomerManagement } from './CustomerManagement';
import { ScheduleCalendar } from './ScheduleCalendar';
import { 
  Plus, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Search, 
  Calendar, 
  DollarSign,
  Mail,
  Eye,
  Users,
  Repeat,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit3,
  ExternalLink,
  Bell
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { stripeService } from '../services/stripeService';
import { emailService, InvoiceEmailData } from '../services/emailService';

type DashboardTab = 'overview' | 'invoices' | 'customers' | 'schedule';

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout, loading: authLoading } = useAuth();
  const { 
    invoices, 
    loading: invoicesLoading, 
    createInvoice, 
    editInvoice, 
    deleteInvoice,
    createCustomerFromInvoice,
    generateInvoiceFromTemplate,
    getTemplatesDueForGeneration,
    getRecurringTemplates,
    getInvoicesFromTemplate,
    updateInvoiceEmailStatus
  } = useInvoices();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showMoreWidgets, setShowMoreWidgets] = useState(false);

  // Helper function to get correct invoice status (including overdue detection)
  const getInvoiceStatus = (invoice: Invoice): 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled' => {
    if (invoice.status === 'paid' || invoice.status === 'draft' || invoice.status === 'cancelled') {
      return invoice.status;
    }
    
    // Check if pending invoice is overdue
    if (invoice.status === 'pending' || invoice.status === 'overdue') {
      const now = new Date();
      const dueDate = invoice.dueDate.toDate();
      
      if (dueDate < now) {
        return 'overdue';
      }
      return 'pending';
    }
    
    return invoice.status;
  };

  // Get filtered invoices (excluding templates from main view) with updated status
  const regularInvoices = invoices.filter(invoice => !invoice.isTemplate).map(invoice => ({
    ...invoice,
    status: getInvoiceStatus(invoice)
  }));
  console.log('📊 Dashboard: Total invoices:', invoices.length, 'Regular invoices:', regularInvoices.length, 'Templates:', invoices.filter(i => i.isTemplate).length);
  
  // Debug paid invoices and their dates
  const paidInvoices = regularInvoices.filter(inv => inv.status === 'paid');
  console.log('💰 Paid invoices debug:', paidInvoices.map(inv => ({
    id: inv.id,
    description: inv.description,
    amount: inv.amount,
    status: inv.status,
    dueDate: inv.dueDate.toDate(),
    createdAt: inv.createdAt.toDate(),
    paidAt: inv.paidAt?.toDate(),
    hasPaidAt: !!inv.paidAt
  })));
  const recurringTemplates = getRecurringTemplates();
  const templatesDue = getTemplatesDueForGeneration();

  const filteredInvoices = regularInvoices.filter(invoice => {
    const matchesSearch = (invoice.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalEarnings: regularInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: regularInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    totalInvoices: regularInvoices.length,
    paidInvoices: regularInvoices.filter(i => i.status === 'paid').length,
  };

  // Enhanced Analytics
  const currentDate = new Date();
  const currentMonth = startOfMonth(currentDate);
  const lastMonth = startOfMonth(subDays(currentDate, 30));
  const last30Days = subDays(currentDate, 30);
  const last7Days = subDays(currentDate, 7);

  const advancedStats = {
    thisMonthRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.paidAt && inv.paidAt.toDate() >= currentMonth
    ).reduce((sum, inv) => sum + inv.amount, 0),
    
    lastMonthRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.paidAt &&
      inv.paidAt.toDate() >= lastMonth && 
      inv.paidAt.toDate() < currentMonth
    ).reduce((sum, inv) => sum + inv.amount, 0),

    last30DaysRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.paidAt && inv.paidAt.toDate() >= last30Days
    ).reduce((sum, inv) => sum + inv.amount, 0),

    last7DaysRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.paidAt && inv.paidAt.toDate() >= last7Days
    ).reduce((sum, inv) => sum + inv.amount, 0),

    overdueInvoices: regularInvoices.filter(inv => inv.status === 'overdue').length,
    overdueAmount: regularInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),

    averageInvoiceValue: regularInvoices.length > 0 ? regularInvoices.reduce((sum, inv) => sum + inv.amount, 0) / regularInvoices.length : 0,
    conversionRate: regularInvoices.length > 0 ? (stats.paidInvoices / regularInvoices.length) * 100 : 0
  };

  const monthlyGrowth = advancedStats.lastMonthRevenue > 0 
    ? ((advancedStats.thisMonthRevenue - advancedStats.lastMonthRevenue) / advancedStats.lastMonthRevenue) * 100 
    : 0;

  // Revenue trend data (last 30 days) - use actual paid date
  const revenueTrendData = eachDayOfInterval({
    start: last30Days,
    end: currentDate
  }).map(date => {
    const dayInvoices = regularInvoices.filter(inv => {
      // Only include actually paid invoices with valid paidAt dates
      if (inv.status !== 'paid' || !inv.paidAt) {
        return false;
      }
      
      try {
        const paidDate = inv.paidAt.toDate();
        const now = new Date();
        
        // Safety check: only include reasonable paid dates
        // Not in the future (beyond today) and not older than 2 years
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(now.getFullYear() - 2);
        
        if (paidDate > now || paidDate < twoYearsAgo) {
          console.warn('Unreasonable paidAt date for invoice:', inv.id, {
            paidAt: paidDate,
            description: inv.description,
            amount: inv.amount
          });
          return false;
        }
        
        const currentDateStr = format(date, 'yyyy-MM-dd');
        const paidDateStr = format(paidDate, 'yyyy-MM-dd');
        
        return paidDateStr === currentDateStr;
      } catch (error) {
        console.warn('Invalid paidAt date for invoice:', inv.id, inv.paidAt);
        return false;
      }
    });
    
    const dayRevenue = dayInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Debug logging for the spike day
    if (dayRevenue > 1000) {
      console.log('🚨 High revenue day detected:', {
        date: format(date, 'MMM dd'),
        revenue: dayRevenue,
        invoiceCount: dayInvoices.length,
        invoices: dayInvoices.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          paidAt: inv.paidAt?.toDate(),
          description: inv.description
        }))
      });
    }
    
    return {
      date: format(date, 'MMM dd'),
      revenue: dayRevenue
    };
  });

  // Status breakdown for pie chart
  const statusBreakdown = [
    { name: 'Paid', value: stats.paidInvoices, color: '#10b981' },
    { name: 'Pending', value: regularInvoices.filter(inv => inv.status === 'pending').length, color: '#f59e0b' },
    { name: 'Overdue', value: advancedStats.overdueInvoices, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Monthly revenue data (last 6 months) - use paid dates
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subDays(currentDate, i * 30));
    const monthEnd = endOfMonth(monthStart);
    const monthRevenue = regularInvoices
      .filter(inv => 
        inv.status === 'paid' && inv.paidAt &&
        isWithinInterval(inv.paidAt.toDate(), { start: monthStart, end: monthEnd })
      )
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    return {
      month: format(monthStart, 'MMM'),
      revenue: monthRevenue,
      invoices: regularInvoices.filter(inv => 
        isWithinInterval(inv.createdAt.toDate(), { start: monthStart, end: monthEnd })
      ).length
    };
  }).reverse();

  const handleCreateInvoice = async (invoiceData: any): Promise<string> => {
    try {
      console.log('🚀 Dashboard: Creating invoice with data:', invoiceData);
      const invoiceId = await createInvoice(invoiceData);
      console.log('✅ Dashboard: Invoice created successfully with ID:', invoiceId);
      
      // Send email immediately if requested and invoice is not paid
      if (invoiceData.sendImmediately && !invoiceData.markAsPaid) {
        try {
          // Find the created invoice
          const createdInvoice = invoices.find(inv => inv.id === invoiceId);
          if (createdInvoice) {
            await handleSendEmail(createdInvoice);
          } else {
            // If invoice not found in current state, create a temporary invoice object for email
            const tempInvoice: Invoice = {
              id: invoiceId,
              number: `INV-${Date.now()}`,
              description: invoiceData.description,
              amount: invoiceData.amount || 0,
              lineItems: invoiceData.lineItems || [],
              subtotal: 0,
              taxTotal: 0,
              total: invoiceData.amount || 0,
              clientEmail: invoiceData.clientEmail,
              clientName: invoiceData.clientName,
              clientPhone: invoiceData.clientPhone,
              status: 'pending',
              createdAt: Timestamp.now(),
              issueDate: Timestamp.now(),
              dueDate: Timestamp.fromDate(invoiceData.dueDate),
              userId: currentUser?.uid || '',
              notes: invoiceData.notes,
              isRecurring: invoiceData.isRecurring || false
            };
            await handleSendEmail(tempInvoice);
          }
        } catch (emailError) {
          console.error('Error sending immediate email:', emailError);
          alert('Invoice created successfully, but failed to send email. You can send it manually from the invoices list.');
        }
      }
      
      setIsCreateModalOpen(false);
      setEditingInvoice(null);
      return invoiceId;
    } catch (error) {
      console.error('❌ Dashboard: Error creating invoice:', error);
      throw error;
    }
  };

  const handleEditInvoice = async (invoiceId: string, invoiceData: any): Promise<void> => {
    try {
      await editInvoice(invoiceId, invoiceData);
      setIsCreateModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error editing invoice:', error);
      throw error;
    }
  };

  const handleOpenEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      // Generate payment link
      const paymentLink = stripeService.generatePaymentUrl(invoice.id, invoice.amount);
      
      // Prepare email data
      const emailData: InvoiceEmailData = {
        clientEmail: invoice.clientEmail,
        clientName: invoice.clientName || 'Valued Customer',
        invoiceId: invoice.id,
        description: invoice.description,
        amount: invoice.amount,
        dueDate: invoice.dueDate.toDate(),
        paymentLink: paymentLink,
        companyName: import.meta.env.VITE_COMPANY_NAME || 'Your Company',
        notes: invoice.notes,
        fromName: userProfile?.displayName || currentUser?.displayName || 'Billr',
        fromEmail: userProfile?.email || currentUser?.email || undefined
      };

      // Smart email type detection: Check if due date is in the past
      const now = new Date();
      const isOverdue = invoice.dueDate.toDate() < now;
      
      console.log('📧 Smart email detection:', {
        dueDate: invoice.dueDate.toDate(),
        now: now,
        isOverdue: isOverdue,
        status: invoice.status
      });

      // Send email based on invoice status and due date
      let emailSent = false;
      if (invoice.status === 'paid') {
        emailSent = await emailService.sendPaymentConfirmation(emailData);
      } else if (invoice.status === 'overdue' || isOverdue) {
        // Send overdue reminder if status is overdue OR if due date has passed
        console.log('🚨 Sending overdue reminder email (invoice is overdue)');
        emailSent = await emailService.sendPaymentReminder(emailData);
      } else {
        // Send regular invoice email for future due dates
        console.log('📬 Sending regular invoice email (invoice not due yet)');
        emailSent = await emailService.sendInvoiceEmail(emailData);
      }

      if (emailSent) {
        // Update invoice email status in Firebase
        await updateInvoiceEmailStatus(invoice.id);
        alert('✅ Email sent successfully!');
      } else {
        // Since we know it's a browser/CORS issue, offer mailto fallback immediately
        const useMailto = window.confirm(
          `📧 Email sending requires a backend server due to browser security.\n\n` +
          `Would you like to open your email client to send manually?\n\n` +
          `Click OK to compose the email with all details pre-filled.`
        );
        
        if (useMailto) {
          // Generate pre-filled email
          const subject = encodeURIComponent(`Invoice #${invoice.id} - Payment Request`);
          const body = encodeURIComponent(`
Hi ${invoice.clientName || 'there'},

I hope this email finds you well. Here's your invoice for our recent work together:

Invoice #: ${invoice.id}
Description: ${invoice.description}
Amount Due: $${invoice.amount.toFixed(2)}
Due Date: ${invoice.dueDate.toDate().toLocaleDateString()}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}

Thank you for your business! If you have any questions about this invoice, please don't hesitate to reach out.

Best regards,
${userProfile?.displayName || currentUser?.displayName || 'Your Name'}
${userProfile?.email || currentUser?.email || ''}
          `);
          
          // Open mailto link
          window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
          
          // Update email status since user will manually send
          await updateInvoiceEmailStatus(invoice.id);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Immediate mailto fallback for any error
      const useMailto = window.confirm(
        `📧 Email API unavailable (browser security restriction).\n\n` +
        `Open your email client to send manually?\n\n` +
        `The email will be pre-filled with all invoice details.`
      );
      
      if (useMailto) {
        const subject = encodeURIComponent(`Invoice #${invoice.id} - Payment Request`);
        const body = encodeURIComponent(`
Hi ${invoice.clientName || 'there'},

Here's your invoice:

Invoice #: ${invoice.id}
Description: ${invoice.description}
Amount: $${invoice.amount.toFixed(2)}
Due Date: ${invoice.dueDate.toDate().toLocaleDateString()}

Best regards,
${userProfile?.displayName || currentUser?.displayName || 'Your Name'}
        `);
        
        window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
        await updateInvoiceEmailStatus(invoice.id);
      }
    }
  };

  const handleCreateCustomer = async (invoiceData: any): Promise<string> => {
    try {
      const customerId = await createCustomerFromInvoice(invoiceData);
      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const handlePayNow = async (invoice: Invoice) => {
    try {
      // Create payment session
      const paymentData = {
        amount: invoice.amount,
        currency: 'usd',
        description: invoice.description,
        invoiceId: invoice.id,
        clientEmail: invoice.clientEmail,
        clientName: invoice.clientName,
        successUrl: `${window.location.origin}/payment-success?invoice=${invoice.id}`,
        cancelUrl: `${window.location.origin}/payment-cancelled?invoice=${invoice.id}`
      };

      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout(paymentData);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  // Auto-generate invoices from due templates
  useEffect(() => {
    const generateDueInvoices = async () => {
      if (invoicesLoading) return;
      
      try {
        const dueTemplates = getTemplatesDueForGeneration();
        console.log('Templates due for generation:', dueTemplates.length);
        
        for (const template of dueTemplates) {
          try {
            console.log(`Generating invoice from template: ${template.templateName}`);
            await generateInvoiceFromTemplate(template.id);
          } catch (error) {
            console.error(`Failed to generate invoice from template ${template.templateName}:`, error);
          }
        }
      } catch (error) {
        console.error('Error checking for due templates:', error);
      }
    };

    // Run once when invoices are loaded
    if (!invoicesLoading && invoices.length > 0) {
      generateDueInvoices();
    }
  }, [invoicesLoading, invoices.length, getTemplatesDueForGeneration, generateInvoiceFromTemplate]);

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center z-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-20" />
          
          {/* Floating animated orbs */}
          <motion.div
            animate={{ 
              y: [0, -30, 0], 
              x: [0, 20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-brand-300/40 to-brand-400/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, 25, 0], 
              x: [0, -25, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-brand-300/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, -15, 0], 
              x: [0, 15, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-brand-100/30 to-brand-200/20 rounded-full blur-3xl"
          />
        </div>

        {/* Main loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          {/* Glassmorphic container */}
          <div className="relative p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-md mx-auto overflow-hidden">
            {/* Subtle shine effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <img 
                src="/images/billr-logo.png" 
                alt="Billr Logo" 
                className="w-32 h-auto mx-auto drop-shadow-lg"
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <h1 className="hidden text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
                Billr
              </h1>
            </motion.div>

            {/* Advanced loading animation */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-brand-200/30 rounded-full"
              />
              
              {/* Middle ring - counter rotation */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-16 h-16 border-4 border-transparent border-t-brand-500 border-r-brand-500 rounded-full"
              />
              
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 border-4 border-transparent border-t-brand-600 rounded-full"
              />
              
              {/* Center animated dot */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-4 h-4 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full shadow-lg"
              />
              
              {/* Orbiting dots */}
              {[0, 120, 240].map((rotation, index) => (
                <motion.div
                  key={index}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: index * 0.5
                  }}
                  className="absolute w-20 h-20"
                  style={{ transformOrigin: 'center' }}
                >
                  <div 
                    className="w-2 h-2 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full absolute"
                    style={{ 
                      top: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Loading text with typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <motion.h2
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-xl font-semibold text-brand-800"
              >
                Preparing Your Experience
              </motion.h2>
              
              <div className="h-6 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    width: ['20%', '100%', '100%', '20%'],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                  className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-full"
                />
              </div>
              
              <motion.p
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="text-brand-600 text-sm"
              >
                Setting up your dashboard
              </motion.p>
            </motion.div>

            {/* Bottom decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-brand-400/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${60 + Math.random() * 30}%`,
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (invoicesLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center z-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-20" />
          
          {/* Floating animated orbs */}
          <motion.div
            animate={{ 
              y: [0, -30, 0], 
              x: [0, 20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-brand-300/40 to-brand-400/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, 25, 0], 
              x: [0, -25, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-brand-300/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, -15, 0], 
              x: [0, 15, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-brand-100/30 to-brand-200/20 rounded-full blur-3xl"
          />
        </div>

        {/* Main loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          {/* Glassmorphic container */}
          <div className="relative p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-md mx-auto overflow-hidden">
            {/* Subtle shine effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <img 
                src="/images/billr-logo.png" 
                alt="Billr Logo" 
                className="w-32 h-auto mx-auto drop-shadow-lg"
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <h1 className="hidden text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
                Billr
              </h1>
            </motion.div>

            {/* Advanced loading animation */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-brand-200/30 rounded-full"
              />
              
              {/* Middle ring - counter rotation */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-16 h-16 border-4 border-transparent border-t-brand-500 border-r-brand-500 rounded-full"
              />
              
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 border-4 border-transparent border-t-brand-600 rounded-full"
              />
              
              {/* Center animated dot */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-4 h-4 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full shadow-lg"
              />
              
              {/* Orbiting dots */}
              {[0, 120, 240].map((rotation, index) => (
                <motion.div
                  key={index}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: index * 0.5
                  }}
                  className="absolute w-20 h-20"
                  style={{ transformOrigin: 'center' }}
                >
                  <div 
                    className="w-2 h-2 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full absolute"
                    style={{ 
                      top: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Loading text with typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <motion.h2
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-xl font-semibold text-brand-800"
              >
                Preparing Your Experience
              </motion.h2>
              
              <div className="h-6 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    width: ['20%', '100%', '100%', '20%'],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                  className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-full"
                />
              </div>
              
              <motion.p
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="text-brand-600 text-sm"
              >
                Setting up your dashboard
              </motion.p>
            </motion.div>

            {/* Bottom decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-brand-400/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${60 + Math.random() * 30}%`,
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 cursor-pointer"
              >
                <img 
                  src="/images/billr-logo.png" 
                  alt="Billr Logo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    // Fallback to text if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-700 to-brand-900">
                  Billr
                </span>
              </button>
            </div>
                      <div className="flex items-center space-x-6">
            <span className="text-zinc-700">Welcome, {currentUser?.displayName || currentUser?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-medium shadow-brand hover:shadow-brand-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2"
            >
              Sign Out
            </button>
          </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-800 mb-2">Dashboard</h2>
          <p className="text-brand-600">Manage your invoices and track your earnings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-brand-200/60">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'invoices', name: 'Invoices', icon: FileText },
                { id: 'customers', name: 'Customers', icon: Users },
                { id: 'schedule', name: 'Schedule', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as DashboardTab)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-2 ${
                      isActive ? 'text-brand-600' : 'text-brand-400 group-hover:text-brand-500'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-brand-800">${stats.totalEarnings.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      {monthlyGrowth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ml-1 ${monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Math.abs(monthlyGrowth).toFixed(1)}% vs last month
                      </span>
                    </div>
              </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-brand-800">${advancedStats.thisMonthRevenue.toFixed(2)}</p>
                    <p className="text-xs text-brand-500 mt-1">
                      Last 30 days: ${advancedStats.last30DaysRevenue.toFixed(2)}
                    </p>
              </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Pending Amount</p>
                    <p className="text-2xl font-bold text-brand-800">${stats.pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-brand-500 mt-1">
                      {regularInvoices.filter(inv => inv.status === 'pending').length} invoices
                    </p>
              </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-brand-800">{advancedStats.conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-brand-500 mt-1">
                      {stats.paidInvoices}/{stats.totalInvoices} paid
                    </p>
              </div>
                  <div className="p-3 bg-brand-100 rounded-xl">
                    <Target className="w-6 h-6 text-brand-600" />
              </div>
            </div>
          </motion.div>
        </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-brand-800">Revenue Trend (30 Days)</h3>
                  <div className="flex items-center gap-2 text-sm text-brand-600">
                    <div className="w-3 h-3 bg-brand-600 rounded-full"></div>
                    Daily Revenue
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Status Breakdown Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <h3 className="text-lg font-semibold text-brand-800 mb-6">Invoice Status Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {statusBreakdown.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm text-brand-600">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Show More Toggle */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowMoreWidgets(!showMoreWidgets)}
                className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-brand-200/60 rounded-xl text-brand-600 hover:text-brand-800 hover:bg-brand-50/80 transition-all duration-300 shadow-brand"
              >
                {showMoreWidgets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showMoreWidgets ? 'Show Less Analytics' : 'Show More Analytics'}
              </button>
            </div>

            {/* Extended Analytics (Show More) */}
            <AnimatePresence>
              {showMoreWidgets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 mb-8"
                >
                  {/* Additional Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Average Invoice</p>
                          <p className="text-2xl font-bold text-brand-800">
                            ${advancedStats.averageInvoiceValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-brand-500 mt-1">Per invoice</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Last 7 Days</p>
                          <p className="text-2xl font-bold text-brand-800">
                            ${advancedStats.last7DaysRevenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-brand-500 mt-1">This week</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Overdue Amount</p>
                          <p className="text-2xl font-bold text-red-700">
                            ${advancedStats.overdueAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-red-500 mt-1">
                            {advancedStats.overdueInvoices} invoices
                          </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Success Rate</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {((stats.paidInvoices / Math.max(1, stats.totalInvoices)) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">Paid invoices</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Monthly Trend Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                  >
                    <h3 className="text-lg font-semibold text-brand-800 mb-6">Monthly Revenue Trends</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{ fill: '#64748b' }}
                          />
                          <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{ fill: '#64748b' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '8px',
                              backdropFilter: 'blur(8px)'
                            }}
                            formatter={(value: any, name: string) => [
                              name === 'revenue' ? `$${value.toFixed(2)}` : value,
                              name === 'revenue' ? 'Revenue' : 'Invoices'
                            ]}
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Invoices Table */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-white/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl font-semibold text-brand-800">Invoices</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-4 py-2 pr-10 bg-white/60 border border-brand-200/60 rounded-xl text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm appearance-none bg-no-repeat bg-right"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2 shadow-brand hover:shadow-brand-lg"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                    <tr className="border-b border-brand-200/40">
                      <th className="text-left p-4 text-brand-700 font-medium">Client</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Description</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Amount</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Status</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Due Date</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Type</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                        className="border-b border-brand-200/20 hover:bg-brand-100/20 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-brand-800">{invoice.clientName || 'No name'}</div>
                            <div className="text-sm text-brand-600">{invoice.clientEmail}</div>
                          </div>
                        </td>
                        <td className="p-4 text-brand-700">{invoice.description}</td>
                        <td className="p-4 font-semibold text-brand-800">${invoice.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            invoice.status === 'paid' 
                              ? 'bg-emerald-100/80 text-emerald-700'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100/80 text-red-700'
                              : 'bg-amber-100/80 text-amber-700'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-brand-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {invoice.dueDate.toDate().toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {invoice.isRecurring ? (
                            <div className="flex items-center gap-1 text-brand-600">
                              <Repeat className="w-4 h-4" />
                              <span className="text-xs">
                                {invoice.recurringFrequency ? `${invoice.recurringFrequency.charAt(0).toUpperCase() + invoice.recurringFrequency.slice(1)}` : 'Recurring'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-brand-500">One-time</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(invoice)}
                              className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                              title="Edit Invoice"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => handleSendEmail(invoice)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  invoice.emailSent 
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-100/40' 
                                    : 'text-brand-600 hover:text-brand-800 hover:bg-brand-100/40'
                                }`}
                                title={invoice.emailSent ? "Email Sent - Send Again" : "Send Email"}
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                            {invoice.status === 'overdue' && (
                              <button
                                onClick={() => console.log('Send reminder for:', invoice.id)}
                                className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100/40 rounded-lg transition-all duration-200"
                                title="Send Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            )}
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => handlePayNow(invoice)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100/40 rounded-lg transition-all duration-200"
                                title="Pay Now"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-brand-600">No invoices found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <CustomerManagement invoices={regularInvoices} />
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-xl">
            <div className="p-6 border-b border-white/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-brand-800">All Invoices</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 pr-10 bg-white/60 border border-brand-200/60 rounded-xl text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2 shadow-brand hover:shadow-brand-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200/40">
                    <th className="text-left p-4 text-brand-700 font-medium">Client</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Description</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Amount</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Status</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Due Date</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Type</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-brand-200/20 hover:bg-brand-100/20 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                          <div className="font-medium text-brand-800">{invoice.clientName || 'No name'}</div>
                          <div className="text-sm text-brand-600">{invoice.clientEmail}</div>
                      </div>
                    </td>
                      <td className="p-4 text-brand-700">{invoice.description}</td>
                      <td className="p-4 font-semibold text-brand-800">${invoice.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        invoice.status === 'paid' 
                          ? 'bg-emerald-100/80 text-emerald-700'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100/80 text-red-700'
                          : 'bg-amber-100/80 text-amber-700'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                      <td className="p-4 text-brand-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {invoice.dueDate.toDate().toLocaleDateString()}
                      </div>
                    </td>
                      <td className="p-4">
                        {invoice.isRecurring ? (
                          <div className="flex items-center gap-1 text-brand-600">
                            <Repeat className="w-4 h-4" />
                            <span className="text-xs">
                              {invoice.recurringFrequency ? `${invoice.recurringFrequency.charAt(0).toUpperCase() + invoice.recurringFrequency.slice(1)}` : 'Recurring'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-brand-500">One-time</span>
                        )}
                    </td>
                                        <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                          <button
                            onClick={() => handleOpenEditModal(invoice)}
                            className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                            title="Edit Invoice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleSendEmail(invoice)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              invoice.emailSent 
                                ? 'text-green-600 hover:text-green-800 hover:bg-green-100/40' 
                                : 'text-brand-600 hover:text-brand-800 hover:bg-brand-100/40'
                            }`}
                            title={invoice.emailSent ? "Email Sent - Send Again" : "Send Email"}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status === 'overdue' && (
                          <button
                            onClick={() => console.log('Send reminder for:', invoice.id)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100/40 rounded-lg transition-all duration-200"
                            title="Send Reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handlePayNow(invoice)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100/40 rounded-lg transition-all duration-200"
                            title="Pay Now"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                  <p className="text-brand-600">No invoices found</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-brand hover:shadow-brand-lg"
                >
                  Create Your First Invoice
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <ScheduleCalendar invoices={regularInvoices} />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
            {isCreateModalOpen && (
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onCreateInvoice={handleCreateInvoice}
          onEditInvoice={handleEditInvoice}
          editingInvoice={editingInvoice}
          onCreateCustomer={handleCreateCustomer}
        />
      )}
      </AnimatePresence>

      <AnimatePresence>
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSendEmail={handleSendEmail}
        />
      )}
      </AnimatePresence>
    </div>
  );
}; 

export default Dashboard;