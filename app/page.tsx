"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const enum eViewMode {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
};

function numberOrDefault(value: number | string, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}


const DEFAULT_PRICE = 400_000;
const DEFAULT_DOWN = 40_000;
const DEFAULT_INT = 3.65;
const DEFAULT_TERM = 30;
const DEFAULT_VIEW = eViewMode.YEARLY;

export default function MortgageCalculator() {
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [downPayment, setDownPayment] = useState(DEFAULT_DOWN);
  const [interestRate, setInterestRate] = useState(DEFAULT_INT);
  const [loanTerm, setLoanTerm] = useState(DEFAULT_TERM);
  const [view, setView] = useState(DEFAULT_VIEW);

  const loanAmount = price - downPayment;
  const monthlyInterest = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;
  const monthlyPayment =
    (loanAmount * monthlyInterest) /
    (1 - Math.pow(1 + monthlyInterest, -totalPayments));

  let remainingDebt = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  const schedule = Array.from({ length: totalPayments }, (_, i) => {
    const interest = remainingDebt * monthlyInterest;
    const principal = monthlyPayment - interest;
    const currentDebt = remainingDebt;
    remainingDebt -= principal;
    cumulativePrincipal += principal;
    cumulativeInterest += interest;

    return {
      month: i + 1,
      year: Math.floor(i / 12) + 1,
      remainingDebt: Number(currentDebt.toFixed(2)),
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      total: Number(monthlyPayment.toFixed(2)),
      totalPrincipalPaid: Number(cumulativePrincipal.toFixed(2)),
      totalInterestPaid: Number(cumulativeInterest.toFixed(2)),
    };
  });

  const grouped = view === eViewMode.YEARLY
    ? Array.from({ length: loanTerm }, (_, i) => {
      const yearData = schedule.slice(i * 12, (i + 1) * 12);
      const sum = (key: any) => yearData.reduce((a, b) => a + (b as any)[key], 0);
      return {
        month: undefined,
        year: i + 1,
        principal: Number(sum("principal").toFixed(2)),
        interest: Number(sum("interest").toFixed(2)),
        total: Number(sum("total").toFixed(2)),
        remainingDebt: Number((yearData.at(-1)?.remainingDebt ?? 0).toFixed(2)),
        totalPrincipalPaid: Number((yearData.at(-1)?.totalPrincipalPaid ?? 0).toFixed(2)),
        totalInterestPaid: Number((yearData.at(-1)?.totalInterestPaid ?? 0).toFixed(2)),
      };
    })
    : schedule;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏡 Mortgage Repayment Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">🏠 House Price (€)</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="House Price"
          />
        </div>
        <div>
          <label className="text-sm font-medium">💰 Down Payment (€)</label>
          <Input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            placeholder="Down Payment"
          />
        </div>
        <div>
          <label className="text-sm font-medium">📊 Interest Rate (%)</label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            placeholder="Interest Rate"
          />
        </div>
        <div>
          <label className="text-sm font-medium">📆 Loan Term (Years)</label>
          <Input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            placeholder="Loan Term"
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-md text-sm">
        <p>💸 <strong>Loan Amount:</strong> €{loanAmount.toLocaleString()}</p>
        <p>📆 <strong>Total Payments:</strong> {totalPayments} months</p>
        <p>📥 <strong>Monthly Payment:</strong> €{monthlyPayment.toFixed(2)}</p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as eViewMode)} className="mb-4">
        <TabsList>
          <TabsTrigger value={eViewMode.MONTHLY}>Monthly</TabsTrigger>
          <TabsTrigger value={eViewMode.YEARLY}>Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={grouped}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={view === eViewMode.YEARLY ? "year" : "month"} />
            <YAxis />
            <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
            <Legend />
            {/* <Line type="monotone" dataKey="principal" stroke="#4ade80" name="Principal" />
            <Line type="monotone" dataKey="interest" stroke="#60a5fa" name="Interest" /> */}
            <Line type="monotone" dataKey="remainingDebt" stroke="#f97316" name="Remaining Debt" />
            <Line type="monotone" dataKey="totalPrincipalPaid" stroke="#16a34a" name="Total Principal Paid" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="totalInterestPaid" stroke="#2563eb" name="Total Interest Paid" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-2">
        {grouped.map((entry, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex justify-between text-sm">
              <span>
                {view === eViewMode.YEARLY ? `Year ${entry.year}` : `Month ${entry.month} (Year ${entry.year})`}:
              </span>
              <span className="flex flex-col items-end">
                <span>💸 Total: €{entry.total.toFixed(2)}</span>
                <span>📉 Principal: €{entry.principal.toFixed(2)}</span>
                <span>🧾 Interest: €{entry.interest.toFixed(2)}</span>
                <span>💼 Remaining: €{entry.remainingDebt.toFixed(2)}</span>
                <br />
                <span>📉 Total Principal Paid: €{entry.totalPrincipalPaid.toFixed(2)}</span>
                <span>🧾 Total Interest Paid: €{entry.totalInterestPaid.toFixed(2)}</span>
                <span>💰 Total Paid: €{(entry.totalPrincipalPaid + entry.totalInterestPaid).toFixed(2)}</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}