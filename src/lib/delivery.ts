const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

function easterSunday(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function brazilNationalHolidays(year: number): Set<string> {
  const fixed = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
  const dates = new Set(fixed.map((day) => `${year}-${day}`));
  const easter = easterSunday(year);
  // Carnaval e Sexta-feira Santa entram como dias sem operação logística nesta estimativa
  for (const offset of [-48, -47, -2]) {
    const date = new Date(easter);
    date.setUTCDate(date.getUTCDate() + offset);
    dates.add(date.toISOString().slice(0, 10));
  }
  return dates;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getEstimatedDeliveryDate(now = new Date()): Date {
  const local = new Date(now.toLocaleString("en-US", { timeZone: BRAZIL_TIME_ZONE }));
  const candidate = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  // Estimativa conservadora: próximo dia útil, ignorando fins de semana e feriados nacionais
  candidate.setUTCDate(candidate.getUTCDate() + 1);
  for (let attempts = 0; attempts < 15; attempts += 1) {
    const weekday = candidate.getUTCDay();
    const holidays = brazilNationalHolidays(candidate.getUTCFullYear());
    if (weekday !== 0 && weekday !== 6 && !holidays.has(dateKey(candidate))) return candidate;
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate;
}

export function formatEstimatedDelivery(now = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long",
  }).format(getEstimatedDeliveryDate(now));
}
