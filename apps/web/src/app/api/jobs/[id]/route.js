import sql from "@/app/api/utils/sql";

function parseAiReasoning(raw) {
  if (!raw || typeof raw !== "string") return { reasoning: raw, gemini: null };
  try {
    const data = JSON.parse(raw);
    if (data?.source === "gemini") {
      return { reasoning: data.reasoning || "", gemini: data };
    }
  } catch {
    /* plain text */
  }
  return { reasoning: raw, gemini: null };
}

function mapRow(row) {
  const { reasoning, gemini } = parseAiReasoning(row.ai_reasoning);
  return {
    id: row.id,
    aiAnalysis: {
      matchScore: gemini ? row.match_score : null,
      reasoning,
      missingGaps: gemini?.missingGaps || [],
      scoredWithGemini: !!gemini,
      scoredAt: gemini?.scoredAt || null,
    },
  };
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM linkedin_jobs WHERE id = ${id}`;
    return Response.json({ success: true }, { headers: CORS });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const setClauses = [];
    const values = [];
    let i = 1;

    if (body.notes !== undefined) {
      setClauses.push(`notes = $${i++}`);
      values.push(body.notes);
    }
    if (body.collection !== undefined) {
      setClauses.push(`collection = $${i++}`);
      values.push(body.collection);
    }
    if (body.isSaved !== undefined) {
      setClauses.push(`is_saved = $${i++}`);
      values.push(body.isSaved);
    }
    if (body.matchScore !== undefined) {
      setClauses.push(`match_score = $${i++}`);
      values.push(body.matchScore);
    }
    if (body.aiReasoning !== undefined) {
      setClauses.push(`ai_reasoning = $${i++}`);
      values.push(body.aiReasoning);
    }

    if (!setClauses.length) {
      return Response.json(
        { error: "Nothing to update" },
        { status: 400, headers: CORS },
      );
    }

    values.push(id);
    const query = `UPDATE linkedin_jobs SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`;
    const result = await sql(query, values);

    const row = result[0];
    return Response.json(
      { success: true, job: row ? mapRow(row) : null },
      { headers: CORS },
    );
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }
}
