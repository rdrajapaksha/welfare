import { prisma } from "./prisma";
import { siteConfig } from "./site";

export const FEE_KEYS = {
  monthly: "fee.monthly",
  registration: "fee.registration",
} as const;

export type FeeMonth = { year: number; month: number };

/** Membership types that skip monthly subscription. */
export function isMonthlyFeeExempt(membershipType: string) {
  return membershipType === "HONORARY";
}

async function readFeeSetting(key: string, fallback: number) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  const n = Number(row.valueEn);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

export async function getMembershipFees() {
  const [monthly, registration] = await Promise.all([
    readFeeSetting(FEE_KEYS.monthly, siteConfig.fees.monthly),
    readFeeSetting(FEE_KEYS.registration, siteConfig.fees.registration),
  ]);
  return { monthly, registration };
}

export async function setMembershipFee(key: keyof typeof FEE_KEYS, amount: number) {
  const value = String(Math.max(0, Math.round(amount)));
  const settingKey = FEE_KEYS[key];
  await prisma.siteSetting.upsert({
    where: { key: settingKey },
    create: {
      key: settingKey,
      valueEn: value,
      valueSi: value,
      valueTa: value,
      group: "fees",
    },
    update: {
      valueEn: value,
      valueSi: value,
      valueTa: value,
      group: "fees",
    },
  });
}

/** Inclusive month range from join date through current calendar month. */
export function monthsFromJoinToNow(joinedAt: Date, now = new Date()): FeeMonth[] {
  const start = new Date(joinedAt.getFullYear(), joinedAt.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  if (start > end) return [];

  const months: FeeMonth[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export type MemberArrears = {
  exempt: boolean;
  monthlyFee: number;
  unpaidMonths: FeeMonth[];
  paidMonths: FeeMonth[];
  monthsDue: number;
  amountDue: number;
  paidThrough: FeeMonth | null;
};

export async function getMemberArrears(
  member: { id: string; joinedAt: Date; membershipType: string; status: string },
  fees?: { monthly: number },
): Promise<MemberArrears> {
  const monthlyFee = fees?.monthly ?? (await getMembershipFees()).monthly;

  if (member.status !== "ACTIVE" || isMonthlyFeeExempt(member.membershipType)) {
    return {
      exempt: true,
      monthlyFee,
      unpaidMonths: [],
      paidMonths: [],
      monthsDue: 0,
      amountDue: 0,
      paidThrough: null,
    };
  }

  const expected = monthsFromJoinToNow(member.joinedAt);
  if (expected.length === 0) {
    return {
      exempt: false,
      monthlyFee,
      unpaidMonths: [],
      paidMonths: [],
      monthsDue: 0,
      amountDue: 0,
      paidThrough: null,
    };
  }

  const payments = await prisma.payment.findMany({
    where: {
      memberId: member.id,
      type: "MEMBERSHIP_FEE",
      status: "PAID",
      periodMonth: { not: null },
    },
    select: { periodYear: true, periodMonth: true },
  });

  const paid = new Set(
    payments
      .filter((p) => p.periodMonth != null)
      .map((p) => `${p.periodYear}-${p.periodMonth}`),
  );

  const unpaidMonths = expected.filter((m) => !paid.has(`${m.year}-${m.month}`));
  const paidMonths = expected.filter((m) => paid.has(`${m.year}-${m.month}`));
  const paidThrough = paidMonths.length > 0 ? paidMonths[paidMonths.length - 1]! : null;

  return {
    exempt: false,
    monthlyFee,
    unpaidMonths,
    paidMonths,
    monthsDue: unpaidMonths.length,
    amountDue: unpaidMonths.length * monthlyFee,
    paidThrough,
  };
}

export async function listMembersInArrears() {
  const fees = await getMembershipFees();
  const members = await prisma.member.findMany({
    where: {
      status: "ACTIVE",
      membershipType: { notIn: ["HONORARY"] },
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      membershipNo: true,
      email: true,
      phone: true,
      joinedAt: true,
      membershipType: true,
      status: true,
    },
  });

  const rows = [];
  for (const member of members) {
    const arrears = await getMemberArrears(member, fees);
    if (arrears.monthsDue > 0) {
      rows.push({ member, arrears });
    }
  }
  return { fees, rows };
}
