"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const enum eViewMode {
  MONTHLY =  "MONTHLY" ,
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
  const [loanTerm, setLoanTerm] = useState(30);
  const [view, setView] = useState(DEFAULT_VIEW);

  const loanAmount = price - downPayment;
  const monthlyInterest = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;
  const monthlyPayment =
    (loanAmount * monthlyInterest) /
    (1 - Math.pow(1 + monthlyInterest, -totalPayments));

  const schedule = Array.from({ length: totalPayments }, (_, i) => {
    const interest = loanAmount * monthlyInterest;
    const principal = monthlyPayment - interest;
    return {
      month: i + 1,
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      total: Number(monthlyPayment.toFixed(2))
    };
  });

  const grouped = view === eViewMode.YEARLY
    ? Array.from({ length: loanTerm }, (_, i) => {
      const yearData = schedule.slice(i * 12, (i + 1) * 12);
      const sum = (key) => yearData.reduce((a, b) => a + b[key], 0);
      return {
        year: i + 1,
        principal: Number(sum("principal").toFixed(2)),
        interest: Number(sum("interest").toFixed(2)),
        total: Number(sum("total").toFixed(2))
      };
    })
    : schedule;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏡 Mortgage Repayment Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="House Price"
        />
        <Input
          type="number"
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          placeholder="Down Payment"
        />
        <Input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          placeholder="Interest Rate (%)"
        />
        <Input
          type="number"
          value={loanTerm}
          onChange={(e) => setLoanTerm(Number(e.target.value))}
          placeholder="Loan Term (Years)"
        />
      </div>

      <Tabs value={view} onValueChange={setView} className="mb-4">
        <TabsList>
          <TabsTrigger value={eViewMode.MONTHLY}>Monthly</TabsTrigger>
          <TabsTrigger value={eViewMode.YEARLY}>Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-2">
        {grouped.map((entry, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex justify-between text-sm">
              <span>
                {view === eViewMode.YEARLY ? `Year ${entry.year}` : `Month ${entry.month}`}:
              </span>
              <span>
                💸 Total: €{entry.total.toLocaleString()} → 📉 Principal: €{entry.principal.toLocaleString()} + 🧾 Interest: €{entry.interest.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
