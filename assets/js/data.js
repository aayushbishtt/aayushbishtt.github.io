// ============================================================================
// data.js — single source of truth for every piece of content on the page.
// Update dates, bullets, links, or copy here; layout code never hardcodes text.
// ============================================================================

export const SITE = {
  name: "Aayush Bisht",
  initials: "AB",
  role: "AI Engineer & Data Scientist",
  tagline: "Building agentic AI systems and decoding what makes machine learning trustworthy.",
  email: "aayush.bisht@student-cs.fr",
  phone: "+33 7 45 39 97 29",
  location: "Paris, France",
  github: "https://github.com/aayushbishtt",
  linkedin: "https://www.linkedin.com/in/aayush-bisht",
  medium: "https://bishtaayush.medium.com/",
  resume: "Aayush_Bisht_Resume.pdf",
  availability: "Open to AI/ML roles · Research internships",
};

// Set to a Ready Player Me .glb URL to use a personal avatar. When empty, the
// bundled demo model (assets/avatar/avatar-demo.glb) is used; if that also
// fails to load, the hero falls back to a static portrait automatically.
export const AVATAR_GLB_URL = "";
export const AVATAR_DEMO_GLB = "assets/avatar/avatar-demo.glb";
export const AVATAR_IDLE_FBX = "assets/avatar/idle.fbx";
export const AVATAR_PORTRAIT = "assets/img/portrait.jpg";

export const ABOUT = {
  eyebrow: "About Me",
  heading: ["WHO", "I AM"],
  paragraphs: [
    "I'm Aayush Bisht, an AI Engineer currently interning at <strong>Amadeus</strong> in Sophia Antipolis, building agentic multi-agent systems that generate and verify software documentation automatically.",
    "I'm pursuing an <strong>MSc in Artificial Intelligence at CentraleSupélec, Université Paris-Saclay</strong>, with graduate coursework from <strong>MVA at ENS Paris-Saclay</strong> in reinforcement learning and advanced deep learning.",
    "Before moving to France I spent five years in industry — OSINT cybersecurity analysis at Cybercell and data engineering at QuantStreet — which is where I learned that models matter less than the pipelines and evidence built around them.",
  ],
};

// Journey epochs — rendered oldest → newest along the loss curve, lowest loss
// on the right. Each bullet is sourced verbatim from the résumé.
export const JOURNEY = [
  {
    epoch: 1,
    kind: "education",
    title: "B.Tech, Information Technology",
    org: "Graphic Era University",
    place: "Dehradun, India",
    when: "2015 – 2019",
    loss: 0.92,
    bullets: [],
    log: "[epoch 1] dataset: Graphic Era University (B.Tech IT) — baseline initialized.",
  },
  {
    epoch: 2,
    kind: "work",
    title: "Data Analyst",
    org: "QuantStreet LLP",
    place: "New Delhi, India",
    when: "Aug 2019 – Jul 2023",
    loss: 0.71,
    bullets: [
      "Engineered automated SQL and Pandas data pipelines, eliminating 12+ hours of manual processing per week.",
      "Mitigated noise in high-frequency trading datasets, driving a 4% accuracy improvement in strategy optimization models.",
    ],
    log: "[epoch 2] fit(QuantStreet) — pipelines automated, val_loss ↓ 4% on strategy models.",
  },
  {
    epoch: 3,
    kind: "work",
    title: "Cybersecurity Analyst (OSINT)",
    org: "Cybercell",
    place: "Kota, India",
    when: "Aug 2023 – Oct 2024",
    loss: 0.47,
    bullets: [
      "Engineered automated monitoring scripts (Python) to filter high-volume threat data streams, reducing manual triage time by ~30%.",
      "Conducted multimodal analysis using OSINT frameworks to trace digital footprints and identify security breaches in real time.",
    ],
    log: "[epoch 3] fit(Cybercell) — triage time ↓ 30%, checkpoint saved.",
  },
  {
    epoch: 4,
    kind: "education",
    title: "MSc in Artificial Intelligence",
    org: "CentraleSupélec, Université Paris-Saclay",
    place: "Paris-Saclay, France",
    when: "Sep 2025 – Present",
    loss: 0.24,
    bullets: [
      "Coursework: Machine Learning, Deep Learning, Optimization, NLP, Decision Modeling, AI for Finance, Medical Imaging (Computer Vision), Multi-Agent Systems.",
      "MVA, ENS Paris-Saclay: Reinforcement Learning, Graphs in Machine Learning, Advanced Deep Learning.",
    ],
    log: "[epoch 4] dataset: CentraleSupélec (M2 AI) + MVA/ENS — checkpoint: Charpak Scholarship awarded.",
  },
  {
    epoch: 5,
    kind: "work",
    title: "AI Engineer Intern",
    org: "Amadeus",
    place: "Sophia Antipolis, France",
    when: "May 2026 – Oct 2026",
    loss: 0.08,
    bullets: [
      "Built an agentic AI documentation generator using multi-agent orchestration to produce documentation from any repository — cutting manual effort from ~15 min/repo and cost from $8 to $2, with a second multi-agent system verifying output for accuracy and reliability.",
      "Developed an AI chatbot grounded in the generated documentation, enabling instant retrieval of answers across teams.",
    ],
    log: "[epoch 5] fit(Amadeus) — cost/repo $8 → $2, verifier agent online, loss → converging.",
  },
];

