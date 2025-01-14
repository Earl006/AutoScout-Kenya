import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";

export async function  GET(req) {
    const users = await prisma.user.findMany();
    return NextResponse.json({users});
}