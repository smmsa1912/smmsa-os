# SMMSA-OS architecture diagrams

The six diagrams in `public/diagrams/` are newly authored, editable SVGs. Three redraw architectures described by published papers (Dynamic Toll and two KYC versions); the others describe OSCAR, TradeAssist, and FinVerse from the available repository/project documentation. They are explanatory figures, not copied paper graphics. The notes below distinguish repository-backed details from high-level reconstruction and describe known implementation caveats.

## 1. Dynamic Toll Charging System

- Asset: `public/diagrams/dynamic-toll-architecture.svg`
- Source: [Dynamic Toll Charging System, IJIRT 191077](https://ijirt.org/publishedpaper/IJIRT191077_PAPER.pdf), Vol. 12, Issue 8 (2026), pp. 5716–5719.
- Recreated elements: entry ANPR capture, YOLOv8 plate detection, OCR plate text extraction, entry event record, RFID/FASTag scan at exit, entry/exit record matching, distance-based fare calculation, and billing.
- Scope distinction: the diagram labels a demo wallet and simulated debit to match the portfolio prototype; it does not claim that the demo processes real payments.

## 2. KYC Smart Card — initial RFID version

- Asset: `public/diagrams/kyc-rfid-architecture.svg`
- Source: [KYC Smart Card, IJIRT 170646](https://ijirt.org/publishedpaper/IJIRT170646_PAPER.pdf), Vol. 11, Issue 7 (December 2024), pp. 26–30.
- Recreated elements: user registration and document upload, central profile/repository, unique RFID identifier, RC522 reader and ESP32, backend UID validation, document retrieval and view-only verification flow.

## 3. KYC Smart Card — expanded dual-mode version

- Asset: `public/diagrams/kyc-dual-mode-architecture.svg`
- Source: [KYC Smart Card, IJIRT 180300](https://ijirt.org/publishedpaper/IJIRT180300_PAPER.pdf), Vol. 12, Issue 1 (June 2025), pp. 646–652.
- Recreated elements: RFID and Bluetooth LE authentication paths, ESP32 bridge, Flutter mobile client, web client, Django API, JWT-based sessions, database and encrypted-document store, and the three-key document flow described in the paper.
- Scope distinction: the three-key sequence represents the paper's described design; the diagram is not an independent security audit or a claim that a production identity service is deployed.

## Editing / export

SVG is used so diagrams remain scalable and their labels, lines, colors, and boxes can be edited. The web app renders the SVG files directly from `public/diagrams/`.

## 4. OSCAR — AI desktop automation architecture

- Asset: `public/diagrams/oscar-system-architecture.svg`
- Source: [OSCAR public repository](https://github.com/smmsa1912/OSCAR), especially the README architecture and `backend/oscar` module layout.
- Recreated elements: Flutter desktop interface; Python planner/orchestrator; provider-neutral action-model gateway (Gemini and explicitly configured OpenAI-compatible providers); action validation; route selection; BrowserAgent / Playwright, UIAgent with PyAutoGUI and vision utilities, TerminalAgent and shortcut handling; persistent workflow state, trace/logging, budget controls, and a feedback loop based on fresh observations.
- Scope distinction: a Windows-first local automation prototype. The diagram does not imply every target application can be controlled reliably or that a planned action always succeeds.

## 5. TradeAssist — quantitative research and backtesting pipeline

- Asset: `public/diagrams/tradeassist-research-pipeline.svg`
- Source basis: the project description in `src/data.js`, resume/project notes, and the recorded historical backtest snapshot. No TradeAssist source repository is linked in this portfolio version.
- Recreated elements: historical market-data ingestion; normalized OHLCV history in Parquet; indicator and signal generation; event-driven backtest; modeled brokerage and slippage; stop/trailing-stop behavior; position sizing and exposure limits; portfolio metrics; buy-and-hold comparison; and 13-fold walk-forward evaluation.
- Scope distinction: this is deliberately labelled a high-level reconstruction rather than verified internal module architecture. The shown IRFC SMA 20/50 result is a recorded historical backtest, not live trading performance, investment advice, or a future-return claim. The diagram does not show live order placement.

## 6. FinVerse — NFC internal-wallet payment architecture

- Asset: `public/diagrams/finverse-payment-architecture.svg`
- Source basis: `FinVerse_IEEE_Paper_University_Project.tex` and `FinVerse_Major_Project_Report_Updated.pdf` (October 2026, available to the project author in the working document library).
- Recreated elements: React merchant/wallet interfaces and Flutter client; Django REST Framework; short-lived (120-second) POS intents; ESP32-S3 / PN532 / TFT terminal; card/account and intent validation; XGBoost risk screening; PostgreSQL transactional wallet posting with row locks; Celery/Redis asynchronous audit work; canonical metadata hashing with Keccak-256; and Solidity/EVM audit anchoring.
- Important implementation and evaluation caveats drawn from the manuscript: the supplied firmware sends a static API-key header while the backend expects device ID, timestamp, nonce, and HMAC signature; the firmware uses the default MIFARE Classic key for card payload access; and model training labels are synthetic and rule-derived. End-to-end terminal interoperability, anti-cloning resistance, and real-world fraud-model generalization are not established. Wallet settlement remains in the application database; the contract anchors metadata and does not settle funds.

## Editing / export

All six figures are authored SVGs, so text and geometry can be changed directly. New project diagrams use the same retro-inspired palette as the three reference-paper diagrams. PNG files supplied in the standalone diagram archive are rendered previews; SVG is the editable source of truth.
