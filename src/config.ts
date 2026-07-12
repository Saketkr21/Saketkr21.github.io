// Site-wide configuration. Edit once, propagates everywhere.

export const site = {
  name: 'Saket Kumar',
  role: 'Senior Data Engineer',
  years: '6+',
  location: 'Bengaluru, India',
  tagline:
    'I build open, cost-efficient data platforms — Snowflake, Databricks, and BigQuery — with a focus on compute cost, query latency, and CI/CD release cycles.',
  currentGig: {
    company: 'New Relic',
    title: 'Founding Data Engineer — Product Rating (India)',
    url: 'https://newrelic.com',
  },
  urls: {
    email: 'kumar.saket0021@gmail.com',
    linkedin: 'https://linkedin.com/in/saketkr21/',
    linkedinLabel: 'linkedin.com/in/saketkr21',
    github: 'https://github.com/Saketkr21',
    githubLabel: 'github.com/Saketkr21',
    phone: '+91-7484844919',
    resumePdf: '/SaketKumar_Resume_2026.pdf',
    // The whiz.pub blog URL. Once you sign up at https://app.whiz.pub/auth/signup
    // and pick your subdomain, replace with e.g. 'https://saketkr21.whiz.pub'.
    // If left empty, the nav Blog link falls back to whiz.pub landing page.
    blogUrl: 'https://saket.whiz.pub',
    // Enable RSS fetch to render latest posts inline on homepage.
    // Requires blogUrl above to be set to a live whiz.pub subdomain.
    blogRssEnabled: true,
  },
};

export const projects = [
  {
    number: '01',
    title: 'dbt-polyglot',
    tags: ['Live · v0.1.1 on PyPI', 'Apache-2.0'],
    description:
      'Compile-time SQL-dialect transpiler for dbt. Run models authored in Snowflake, BigQuery, Redshift, T-SQL, or DuckDB on Spark / Databricks unchanged — via sqlglot transpilation with a Spark correctness fix-up layer. Battle-tested inside my New Relic Snowflake → lakehouse migration.',
    stack: ['Python', 'sqlglot', 'dbt-core', 'Spark', 'PyPI'],
    links: [
      { label: 'View on PyPI', url: 'https://pypi.org/project/dbt-polyglot/' },
      { label: 'Source (GitHub)', url: 'https://github.com/Saketkr21/dbt-polyglot' },
    ],
  },
  {
    number: '02',
    title: 'lakehouse-lab',
    tags: ['58 modules', 'Docker · uv'],
    description:
      "A self-authored, laptop-safe Data Engineering production-challenges curriculum. 58 modules across Spark performance (skew, OOM, AQE), Apache Iceberg & Delta Lake correctness, Kafka + Structured Streaming, Debezium CDC, dbt quality with Great Expectations, and Airflow — with a full incident-simulator capstone.",
    stack: ['Spark', 'Iceberg', 'Delta Lake', 'Kafka', 'Debezium', 'dbt', 'Airflow'],
    links: [
      { label: 'Explore the repo', url: 'https://github.com/Saketkr21/lakehouse-lab' },
    ],
  },
];

