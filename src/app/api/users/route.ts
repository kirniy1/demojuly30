import { NextRequest, NextResponse } from 'next/server';
import supabase from "@/db/supabase";

export async function GET(req: NextRequest) {
    try {
        // Получение всех пользователей из базы данных
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('*');

        if (fetchError) {
            console.error("Failed to fetch users:", fetchError);
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
        }

        if (!users) {
            return NextResponse.json({ error: "No users found" }, { status: 404 });
        }

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
