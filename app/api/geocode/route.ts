import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type GeoapifyResult = {
  place_id?: string;
  lat?: number;
  lon?: number;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ locations: [] });
  }

  if (query.length > 256 || query.includes(";")) {
    return NextResponse.json(
      { error: "Enter a shorter location without semicolons." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Location search is not configured yet." }, { status: 503 });
  }

  const params = new URLSearchParams({
    text: query,
    apiKey,
    filter: "countrycode:ng",
    lang: "en",
    limit: "5",
    format: "json",
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to search for that location right now." },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as { results?: GeoapifyResult[] };
  const locations = (payload.results ?? []).flatMap((result) => {
    const { latitude, longitude } = {
      latitude: result.lat,
      longitude: result.lon,
    };
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

    const label =
      result.formatted ??
      ([result.address_line1, result.address_line2].filter(Boolean).join(", ") || query);

    return [
      {
        label,
        latitude,
        longitude,
        providerId: result.place_id,
      },
    ];
  });

  return NextResponse.json({ locations });
}
