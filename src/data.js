// All of the portfolio's content lives here. Edit this file to change what the OS shows.

export const profile = {
  name: 'Andrew Neil',
  handle: 'smmsa1912',
  role: 'Computer Engineering student',
  school: 'Xavier Institute of Engineering, Mumbai',
  grad: 2027,
  tagline: 'AI engineering, agentic automation and Python backend.',
  bio: [
    'I study Computer Engineering at Xavier Institute of Engineering in Mumbai (class of 2027) and work as a backend intern at 41studio.',
    'I build tool-using AI systems, Django backends and computer-vision prototypes. My main project, OSCAR, turns plain-language tasks into actions across the browser, the desktop and the terminal.',
  ],
  github: 'https://github.com/smmsa1912',
  email: 'andrewneil1912@gmail.com',
  linkedin: 'https://www.linkedin.com/in/andrew-neil-santhana-muthu-48aa912b2/',
  resume: '/resume.pdf',
}

export const highlights = [
  'Backend Engineer Intern at 41studio (since August 2026)',
  'Three papers published in IJIRT (December 2024, June 2025, 2026)',
  'Won the college mini-project competition with the Dynamic Toll Charging System',
  'Three fixed-price Upwork contracts completed, two five-star reviews',
]

export const education = {
  degree: 'B.E. in Computer Engineering',
  school: 'Xavier Institute of Engineering (XIE), Mumbai',
  when: 'Expected 2027',
  cgpa: '7.48/10 (through Semester VI)',
  courses: 'Data Structures, DBMS, Operating Systems, Computer Networks, AI/ML, IoT',
}

export const experience = [
  {
    id: '41studio',
    role: 'Backend Engineer Intern',
    org: '41studio',
    when: 'Aug 2026 to present',
    tech: ['Python', 'Django', 'Relational databases'],
    points: [
      'Contributing to a Django-based ERP for a polytechnic college, covering student records and academic administration for department heads, teachers, classes and students.',
      'Working on backend workflows for marks entry, attendance, student data, marksheets and certificates.',
    ],
  },
  {
    id: 'freelance',
    role: 'Freelance Python Developer',
    org: 'Upwork contracts',
    when: '2023 to 2025',
    tech: ['Python', 'Selenium', 'LangChain', 'OpenAI API', 'Claude API', 'SMTP'],
    points: [
      'Built a website monitor that checked appointment availability and emailed alerts through the client\'s SMTP server.',
      'Created a command-line LLM workflow that generates three response variants, lets the user pick one, and reuses it as context.',
      'Delivered Selenium browser automation and web scraping. Three fixed-price contracts completed, two five-star reviews.',
    ],
  },
]

