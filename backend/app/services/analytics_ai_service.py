import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

def generate_ai_insights(data):
    try:
        prompt = f"""
You are an enterprise AI analytics engine.
Analyze the ticket analytics below
and generate professional executive insights.

Analytics Data:
{data}

Generate:
- workload insights
- escalation risks
- SLA concerns
- sentiment observations
- department trends
- operational recommendations

Keep response concise, executive-friendly, and professional.
Return ONLY 4 short executive insights. 
Rules: - maximum 18 words each - concise - enterprise style - no long explanations - actionable insights only
"""
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[{"role": "system", "content": prompt}],
            temperature=0.5
        )
        text = response.choices[0].message.content
        insights = text.split("\n")
        insights = [i.replace("-", "").strip() for i in insights if i.strip()]
        return insights[:4]
    except Exception as e:
        print("AI INSIGHTS ERROR:", str(e))
        return ["Unable to generate AI insights."]

def generate_executive_report(data):
    try:
        prompt = f"""
You are the Chief Operating Officer (COO) of an enterprise helpdesk.
Analyze the following live database metrics and write a highly professional Executive Summary Report.

Helpdesk Data:
{data}

Requirements:
- Format strictly as Markdown.
- Include a high-level "Executive Summary" paragraph with exact bullet points (Total Tickets Processed, Resolution Rate, SLA Compliance, Critical Tickets, Customer Sentiment %, Most Active Department, Average Resolution Time).
- Specifically calculate and include these 5 AI-driven metrics at the end:
  1. Business Health Score (0-100)
  2. SLA Risk Prediction
  3. Customer Satisfaction Prediction
  4. Department Efficiency Score
  5. AI Recommendations & Next Actions
- Identify bottlenecks or risks.
- Keep the tone authoritative, analytical, and professional.
"""
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": "You are an enterprise AI analytics engine."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        return {"report": response.choices[0].message.content.strip()}
    except Exception as e:
        print("EXECUTIVE REPORT ERROR:", str(e))
        return {"error": str(e)}
