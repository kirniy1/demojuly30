import { NextRequest, NextResponse } from 'next/server';
import supabase from "@/db/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
   try {
      const { userId, points } = await req.json();

      if (!userId || typeof points !== 'number') {
         return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
      }

      // Fetch user data
      const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

      if (fetchError) {
         console.error("Failed to fetch user:", fetchError);
         return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
      }

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update user scores
      const { error: updateError } = await supabase
          .from('users')
          .update({
             scores: user.scores + points
          })
          .eq('id', userId);

      if (updateError) {
         console.error("Failed to update user:", updateError);
         return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }

      return NextResponse.json({
         result: true,
         updatedScores: user.scores + points
      });
   } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}
