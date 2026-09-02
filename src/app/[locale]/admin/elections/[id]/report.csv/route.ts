import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isLocale } from "@/i18n";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number) {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; id: string }> },
) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });
  if (!election) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eligible = await prisma.member.count({ where: { status: "ACTIVE" } });
  const totalVotes = election._count.votes;
  const ranked = [...election.candidates].sort((a, b) => b._count.votes - a._count.votes);

  const lines = [
    ["Election", election.titleEn],
    ["Slug", election.slug],
    ["Status", election.status],
    ["Opens", election.opensAt.toISOString()],
    ["Closes", election.closesAt?.toISOString() ?? ""],
    ["Total votes", totalVotes],
    ["Eligible active members", eligible],
    ["Turnout %", eligible > 0 ? ((totalVotes / eligible) * 100).toFixed(1) : "0"],
    [],
    ["Rank", "Candidate", "Position", "Votes", "Share %"],
    ...ranked.map((c, i) => {
      const share = totalVotes > 0 ? ((c._count.votes / totalVotes) * 100).toFixed(1) : "0";
      return [i + 1, c.name, c.positionEn, c._count.votes, share];
    }),
  ];

  const body = lines
    .map((row) => (row.length === 0 ? "" : row.map(csvEscape).join(",")))
    .join("\r\n");

  const filename = `election-${election.slug}-report.csv`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
