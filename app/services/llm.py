from openai import OpenAI

from app.config import AI_API_KEY, AI_BASE_URL, AI_MODEL

client = OpenAI(
    api_key=AI_API_KEY,
    base_url=AI_BASE_URL
)


def get_football_reply(message: str):
    response = client.chat.completions.create(
        model=AI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a football chatbot. Answer only football questions about players, teams, matches, tactics, transfers, rules, leagues, and football history. "
                    "If the user asks about anything outside football, politely say you can answer football questions only. "
                    "Keep answers clear, accurate, and concise unless the user asks for detail."
                )
            },
            {
                "role": "user",
                "content": message
            }
        ],
        temperature=0.4,
        max_tokens=300
    )

    return response.choices[0].message.content.strip()
