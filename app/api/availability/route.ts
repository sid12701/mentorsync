import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/features/availability/getSlots";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tutorId = searchParams.get("tutorId");
  const date = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") || "60");

  if (!tutorId || !date) {
    return NextResponse.json(
      { error: "tutorId and date are required" },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      tutorId,
    )
  ) {
    return NextResponse.json(
      { error: "Invalid tutorId format" },
      { status: 400 },
    );
  }

  try{ 
    const slots = await getAvailableSlots(tutorId, date, duration)

    return NextResponse.json({slots})
  }
  catch(error){
    console.error('Error fetching slots: ', error)
    return NextResponse.json(
        {error: 'Internal server error'},
        {status: 500}
    )
  }
}

