import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Parse this meal plan text and return ONLY valid JSON, no markdown, no explanation:
{
  "meals": [
    {
      "id": "m1",
      "name": "Breakfast",
      "time": "7:30 am",
      "emoji": "☀️",
      "items": [
        { "name": "food name", "amount": "150", "unit": "g", "calories": 93, "protein": 13, "carbs": 9, "fat": 0 }
      ]
    }
  ]
}
Rules:
- amount must be a number string (no units in the amount field, put units in the unit field separately)
- Use emojis: ☀️ breakfast, 🍃 lunch, 🫖 snack, 🌙 dinner, 🥗 other
- Estimate macros from food + amount if not explicitly given
- id should be m1, m2, m3 etc

Meal plan text to parse:
${text}`
        }]
      })
    })

    const data = await response.json()
    const raw = data.content?.map(i => i.text || '').join('') || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: 'Could not parse meal plan' }, { status: 500 })
  }
}
