
export function range(min: number, max: number): number[] {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
}

export function numberOrDefault(value: number | string, defaultValue: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

export function calculateMonthlyInterest(rate: number) {
    return rate / 100 / 12;
}

export function calculateTotalPayments(termYears: number) {
    return termYears * 12;
}

export function calculateMonthlyPayment(loanAmount: number, monthlyInterest: number, totalPayments: number) {
    return (loanAmount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -totalPayments));
}

export function generateSchedule(loanAmount: number, monthlyInterest: number, monthlyPayment: number, totalPayments: number) {
    let remainingDebt = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    return range(0, totalPayments).map(i => {
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
}

export function groupByYear(schedule: any[], loanTerm: number) {
    return range(0, loanTerm).map(i => {
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
    });
}


export function generateRepaymentPlan(loanAmount: number, interestRate: number) {
    return range(4, 30).map((i) => {
        const term = i + 1;
        const monthlyInterest = calculateMonthlyInterest(interestRate);
        const totalPayments = calculateTotalPayments(term);
        const monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyInterest, totalPayments);
        const totalPaid = monthlyPayment * totalPayments;
        const interest = totalPaid / loanAmount * 100;
        return {
            term,
            interest: Number(interest.toFixed(4)),
            totalPaid: Number(totalPaid.toFixed(2)),
            monthlyPayment: Number(monthlyPayment.toFixed(2)),
        };
    });
}