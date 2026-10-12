import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { FineRecord } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Wallet,
} from 'lucide-react';

export const FinesPage: React.FC = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [payingFine, setPayingFine] = useState<FineRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<FineRecord | null>(null);

  useEffect(() => {
    if (user) loadFines();
  }, [user]);

  const loadFines = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.getFines(user.id);
      setFines(list);
    } catch (e) {
      console.error('Failed to load fines', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payingFine) return;
    setIsProcessing(true);
    try {
      const res = await api.payFine(
        payingFine.id,
        paymentMethod === 'card' ? 'Credit Card (ending 4242)' : 'Student Digital Wallet',
        `TXN-LIB-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setReceipt(res);
      setPayingFine(null);
      loadFines();
    } catch (e) {
      console.error('Payment failed', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const unpaidFines = fines.filter((f) => f.status === 'unpaid');
  const totalUnpaid = unpaidFines.reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Overdue Fine Ledger & Payments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Automated fine calculation: fine = overdue days &times; fine per day ($0.50/day). Pay outstanding library balance online securely.
        </p>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
            Total Outstanding Balance
          </span>
          <h2 className="text-3xl font-extrabold font-mono text-white mt-1">
            ${totalUnpaid.toFixed(2)}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {unpaidFines.length === 0
              ? 'Your library fine balance is completely clear ($0.00).'
              : `You have ${unpaidFines.length} pending overdue fine record(s).`}
          </p>
        </div>

        {unpaidFines.length > 0 && (
          <button
            onClick={() => setPayingFine(unpaidFines[0])}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Pay Selected Balance
          </button>
        )}
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
      ) : fines.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Fine Records</h3>
          <p className="text-xs text-slate-500 mt-1">
            You have no fine records on file. Always return books before the due date to maintain a clear record!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Book Title</th>
                <th className="p-4">Overdue Days</th>
                <th className="p-4">Fine Rate</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {fines.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{f.bookTitle}</td>
                  <td className="p-4 font-mono">{f.overdueDays} days</td>
                  <td className="p-4 font-mono text-slate-500">${f.finePerDay.toFixed(2)}/day</td>
                  <td className="p-4 font-mono font-extrabold text-slate-900 text-sm">
                    ${f.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="p-4 text-right">
                    {f.status === 'unpaid' ? (
                      <button
                        onClick={() => setPayingFine(f)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Pay ${f.amount.toFixed(2)}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ref: {f.transactionRef || 'PAID'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {payingFine && (
        <Modal
          isOpen={!!payingFine}
          onClose={() => setPayingFine(null)}
          title="Library Fine Payment Gateway"
          maxWidth="md"
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Payment Summary
              </span>
              <h4 className="font-bold text-sm text-slate-900">{payingFine.bookTitle}</h4>
              <div className="flex items-center justify-between text-xs pt-2 font-mono">
                <span className="text-slate-500">Overdue ({payingFine.overdueDays} days &times; ${payingFine.finePerDay}/day)</span>
                <span className="font-extrabold text-slate-900 text-base">${payingFine.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Select Method */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 justify-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Credit / Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 justify-center transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-4 h-4" /> Student Wallet
                </button>
              </div>
            </div>

            {/* Card Input Mock */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      defaultValue="789"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPayingFine(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                {isProcessing ? 'Processing Payment...' : `Authorize $${payingFine.amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Receipt Modal */}
      {receipt && (
        <Modal
          isOpen={!!receipt}
          onClose={() => setReceipt(null)}
          title="Official Payment Receipt"
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Fine Payment Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Apex University Library Finance Office
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-bold text-slate-900">{receipt.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Book Title:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{receipt.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-emerald-700">${receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