// Projects — mapped to a 3x3 convolution kernel sweep over a 5x5 grid, so
// each project has a top-left kernel anchor position (row, col) in [0,2].
export const PROJECTS = [
  {
    id: "P1",
    pos: [0, 0],
    title: "Causal Discovery in Time Series for Trustworthy AI",
    context: "CEA Lab · Research Project",
    icon: "graph",
    description:
      "Benchmarked causal discovery algorithms (PCMCI, PCMCI+) against the Causal Chamber dataset to evaluate ground-truth recovery, stress-testing robustness with Tigramite under hidden confounding and autocorrelation.",
    tags: ["Python", "Tigramite", "Causal Inference"],
    repo: "https://github.com/aayushbishtt/CausalDiscoveryCentraleSupelec",
    badge: null,
  },
  {
    id: "P2",
    pos: [0, 1],
    title: "RL-Based Neural Network Pruning for Causal Time Series Models",
    context: "CentraleSupélec",
    icon: "scissors",
    description:
      "Engineered a Deep Q-Network (DQN) agent to automate layer-wise pruning of Temporal Convolutional Networks, achieving a 38.7% parameter reduction (1.63× compression) while preserving predictive accuracy and causal robustness.",
    tags: ["PyTorch", "DQN", "Reinforcement Learning"],
    repo: "https://github.com/aayushbishtt/RL-Based-Neural-Network-Pruning-for-Causal-Time-Series-Models",
    badge: null,
  },
  {
    id: "P3",
    pos: [0, 2],
    title: "Hierarchical Ensemble for Text Decoding",
    context: "CentraleSupélec",
    icon: "lock",
    description:
      "Developed a hybrid architecture combining a GRU-Seq2Seq model for decryption with a fine-tuned GPT-2 for linguistic refinement, implementing an end-to-end PyTorch inference pipeline that reconstructs encrypted text with high semantic accuracy.",
    tags: ["PyTorch", "GRU", "GPT-2", "NLP"],
    repo: "https://github.com/aayushbishtt/Decoding-Encoded-Text-Using-a-Hierarchical-Ensemble-of-GRU",
    badge: null,
  },
  {
    id: "P4",
    pos: [1, 0],
    title: "Decoding Mouse Position in a Maze from Brain Signals",
    context: "Paris Brain Institute",
    icon: "brain",
    description:
      "Developed deep-learning models to decode a mouse's spatial position from hippocampal spike waveforms, evaluating input representations, temporal windows, and data-splitting strategies for robust generalization.",
    tags: ["Python", "Deep Learning", "Neuroscience"],
    repo: "https://github.com/aayushbishtt/mouse-maze-position-from-brain-signals",
    badge: null,
  },
  {
    id: "P5",
    pos: [1, 1],
    title: "M.O.H. — Skin Cell Culture Monitoring System",
    context: "Hack'InSaclay, IP Paris",
    icon: "heartbeat",
    description:
      "Built a real-time monitoring dashboard for skin-cultivation labs that scores culture health from simulated temperature, pH, O2, and impedance data, paired with a RAG chatbot over lab SOPs and automated email alerts carrying AI-generated remediation steps.",
    tags: ["RAG", "LangChain", "Dashboard"],
    repo: "https://github.com/aayushbishtt/Code4Care-AI-Agent",
    badge: "🏆 2nd Place",
  },
  {
    id: "P6",
    pos: [1, 2],
    title: "Multi-Agent System for Nuclear Waste Disposal",
    context: "CentraleSupélec",
    icon: "radiation",
    description:
      "Designed a multi-agent system architecture coordinating autonomous agents for the safe disposal of nuclear waste, as part of the Multi-Agent Systems coursework at CentraleSupélec.",
    tags: ["Multi-Agent Systems", "Python"],
    repo: "https://github.com/aayushbishtt/Multi-Agent-System-for-Nuclear-Waste",
    badge: null,
  },
];

