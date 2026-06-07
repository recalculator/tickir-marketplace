import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

async function canAccessConversation(conversationId: string, userId: string, userRole: string, lenderId: string | null) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      lenderInterest: {
        include: { loanRequest: { select: { borrowerId: true } } },
      },
    },
  });

  if (!conversation) return null;

  const { lenderInterest } = conversation;
  const isBorrower = userRole === UserRole.BORROWER && lenderInterest.loanRequest.borrowerId === userId;
  const isLender = lenderId && lenderInterest.lenderId === lenderId;

  if (!isBorrower && !isLender) return null;
  return conversation;
}

// GET /api/v1/conversations/:id/messages
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const user = session!.user;
  const conversation = await canAccessConversation(id, user.id, user.role, user.lenderId);
  if (!conversation) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: messages });
}

// POST /api/v1/conversations/:id/messages — Send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const user = session!.user;
  const conversation = await canAccessConversation(id, user.id, user.role, user.lenderId);
  if (!conversation) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { body: messageBody } = body;

  if (!messageBody?.trim()) {
    return NextResponse.json({ success: false, error: "Message body is required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { conversationId: id, senderUserId: user.id, body: messageBody.trim() },
    include: { sender: { select: { id: true, email: true, role: true } } },
  });

  return NextResponse.json({ success: true, data: message }, { status: 201 });
}
