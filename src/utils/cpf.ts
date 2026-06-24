export function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(cleaned[i]) * (10 - i);
  }

  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;

  if (digit !== Number(cleaned[9])) return false;

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += Number(cleaned[i]) * (11 - i);
  }

  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;

  return digit === Number(cleaned[10]);
}
