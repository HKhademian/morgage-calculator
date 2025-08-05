
export function range(min: number, max: number): number[] {
    return Array.from({ length: max - min }, (_, i) => i + min);
}

export function formatCurrency(value: number): string {
    return `€${value.toLocaleString("en-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function round(value: number): number {
    return Number(value.toFixed(2));
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

export function generateSchedule(
    loanAmount: number,
    monthlyInterest: number,
    monthlyPayment: number,
    totalPayments: number,
    additionalPrincipal: number = 0,
) {
    let remainingDebt = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    const schedule = [];
    for (let month = 1; month <= totalPayments + 5; month++) {
        if (remainingDebt <= 0) {
            break;
        }

        const interest = remainingDebt * monthlyInterest;
        let principal = monthlyPayment - interest + additionalPrincipal;
        if (principal > remainingDebt + interest) {
            principal = remainingDebt;
        }
        const currentDebt = remainingDebt;
        remainingDebt -= principal;
        cumulativePrincipal += principal;
        cumulativeInterest += interest;
        schedule.push({
            month: month,
            year: Math.floor((month - 1) / 12) + 1,
            remainingDebt: round(currentDebt),
            principal: round(principal),
            interest: round(interest),
            total: round(monthlyPayment + additionalPrincipal),
            totalPrincipalPaid: round(cumulativePrincipal),
            totalInterestPaid: round(cumulativeInterest),
        });
    }
    return schedule;
}

export function groupByYear(schedule: any[], loanTerm: number) {
    return range(1, loanTerm + 1).map(year => {
        const yearData = schedule.slice((year - 1) * 12, year * 12);
        const sum = (key: any) => yearData.reduce((a, b) => a + (b as any)[key], 0);
        return {
            month: 0,
            year: year,
            principal: round(sum("principal")),
            interest: round(sum("interest")),
            total: round(sum("total")),
            remainingDebt: round((yearData.at(-1)?.remainingDebt ?? 0)),
            totalPrincipalPaid: round((yearData.at(-1)?.totalPrincipalPaid ?? 0)),
            totalInterestPaid: round((yearData.at(-1)?.totalInterestPaid ?? 0)),
        };
    });
}

export function generateRepaymentPlan(loanAmount: number, interestRate: number) {
    return range(1, 30 + 1).map((i) => {
        const term = i;
        const monthlyInterest = calculateMonthlyInterest(interestRate);
        const totalPayments = calculateTotalPayments(term);
        const monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyInterest, totalPayments);
        const totalPaid = monthlyPayment * totalPayments;
        const interest = totalPaid / loanAmount * 100 - 100;
        return {
            term,
            interest: round(interest),
            totalPaid: round(totalPaid),
            monthlyPayment: round(monthlyPayment),
        };
    });
}