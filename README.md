# Verdict

Verdict is an AI-powered research and hypothesis stress-testing tool. It accelerates scientific literature review by automatically retrieving academic papers, extracting their core scientific claims, and rigorously stress-testing new research hypotheses against established literature.

## Features

- **Automated Literature Retrieval:** Integrates directly with the [OpenAlex API](https://openalex.org/) to pull the most relevant academic papers based on your research query.
- **AI Claim Extraction:** Utilizes Groq's high-speed inference (Llama 3.1) to digest paper abstracts and extract structured, high-confidence empirical and theoretical claims.
- **Hypothesis Stress-Testing:** Propose a new research hypothesis and let the AI critically evaluate it against the extracted literature claims.
- **Structured Insights:** Outputs a clean, deliberate dashboard featuring:
  - **Novelty Signal:** How novel is your hypothesis compared to existing work?
  - **Evidence Support:** How strongly does the literature support your idea?
  - **Contradiction Risk:** Flags existing claims that directly conflict with your hypothesis.
  - **Blind Spots:** Identifies unsupported assumptions and missing evidence.
  - **Next Steps:** Recommends a concise experiment design to adequately test your hypothesis.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend/API:** Next.js Server Actions
- **LLM Provider:** [Groq](https://groq.com/) (`llama-3.1-8b-instant`)
- **Data Source:** [OpenAlex](https://openalex.org/)

## Local Development

### Prerequisites

You will need a free Groq API key to run the AI extraction pipeline.

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kunsangg/verdict-.git
   cd verdict-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GROQ_API_KEY="your_groq_api_key_here"
   OPENALEX_BASE_URL="https://api.openalex.org"
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Deployment

This project includes a multi-stage, production-optimized Docker setup.

```bash
# Build and run the container in detached mode
docker-compose up --build -d
```
The application will be available at [http://localhost:3000](http://localhost:3000). To view logs, use `docker-compose logs -f`.

## Architecture

1. **Retrieval (`lib/pipeline/retrieval.ts`)**: Queries OpenAlex `works` endpoint, implements automated fallbacks for overly narrow queries, and reconstructs inverted-index abstracts into human-readable text.
2. **Extraction (`lib/pipeline/extractClaims.ts`)**: Batches papers and prompts the LLM to extract JSON-structured claims (`empirical` or `theoretical`).
3. **Stress Testing (`lib/pipeline/stressTest.ts`)**: Evaluates a user-provided hypothesis against the extracted claims, outputting a strict JSON format for the UI to consume.
4. **UI**: A responsive, minimalist React state-machine built with Tailwind and shadcn/ui components (`components/ResultPanel.tsx`).
