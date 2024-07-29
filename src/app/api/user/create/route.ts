import { NextRequest, NextResponse } from 'next/server';
import supabase from "@/db/supabase";
import increase_max_energy from "@/app/api/util/add_energy";

/*
POST http://localhost:3000/api/user/create
{
    "id": 1489,
    "first_name":"gay",
    "last_name": "orgy",
    "username": "GAPYEAR",
    "scores": 1,
    "referal_id": 123
}
*/

export async function POST(req: NextRequest) {
    try {
        const { id, first_name, last_name, username, referal_id } = await req.json();

        if (!id || !username || !first_name) {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        // Проверка существования пользователя в базе данных
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Failed to fetch user:", fetchError);
            return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
        }

        // Если пользователь не существует, добавляем его
        if (!existingUser) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: id,
                    first_name: first_name,
                    last_name: last_name,
                    scores: 0,
                    username: username,
                    referal_id: referal_id,

                }]);

            if (insertError) {
                console.error("Failed to insert user:", insertError);
                return NextResponse.json({ error: "Failed to insert user" }, { status: 500 });
            }

            if (referal_id) {
                await increase_max_energy(referal_id, 500);
            }

            return NextResponse.json({ message: "User added successfully" }, { status: 200 });
        }

        return NextResponse.json({ message: "User already exists" }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
