export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    const data = await response.json();

    return Response.json(data);
  } catch (err) {
    return Response.json({
      error: err.message,
    });
  }
}