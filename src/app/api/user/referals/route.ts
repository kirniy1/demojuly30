import { NextResponse } from 'next/server';
import supabase from "@/db/supabase";

// Define the GET request handler
export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Fetch referrals from the database
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('referal_id', id);

        if (error) {
            console.error("Error fetching referrals:", error);
            return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
        }

        const referralsCount = data.length;

        return NextResponse.json({ referralsCount }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
