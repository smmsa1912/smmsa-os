// All of the portfolio's content lives here. Edit this file to change what the OS shows.

export const profile = {
  name: 'Andrew Neil',
  handle: 'smmsa1912',
  role: 'AI Engineer · Agentic Systems & Backend Engineering',
  school: 'Xavier Institute of Engineering, Mumbai',
  grad: 2027,
  tagline: 'Building reliable AI agents, tool-driven automation and Python backend systems.',
  bio: [
    'I am a Computer Engineering student at Xavier Institute of Engineering, Mumbai (2027) focused on agentic AI, AI engineering and backend systems. I have professional backend-internship experience building Django workflows and freelance experience delivering Python automation projects.',
    'I build practical, tool-using AI systems with an emphasis on reliable execution, evaluation and human-verifiable outcomes. My work spans OSCAR, a Windows-first desktop and browser automation agent; TradeAssist, a quantitative research and backtesting system; and fintech, IoT and computer-vision prototypes.',
  ],
  github: 'https://github.com/smmsa1912',
  email: 'andrewneil1912@gmail.com',
  linkedin: 'https://www.linkedin.com/in/andrew-neil-santhana-muthu-48aa912b2/',
  resume: '/resume.pdf',
}

export const highlights = [
  'Agentic AI and backend engineering portfolio focused on Python, tool calling and reliable automation',
  'Backend Engineer Intern at 4iStudio — Django workflows for a college ERP',
  'Passed Handshake AI Project Maser / Project Hertz technical assessment (CodeSignal)',
  'Three IJIRT publications across KYC Smart Card and Dynamic Toll Charging System',
  'Competition-winning Dynamic Toll Charging System project',
  'Freelance Python development experience with completed Upwork contracts and five-star client feedback',
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
    id: '4istudio',
    role: 'Backend Engineer Intern',
    org: '4iStudio',
    when: 'Jul 2026 to Nov 2026',
    tech: ['Python', 'Django', 'Relational databases'],
    points: [
      'Built and contributed to Django ERP workflows for a polytechnic-college environment, covering student records and academic administration for department heads, teachers, classes and students.',
      'Worked on backend workflows for marks entry, attendance, student data, marksheets and certificates.',
    ],
  },
  {
    id: 'freelance',
    role: 'Freelance Python Developer',
    org: 'Upwork contracts',
    when: 'Freelance engagements',
    tech: ['Python', 'Selenium', 'Browser automation', 'LLM APIs', 'SMTP'],
    points: [
      'Built a website monitor that checked appointment availability and emailed alerts through the client\'s SMTP server.',
      'Created a command-line LLM workflow that generates three response variants, lets the user pick one, and reuses it as context.',
      'Delivered Selenium browser automation and web scraping across completed fixed-price Upwork contracts, earning five-star client feedback.',
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
      'A Windows-first, local-first vision-powered desktop automation agent with a cloud-planner core. OSCAR translates natural-language goals into structured, tool-executed workflows across browser, desktop UI and terminal environments.',
    points: [
      'Python orchestration backend with a Flutter desktop interface and provider-adapter architecture for hosted and local language models.',
      'Tool-calling planner routes structured actions to specialized browser, desktop/UI and terminal capabilities while maintaining workflow context.',
      'Vision-assisted interaction combines screenshots, OCR and UI observations with Playwright browser automation and desktop input control.',
      'Includes keyboard/mouse recording and replay, bounded retries, fresh observations, action validation, outcome checks and duplicate-action safeguards.',
      'Regression suite reached 243 passing tests, covering core workflows and mocked Windows API paths.',
    ],
    workflow: [
      { title: 'Describe a task', detail: 'The user provides a goal in natural language.' },
      { title: 'Plan and route', detail: 'The planner generates validated structured tool calls and routes each action to the relevant browser, desktop or terminal capability.' },
      { title: 'Observe and act', detail: 'Specialized agents execute browser and desktop actions using current observations, screenshots and supported tools.' },
      { title: 'Check the result', detail: 'The system verifies outcomes, refreshes observations and applies bounded retries to reduce duplicate or ineffective actions.' },
    ],
    scopeNote: 'Windows-first, local-first engineering project. It is an actively developed automation system, not a guarantee of autonomous success in every application; execution quality depends on application state, permissions, model output and available tools.',
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
    stack: [
      'Python',
      'Flutter',
      'Gemini API',
      'OpenAI-compatible APIs',
      'Ollama',
      'OmniRoute',
      'Playwright',
      'PyAutoGUI',
      'YOLOv8',
      'OCR',
      'pytest',
    ],
    repo: 'https://github.com/smmsa1912/OSCAR',
    demo: null,
  },
  {
    id: 'tradeassist',
    name: 'TradeAssist',
    kind: 'Personal project',
    tags: ['Quant research', 'Risk'],
    summary:
      'A Python-based quantitative research and risk-analysis platform for Indian equities, combining historical market-data workflows, strategy evaluation and cost-aware backtesting.',
    points: [
      'Backtesting covers technical indicators, entry and exit signals, brokerage costs, slippage, stop-losses and trailing stops.',
      'Risk and portfolio analysis includes position sizing, exposure limits, P&L, equity curves, maximum drawdown, Sharpe ratio, win rate and profit factor, with walk-forward evaluation.',
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
    stack: [
      'Python',
      'Angel One SmartAPI',
      'Pandas',
      'NumPy',
      'pandas-ta',
      'Parquet',
      'scikit-learn',
    ],
    repo: null,
    demo: null,
  },
  {
    id: 'finverse',
    name: 'FinVerse 2.0',
    kind: 'Final-year project · In development',
    tags: ['Agentic fintech', 'B2B payments', 'Blockchain', 'IoT'],
    summary:
      'A next-generation B2B payment-gateway research prototype for the AI era, exploring machine-to-machine agentic commerce through a web dashboard, backend services, an AI copilot and an ESP32-based authentication terminal.',
    points: [
      'Explores payment workflows initiated by users and software agents, with an AI copilot intended to assist with financial operations.',
      'Combines a React 19/Vite dashboard, Django/Python backend direction and an ESP32-S3 terminal concept using NFC-based interaction.',
      'The architecture explores blockchain-backed auditability and hardware-assisted authentication; it remains a student prototype under active development, not a live payment network.',
    ],
    workflow: [
      { title: 'Initiate a payment workflow', detail: 'A business user or authorized software agent starts a payment-related workflow through the dashboard or integration layer.' },
      { title: 'Evaluate and orchestrate', detail: 'Backend services coordinate business rules, payment workflow state and the AI-copilot experience.' },
      { title: 'Authenticate the request', detail: 'The ESP32/NFC terminal concept explores a hardware-backed user or device authentication step.' },
      { title: 'Record and reconcile', detail: 'The prototype explores blockchain metadata anchoring and financial workflow records; it does not claim production-grade settlement.' },
    ],
    scopeNote: 'Final-year project in development. The agentic-commerce and B2B payment-gateway direction is a prototype/research target; do not describe it as a production payment gateway or imply that all planned integrations are deployed.',
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
    stack: [
      'React 19',
      'Vite',
      'Tailwind CSS v4',
      'Django',
      'Python',
      'Solidity',
      'Hardhat',
      'ESP32-S3',
      'ATECC608A',
      'PN532 NFC',
    ],
    repo: null,
    demo: null,
  },
  {
    id: 'toll-system',
    name: 'Dynamic Toll Charging System',
    kind: 'Competition-winning project',
    tags: ['Computer vision', 'IoT'],
    summary:
      'A tollgate demonstration that detects vehicles, reads number plates and identifies them by RFID, charging a dummy wallet.',
    points: [
      'Combines YOLOv8 vehicle detection, OCR/ANPR plate recognition and RFID identification.',
      'Won the institute project competition and was developed into a co-authored IJIRT paper (2026).',
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
    repo: 'https://github.com/smmsa1912/Tollgate-Project',
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
    kind: 'Personal / academic project',
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
  Languages: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'C/C++', 'Dart'],
  'Agentic AI and LLM engineering': [
    'LLM APIs (Gemini, OpenAI, Claude, OmniRoute)',
    'Local LLMs (Ollama)',
    'Tool calling',
    'Agent orchestration',
    'LangChain',
    'LangGraph',
    'Prompt and workflow evaluation',
    'RAG fundamentals'
  ],
  'Automation and computer use': [
    'Playwright',
    'Selenium',
    'PyAutoGUI',
    'Computer-use workflows',
    'Browser automation',
    'OCR',
  ],
  'ML and computer vision': [
    'Pandas',
    'NumPy',
    'scikit-learn',
    'PyTorch',
    'OpenCV',
    'YOLOv8',
    'ANPR',
  ],
  'Backend and data': [
    'Django',
    'FastAPI',
    "Selenium",
    'REST APIs',
    'Relational databases',
    'Parquet',
    'pytest',
  ],
  'Tools and systems': [
    'Git/GitHub',
    'Linux/CLI',
    'Flutter',
    'React 19',
    'Vite',
    'Tailwind CSS',
    'Docker',
    'ESP32',
    'RFID/NFC',
    'JWT',
    'Hardhat',
  ],
}