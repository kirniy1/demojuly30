import { NextRequest, NextResponse } from 'next/server';
import supabase from "@/db/supabase";

const currentTime = new Date();

async function decrease_points(user: string, points: number): Promise<void> {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("scores")
            .eq("id", user)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error("User not found");
        }

        const currentScores: number = data.scores;
        if (currentScores < points) {
            throw new Error("Insufficient points");
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ scores: currentScores - points })
            .eq("id", user);

        if (updateError) {
            throw new Error(updateError.message);
        }

        console.log("Points decreased successfully");
    } catch (error) {
        console.error("Error decreasing points:", error);
        throw error;
    }
}

interface BoosterPrices {
    [key: string]: number;
}

interface BoosterDurations {
    [key: string]: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userid');
        const boosterType = searchParams.get('boosterType');

        if (!userId || !boosterType) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const boosterPrices: BoosterPrices = {
            x2: 1000,
            x3: 2500,
            x5: 5000
        };

        const boosterDurations: BoosterDurations = {
            x2: 30, // 30 minutes
            x3: 15, // 15 minutes
            x5: 5   // 5 minutes
        };

        if (!boosterPrices[boosterType]) {
            return NextResponse.json({ error: "Invalid booster type" }, { status: 400 });
        }

        const points = boosterPrices[boosterType];
        await decrease_points(userId, points);

        const endTime = new Date(currentTime.getTime() + boosterDurations[boosterType] * 60000);

        const boosterField = `booster_${boosterType}`;
        const updateData: { [key: string]: string | null } = {
            booster_x2: null,
            booster_x3: null,
            booster_x5: null,
            [boosterField]: endTime.toISOString()
        };

        const { error: updateError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", userId);

        if (updateError) {
            console.error("Failed to update booster:", updateError);
            return NextResponse.json({ error: "Failed to update booster" }, { status: 500 });
        }

        return NextResponse.json({ success: true, boosterType, endTime });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
