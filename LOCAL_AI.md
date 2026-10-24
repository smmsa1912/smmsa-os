# Ask My Portfolio — local AI design

The assistant uses **hybrid routing**: known facts and desktop navigation are answered directly for accuracy; open-ended/reasoning prompts and unmatched questions are sent to the local model when it is enabled. The model is small and can still make mistakes, so portfolio claims should be checked against the linked case studies.

SMMSA-OS uses a retrieval-first approach rather than fine-tuning a model on Andrew's data.

## Two answering modes

- **Quick Answers:** searches the curated `src/data.js` portfolio facts, generates a grounded response from those facts, and links to the matching case study, resume, repository, or publication. It works immediately and does not load an LLM.
- **Local AI:** after a visitor explicitly clicks **Load local AI**, the app dynamically imports WebLLM from `https://esm.run/@mlc-ai/web-llm@0.2.84` and loads `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`. Retrieved portfolio facts are supplied as context for generation.

## Deployment and privacy

- The site remains a static React/Vite deployment. It has no inference server, provider API key, or new npm dependency for the optional model runtime.
- The WebLLM JavaScript runtime and model artifacts are fetched from public hosting only after opt-in. The model is cached by the browser where supported; the initial download may be large and use substantial browser storage and GPU memory.
- After the model is loaded, prompt inference happens in the visitor's browser. Questions are not sent to an inference API by this implementation.
- Local mode requires a secure browser context and WebGPU. Quick Answers continue to work when the model is unavailable or fails to load.
- The model is not fine-tuned on portfolio data. It receives retrieved, curated project/profile facts at answer time; generated answers can still be wrong, so source links remain visible.

## Update the assistant's facts

Edit `src/data.js` to update profile, project, technology, metrics, publication, or limitation details. `src/portfolioKnowledge.js` formats and ranks that data for retrieval. Keep security caveats and prototype/production distinctions explicit, and do not add secrets or private client information.

## References

- WebLLM: https://github.com/mlc-ai/web-llm
- WebLLM browser inference overview: https://webllm.mlc.ai/docs/
- WebLLM model configuration (supported model IDs and device memory guidance): https://github.com/mlc-ai/web-llm/blob/main/src/config.ts

## Grounding and direct answers

Greeting, identity, email, contact-link, and project-list questions are answered directly from the portfolio data before local generation runs. This is intentional: a small local model should not guess basic identity or contact facts. The retrieved profile context also includes the exact public contact values. Prior model-generated replies are not reused as conversation context; recent user questions may be used for follow-up continuity.


## Portfolio intent and follow-up handling

The assistant now routes common intents (greetings, help, contact, education, skills, experience, publications, project stacks/architectures/limitations/results, comparisons, and app navigation) before invoking the local model. Short follow-ups can inherit the last cited topic for retrieval. The model receives a compact context of ranked portfolio documents and verified links; its generated answer is not fed back into subsequent turns as trusted evidence.
