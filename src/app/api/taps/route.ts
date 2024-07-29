import supabase from "@/db/supabase";
/*
POST PROTO://URL:PORT/api/taps?userid=INT
add 10 score to people

 */
export async function POST(request: Request) {
    /*
    WARNING
    A LOT OF SHITCODE!
     */
    const { searchParams } = new URL(request.url)
    try {
        const value = await
            supabase
                .from("users")
                .select("scores")
                .eq("id", searchParams.get("userid"))

        // @ts-ignore
        const var_scores = value.data[0].scores
        const update =
            await supabase
                .from("users")
                .update({scores: 1 +var_scores })
                .eq("id", searchParams.get("userid"))
        return Response.json({
            taps: var_scores,
            success: true
        })
    }catch (TypeError) {
        //TODO do something with an error
        return Response.json({
            taps: -1,
            success: false
        })
    }

}