export const projects = [
  {
    id: 'oscar',
    name: 'OSCAR',
    kind: 'Personal project',
    tags: ['AI agents', 'Automation'],
    summary:
      'A multi-agent AI assistant for Windows that turns natural-language tasks into workflows across the browser, the desktop and the terminal.',
    points: [
      'Python orchestration backend with a Flutter desktop interface.',
      'Screenshot-driven planning and JSON action execution, with separate browser, UI and terminal agents and persistent workflow state.',
      'Record-and-replay for mouse, keyboard, delays and coordinates.',
      'Reliability safeguards include fresh observations, bounded retries, outcome checks and duplicate-typing prevention; regression coverage includes mocked Windows API paths.',
    ],
    workflow: [
      { title: 'Describe a task', detail: 'The user provides a goal in natural language.' },
      { title: 'Plan and route', detail: 'The planner produces structured actions that are routed to the browser, desktop UI or terminal agent.' },
      { title: 'Observe and act', detail: 'Agents use browser actions or screenshot-driven desktop interaction to carry out the workflow.' },
      { title: 'Check the result', detail: 'Fresh observations, bounded retries and outcome checks help prevent repeated or ineffective actions.' },
    ],
    scopeNote: 'Windows-first local automation prototype. Reliability still depends on the target application, its current state and the actions available to the agent.',
    diagrams: [
      {
        src: '/diagrams/oscar-system-architecture.svg',
        title: 'System architecture',
        caption: 'Redrawn from the public repository README and backend module layout. It shows the Flutter desktop UI, Python planner/orchestrator, provider-neutral model gateway, validated action routing, specialized agents, and the observation loop.',
        sourceLabel: 'Public GitHub README and backend modules',
        sourceUrl: 'https://github.com/smmsa1912/OSCAR',
        sourceLinkLabel: 'View repository',
      },
    ],
    stack: ['Python', 'Flutter', 'Gemini', 'Local LLMs', 'Playwright', 'PyAutoGUI', 'YOLOv8', 'OCR', 'pytest'],
    repo: 'https://github.com/smmsa1912/OSCAR',
    demo: null,
  },
  {
    id: 'tradeassist',
    name: 'TradeAssist',
    kind: 'Personal project',
    tags: ['Quant research', 'Risk'],
    summary:
      'A research and risk-management system for Indian equities: a market-data pipeline and a backtesting engine with realistic costs.',
    points: [
      'Backtesting covers technical indicators, entry and exit signals, brokerage costs, slippage, stop-losses and trailing stops.',
      'Risk controls and portfolio analysis: position sizing, exposure limits, P&L, equity curves, max drawdown, Sharpe ratio, win rate and profit factor, plus walk-forward testing.',
      'Best recorded run: IRFC, SMA 20/50 crossover, 5% stop-loss, Jan 2023 to Sep 2026. +24.17% cumulative return, 6.75% CAGR, -11.03% max drawdown over 86 trades. Backtest results only, not a claim of live profit.',
    ],
    workflow: [
      { title: 'Prepare market data', detail: 'Load and organize historical market data for the selected symbol and period.' },
      { title: 'Generate signals', detail: 'Calculate technical indicators and apply the selected entry, exit and stop-loss rules.' },
      { title: 'Simulate execution', detail: 'Run the backtest with modeled brokerage costs, slippage and portfolio constraints.' },
      { title: 'Review risk and results', detail: 'Inspect equity curve, return, drawdown, Sharpe ratio, win rate and profit factor.' },
    ],
    metrics: [
      { label: 'Cumulative return', value: '+24.17%' },
      { label: 'CAGR', value: '6.75%' },
      { label: 'Max drawdown', value: '-11.03%' },
      { label: 'Trades', value: '86' },
    ],
    metricsLabel: 'Recorded backtest snapshot',
    metricsNote: 'IRFC · SMA 20/50 crossover · 5% stop-loss · January 2023–September 2026. Historical backtest only; this is not live trading performance or a prediction of future returns.',
    scopeNote: 'Research prototype. Results depend on the selected data, strategy parameters and execution assumptions; the recorded backtest should not be presented as live profit.',
    diagrams: [
      {
        src: '/diagrams/tradeassist-research-pipeline.svg',
        title: 'Research and backtesting pipeline',
        caption: 'High-level reconstruction of historical data ingestion, Parquet storage, indicators, simulated execution, risk controls, and walk-forward evaluation. Detailed module boundaries are illustrative because no TradeAssist source repository is linked here.',
        sourceLabel: 'Portfolio / resume description and recorded backtest notes; high-level, not source-code-verified',
      },
    ],
    stack: ['Python', 'Angel One SmartAPI', 'Pandas', 'NumPy', 'pandas-ta', 'Parquet', 'scikit-learn', 'PyTorch'],
    repo: null,
    demo: null,
  },
  {
    id: 'finverse',
    name: 'FinVerse',
    kind: 'Final-year project',
    tags: ['Fintech', 'Blockchain'],
    summary:
      'An AI-powered blockchain financial platform prototype: web dashboard, Django backend, mobile app and ESP32/NFC hardware authentication.',
    points: [
      'Connects the financial and authentication parts into one end-to-end prototype.',
      'A prototype, not a deployed commercial product.',
    ],
    workflow: [
      { title: 'Start a financial action', detail: 'The web dashboard or mobile app provides the user-facing entry point.' },
      { title: 'Handle application logic', detail: 'The Django backend coordinates the prototype’s financial and authentication workflows.' },
      { title: 'Authenticate the interaction', detail: 'The ESP32/NFC hardware path is intended to add a physical authentication step.' },
      { title: 'Connect the components', detail: 'The project explores a combined financial platform across web, mobile, blockchain and IoT components.' },
    ],
    scopeNote: 'Final-year prototype under development. Do not describe it as a production payment gateway or imply that all planned integrations are commercially deployed.',
    implementationCaveats: [
      'Known firmware/backend authentication mismatch: the supplied terminal firmware sends a static API-key header, while the backend endpoint requires timestamped HMAC authentication and a nonce; terminal/backend interoperability is not validated until this interface mismatch is resolved.',
      'The supplied NFC path reads a MIFARE Classic payload using the default MIFARE Classic key, so card anti-cloning resistance is not established.',
      'The risk-model training data uses synthetic, rule-derived labels; real-world fraud-model generalization is unvalidated.',
      'Wallet settlement occurs in the application database. The asynchronous Solidity transaction is a metadata audit anchor, not the money-settlement rail.',
    ],
    diagrams: [
      {
        src: '/diagrams/finverse-payment-architecture.svg',
        title: 'NFC payment, risk screening and audit architecture',
        caption: 'Reconstructed from the FinVerse project report and IEEE manuscript. The diagram distinguishes database wallet settlement from asynchronous on-chain metadata anchoring, and calls out the known firmware/authentication mismatch and evaluation caveats.',
        sourceLabel: 'FinVerse IEEE manuscript and major-project report (October 2026)',
      },
    ],
    stack: ['React', 'Tailwind CSS', 'Django', 'Flutter', 'Python', 'Blockchain', 'ESP32', 'NFC/RFID'],
    repo: null,
    demo: null,
  },
  {
    id: 'toll-system',
    name: 'Dynamic Toll Charging System',
    kind: 'College mini-project, competition winner',
    tags: ['Computer vision', 'IoT'],
    summary:
      'A tollgate demonstration that detects vehicles, reads number plates and identifies them by RFID, charging a dummy wallet.',
    points: [
      'Combines YOLOv8 vehicle detection, OCR/ANPR plate recognition and RFID identification.',
      'Won the college mini-project competition and led to a co-authored IJIRT paper (2026).',
      'RFID simulated FASTag. Real payment processing was not implemented.',
    ],
    workflow: [
      { title: 'Capture a vehicle', detail: 'A camera frame provides the input for the tollgate demonstration.' },
      { title: 'Detect and identify', detail: 'YOLOv8 detects the vehicle, OCR/ANPR reads its number plate and RFID supplies a card identifier.' },
      { title: 'Match a user record', detail: 'The recognized identifier is used in the demonstration’s vehicle or account-matching flow.' },
      { title: 'Simulate the toll charge', detail: 'The prototype calculates a demonstration charge and updates a dummy wallet rather than processing a real payment.' },
    ],
    scopeNote: 'Competition-winning college prototype. RFID simulates FASTag, and real payment processing is outside the project scope.',
    stack: ['Python', 'YOLOv8', 'OpenCV', 'OCR/ANPR', 'RFID'],
    repo: null,
    demo: null,
    paperIds: ['toll-paper'],
    diagrams: [
      {
        src: '/diagrams/dynamic-toll-architecture.svg',
        title: 'System architecture',
        caption: 'Redrawn from the paper’s system description. The final billing box reflects the portfolio prototype’s simulated wallet, not a live payment integration.',
        sourcePaperId: 'toll-paper',
      },
    ],
  },
  {
    id: 'kyc-smartcard',
    name: 'KYC Smart Card',
    kind: 'Academic mini-project',
    tags: ['IoT', 'Security'],
    summary:
      'A DigiLocker-inspired platform for storing and sharing documents with institutions, with RFID smartcard verification and mobile/Bluetooth authentication.',
    points: [
      'Django web backend, Flutter mobile app, ESP32 with RFID and Bluetooth LE, JWT and document encryption.',
      'Published as two IJIRT papers: the initial RFID repository version and the expanded dual-mode authentication version.',
    ],
    workflow: [
      { title: 'Register or retrieve a document', detail: 'The Django-backed platform manages the document-repository workflow.' },
      { title: 'Verify a credential', detail: 'The ESP32 smartcard path uses RFID, with a separate Bluetooth LE mobile-authentication path in the expanded design.' },
      { title: 'Apply application security', detail: 'The design includes JWT-based authentication and document encryption.' },
      { title: 'Use the mobile experience', detail: 'The Flutter app provides a companion interface to the web and smartcard workflow.' },
    ],
    scopeNote: 'Academic project with two related publications. The portfolio presents the implemented/design scope and does not claim a production-scale identity platform.',
    stack: ['Django', 'Flutter', 'ESP32', 'RFID', 'Bluetooth LE', 'JWT'],
    repo: 'https://github.com/smmsa1912/SmartCard-Project',
    demo: null,
    paperIds: ['kyc-paper-1', 'kyc-paper-2'],
    diagrams: [
      {
        src: '/diagrams/kyc-rfid-architecture.svg',
        title: 'Initial RFID document-repository design',
        caption: 'Redrawn from the December 2024 paper: smartcard UID lookup linked to a central profile and document repository.',
        sourcePaperId: 'kyc-paper-1',
      },
      {
        src: '/diagrams/kyc-dual-mode-architecture.svg',
        title: 'Expanded dual-mode authentication design',
        caption: 'Redrawn from the June 2025 paper, including RFID/Bluetooth access paths, the ESP32 bridge, Django API, JWT sessions, and the described three-key document flow.',
        sourcePaperId: 'kyc-paper-2',
      },
    ],
  },
]

