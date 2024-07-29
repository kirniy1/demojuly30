import supabase from "@/db/supabase";

export default async function update_points(user: any, points: number) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("scores")
            .eq("id", user);

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            throw new Error("User not found");
        }

        const var_scores = data[0].scores;
        const { error: updateError } = await supabase
            .from("users")
            .update({ scores: points + var_scores })
            .eq("id", user);

        if (updateError) {
            throw new Error(updateError.message);
        }

        console.log("Scores updated successfully");
    } catch (error) {
        console.error("Error updating scores:", error);
    }
}
