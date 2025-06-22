import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, 
  Repeat,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

export const ScheduleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { invoices, loading } = useInvoices();

  // Helper function to get invoices for a specific date (due date or paid date)
  const getInvoicesForDate = (date: Date): any[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return invoices.filter(invoice => {
      // Show on due date if not paid
      const dueDate = format(invoice.dueDate.toDate(), 'yyyy-MM-dd');
      if (!invoice.paidAt && dueDate === dateStr) {
        return true;
      }
      
      // Show on paid date if paid
      if (invoice.paidAt) {
        const paidDate = format(invoice.paidAt.toDate(), 'yyyy-MM-dd');
        return paidDate === dateStr;
      }
      
      return false;
    });
  };

  // Helper function removed as it was not being used

     // const invoiceDates = getInvoiceDates(); // Commented out as it's not being used
  const selectedDateInvoices = selectedDate ? getInvoicesForDate(selectedDate) : [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayInvoices = getInvoicesForDate(date);
      
      if (dayInvoices.length > 0) {
        const paidInvoices = dayInvoices.filter(inv => inv.paidAt);
        const unpaidInvoices = dayInvoices.filter(inv => !inv.paidAt);
        
        return (
          <div className="flex justify-center mt-1 gap-1">
            {unpaidInvoices.length > 0 && (
              <div 
                className="w-2 h-2 bg-amber-500 rounded-full" 
                title={`${unpaidInvoices.length} invoice(s) due`}
              />
            )}
            {paidInvoices.length > 0 && (
              <div 
                className="w-2 h-2 bg-emerald-500 rounded-full" 
                title={`${paidInvoices.length} invoice(s) paid`}
              />
            )}
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayInvoices = getInvoicesForDate(date);
      
      if (dayInvoices.length > 0) {
        const paidInvoices = dayInvoices.filter(inv => inv.paidAt);
        const unpaidInvoices = dayInvoices.filter(inv => !inv.paidAt);
        
        if (paidInvoices.length > 0 && unpaidInvoices.length === 0) {
          return 'has-paid-invoice';
        } else if (unpaidInvoices.length > 0) {
          return 'has-due-invoice';
        }
      }
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-brand-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-800">Invoice Calendar</h2>
          <p className="text-brand-600">View invoice due dates and payment dates on the calendar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white/80 backdrop-blur-xl border border-brand-200/60 rounded-2xl shadow-brand">
            <style>{`
              .react-calendar {
                width: 100%;
                background: transparent;
                border: none;
                font-family: inherit;
              }
              .react-calendar__navigation {
                display: flex;
                height: 44px;
                margin-bottom: 1em;
              }
              .react-calendar__navigation button {
                min-width: 44px;
                background: transparent;
                border: none;
                color: #1e40af;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.2s;
              }
              .react-calendar__navigation button:hover {
                background-color: rgba(59, 130, 246, 0.1);
                border-radius: 8px;
              }
              .react-calendar__month-view__weekdays {
                text-align: center;
                text-transform: uppercase;
                font-weight: bold;
                font-size: 0.75em;
                color: #6b7280;
              }
              .react-calendar__month-view__weekdays__weekday {
                padding: 0.5em;
              }
              .react-calendar__month-view__days__day {
                position: relative;
                background: transparent;
                border: none;
                color: #374151;
                padding: 0.75em 0.5em;
                transition: all 0.2s;
                border-radius: 8px;
                margin: 1px;
              }
              .react-calendar__month-view__days__day:hover {
                background-color: rgba(59, 130, 246, 0.1);
                color: #1e40af;
              }
              .react-calendar__month-view__days__day--active {
                background-color: rgba(59, 130, 246, 0.08) !important;
                color: #374151 !important;
                font-weight: 600;
                border: 1px solid rgba(59, 130, 246, 0.25) !important;
                box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
              }
              .react-calendar__month-view__days__day--neighboringMonth {
                color: #d1d5db;
              }
              .react-calendar__tile.has-scheduled-invoice {
                background-color: rgba(59, 130, 246, 0.1);
                color: #1e40af;
                font-weight: 600;
              }
              .react-calendar__tile.has-scheduled-invoice:hover {
                background-color: rgba(59, 130, 246, 0.2);
              }
              .react-calendar__tile.has-due-invoice {
                background-color: rgba(245, 158, 11, 0.1);
                color: #d97706;
                font-weight: 600;
              }
              .react-calendar__tile.has-due-invoice:hover {
                background-color: rgba(245, 158, 11, 0.2);
              }
              .react-calendar__tile.has-paid-invoice {
                background-color: rgba(16, 185, 129, 0.1);
                color: #059669;
                font-weight: 600;
              }
              .react-calendar__tile.has-paid-invoice:hover {
                background-color: rgba(16, 185, 129, 0.2);
              }
            `}</style>
            
            <Calendar
              onChange={(date) => handleDateClick(date as Date)}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              next2Label={null}
              prev2Label={null}
              nextLabel={<ChevronRight className="w-4 h-4" />}
              prevLabel={<ChevronLeft className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Invoices for Selected Date */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white/80 backdrop-blur-xl border border-brand-200/60 rounded-2xl shadow-brand">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-800">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </h3>
            </div>

            {selectedDateInvoices.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                <p className="text-brand-600 text-sm">No invoices on this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const paidInvoices = selectedDateInvoices.filter(inv => inv.paidAt);
                  const unpaidInvoices = selectedDateInvoices.filter(inv => !inv.paidAt);

                  return (
                    <>
                      {unpaidInvoices.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Due Invoices ({unpaidInvoices.length})
                          </h4>
                          <div className="space-y-2">
                            {unpaidInvoices.map((invoice) => (
                              <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-amber-50/60 border border-amber-200/40 rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-brand-800 text-sm">
                                      {invoice.description}
                                    </h5>
                                    <p className="text-xs text-brand-600 mt-1">
                                      {invoice.clientName || invoice.clientEmail}
                                    </p>
                                    <p className="text-xs text-brand-500 mt-1">
                                      Invoice #{invoice.number}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {invoice.isRecurring && !invoice.isTemplate && (
                                      <div className="flex items-center gap-1">
                                        <Repeat className="w-3 h-3 text-brand-500" />
                                        <span className="text-xs text-brand-500">
                                          {invoice.recurringFrequency || 'Recurring'}
                                        </span>
                                      </div>
                                    )}
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      invoice.status === 'paid' 
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : invoice.status === 'overdue'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-brand-600">
                                  <span>${invoice.total?.toFixed(2) || invoice.amount?.toFixed(2)}</span>
                                  <span>Due: {invoice.dueDate.toDate().toLocaleDateString()}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {paidInvoices.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Paid Invoices ({paidInvoices.length})
                          </h4>
                          <div className="space-y-2">
                            {paidInvoices.map((invoice) => (
                              <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-emerald-50/60 border border-emerald-200/40 rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-brand-800 text-sm">
                                      {invoice.description}
                                    </h5>
                                    <p className="text-xs text-brand-600 mt-1">
                                      {invoice.clientName || invoice.clientEmail}
                                    </p>
                                    <p className="text-xs text-brand-500 mt-1">
                                      Invoice #{invoice.number}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {invoice.isRecurring && !invoice.isTemplate && (
                                      <div className="flex items-center gap-1">
                                        <Repeat className="w-3 h-3 text-brand-500" />
                                        <span className="text-xs text-brand-500">
                                          {invoice.recurringFrequency || 'Recurring'}
                                        </span>
                                      </div>
                                    )}
                                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                                      Paid
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-brand-600">
                                  <span>${invoice.total?.toFixed(2) || invoice.amount?.toFixed(2)}</span>
                                  <div className="text-right">
                                    <div>Paid: {invoice.paidAt?.toDate().toLocaleDateString()}</div>
                                    <div className="text-emerald-600">Method: {invoice.paidMethod}</div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 