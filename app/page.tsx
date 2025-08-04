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

import {
  calculateMonthlyInterest,
  calculateTotalPayments,
  calculateMonthlyPayment,
  generateSchedule,
  groupByYear,
  numberOrDefault,
  generateRepaymentPlan,
  formatCurrency,
} from "@/lib/morgage";

const enum eViewMode {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
};

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
  const monthlyInterest = calculateMonthlyInterest(interestRate);
  const totalPayments = calculateTotalPayments(loanTerm);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyInterest, totalPayments);
  const schedule = generateSchedule(loanAmount, monthlyInterest, monthlyPayment, totalPayments);

  const grouped = view === eViewMode.YEARLY
    ? groupByYear(schedule, loanTerm)
    : schedule;

  const repaymentPlan = generateRepaymentPlan(loanAmount, interestRate);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏡 Mortgage Repayment Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">🏠 House Price (€)</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(numberOrDefault(e.target.value))}
            placeholder="House Price"
          />
        </div>
        <div>
          <label className="text-sm font-medium">💰 Down Payment (€)</label>
          <Input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(numberOrDefault(e.target.value))}
            placeholder="Down Payment"
          />
        </div>
        <div>
          <label className="text-sm font-medium">📊 Interest Rate (%)</label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(numberOrDefault(e.target.value))}
            placeholder="Interest Rate"
          />
        </div>
        <div>
          <label className="text-sm font-medium">📆 Loan Term (Years)</label>
          <Input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(numberOrDefault(e.target.value))}
            placeholder="Loan Term"
          />
        </div>
      </div>

      <div className="mb-8">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={repaymentPlan}>
            <CartesianGrid strokeDasharray="3 3" />
            <Legend />
            <YAxis />
            <XAxis dataKey="term" label={{ value: "Loan Term (Years)", position: "insideBottomRight", offset: -5 }} />
            <Tooltip formatter={formatCurrency} />
            <Line type="monotone" dataKey="monthlyPayment" stroke="#0ea5e9" name="Monthly Payment" />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={repaymentPlan}>
            <CartesianGrid strokeDasharray="3 3" />
            <Legend />
            <YAxis />
            <XAxis dataKey="term" label={{ value: "Loan Term (Years)", position: "insideBottomRight", offset: -5 }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} %`} />
            <Line type="monotone" dataKey="interest" stroke="#e80000ff" name="Interest" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-md text-sm">
        <p>💸 <strong>Loan Amount:</strong> {formatCurrency(loanAmount)}</p>
        <p>📆 <strong>Total Payments:</strong> {totalPayments} months</p>
        <p>📥 <strong>Monthly Payment:</strong> {formatCurrency(monthlyPayment)}</p>
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
            <Tooltip formatter={formatCurrency} />
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
                <span>💸 Total: {formatCurrency(entry.total)}</span>
                <span>📉 Principal: {formatCurrency(entry.principal)}</span>
                <span>🧾 Interest: {formatCurrency(entry.interest)}</span>
                <span>💼 Remaining: {formatCurrency(entry.remainingDebt)}</span>
                <br />
                <span>📉 Total Principal Paid: {formatCurrency(entry.totalPrincipalPaid)}</span>
                <span>🧾 Total Interest Paid: {formatCurrency(entry.totalInterestPaid)}</span>
                <span>💰 Total Paid: {formatCurrency(entry.totalPrincipalPaid + entry.totalInterestPaid)}</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}