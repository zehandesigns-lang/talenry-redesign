/** A yearly salary in the user's currency: rupees for India, dollars everywhere else */
export function formatSalary(amount: number, country: string | undefined) {
  const india = country === 'India'
  return new Intl.NumberFormat(india ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: india ? 'INR' : 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Reads what was typed into a salary field; null when it's empty */
export function parseSalaryInput(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 9)
  return digits ? Number(digits) : null
}