export const SKILLS = [
  { name: "Python", category: "lang" },
  { name: "SQL", category: "lang" },
  { name: "PyTorch", category: "ml" },
  { name: "TensorFlow", category: "ml" },
  { name: "HuggingFace", category: "ml" },
  { name: "Azure OpenAI", category: "ml" },
  { name: "LangChain", category: "ml" },
  { name: "LangGraph", category: "ml" },
  { name: "RAG", category: "ml" },
  { name: "Multi-Agent Systems", category: "ml" },
  { name: "Ollama", category: "ml" },
  { name: "Strands Agents", category: "ml" },
  { name: "LLM APIs", category: "ml" },
  { name: "Pandas", category: "ml" },
  { name: "NumPy", category: "ml" },
  { name: "Docker", category: "tools" },
  { name: "Git", category: "tools" },
  { name: "DVC", category: "tools" },
  { name: "Linux", category: "tools" },
  { name: "ETL", category: "tools" },
  { name: "Splunk", category: "tools" },
  { name: "JIRA", category: "tools" },
  { name: "Confluence", category: "tools" },
  { name: "English", category: "human" },
  { name: "French (A2)", category: "human" },
  { name: "Hindi", category: "human" },
];

export const SKILL_CATEGORIES = {
  lang: { label: "Languages", color: "#4ade9f" },
  ml: { label: "AI / ML", color: "#5b8cff" },
  tools: { label: "Data & Tools", color: "#f0b45e" },
  human: { label: "Spoken", color: "#94a3b8" },
};

// Offline assistant knowledge base — no API key, no network call. Each topic
// has match patterns (checked against the lower-cased user message) and a
// canned answer. `chips` are the follow-up quick-replies shown after it.
export const CHAT_KB = {
  greeting:
    "Hey, I'm a quick offline assistant — I answer from a local knowledge base about Aayush, no live AI behind me. What would you like to know?",
  fallback:
    "I only know about Aayush's background — try one of the topics below, or reach him directly.",
  topics: [
    {
      id: "experience",
      patterns: [/experience/, /work(ed)?/, /job/, /career/, /amadeus/, /cybercell/, /quantstreet/],
      answer:
        "Aayush is currently an AI Engineer Intern at Amadeus (Sophia Antipolis), building agentic multi-agent systems that generate and verify repo documentation — cutting cost per repo from $8 to $2. Before that: OSINT cybersecurity analyst at Cybercell, and data analyst at QuantStreet LLP.",
      chips: ["education", "projects", "contact"],
    },
    {
      id: "education",
      patterns: [/educat/, /school/, /universit/, /degree/, /study|studies|studying/, /centralesupelec|centrale|supelec|saclay|mva|ens/],
      answer:
        "MSc in Artificial Intelligence at CentraleSupélec, Université Paris-Saclay (Sep 2025 – present), with MVA coursework at ENS Paris-Saclay. He's a France Excellence Charpak Scholar. B.Tech in Information Technology from Graphic Era University, India (2015–2019).",
      chips: ["experience", "skills", "projects"],
    },
    {
      id: "projects",
      patterns: [/project/, /research/, /causal/, /brain/, /pruning/, /hackathon/, /build|built/],
      answer:
        "Highlights: causal discovery research at CEA, RL-based neural network pruning (38.7% parameter reduction), a GRU+GPT-2 text decoder, decoding mouse position from brain signals at Paris Brain Institute, and a 2nd-place hackathon win at Hack'InSaclay for a skin-cell monitoring system. Scroll to the Projects section to explore them all.",
      chips: ["skills", "resume", "contact"],
    },
    {
      id: "skills",
      patterns: [/skill/, /stack/, /tech(nolog)?y|technologies/, /tool/, /language/, /framework/],
      answer:
        "Python & SQL; PyTorch, TensorFlow, HuggingFace, LangChain, LangGraph, RAG, and multi-agent frameworks; Docker, Git, DVC, Linux, ETL. Scroll to the Skills section for the full interactive list.",
      chips: ["projects", "experience", "contact"],
    },
    {
      id: "contact",
      patterns: [/contact/, /email|e-mail/, /reach/, /hire|hiring/, /linkedin/, /phone/, /connect/],
      answer:
        "Best ways to reach Aayush: email aayush.bisht@student-cs.fr, or connect on LinkedIn / GitHub via the icons in the nav and footer. He typically responds within a couple of days.",
      chips: ["resume", "projects", "fun fact"],
    },
    {
      id: "resume",
      patterns: [/resume|résumé|cv/, /download/],
      answer:
        "You can download his full résumé using the Resume button in the navigation bar or the footer.",
      chips: ["experience", "contact"],
    },
    {
      id: "fun fact",
      patterns: [/fun fact/, /hobby|hobbies/, /interesting/, /surprise/],
      answer:
        "Fun fact: Aayush worked in cybersecurity OSINT investigations before pivoting into AI — so he still reflexively checks where a dataset actually came from before trusting a model's output.",
      chips: ["projects", "experience", "contact"],
    },
  ],
};

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#projects", label: "Projects" },
  { href: "#demo", label: "Live Demo" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];
