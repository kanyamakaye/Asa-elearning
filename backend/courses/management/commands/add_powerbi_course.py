"""One-off command that inserts the "Power BI Data Analytics" course with
real, hand-authored curriculum content (17 modules, ~30 lessons, a final
knowledge-check quiz, and a capstone assignment) instead of the generic
template content used for the bulk-seeded catalog. Safe to re-run — it's a
get_or_create on the course title/instructor, and skips lesson/quiz/
assignment creation if the course already has them.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from assessments.models import QuestionOption, Quiz, QuizQuestion
from assignments.models import Assignment
from courses.models import Course, CourseCategory, CourseModule, CourseUnit
from lessons.models import Lesson

COURSE_TITLE = 'Power BI Data Analytics: From Data to Interactive Business Intelligence'
INSTRUCTOR_EMAIL = 'daniel.osei@asaacademy.com'
CATEGORY_NAME = 'Data Science'

LEARNING_OBJECTIVES = [
    'Explain the Power BI ecosystem and the end-to-end BI workflow.',
    'Connect Power BI to different data sources.',
    'Import and transform data using Power Query.',
    'Clean and prepare datasets for analysis.',
    'Design efficient relational data models.',
    'Create relationships between tables.',
    'Write DAX measures and calculated columns.',
    'Apply filter context and row context correctly.',
    'Perform time-intelligence analysis.',
    'Create professional visualizations and dashboards.',
    'Build interactive reports with slicers and drill-through.',
    'Publish reports to Power BI Service.',
    'Configure workspaces and sharing.',
    'Implement Row-Level Security.',
    'Optimize Power BI models and reports for performance.',
    'Apply Power BI to real-world business problems.',
    'Develop an end-to-end Power BI portfolio project.',
]

REQUIREMENTS = [
    'A Windows PC able to run Power BI Desktop (free download from Microsoft).',
    'Basic computer literacy — comfort with spreadsheets is helpful but not required.',
    'No prior BI or programming experience needed — DAX and data modeling are taught from first principles.',
]

COURSE_DESCRIPTION = (
    "This course teaches you how to use Microsoft Power BI to transform raw data into meaningful "
    "business insights and interactive reports. You'll begin with the fundamentals of Power BI and "
    "progress through data acquisition, data cleaning, Power Query, data modeling, DAX, visualization, "
    "dashboard design, Power BI Service, security, performance optimization, and real-world business "
    "intelligence projects.\n\n"
    "The course emphasizes hands-on learning and business scenarios, so you don't just learn how Power BI "
    "works — you learn how to use it to answer real business questions, finishing with a full executive "
    "dashboard capstone project for your portfolio."
)

# Each module: title, short description, and its lessons (title, duration in
# minutes, content already formatted for RichText: "## " headings, "- "
# bullets, "**bold**" spans, one block per paragraph).
MODULES = [
    {
        'title': 'Module 1: Introduction to Power BI',
        'description': 'What business intelligence is, and where Power BI fits into the BI workflow.',
        'lessons': [
            {
                'title': 'Lesson 1.1: What Is Business Intelligence?',
                'duration': 15,
                'content': (
                    "Organizations generate large amounts of data every day — sales transactions, customer "
                    "interactions, employee records, financial transactions, inventory movements, website "
                    "activity, and operational data. Having data, however, is not the same as having useful "
                    "information.\n\n"
                    "**Business Intelligence (BI)** is the process of transforming data into information and "
                    "insights that support better business decisions.\n\n"
                    "## From Data to Decisions\n\n"
                    "A typical BI process follows a clear chain: Raw Data → Data Preparation → Data Modeling → "
                    "Analysis → Visualization → Insight → Decision.\n\n"
                    "For example, a company might have thousands of sales transactions, each with a Customer "
                    "ID, Product ID, Order Date, Quantity, Sales Amount, Region, and Salesperson. Simply "
                    "looking at these raw rows does not answer the questions management actually cares about:\n\n"
                    "- What are total sales?\n"
                    "- Which products generate the most revenue?\n"
                    "- Which regions are underperforming?\n"
                    "- How are sales changing over time?\n"
                    "- Which customers contribute the most revenue?\n"
                    "- What is the company's profit margin?\n\n"
                    "## Why It Matters\n\n"
                    "Power BI exists to turn underlying data like this into clear, visual answers to exactly "
                    "these kinds of questions."
                ),
            },
            {
                'title': 'Lesson 1.2: What Is Power BI?',
                'duration': 15,
                'content': (
                    "**Power BI** is Microsoft's business intelligence and analytics platform. It lets you "
                    "connect to data, transform it, model it, analyze it, create visualizations, build "
                    "reports, and publish and share insights.\n\n"
                    "Power BI can work with many different types of data sources, including Excel, CSV, SQL "
                    "databases, cloud databases, web data, APIs, SharePoint, data warehouses, and other "
                    "enterprise systems.\n\n"
                    "## The Power BI Workflow\n\n"
                    "A typical Power BI project follows this process: Connect → Transform → Model → Calculate "
                    "→ Visualize → Publish → Share → Maintain.\n\n"
                    "Each stage matters. Poor data preparation creates inaccurate results. Poor modeling makes "
                    "DAX unnecessarily complicated. Poor visualization makes correct analysis hard to "
                    "understand.\n\n"
                    "## Why It Matters\n\n"
                    "Power BI development is not simply about creating attractive charts — it's about "
                    "building a reliable analytical solution."
                ),
            },
        ],
    },
    {
        'title': 'Module 2: Getting Started with Power BI Desktop',
        'description': 'The components of the Power BI ecosystem, and where each one fits.',
        'lessons': [
            {
                'title': 'Lesson 2.1: Understanding Power BI Components',
                'duration': 15,
                'content': (
                    "The Power BI ecosystem is made up of several distinct components that work together.\n\n"
                    "## Power BI Desktop\n\n"
                    "The main development environment for most report developers. It's primarily used to "
                    "connect to data, transform data, build data models, create DAX calculations, and design "
                    "reports.\n\n"
                    "## Power BI Service\n\n"
                    "The cloud-based environment used to publish reports, share them, manage workspaces, "
                    "create dashboards, configure security, and collaborate with other users.\n\n"
                    "## Power BI Mobile\n\n"
                    "Lets users access reports and dashboards from mobile devices.\n\n"
                    "## Power Query\n\n"
                    "The data preparation and transformation technology used in Power BI. It lets you remove "
                    "unnecessary columns, filter rows, change data types, split columns, merge tables, append "
                    "datasets, replace values, and create calculated transformation columns.\n\n"
                    "## DAX\n\n"
                    "**DAX** stands for Data Analysis Expressions — the language used primarily for "
                    "calculations and analytical logic, such as:\n\n"
                    "- Total Sales\n"
                    "- Total Profit\n"
                    "- Profit Margin\n"
                    "- Year-to-Date Sales\n"
                    "- Previous Year Sales\n"
                    "- Sales Growth %"
                ),
            },
        ],
    },
    {
        'title': 'Module 3: Connecting to Data Sources',
        'description': 'Where Power BI gets its data from, and how to choose between Import and DirectQuery.',
        'lessons': [
            {
                'title': 'Lesson 3.1: Understanding Data Sources',
                'duration': 15,
                'content': (
                    "Before building a report, Power BI needs access to data. Selecting **Get Data** in Power "
                    "BI Desktop shows the available connectors. Common sources include:\n\n"
                    "## Excel\n\n"
                    "One of the most common sources for business analysis — a workbook may contain sales "
                    "data, customer information, product information, budgets, and targets.\n\n"
                    "## CSV\n\n"
                    "CSV files are frequently used for data exchange, for example:\n\n"
                    "- OrderID, OrderDate, Customer, Product, Quantity, Sales\n"
                    "- 1001, 2026-01-10, ABC Ltd, Laptop, 2, 2400\n"
                    "- 1002, 2026-01-11, XYZ Ltd, Monitor, 5, 1500\n\n"
                    "## SQL Server\n\n"
                    "Organizations often store operational data in relational databases. Power BI can connect "
                    "directly to SQL Server and retrieve data using queries or whole tables.\n\n"
                    "## Web Sources\n\n"
                    "Power BI can retrieve structured information directly from web pages and web-based "
                    "sources."
                ),
            },
            {
                'title': 'Lesson 3.2: Import vs DirectQuery',
                'duration': 15,
                'content': (
                    "Two important Power BI connectivity approaches are **Import** and **DirectQuery**.\n\n"
                    "## Import\n\n"
                    "Data is loaded directly into the Power BI model. Advantages:\n\n"
                    "- Generally fast report performance.\n"
                    "- Powerful modeling capabilities.\n"
                    "- Rich DAX functionality.\n"
                    "- Data can be compressed efficiently.\n\n"
                    "## DirectQuery\n\n"
                    "Power BI maintains a live connection to the underlying data source instead of importing "
                    "everything into the model. Advantages:\n\n"
                    "- Useful for very large datasets.\n"
                    "- Data can remain in the source system.\n"
                    "- Can support scenarios requiring more current source data.\n\n"
                    "However, DirectQuery introduces additional performance and modeling considerations.\n\n"
                    "## Key Principle\n\n"
                    "Use the simplest architecture that satisfies the business requirements. Don't choose "
                    "DirectQuery simply because it sounds more advanced."
                ),
            },
        ],
    },
    {
        'title': 'Module 4: Power Query — Data Cleaning and Transformation',
        'description': 'Cleaning messy real-world data, and the difference between merging and appending tables.',
        'lessons': [
            {
                'title': 'Lesson 4.1: Why Data Preparation Matters',
                'duration': 15,
                'content': (
                    "Real-world data is rarely clean. You may encounter missing values, duplicate records, "
                    "incorrect data types, inconsistent names, extra spaces, invalid dates, unnecessary "
                    "columns, multiple files, and inconsistent formatting.\n\n"
                    "## A Simple Example\n\n"
                    "A city column might contain \"Kigali\", \"kigali\", \"KIGALI\", and \" Kigali\" (with a "
                    "leading space). From a business perspective these values all represent the same city — "
                    "Power Query can standardize them into one consistent value.\n\n"
                    "## Why It Matters\n\n"
                    "A data model built on messy source data produces unreliable totals and misleading "
                    "reports, no matter how well the DAX or visuals are built on top of it."
                ),
            },
            {
                'title': 'Lesson 4.2: Common Power Query Transformations',
                'duration': 20,
                'content': (
                    "## Remove Columns\n\n"
                    "Remove any column that is unnecessary for analysis — fewer columns keep the model "
                    "smaller and faster.\n\n"
                    "## Remove Rows\n\n"
                    "Remove blank rows, invalid records, headers embedded within the dataset, and other "
                    "unwanted records.\n\n"
                    "## Change Data Types\n\n"
                    "Every column should have an appropriate data type. Common types include:\n\n"
                    "- Text\n"
                    "- Whole Number\n"
                    "- Decimal Number\n"
                    "- Date\n"
                    "- Date/Time\n"
                    "- Boolean\n\n"
                    "Correct data types are essential for calculations — a **Sales Amount** column, for "
                    "example, should be numeric, not text."
                ),
            },
            {
                'title': 'Lesson 4.3: Merge vs Append',
                'duration': 15,
                'content': (
                    "These are two of the most important Power Query concepts, and they're easy to confuse.\n\n"
                    "## Merge\n\n"
                    "**Merge** combines columns from related tables — conceptually similar to a SQL JOIN. "
                    "Given a Sales table (ProductID, Sales) and a Products table (ProductID, Product), a merge "
                    "can bring the product name into the Sales table by matching on ProductID.\n\n"
                    "## Append\n\n"
                    "**Append** combines rows from tables with a similar structure. Given a January Sales "
                    "table and a February Sales table with the same columns, appending them produces one "
                    "combined table covering both months.\n\n"
                    "## Remember\n\n"
                    "- Merge = combine columns.\n"
                    "- Append = combine rows."
                ),
            },
        ],
    },
    {
        'title': 'Module 5: Data Modeling',
        'description': 'Fact and dimension tables, the star schema, and how to build reliable relationships.',
        'lessons': [
            {
                'title': 'Lesson 5.1: Why Data Modeling Matters',
                'duration': 15,
                'content': (
                    "A Power BI report is only as reliable as its underlying data model. A good model makes "
                    "DAX easier to write, reports faster to load, relationships clearer, and business logic "
                    "more reliable to maintain.\n\n"
                    "## The Star Schema\n\n"
                    "A common, well-tested approach to data modeling in Power BI is the **star schema** — one "
                    "central fact table surrounded by descriptive dimension tables."
                ),
            },
            {
                'title': 'Lesson 5.2: Fact and Dimension Tables',
                'duration': 20,
                'content': (
                    "## Fact Table\n\n"
                    "A fact table contains measurable business events. A Sales Fact table might contain "
                    "OrderID, DateID, ProductID, CustomerID, Quantity, and Sales.\n\n"
                    "## Dimension Tables\n\n"
                    "Dimension tables provide descriptive information about the facts:\n\n"
                    "- **Product Dimension** — ProductID, Product Name, Category, Brand.\n"
                    "- **Customer Dimension** — CustomerID, Customer Name, Segment, Region.\n"
                    "- **Date Dimension** — Date, Year, Month, Quarter.\n\n"
                    "## The Star Schema, Visually\n\n"
                    "A typical model looks conceptually like Customers and Products sitting on either side of "
                    "Sales, with Dates above it — the Sales table sits in the center while descriptive "
                    "dimensions surround it."
                ),
            },
            {
                'title': 'Lesson 5.3: Relationships',
                'duration': 15,
                'content': (
                    "**Relationships** connect tables together. Important relationship types include "
                    "one-to-many, many-to-one, one-to-one, and many-to-many.\n\n"
                    "## A Typical Relationship\n\n"
                    "Product[ProductID] → Sales[ProductID]: one product can appear in many sales "
                    "transactions, so Product is the \"one\" side and Sales is the \"many\" side.\n\n"
                    "## Best Practice\n\n"
                    "Whenever possible, prefer clear one-to-many relationships flowing from dimension tables "
                    "to fact tables — it keeps filter propagation predictable and DAX easier to reason about."
                ),
            },
        ],
    },
    {
        'title': 'Module 6: DAX Fundamentals',
        'description': "Power BI's formula language, and the crucial difference between measures and calculated columns.",
        'lessons': [
            {
                'title': 'Lesson 6.1: What Is DAX?',
                'duration': 15,
                'content': (
                    "**DAX** stands for Data Analysis Expressions — the formula language Power BI uses for "
                    "analytical calculations.\n\n"
                    "A simple measure might be:\n\n"
                    "- Total Sales = SUM(Sales[SalesAmount])\n\n"
                    "This creates a reusable measure that can be dropped into any card, chart, or table in the "
                    "report."
                ),
            },
            {
                'title': 'Lesson 6.2: Measures vs Calculated Columns',
                'duration': 20,
                'content': (
                    "This is one of the most important concepts for any Power BI learner to get right.\n\n"
                    "## Calculated Column\n\n"
                    "A calculated column is calculated for **every row** in a table. For example:\n\n"
                    "- Revenue = Sales[Quantity] * Sales[UnitPrice]\n\n"
                    "Every row receives its own calculated value, stored in the model.\n\n"
                    "## Measure\n\n"
                    "A measure calculates a result **dynamically**, based on the current filter context. For "
                    "example:\n\n"
                    "- Total Revenue = SUM(Sales[Revenue])\n\n"
                    "If a user filters the report to 2026, the measure recalculates revenue for 2026. If they "
                    "select Kigali, it recalculates revenue for Kigali instead.\n\n"
                    "## General Rule\n\n"
                    "Use measures for aggregations and analytical calculations whenever possible. Only use "
                    "calculated columns when you genuinely need a value stored at row level."
                ),
            },
        ],
    },
    {
        'title': 'Module 7: Advanced DAX',
        'description': 'Filter context and CALCULATE — the two ideas that unlock the rest of DAX.',
        'lessons': [
            {
                'title': 'Lesson 7.1: Filter Context',
                'duration': 15,
                'content': (
                    "**Filter context** is fundamental to understanding DAX. Suppose we have:\n\n"
                    "- Total Sales = SUM(Sales[SalesAmount])\n\n"
                    "If a visual displays sales by region, Power BI evaluates that same measure separately "
                    "for each region:\n\n"
                    "- North: 100,000\n"
                    "- South: 150,000\n"
                    "- East: 120,000\n\n"
                    "The measure's formula never changes — only the surrounding filter context does."
                ),
            },
            {
                'title': 'Lesson 7.2: CALCULATE',
                'duration': 20,
                'content': (
                    "**CALCULATE** is one of the most important functions in all of DAX — it lets you modify "
                    "filter context explicitly. For example:\n\n"
                    "- Online Sales = CALCULATE([Total Sales], Sales[Channel] = \"Online\")\n"
                    "- 2026 Sales = CALCULATE([Total Sales], 'Date'[Year] = 2026)\n\n"
                    "Each of these tells Power BI to evaluate **Total Sales** under a specific, explicit "
                    "filter.\n\n"
                    "## Why CALCULATE Matters\n\n"
                    "CALCULATE is what makes DAX powerful for comparisons, time intelligence, conditional "
                    "calculations, ratios, and business rules."
                ),
            },
        ],
    },
    {
        'title': 'Module 8: Time Intelligence',
        'description': 'Building a proper Date table and calculating year-over-year growth.',
        'lessons': [
            {
                'title': 'Lesson 8.1: Why Date Tables Matter',
                'duration': 15,
                'content': (
                    "Business users constantly ask questions involving time: sales this year, sales last "
                    "year, monthly growth, year-to-date sales, quarter-to-date sales, and same period last "
                    "year. A dedicated **Date table** makes all of these calculations easier and more "
                    "reliable.\n\n"
                    "A Date table typically contains columns like:\n\n"
                    "- Date\n"
                    "- Year\n"
                    "- Month\n"
                    "- Month Number\n"
                    "- Quarter"
                ),
            },
            {
                'title': 'Lesson 8.2: Year-over-Year Analysis',
                'duration': 20,
                'content': (
                    "Suppose we have:\n\n"
                    "- Total Sales = SUM(Sales[SalesAmount])\n\n"
                    "We can build a previous-year measure using CALCULATE with a time-intelligence function:\n\n"
                    "- Previous Year Sales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))\n\n"
                    "And then calculate growth on top of it:\n\n"
                    "- Sales Growth % = DIVIDE([Total Sales] - [Previous Year Sales], [Previous Year Sales])\n\n"
                    "This lets the report show, at a glance, whether performance is improving or declining "
                    "compared to the same period a year ago."
                ),
            },
        ],
    },
    {
        'title': 'Module 9: Data Visualization',
        'description': 'Matching the right chart type to the analytical question you\'re actually answering.',
        'lessons': [
            {
                'title': 'Lesson 9.1: Choosing the Right Visual',
                'duration': 15,
                'content': (
                    "A good dashboard does not use every available chart type — the visual should match the "
                    "analytical question being asked.\n\n"
                    "## Column Chart\n\n"
                    "Useful for comparing categories, e.g. Sales by Product Category.\n\n"
                    "## Line Chart\n\n"
                    "Useful for trends over time, e.g. Monthly Revenue.\n\n"
                    "## Pie or Donut Chart\n\n"
                    "Can show simple composition when there are only a few categories, although bars are "
                    "often easier to compare.\n\n"
                    "## Card\n\n"
                    "Useful for displaying key metrics like Total Revenue, Total Customers, Profit, or "
                    "Orders.\n\n"
                    "## Matrix\n\n"
                    "Useful for detailed, hierarchical analysis."
                ),
            },
        ],
    },
    {
        'title': 'Module 10: Building Interactive Reports',
        'description': 'Letting users filter and dig into a report themselves, with slicers and drill-through.',
        'lessons': [
            {
                'title': 'Lesson 10.1: Slicers',
                'duration': 15,
                'content': (
                    "**Slicers** allow users to filter a report interactively — common examples include Year, "
                    "Month, Region, Product Category, and Customer Segment.\n\n"
                    "A report user could set Year to 2026, Region to Kigali, and Category to Electronics, and "
                    "every connected visual on the page updates to match those selections at once."
                ),
            },
            {
                'title': 'Lesson 10.2: Drill-Through',
                'duration': 15,
                'content': (
                    "**Drill-through** lets users move from a summary view straight into detailed "
                    "information.\n\n"
                    "For example, a sales manager sees Laptop Sales = $250,000 on a summary page. They can "
                    "drill through from that value to a detailed page containing every underlying Customer, "
                    "Order, Product, Salesperson, Date, and Quantity.\n\n"
                    "This turns a static number into a genuinely interactive analytical experience."
                ),
            },
        ],
    },
    {
        'title': 'Module 11: Dashboard and Report Design',
        'description': 'Five design principles that separate a professional dashboard from a cluttered one.',
        'lessons': [
            {
                'title': 'Lesson 11.1: Principles of Effective Dashboard Design',
                'duration': 20,
                'content': (
                    "A professional dashboard should let its audience answer important questions quickly.\n\n"
                    "## Principle 1 — Establish Hierarchy\n\n"
                    "Important KPIs should be easy to find, usually placed top-left or across the top of the "
                    "page.\n\n"
                    "## Principle 2 — Reduce Clutter\n\n"
                    "Avoid unnecessary borders, decorative elements, excessive colors, and duplicate charts.\n\n"
                    "## Principle 3 — Use Consistent Formatting\n\n"
                    "Keep fonts, number formats, titles, spacing, and alignment consistent across every page.\n\n"
                    "## Principle 4 — Highlight Exceptions\n\n"
                    "Users should be able to quickly spot poor performance, significant growth, missing "
                    "targets, high-value customers, and operational problems.\n\n"
                    "## Principle 5 — Design for the Audience\n\n"
                    "An executive dashboard and an operational report should not look the same — match the "
                    "level of detail to who's actually going to read it."
                ),
            },
        ],
    },
    {
        'title': 'Module 12: Power BI Service',
        'description': 'Publishing a report to the cloud, and organizing content with workspaces.',
        'lessons': [
            {
                'title': 'Lesson 12.1: Publishing a Report',
                'duration': 10,
                'content': (
                    "After building a report in Power BI Desktop, it can be published to Power BI Service.\n\n"
                    "The general workflow is: Power BI Desktop → Publish → Workspace → Report.\n\n"
                    "Once published, the report can be accessed by authorized users through their browser or "
                    "the Power BI mobile app — no Desktop installation required on their end."
                ),
            },
            {
                'title': 'Lesson 12.2: Workspaces',
                'duration': 15,
                'content': (
                    "A **workspace** provides an environment for organizing and collaborating around Power BI "
                    "content. It may contain reports, dashboards, semantic models, dataflows, and other BI "
                    "content.\n\n"
                    "Workspaces also support permissions and collaboration, so a team can share and jointly "
                    "maintain the same set of reports without emailing files back and forth."
                ),
            },
        ],
    },
    {
        'title': 'Module 13: Security',
        'description': 'Restricting exactly which rows each user is allowed to see, with Row-Level Security.',
        'lessons': [
            {
                'title': 'Lesson 13.1: Row-Level Security',
                'duration': 20,
                'content': (
                    "**Row-Level Security (RLS)** restricts the rows of data that each user is allowed to "
                    "see.\n\n"
                    "Consider a company with three regions — East, West, and North — where each regional "
                    "manager should only see their own region's data:\n\n"
                    "- Manager A → East\n"
                    "- Manager B → West\n"
                    "- Manager C → North\n\n"
                    "RLS enforces this restriction so the exact same report can serve every manager, while "
                    "each one only ever sees the data they're authorized to access.\n\n"
                    "## Why RLS Matters\n\n"
                    "Security is not simply a technical feature — it's a business requirement. A report "
                    "containing confidential information must ensure users cannot access data outside their "
                    "responsibilities."
                ),
            },
        ],
    },
    {
        'title': 'Module 14: Performance Optimization',
        'description': 'Diagnosing why a Power BI report is slow, and the strategies that fix it.',
        'lessons': [
            {
                'title': 'Lesson 14.1: Why Power BI Reports Become Slow',
                'duration': 20,
                'content': (
                    "Performance problems commonly result from very large datasets, poor data models, "
                    "excessive calculated columns, complex DAX, too many visuals on one page, inefficient "
                    "Power Query transformations, poor relationships, or simply importing unnecessary data.\n\n"
                    "## Optimization Strategies\n\n"
                    "- **Reduce unnecessary columns** — don't import columns that are never actually used.\n"
                    "- **Reduce unnecessary rows** — filter data at the source when appropriate.\n"
                    "- **Use a star schema** — a clean model generally improves both maintainability and "
                    "performance.\n"
                    "- **Prefer measures where appropriate** — avoid creating calculated columns you don't "
                    "truly need.\n"
                    "- **Reduce visual complexity** — every visual on a page can generate its own query "
                    "against the model."
                ),
            },
        ],
    },
    {
        'title': 'Module 15: Real-World Business Analytics',
        'description': 'Assembling everything so far into a working sales analytics dashboard.',
        'lessons': [
            {
                'title': 'Lesson 15.1: Sales Analytics',
                'duration': 20,
                'content': (
                    "A typical sales dashboard combines a set of KPIs with supporting visuals.\n\n"
                    "## KPIs\n\n"
                    "- Total Sales\n"
                    "- Total Profit\n"
                    "- Orders\n"
                    "- Customers\n"
                    "- Average Order Value\n\n"
                    "## Visuals\n\n"
                    "- Sales by Month\n"
                    "- Sales by Region\n"
                    "- Sales by Product\n"
                    "- Top Customers\n"
                    "- Profit by Category\n\n"
                    "## Business Questions\n\n"
                    "The report should help answer: Are sales increasing? Which regions perform best? Which "
                    "products generate the most revenue? Which customers are most valuable? Which products "
                    "have poor margins?"
                ),
            },
        ],
    },
    {
        'title': 'Module 16: The Business Analyst Use Case',
        'description': 'Connecting business requirements to the reports you actually build.',
        'lessons': [
            {
                'title': 'Lesson 16.1: Requirements Before Charts',
                'duration': 20,
                'content': (
                    "Power BI is particularly useful for Business Analysts because it connects business "
                    "requirements with data analysis. A Business Analyst should begin with a question like "
                    "\"What business problem are we trying to solve?\" — not \"What chart should we create?\"\n\n"
                    "## Example Requirement\n\n"
                    "**Business Requirement:** Management needs a dashboard to monitor monthly sales "
                    "performance.\n\n"
                    "## Functional Requirements\n\n"
                    "The dashboard should display:\n\n"
                    "- Monthly sales.\n"
                    "- Sales by region.\n"
                    "- Sales by product.\n"
                    "- Sales versus target.\n"
                    "- Year-over-year growth.\n"
                    "- Top 10 customers.\n\n"
                    "## Non-Functional Requirements\n\n"
                    "The dashboard should also load quickly, use approved data sources, apply appropriate "
                    "security, use consistent company terminology, and be accessible only to authorized "
                    "users.\n\n"
                    "## Why It Matters\n\n"
                    "Power BI development is closely connected to requirements analysis and business "
                    "decision-making, not just to building charts."
                ),
            },
        ],
    },
]

# Final knowledge-check quiz (course-level). Options and explanations are
# original, written to accurately answer the "Knowledge Questions" listed in
# the course's Final Assessment section.
FINAL_QUIZ_QUESTIONS = [
    {
        'q': 'What is Power BI?',
        'options': [
            "Microsoft's business intelligence and analytics platform for connecting to, transforming, modeling, and visualizing data",
            'A relational database engine used to store transactional records',
            'A programming language for building mobile applications',
            'A spreadsheet formatting add-in for Microsoft Word',
        ],
        'correct': 0,
        'explanation': 'Power BI is Microsoft\'s BI and analytics platform — it connects to data, transforms and models it, and turns it into reports and dashboards.',
    },
    {
        'q': 'What is Power Query used for in Power BI?',
        'options': [
            'Writing DAX measures and calculated columns',
            'Publishing finished reports to Power BI Service',
            'Connecting to and transforming data — removing columns, filtering rows, changing types, merging and appending tables',
            'Configuring Row-Level Security roles',
        ],
        'correct': 2,
        'explanation': 'Power Query is the data preparation and transformation engine behind Power BI, used before a model or DAX is ever built.',
    },
    {
        'q': 'What is DAX?',
        'options': [
            'A data connector for SQL Server',
            'Data Analysis Expressions — the formula language used for measures and calculated columns',
            'The Power BI mobile app',
            'A visualization type for hierarchical data',
        ],
        'correct': 1,
        'explanation': 'DAX (Data Analysis Expressions) is the formula language Power BI uses for calculations like Total Sales or Sales Growth %.',
    },
    {
        'q': 'What is a fact table?',
        'options': [
            'A table that stores only descriptive attributes like product category or customer segment',
            'A table containing measurable business events, such as individual sales transactions',
            'A table used exclusively for Row-Level Security rules',
            'A backup copy of the data model',
        ],
        'correct': 1,
        'explanation': 'A fact table holds measurable business events (e.g. OrderID, Quantity, Sales) — the numbers a report actually aggregates.',
    },
    {
        'q': 'What is a dimension table?',
        'options': [
            'A table that provides descriptive context — like product, customer, or date details — around a fact table',
            'A table that only DirectQuery models can use',
            'A table that stores DAX measures',
            'A duplicate of the fact table used for performance testing',
        ],
        'correct': 0,
        'explanation': 'Dimension tables (Product, Customer, Date, etc.) describe the "who, what, when" that surrounds the measurable facts.',
    },
    {
        'q': 'What is filter context in DAX?',
        'options': [
            'A setting that hides certain visuals from unauthorized users',
            'The set of filters currently applied to a calculation — from slicers, visuals, or rows — that determines what a measure computes over',
            'A type of relationship between two dimension tables',
            'The order in which Power Query steps are applied',
        ],
        'correct': 1,
        'explanation': 'Filter context is what makes the same measure formula return a different number for every region, year, or slicer selection.',
    },
    {
        'q': 'What does CALCULATE do in DAX?',
        'options': [
            'It only sums numeric columns',
            'It evaluates an expression under a modified filter context, which is what makes comparisons and time intelligence possible',
            'It imports data from an external source',
            'It renames a measure',
        ],
        'correct': 1,
        'explanation': "CALCULATE lets you override or add filters to a measure's evaluation — the basis for things like year-over-year growth.",
    },
    {
        'q': 'What is Row-Level Security (RLS)?',
        'options': [
            'A feature that encrypts the entire Power BI file',
            'A way to restrict which rows of data each user can see in the same report, based on their identity',
            'A setting that limits how many rows a visual can display',
            'A backup and recovery policy for workspaces',
        ],
        'correct': 1,
        'explanation': 'RLS lets one report serve many users while each person only ever sees the rows they\'re authorized to view.',
    },
    {
        'q': 'What is the key difference between Import and DirectQuery?',
        'options': [
            'Import is only for Excel files; DirectQuery is only for SQL Server',
            'Import loads data into the Power BI model for fast performance and full DAX support; DirectQuery queries the source live, which suits very large or frequently changing datasets',
            'DirectQuery is always faster than Import',
            'There is no meaningful difference between them',
        ],
        'correct': 1,
        'explanation': 'Import gives the best performance and modeling flexibility for most cases; DirectQuery trades some of that for a live connection to the source.',
    },
]


class Command(BaseCommand):
    help = 'Inserts the Power BI Data Analytics course with real, hand-authored curriculum content.'

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            instructor = User.objects.get(email=INSTRUCTOR_EMAIL)
        except User.DoesNotExist:
            raise CommandError(
                f'Instructor {INSTRUCTOR_EMAIL} not found — run seed_data first.'
            )

        try:
            category = CourseCategory.objects.get(name=CATEGORY_NAME)
        except CourseCategory.DoesNotExist:
            raise CommandError(f'Category "{CATEGORY_NAME}" not found — run seed_data first.')

        with transaction.atomic():
            course, created = Course.objects.get_or_create(
                title=COURSE_TITLE,
                instructor=instructor,
                defaults={
                    'category': category,
                    'description': COURSE_DESCRIPTION,
                    'short_description': (
                        'Go from raw data to interactive Power BI dashboards — Power Query, data modeling, '
                        'DAX, visualization, publishing, security, and a capstone project.'
                    ),
                    'level': Course.Level.BEGINNER,
                    'language': 'English',
                    'duration_hours': 32,
                    'price': Decimal('59'),
                    'is_free': False,
                    'status': Course.Status.PUBLISHED,
                    'visibility': Course.Visibility.PUBLIC,
                    'requirements': REQUIREMENTS,
                    'learning_objectives': LEARNING_OBJECTIVES,
                    'certificate_enabled': True,
                    'published_at': timezone.now(),
                },
            )

            if not created:
                self.stdout.write(self.style.WARNING(
                    f'"{COURSE_TITLE}" already exists (id={course.id}) — skipping content creation.'
                ))
                return

            unit = CourseUnit.objects.create(course=course, title='Course Content', order=0)

            lesson_count = 0
            for m_index, module_data in enumerate(MODULES):
                module = CourseModule.objects.create(
                    unit=unit,
                    title=module_data['title'],
                    description=module_data['description'],
                    order=m_index,
                )
                for l_index, lesson_data in enumerate(module_data['lessons']):
                    Lesson.objects.create(
                        module=module,
                        title=lesson_data['title'],
                        lesson_type=Lesson.LessonType.TEXT,
                        content=lesson_data['content'],
                        duration_minutes=lesson_data['duration'],
                        order=l_index,
                        is_preview=(m_index == 0 and l_index == 0),
                        status=Lesson.Status.PUBLISHED,
                    )
                    lesson_count += 1

            # Capstone module (17) — project brief lives as its own lesson;
            # the practical assessment itself becomes the course Assignment
            # below, since it's graded work rather than reading material.
            capstone_unit_module = CourseModule.objects.create(
                unit=unit,
                title='Module 17: Capstone Project',
                description='Apply everything from the course to build a full executive sales dashboard.',
                order=len(MODULES),
            )
            Lesson.objects.create(
                module=capstone_unit_module,
                title='Lesson 17.1: Capstone Project Brief — Build an Executive Sales Dashboard',
                lesson_type=Lesson.LessonType.TEXT,
                duration_minutes=15,
                order=0,
                status=Lesson.Status.PUBLISHED,
                content=(
                    "## Scenario\n\n"
                    "You are working as a Data Analyst for a fictional company. You've been given sales "
                    "transactions, customer data, product data, salesperson data, regional information, and "
                    "monthly targets. Management wants an interactive Power BI dashboard built from this "
                    "data.\n\n"
                    "## Project Requirements\n\n"
                    "**Page 1 — Executive Overview.** Total Revenue, Total Profit, Total Orders, Profit "
                    "Margin, and Revenue Growth % as KPIs, plus a Monthly Revenue Trend, Revenue by Region, "
                    "Revenue by Category, and Actual vs Target.\n\n"
                    "**Page 2 — Product Analysis.** Product sales, product profitability, category "
                    "performance, and the top 10 products.\n\n"
                    "**Page 3 — Customer Analysis.** Customer revenue, customer profitability, customer "
                    "segment, and top customers.\n\n"
                    "**Page 4 — Regional Analysis.** Revenue by region, profit by region, regional target "
                    "achievement, and monthly regional trends.\n\n"
                    "**Page 5 — Detailed Transactions.** A drill-through page letting users investigate "
                    "individual transactions.\n\n"
                    "## Course Completion Criteria\n\n"
                    "You've successfully completed this course when you can independently work through "
                    "Connect → Clean → Model → Calculate → Visualize → Analyze → Publish → Secure, and can "
                    "explain not only how you built the solution, but why each design decision was made."
                ),
            )
            lesson_count += 1

            # Final knowledge-check quiz — course-level (module=None).
            quiz = Quiz.objects.create(
                course=course,
                title=f'{course.title} — Final Knowledge Check',
                description='Test your understanding of the core Power BI concepts covered in this course.',
                instructions='Answer each question to check your understanding. You can retake this quiz if needed.',
                duration_minutes=20,
                attempt_limit=3,
                status=Quiz.Status.PUBLISHED,
                created_by=instructor,
            )
            total_marks = 0
            for order, item in enumerate(FINAL_QUIZ_QUESTIONS):
                question = QuizQuestion.objects.create(
                    quiz=quiz,
                    question_text=item['q'],
                    question_type=QuizQuestion.QuestionType.MULTIPLE_CHOICE,
                    marks=10,
                    order=order,
                    explanation=item['explanation'],
                )
                for o_index, opt_text in enumerate(item['options']):
                    QuestionOption.objects.create(
                        question=question,
                        option_text=opt_text,
                        is_correct=(o_index == item['correct']),
                        order=o_index,
                    )
                total_marks += 10
            quiz.total_marks = total_marks
            quiz.passing_marks = max(1, round(total_marks * 0.7))
            quiz.save(update_fields=['total_marks', 'passing_marks'])

            # Capstone practical assessment — graded work, so it's an
            # Assignment rather than more reading material.
            Assignment.objects.create(
                course=course,
                module=capstone_unit_module,
                title='Capstone: Executive Sales Dashboard',
                description=(
                    'Build the full five-page executive sales dashboard described in the Module 17 project '
                    'brief, using a raw dataset of your choosing (or one provided by your instructor).'
                ),
                instructions=(
                    "Using a raw dataset, you must:\n\n"
                    "1. Import the data into Power BI.\n"
                    "2. Clean the data in Power Query.\n"
                    "3. Create a data model with fact and dimension tables.\n"
                    "4. Build the relationships between them.\n"
                    "5. Create calculated measures with DAX.\n"
                    "6. Build a Date table.\n"
                    "7. Perform time-intelligence analysis (e.g. year-over-year growth).\n"
                    "8. Create interactive visuals with slicers and drill-through.\n"
                    "9. Build the five-page dashboard from the project brief.\n"
                    "10. Publish the report to Power BI Service.\n"
                    "11. Configure appropriate Row-Level Security.\n"
                    "12. Submit a short written explanation of your key business findings and the design "
                    "decisions behind your model and report.\n"
                ),
                maximum_marks=100,
                passing_marks=60,
                submission_type=Assignment.SubmissionType.FILE_AND_TEXT,
                status=Assignment.Status.PUBLISHED,
                created_by=instructor,
            )

            self.stdout.write(self.style.SUCCESS(
                f'Created "{course.title}" (id={course.id}, slug={course.slug}) with '
                f'{len(MODULES) + 1} modules, {lesson_count} lessons, a {len(FINAL_QUIZ_QUESTIONS)}-question '
                f'final quiz, and a capstone assignment.'
            ))
