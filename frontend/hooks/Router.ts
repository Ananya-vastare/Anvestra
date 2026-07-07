import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get form data from frontend
    const formData = await req.formData();

    console.log("🔄 [API Route] Received request");

    // Prepare form data for Flask
    const flaskFormData = new FormData();

    // Copy fields
    const url = formData.get("url") as string | null;
    const goal = formData.get("goal") as string | null;
    const story = formData.get("story") as string | null;
    const aim = formData.get("aim") as string | null;
    const image = formData.get("image") as File | null;

    flaskFormData.append("url", url || "");
    flaskFormData.append("goal", goal || "");
    flaskFormData.append("story", story || "");
    flaskFormData.append("aim", aim || "");

    if (image) {
      flaskFormData.append("image", image);
    }

    console.log("🔄 [API Route] Forwarding to Flask:", {
      url: url || "(empty)",
      hasImage: !!image,
      goal: goal ? goal.substring(0, 50) : "(empty)",
      story: story ? story.substring(0, 50) : "(empty)",
      aim: aim ? aim.substring(0, 50) : "(empty)",
    });

    // Get Flask URL from env or default
    const FLASK_URL = process.env.FLASK_API_URL || "http://localhost:5000";

    // Forward to Flask
    const response = await fetch(`${FLASK_URL}/audit`, {
      method: "POST",
      body: flaskFormData,
    });

    console.log("🔄 [API Route] Flask responded:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API Route] Flask error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Flask error: ${response.status}`,
          summary: "Backend processing failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("✅ [API Route] Returning results to frontend");

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ [API Route] Error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        summary: "Failed to process audit request",
      },
      { status: 500 }
    );
  }
}