export const experience = [
  {
    company: 'New Relic',
    role: 'Senior Data Engineer',
    subtitle: 'Founding Member — Product Rating Data (India)',
    location: 'Bengaluru, India',
    from: 'Jul 2024',
    to: 'Present',
    highlights: [
      {
        title: 'Open Lakehouse Migration (Snowflake → Iceberg)',
        body: 'Leading migration of ELT pipeline (440+ dbt models) to a fully open-source lakehouse — Iceberg on S3, Spark Thrift compute, dbt-spark, Project Nessie catalog, Airflow 3. Automated model-parity validation + mismatch-spike dashboard for zero-downtime cutover.',
      },
      {
        title: 'Snowflake Cost & Performance',
        body: 'Refactored critical dbt models — $45.2K annual credit savings, 50% faster queries, 100% data parity.',
      },
      {
        title: 'CI/CD for Data',
        body: 'Jenkins + GitHub framework (linting, BDD, dbt Cloud triggers, quality gates, Slack) — 85% cut in deployment lead time.',
      },
      {
        title: 'Zero-Downtime Migration & Monetization Modeling',
        body: 'Migrated a 10 GB/hour billing pipeline from Airflow 1.0 to dbt Cloud + Snowflake. Rating engine supported 15+ new product SKUs (Feb 2025).',
      },
    ],
  },
  {
    company: 'Falabella',
    role: 'Data Engineer',
    subtitle: 'LATAM e-commerce — Falabella.cl third-party marketplace',
    location: 'Bengaluru, India',
    from: 'Jun 2022',
    to: 'May 2024',
    highlights: [
      {
        title: 'Fast Shipping Tags',
        body: 'Data product on BigQuery/DataProc/Pub-Sub for 4M+ SKUs at 97% accuracy — drove 50% lift in platform conversion.',
      },
      {
        title: 'Serverless Ingestion Framework',
        body: 'Cloud Functions + Federated Queries — 80% faster pipeline setup, killed Compute Engine overhead.',
      },
      {
        title: 'Airflow Observability at Scale',
        body: 'Custom monitoring for 2,000+ DAGs — automated alerts, root-cause analytics, 60% MTTR improvement, 99.9% availability.',
      },
    ],
  },
  {
    company: 'Infosys',
    role: 'Specialist Programmer',
    subtitle: 'Clients: Walmart & Five Below',
    location: 'Hyderabad, India',
    from: 'Oct 2020',
    to: 'Jun 2022',
    highlights: [
      {
        title: 'Enterprise ETL on Databricks & Spark (Walmart)',
        body: 'Spark-Scala + PySpark ETL on Databricks and GCP DataProc, GCS → BigQuery with automated data-quality gates. Spark Structured Streaming for near-real-time.',
      },
      {
        title: 'PII Encryption Framework (Five Below)',
        body: 'Cross-org AES-256/PGP framework in Python/PySpark/Scala/Java/PGPy, processing 80 GB+ files for end-to-end PII compliance.',
      },
    ],
  },
];

export const skills = [
  {
    title: 'Warehouses & Lakehouses',
    items: ['Databricks', 'Snowflake', 'BigQuery', 'Delta Lake', 'Apache Iceberg', 'dbt (Core & Cloud)'],
  },
  {
    title: 'Big Data, Streaming & Orchestration',
    items: [
      'Apache Spark',
      'PySpark',
      'Spark Structured Streaming',
      'Kafka',
      'Debezium (CDC)',
      'Airflow',
      'ETL / ELT',
      'Great Expectations',
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    items: [
      'AWS (Glue, S3, Athena, EMR)',
      'GCP (BigQuery, DataProc, Pub/Sub, Cloud Functions)',
      'Azure',
      'Kubernetes',
      'Docker',
      'Terraform',
      'MongoDB',
      'Linux',
    ],
  },
  {
    title: 'Languages & Frameworks',
    items: ['Python', 'SQL', 'NoSQL', 'Scala', 'Shell', 'FastAPI', 'Pandas', 'Pytest', 'REST APIs'],
  },
  {
    title: 'DevOps, BI & Governance',
    items: [
      'Jenkins',
      'GitHub Actions',
      'Prometheus / Grafana',
      'Looker Studio',
      'Tableau',
      'GDPR / PII',
      'AES-256 / PGP',
      'Data Quality Gates',
    ],
  },
];

export const certifications = [
  { name: 'dbt Fundamentals', issuer: 'dbt Labs', year: '2024' },
  { name: 'Azure Data Fundamentals DP-900', issuer: 'Microsoft', year: '2021' },
  { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: '2020' },
  { name: 'Machine Learning', issuer: 'Andrew Ng, Stanford / Coursera', year: '2019', extra: '95%' },
  { name: 'Python Advanced', issuer: 'Cutshort', year: '2023' },
  { name: 'AWS AI & ML Scholarship', issuer: 'Udacity', year: '2026' },
];

export const quickFacts = [
  { label: 'Currently', value: 'New Relic — Founding DE, Product Rating (India)' },
  { label: 'Based in', value: 'Bengaluru, India' },
  { label: 'Open to', value: 'Global roles & interesting problems' },
  { label: 'Degree', value: 'B.Tech ECE, NSEC Kolkata (GPA 8.30)' },
];