export const publications = [
  {
    id: 'toll-paper',
    title: 'Dynamic Toll Charging System',
    where: 'IJIRT, Vol. 12, Issue 8, 2026, pp. 5716-5719',
    href: 'https://ijirt.org/publishedpaper/IJIRT191077_PAPER.pdf',
    format: 'Journal paper · PDF',
    summary: 'Published paper describing a distance-aware tolling approach using vehicle identification, ANPR and RFID. The portfolio project is a demonstration prototype; it does not process real payments.',
    topics: ['ANPR', 'YOLOv8', 'RFID', 'Transportation'],
  },
  {
    id: 'kyc-paper-2',
    title: 'KYC Smart Card (expanded dual-mode authentication version)',
    where: 'IJIRT, Vol. 12, Issue 1, June 2025',
    href: 'https://ijirt.org/publishedpaper/IJIRT180300_PAPER.pdf',
    format: 'Journal paper · PDF',
    summary: 'Expanded KYC Smart Card design combining RFID smartcard and Bluetooth-based mobile authentication with a Django backend and Flutter app.',
    topics: ['ESP32', 'RFID', 'Bluetooth LE', 'Django'],
  },
  {
    id: 'kyc-paper-1',
    title: 'KYC Smart Card (initial RFID document-repository version)',
    where: 'IJIRT, Vol. 11, Issue 7, December 2024',
    href: 'https://ijirt.org/publishedpaper/IJIRT170646_PAPER.pdf',
    format: 'Journal paper · PDF',
    summary: 'Initial KYC Smart Card version focused on RFID-based identity verification and a centralized document repository.',
    topics: ['RFID', 'Smart cards', 'Document management'],
  },
]

export const skills = {
  Languages: ['Python', 'JavaScript/TypeScript', 'SQL', 'C/C++'],
  'AI and automation': ['LLM APIs (Gemini, OpenAI, Claude)', 'Local LLMs', 'Agent/tool calling', 'LangChain', 'Playwright', 'Selenium', 'PyAutoGUI'],
  'ML and vision': ['Pandas', 'NumPy', 'scikit-learn', 'PyTorch', 'OpenCV', 'YOLOv8', 'OCR'],
  'Backend and data': ['Django', 'FastAPI', 'REST APIs', 'Relational databases', 'Parquet', 'pytest'],
  'Tools and systems': ['Git/GitHub', 'Linux/CLI', 'Flutter', 'React', 'Tailwind CSS', 'ESP32', 'RFID', 'JWT'],
}
