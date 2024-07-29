import {NextRequest} from "next/server";
import update_points from "@/app/api/util/add_points";


/*
* POST http://localhost:3000/api/checkin?quantity=INTEGER&userid=INTEGER
* route to add some coins to some people
*/
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    await update_points(parseInt(<string>searchParams.get("userid")), parseInt(<string>searchParams.get("quantity")))
    return Response.json({result: true})
}
