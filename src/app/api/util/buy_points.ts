import supabase from "@/db/supabase";

export default async function decrease_points(user: any, points: number) {
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
        if (var_scores < points) {
            throw new Error("Insufficient points");
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ scores: var_scores - points })
            .eq("id", user);

        if (updateError) {
            throw new Error(updateError.message);
        }

        console.log("Points decreased successfully");
    } catch (error) {
        console.error("Error decreasing points:", error);
    }
}
