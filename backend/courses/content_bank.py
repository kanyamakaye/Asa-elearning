"""Domain content used to enrich seeded course data with real, professional
lesson material and quiz questions — see the enrich_course_content management
command. Organized by CourseCategory.name so every course inherits content
appropriate to its subject area instead of generic placeholder text.

This is intentionally template-assisted rather than hand-written per course:
with 100+ seeded courses, the goal is genuinely accurate, well-structured
content reused sensibly across courses in the same domain, not bespoke prose
for every single course.
"""

# Each concept is (short_bold_lead, one-sentence explanation). Used to build
# "Key Concepts" bullets and "Why it matters" paragraphs in lesson content.
CONCEPTS = {
    'Software Development': [
        ('Version control', "Git tracks every change to your code so teams can collaborate safely and roll back mistakes."),
        ('Clean code', "Readable, well-named code is easier to maintain than clever one-liners nobody can follow later."),
        ('Debugging mindset', "Reproduce a bug first, then isolate it with logs or a debugger before changing anything."),
        ('Testing pyramid', "Favor many fast unit tests, fewer integration tests, and a handful of end-to-end tests."),
        ('Code review', "A second pair of eyes catches bugs early and spreads knowledge of the codebase across the team."),
        ('Data structures', "Choosing the right structure — array, hash map, tree — determines how fast your code runs."),
        ('Big O thinking', "Estimate how an algorithm's runtime grows as input size increases, not just whether it works."),
        ('API design', "A good API hides implementation details behind a small, predictable, well-documented surface."),
        ('Separation of concerns', "Splitting a program into layers (UI, logic, data) lets each piece change independently."),
        ('Continuous integration', "Automatically building and testing every commit surfaces integration problems within minutes."),
        ('Refactoring', "Improve a design's structure without changing its behavior, guided by a passing test suite."),
        ('Error handling', "Fail loudly and specifically instead of silently swallowing exceptions that hide real bugs."),
        ('Documentation', "Comments should explain *why*, not *what* — the code itself already says what it does."),
        ('Dependency management', "Pin and audit third-party packages; an unmaintained dependency is a liability, not a shortcut."),
        ('Security basics', "Validate all input, never trust the client, and keep secrets out of source control."),
        ('Agile iteration', "Ship small, working increments and adjust direction from real feedback instead of a fixed long plan."),
    ],
    'Information Technology': [
        ('Network basics', "IP addresses uniquely identify devices so data packets know exactly where to go."),
        ('The OSI model', "Networking is split into seven layers, from physical cables up to the application layer."),
        ('DNS', "DNS translates the domain names people type into the IP addresses computers actually use."),
        ('Firewalls', "Firewalls filter incoming and outgoing traffic against rules to block unauthorized access."),
        ('Virtualization', "Running multiple isolated virtual machines on one physical server puts hardware to full use."),
        ('Cloud service models', "IaaS, PaaS, and SaaS trade off control for convenience at different levels of the stack."),
        ('Backups', "The 3-2-1 rule — three copies, two media types, one offsite — protects against data loss."),
        ('Ticketing systems', "Ticketing tracks, prioritizes, and routes support requests so nothing falls through the cracks."),
        ('Patch management', "Regularly applying security updates closes known vulnerabilities before attackers can exploit them."),
        ('Active Directory', "Active Directory centralizes user accounts, permissions, and policy across a Windows network."),
        ('Encryption', "Encryption scrambles data so only someone holding the right key can read it."),
        ('Uptime & SLAs', "Service level agreements define the guaranteed availability a system is contractually required to meet."),
        ('Load balancing', "Load balancers spread traffic across multiple servers so no single machine gets overwhelmed."),
        ('Containers', "Containers package an application with its dependencies so it runs the same way everywhere."),
        ('Disaster recovery', "A tested recovery plan restores systems and data quickly after a major outage."),
        ('Access control', "The principle of least privilege limits each user to only the access their job requires."),
    ],
    'Data Science': [
        ('Data cleaning', "Real-world data is messy — handling missing values and outliers comes before any analysis."),
        ('Descriptive statistics', "Mean, median, and standard deviation summarize a dataset's center and spread at a glance."),
        ('Exploratory data analysis', "Visualizing distributions and relationships before modeling reveals patterns and red flags early."),
        ('Train/test split', "Evaluating a model on data it has never seen estimates how it will actually perform."),
        ('Overfitting', "A model that memorizes its training data performs poorly the moment it sees new data."),
        ('Feature engineering', "Transforming raw data into informative inputs often matters more than the algorithm chosen."),
        ('Correlation vs. causation', "Two variables moving together doesn't prove that one causes the other."),
        ('Supervised learning', "Supervised models learn from labeled examples to predict an outcome on new data."),
        ('Unsupervised learning', "Algorithms like clustering find structure in data without any labeled outcomes at all."),
        ('Bias-variance tradeoff', "Balancing a model's simplicity against its flexibility is key to generalizing well."),
        ('Data visualization', "A well-chosen chart communicates a pattern far faster than a table of raw numbers."),
        ('SQL fundamentals', "Structured queries let you filter, join, and aggregate data stored in relational tables."),
        ('Time series data', "Data points ordered in time often carry trend and seasonal patterns worth modeling explicitly."),
        ('A/B testing', "Comparing two versions with real users shows what actually works, not just what you assume."),
        ('Model evaluation metrics', "Accuracy alone can mislead on imbalanced data — precision, recall, and F1 matter too."),
        ('Reproducibility', "Versioning your data, code, and parameters lets results be verified and rerun reliably."),
    ],
    'Business': [
        ('SWOT analysis', "Mapping Strengths, Weaknesses, Opportunities, and Threats clarifies strategic position before deciding."),
        ('Value proposition', "A strong value proposition states the specific benefit a product delivers to a specific customer."),
        ('Stakeholder management', "Identifying who a project affects, and managing their expectations, prevents surprises later."),
        ('Project scope', "Clearly defining what is — and isn't — included prevents scope creep from derailing a project."),
        ('Risk register', "Logging potential risks with their likelihood and impact helps teams plan mitigations in advance."),
        ('SMART goals', "Specific, Measurable, Achievable, Relevant, Time-bound goals are far easier to track and hit."),
        ('Supply chain', "Coordinating suppliers, production, and logistics gets the right product to customers on time."),
        ('Change management', "People naturally resist change; clear communication and early quick wins build real buy-in."),
        ('Corporate governance', "Governance structures keep a company accountable to its shareholders and other stakeholders."),
        ('Process improvement', "Lean and Six Sigma techniques reduce waste and variation to make operations more efficient."),
        ('Customer relationship management', "Tracking every customer touchpoint builds loyalty and surfaces real upsell opportunities."),
        ('Business model canvas', "A one-page map of how a company creates, delivers, and captures value for its customers."),
        ('Break-even analysis', "The break-even point shows exactly when a venture's revenue starts covering its total costs."),
        ('KPIs', "Key Performance Indicators translate strategy into measurable numbers everyone can rally around."),
        ('Contract fundamentals', "A legally valid contract needs an offer, acceptance, and consideration between the parties."),
        ('Negotiation', "Focusing on underlying interests, not fixed positions, often unlocks genuinely win-win outcomes."),
    ],
    'Accounting': [
        ('Double-entry bookkeeping', "Every transaction affects at least two accounts, keeping total debits and credits in balance."),
        ('The accounting equation', "Assets = Liabilities + Equity holds true after every single transaction is recorded."),
        ('Accrual vs. cash basis', "Accrual accounting records revenue and expenses when earned or incurred, not just when cash moves."),
        ('Balance sheet', "A balance sheet is a snapshot of what a business owns and owes at one point in time."),
        ('Income statement', "The income statement shows revenue, expenses, and profit over a period, not a single moment."),
        ('Cash flow statement', "This statement tracks actual cash moving through operating, investing, and financing activities."),
        ('Depreciation', "Depreciation spreads an asset's cost over its useful life instead of expensing it all at once."),
        ('Accounts receivable/payable', "Receivable is money owed to you; payable is money you owe — both drive cash flow planning."),
        ('General ledger', "The general ledger is the complete record of every financial transaction, organized by account."),
        ('Trial balance', "A trial balance checks that total debits equal total credits before financial statements are prepared."),
        ('Budgeting', "Budgeting plans expected income and expenses in advance to guide upcoming spending decisions."),
        ('Cost accounting', "Cost accounting assigns direct and indirect costs to products to reveal true profitability."),
        ('Internal controls', "Controls like separation of duties reduce the risk that errors or fraud go unnoticed."),
        ('Tax fundamentals', "Understanding taxable income, deductions, and deadlines avoids costly penalties and surprises."),
        ('Auditing', "An independent audit verifies that financial statements fairly represent the organization's position."),
        ('Financial ratios', "Ratios like current ratio or gross margin turn raw numbers into insight you can compare over time."),
    ],
    'Digital Marketing': [
        ('Sales funnel', "Prospects move through awareness, consideration, and decision before ever converting to a customer."),
        ('SEO', "Search engine optimization improves content and site structure so it ranks higher in organic results."),
        ('Content marketing', "Publishing genuinely useful content builds trust and attracts an audience over time, not overnight."),
        ('Paid search (PPC)', "With PPC, you pay per click for ads that appear against keywords you specifically choose."),
        ('Conversion rate', "Conversion rate is the percentage of visitors who complete a desired action, like a purchase."),
        ('A/B testing', "Comparing two versions of a page or ad with real traffic shows which one actually performs better."),
        ('Email segmentation', "Sending relevant messages to specific audience groups beats one generic blast to everyone."),
        ('Customer acquisition cost', "CAC is what it actually costs, on average, to win one new paying customer."),
        ('Retention & LTV', "Keeping an existing customer is cheaper than acquiring a new one, and lifts lifetime value."),
        ('Brand positioning', "Positioning describes how a brand is perceived relative to competitors in the customer's mind."),
        ('Social proof', "Reviews, testimonials, and visible user counts reduce a buyer's perceived risk before purchase."),
        ('Marketing analytics', "Tracking the right metrics tells you what's actually working, not just what feels like it is."),
        ('Attribution', "Attribution figures out which touchpoint, or combination of touchpoints, drove a conversion."),
        ('Influencer marketing', "Brands borrow a creator's audience trust to introduce a product to a receptive audience."),
        ('Affiliate marketing', "Affiliate partners earn a commission for driving sales or leads back to your business."),
        ('Short-form video', "Fast, native-feeling video performs strongly for reach on platforms like TikTok and Reels."),
    ],
    'Languages': [
        ('Spaced repetition', "Reviewing new vocabulary at increasing intervals moves it into long-term memory efficiently."),
        ('Comprehensible input', "Learning accelerates fastest with material that's just slightly above your current level."),
        ('Active recall', "Trying to remember a word before checking the answer builds stronger memory than rereading."),
        ('Immersion', "Surrounding yourself with the language, even briefly each day, builds intuition faster than occasional study."),
        ('Pronunciation practice', "Listening and repeating aloud early on prevents habits that are hard to unlearn later."),
        ('Grammar patterns', "Drilling one pattern across different sentences builds usable fluency faster than memorizing rules."),
        ('Listening comprehension', "Regular exposure to native speech trains your ear to parse fast, natural conversation."),
        ('Speaking practice', "Making mistakes out loud, early and often, matters more than sounding perfect from day one."),
        ('Vocabulary in context', "Learning words inside example sentences sticks far better than memorizing isolated lists."),
        ('The CEFR scale', "A1 through C2 describes proficiency from beginner to near-native — useful for setting real goals."),
        ('Cognates', "Words that look and sound similar across related languages can jump-start early vocabulary."),
        ('Cultural context', "Understanding norms around greetings and politeness prevents awkward miscommunication."),
        ('Consistency over intensity', "Fifteen focused minutes daily beats one long, exhausting session once a week."),
        ('Shadowing', "Repeating audio in real time, matching rhythm and intonation, sharpens listening and speaking together."),
        ('Error correction', "Getting timely feedback on mistakes prevents them from hardening into permanent habits."),
        ('Setting a purpose', "Learning toward a real goal — travel, work, a conversation — sustains motivation better than studying abstractly."),
    ],
    'Professional Development': [
        ('Active listening', "Fully focusing on the speaker, instead of planning your reply, builds real trust and understanding."),
        ('Emotional intelligence', "Recognizing and managing your own emotions, and reading others', improves how you work with people."),
        ('SMART time management', "Prioritizing important-but-not-urgent work early keeps it from becoming a constant crisis later."),
        ('Delegation', "Assigning the right task to the right person frees your time and develops their skills."),
        ('Constructive feedback', "Good feedback focuses on specific, observable behavior, not personality, plus a path forward."),
        ('Conflict resolution', "Addressing disagreements early and directly usually costs far less than letting them fester."),
        ('Public speaking structure', "A clear opening, a few key points, and a strong close keep an audience with you."),
        ('Growth mindset', "Believing ability can be developed through effort turns setbacks into data, not verdicts."),
        ('Networking', "Genuine, mutually useful relationships built over time outperform transactional one-off asks."),
        ('Personal branding', "Consistently showing your expertise and values shapes how others perceive you professionally."),
        ('Meeting discipline', "A clear agenda, a defined owner, and documented follow-ups turn meetings into decisions."),
        ('Critical thinking', "Questioning assumptions and evidence before concluding leads to better decisions under uncertainty."),
        ('Coaching vs. mentoring', "Coaching draws answers out of someone through questions; mentoring shares direct experience."),
        ('Resilience', "Recovering from setbacks faster comes from perspective and support, not just raw willpower."),
        ('Negotiation prep', "Knowing your walk-away point (BATNA) before a negotiation starts gives you real leverage."),
        ('Prioritization frameworks', "Sorting tasks by urgency and importance, like the Eisenhower Matrix, clarifies what's first."),
    ],
}

# Multiple-choice question banks. Each entry: q, options (4), correct (index), explanation.
QUESTIONS = {
    'Software Development': [
        {'q': "What is the main purpose of version control systems like Git?", 'options': ["Track and manage changes to code over time", "Compile source code into machine code", "Design user interfaces", "Encrypt sensitive data"], 'correct': 0, 'explanation': "Version control tracks history, enables branching, and lets teams collaborate without overwriting each other's work."},
        {'q': "In Big O notation, which complexity describes an algorithm whose runtime scales directly with input size?", 'options': ["O(1)", "O(log n)", "O(n)", "O(2^n)"], 'correct': 2, 'explanation': "O(n) is linear — runtime grows proportionally with input size."},
        {'q': "What does the software principle \"DRY\" stand for?", 'options': ["Do Repeat Yourself", "Don't Repeat Yourself", "Design Rapidly Yearly", "Debug Regularly Yourself"], 'correct': 1, 'explanation': "DRY encourages removing duplication by extracting shared logic into one reusable place."},
        {'q': "Which testing type verifies that a single function works correctly in isolation?", 'options': ["Unit test", "End-to-end test", "Load test", "Smoke test"], 'correct': 0, 'explanation': "Unit tests target the smallest testable pieces of code in isolation."},
        {'q': "What is the primary benefit of code review before merging changes?", 'options': ["It slows down deployment on purpose", "It catches bugs and spreads codebase knowledge across the team", "It replaces the need for testing", "It automatically formats code"], 'correct': 1, 'explanation': "A second reviewer catches issues the original author missed and shares context."},
        {'q': "In REST API design, which HTTP method is conventionally used to fully replace an existing resource?", 'options': ["GET", "POST", "PUT", "DELETE"], 'correct': 2, 'explanation': "PUT conventionally replaces a resource entirely; PATCH is used for partial updates."},
        {'q': "What problem does continuous integration (CI) primarily solve?", 'options': ["It replaces manual testing entirely", "It catches integration issues early by building and testing every commit", "It manages cloud infrastructure costs", "It writes documentation automatically"], 'correct': 1, 'explanation': "CI surfaces integration problems within minutes instead of weeks."},
        {'q': "Which data structure provides average O(1) lookup time by key?", 'options': ["Linked list", "Array", "Hash map", "Binary search tree"], 'correct': 2, 'explanation': "Hash maps use a hash function to give near-constant-time key lookups on average."},
        {'q': "What is \"technical debt\"?", 'options': ["Money owed to a software vendor", "The long-term cost of choosing a quick fix over a better, more maintainable solution", "A bug in production", "A type of database index"], 'correct': 1, 'explanation': "Technical debt accrues \"interest\" as shortcuts make future changes slower and riskier."},
        {'q': "In object-oriented programming, what does \"encapsulation\" refer to?", 'options': ["Bundling data and the methods that operate on it while hiding internal details", "Running code on multiple threads at once", "Converting code to bytecode", "Compressing files for storage"], 'correct': 0, 'explanation': "Encapsulation hides an object's internal state behind a controlled interface."},
        {'q': "What is the purpose of a Git branch?", 'options': ["To permanently delete old commits", "To develop features or fixes in isolation before merging them", "To compile the project", "To back up the entire repository offline"], 'correct': 1, 'explanation': "Branches let work happen in parallel without disturbing the main codebase."},
        {'q': "Which of these is a core principle of Agile software development?", 'options': ["Deliver working software in small, frequent iterations", "Freeze all requirements before writing any code", "Avoid talking to stakeholders until launch", "Write all documentation before any code"], 'correct': 0, 'explanation': "Agile favors iterative delivery and feedback over big up-front planning."},
        {'q': "What does an API rate limit protect against?", 'options': ["SQL injection", "A single client overwhelming a service with too many requests", "Slow database queries", "Broken user interfaces"], 'correct': 1, 'explanation': "Rate limiting caps how many requests a client can make in a given time window."},
        {'q': "What is the main advantage of containerizing an application (e.g., with Docker)?", 'options': ["It automatically fixes bugs", "It packages an app with its dependencies so it runs consistently across environments", "It makes code run faster than native execution", "It removes the need for testing"], 'correct': 1, 'explanation': "Containers bundle the app and its runtime so \"it works on my machine\" problems disappear."},
        {'q': "What does \"idempotent\" mean for an API operation?", 'options': ["It can only be called once ever", "Calling it multiple times has the same effect as calling it once", "It always returns an error", "It requires authentication"], 'correct': 1, 'explanation': "PUT and DELETE are typically idempotent — repeating them doesn't change the outcome."},
        {'q': "Which practice helps prevent merge conflicts on a fast-moving team?", 'options': ["Working on one giant branch for months", "Committing and pulling changes frequently in small increments", "Never using version control", "Disabling code review"], 'correct': 1, 'explanation': "Small, frequent integrations surface conflicts early while they're still easy to resolve."},
        {'q': "What is the purpose of a linter?", 'options': ["To deploy code to production", "To automatically flag style issues and potential bugs in source code", "To manage databases", "To encrypt passwords"], 'correct': 1, 'explanation': "Linters catch stylistic inconsistencies and common mistakes before code even runs."},
        {'q': "In a client-server architecture, what is the role of the client?", 'options': ["It stores the master copy of all data permanently", "It initiates requests and typically renders the response for the user", "It only runs on servers", "It has no role in the request-response cycle"], 'correct': 1, 'explanation': "The client sends requests to the server and presents the results to the user."},
        {'q': "What does \"scalability\" describe in a software system?", 'options': ["How pretty the UI looks", "The system's ability to handle increased load by adding resources", "How many programming languages it supports", "The size of the codebase"], 'correct': 1, 'explanation': "A scalable system keeps performing well as demand grows."},
        {'q': "Which of these is a common cause of a memory leak?", 'options': ["Releasing all allocated resources promptly", "Holding references to objects that are no longer needed", "Using too few variables", "Writing too many comments"], 'correct': 1, 'explanation': "Unreleased references prevent the garbage collector from reclaiming unused memory."},
        {'q': "What is the purpose of environment variables in application configuration?", 'options': ["To store secrets and settings outside of source code", "To speed up compilation", "To style the user interface", "To replace databases"], 'correct': 0, 'explanation': "Environment variables keep secrets and per-environment config out of the codebase."},
        {'q': "What does \"backward compatibility\" mean when releasing a new API version?", 'options': ["New clients cannot use the old API at all", "Existing clients continue to work correctly with the updated system", "The API can no longer be updated", "All previous data is deleted"], 'correct': 1, 'explanation': "Backward-compatible changes don't break clients built against the previous version."},
        {'q': "Which of the following best describes \"pair programming\"?", 'options': ["Two developers writing separate, unrelated features", "Two developers working together at one workstation, reviewing and writing code in real time", "Running two versions of an app in parallel", "Testing an app on two devices"], 'correct': 1, 'explanation': "Pair programming shares context and catches mistakes as code is being written."},
        {'q': "What is the main goal of writing an automated test before fixing a reported bug?", 'options': ["To make the bug harder to reproduce", "To confirm the bug exists and later verify the fix actually resolves it", "To slow down the release", "To avoid writing documentation"], 'correct': 1, 'explanation': "A failing test that reproduces the bug proves the fix works and guards against regressions."},
    ],
    'Information Technology': [
        {'q': "What is the main function of DNS?", 'options': ["Encrypt network traffic", "Translate domain names into IP addresses", "Assign IP addresses automatically", "Block malicious websites"], 'correct': 1, 'explanation': "DNS resolves human-readable domain names to the IP addresses machines actually use."},
        {'q': "Which protocol is used to securely browse websites with encryption?", 'options': ["HTTP", "FTP", "HTTPS", "SMTP"], 'correct': 2, 'explanation': "HTTPS encrypts traffic between the browser and server using TLS."},
        {'q': "What does a firewall primarily do?", 'options': ["Speed up internet connections", "Filter network traffic based on security rules", "Store backups", "Assign domain names"], 'correct': 1, 'explanation': "Firewalls allow or block traffic based on configured security rules."},
        {'q': "In the 3-2-1 backup rule, how many total copies of data should you keep?", 'options': ["1", "2", "3", "5"], 'correct': 2, 'explanation': "Three total copies, on two different media types, with one stored offsite."},
        {'q': "What is virtualization primarily used for?", 'options': ["Running multiple isolated virtual machines on one physical server", "Encrypting hard drives", "Increasing screen resolution", "Blocking spam email"], 'correct': 0, 'explanation': "Virtualization lets one physical server host several independent virtual machines."},
        {'q': "Which cloud service model gives you the most control over the underlying operating system?", 'options': ["SaaS", "PaaS", "IaaS", "DaaS"], 'correct': 2, 'explanation': "IaaS provides raw compute and storage, leaving the OS and above under your control."},
        {'q': "What is the purpose of Active Directory in a Windows network?", 'options': ["Hosting websites", "Centralizing user accounts and permissions across the network", "Rendering 3D graphics", "Compressing files"], 'correct': 1, 'explanation': "Active Directory centrally manages identities, permissions, and policy."},
        {'q': "What does \"least privilege\" mean in access control?", 'options': ["Every user gets administrator access by default", "Users are granted only the access they need to do their job", "Access is never restricted", "Only IT staff can log in"], 'correct': 1, 'explanation': "Least privilege limits the potential damage from a compromised account."},
        {'q': "What is the primary purpose of a load balancer?", 'options': ["Encrypt passwords", "Distribute incoming traffic across multiple servers", "Store user data", "Compile source code"], 'correct': 1, 'explanation': "Load balancers spread requests so no single server becomes a bottleneck."},
        {'q': "Which of these best describes patch management?", 'options': ["Ignoring software updates to avoid downtime", "Regularly applying updates to fix bugs and close security holes", "Deleting old software versions permanently", "Backing up databases"], 'correct': 1, 'explanation': "Timely patching closes known vulnerabilities before they can be exploited."},
        {'q': "What does an SLA (Service Level Agreement) typically define?", 'options': ["The programming language used", "The guaranteed level of service, such as uptime, a provider must deliver", "The office hours of the IT team", "The color scheme of a dashboard"], 'correct': 1, 'explanation': "SLAs set measurable commitments like uptime and response times."},
        {'q': "Why is IP addressing important on a network?", 'options': ["It uniquely identifies devices so data can be routed to the right destination", "It encrypts all traffic automatically", "It speeds up the CPU", "It manages user passwords"], 'correct': 0, 'explanation': "Every device needs a unique address for packets to reach it correctly."},
        {'q': "What is a key advantage of using containers over traditional virtual machines?", 'options': ["Containers are heavier and slower to start", "Containers share the host OS kernel and start much faster", "Containers require a separate OS per app", "Containers cannot be automated"], 'correct': 1, 'explanation': "Sharing the host kernel makes containers much lighter and faster to start than full VMs."},
        {'q': "What is the goal of a disaster recovery plan?", 'options': ["To prevent all outages from ever happening", "To restore systems and data quickly after a major disruption", "To eliminate the need for backups", "To reduce IT staff headcount"], 'correct': 1, 'explanation': "DR planning focuses on fast, reliable recovery, not preventing every failure."},
        {'q': "Which layer of the OSI model is responsible for routing data between networks?", 'options': ["Physical layer", "Data Link layer", "Network layer", "Application layer"], 'correct': 2, 'explanation': "The Network layer (Layer 3) handles logical addressing and routing."},
        {'q': "What does encryption protect against?", 'options': ["Slow internet speeds", "Unauthorized parties reading intercepted data", "Hardware failure", "Power outages"], 'correct': 1, 'explanation': "Encryption makes intercepted data unreadable without the correct key."},
        {'q': "In a helpdesk ticketing system, what is the main benefit of prioritization?", 'options': ["All tickets are resolved in the order they arrive regardless of urgency", "Critical issues get addressed before lower-impact ones", "Tickets are deleted automatically after a day", "Users cannot see their ticket status"], 'correct': 1, 'explanation': "Prioritization ensures the most urgent, high-impact issues are handled first."},
        {'q': "What is a common symptom of a DDoS attack?", 'options': ["A service becomes unavailable due to a flood of traffic", "Files become encrypted and held for ransom", "Passwords are silently changed", "Emails are automatically forwarded"], 'correct': 0, 'explanation': "DDoS attacks overwhelm a service with traffic until it can't respond to real users."},
        {'q': "What does RAID primarily provide in server storage?", 'options': ["Faster internet speeds", "Redundancy and/or performance across multiple physical disks", "Automatic software updates", "User authentication"], 'correct': 1, 'explanation': "RAID configurations combine disks for fault tolerance, speed, or both."},
        {'q': "Which of these is considered a strong password practice?", 'options': ["Reusing the same password across all accounts", "Using a long, unique passphrase with a password manager", "Writing passwords on a sticky note", "Using your name and birth year"], 'correct': 1, 'explanation': "Unique, long passphrases managed by a password manager resist both guessing and reuse attacks."},
        {'q': "What is the purpose of a VPN?", 'options': ["To make a website load faster", "To create a secure, encrypted connection over a public network", "To block all internet access", "To speed up printers"], 'correct': 1, 'explanation': "A VPN tunnels traffic securely, even over untrusted public networks."},
        {'q': "What does \"uptime\" measure?", 'options': ["How fast a website loads", "The percentage of time a system is operational and available", "The number of users on a system", "The size of a database"], 'correct': 1, 'explanation': "Uptime is the proportion of time a service is actually reachable and working."},
        {'q': "Which of these is a benefit of centralized logging in IT operations?", 'options': ["It makes it harder to find issues", "It lets teams search and correlate events across systems from one place", "It replaces the need for monitoring", "It encrypts all stored data automatically"], 'correct': 1, 'explanation': "Centralized logs make it far easier to trace an issue across multiple systems."},
        {'q': "What is the first recommended step when troubleshooting a reported IT issue?", 'options': ["Reinstall the operating system immediately", "Reproduce and clearly define the problem before making changes", "Replace the hardware", "Ignore it until it happens again"], 'correct': 1, 'explanation': "Understanding the actual problem prevents wasted effort fixing the wrong thing."},
    ],
    'Data Science': [
        {'q': "Why is a train/test split used when building a machine learning model?", 'options': ["To make training faster", "To estimate how the model performs on data it hasn't seen", "To reduce the number of features", "To visualize the data"], 'correct': 1, 'explanation': "Holding out test data simulates how the model will behave on future, unseen inputs."},
        {'q': "What does \"overfitting\" mean?", 'options': ["A model performs well on both training and new data", "A model performs well on training data but poorly on new data", "A model trains too slowly", "A dataset has too few rows"], 'correct': 1, 'explanation': "An overfit model has memorized noise in the training set instead of learning general patterns."},
        {'q': "Which measure of central tendency is most affected by extreme outliers?", 'options': ["Median", "Mode", "Mean", "Range"], 'correct': 2, 'explanation': "The mean is pulled toward extreme values; the median is far more robust to outliers."},
        {'q': "What is the main difference between supervised and unsupervised learning?", 'options': ["Supervised learning uses labeled data; unsupervised learning finds structure without labels", "Supervised learning is always faster", "Unsupervised learning requires more labeled data", "There is no real difference"], 'correct': 0, 'explanation': "Supervised learning maps inputs to known outputs; unsupervised learning has no labels to learn from."},
        {'q': "Correlation between two variables means:", 'options': ["One variable definitely causes the other", "The variables tend to move together, but causation isn't proven", "The variables are unrelated", "The data has no missing values"], 'correct': 1, 'explanation': "Correlation only shows a statistical association, not a causal relationship."},
        {'q': "Which SQL clause is used to filter rows before aggregation?", 'options': ["HAVING", "GROUP BY", "WHERE", "ORDER BY"], 'correct': 2, 'explanation': "WHERE filters individual rows before any grouping happens; HAVING filters after aggregation."},
        {'q': "What is the purpose of feature engineering?", 'options': ["To delete all missing values", "To transform raw data into more informative inputs for a model", "To visualize a dataset", "To split data into train and test sets"], 'correct': 1, 'explanation': "Well-engineered features often improve model performance more than switching algorithms."},
        {'q': "In a classification problem with imbalanced classes, why can accuracy be misleading?", 'options': ["Accuracy always equals 100%", "A model can score high accuracy by just predicting the majority class every time", "Accuracy is not a real metric", "Accuracy only works for regression"], 'correct': 1, 'explanation': "With 95% of one class, always predicting it yields 95% accuracy while learning nothing useful."},
        {'q': "What does \"precision\" measure in a classification model?", 'options': ["Of all actual positives, how many were correctly identified", "Of all predicted positives, how many were actually correct", "The total number of predictions made", "The speed of the model"], 'correct': 1, 'explanation': "Precision asks: when the model says positive, how often is it right?"},
        {'q': "What does \"recall\" measure in a classification model?", 'options': ["Of all actual positives, how many were correctly identified", "Of all predicted positives, how many were correct", "How fast the model runs", "The size of the dataset"], 'correct': 0, 'explanation': "Recall asks: of everything actually positive, how many did the model catch?"},
        {'q': "What is a key characteristic of time series data?", 'options': ["Data points have no particular order", "Data points are ordered in time and may show trend or seasonality", "It cannot be visualized", "It is always categorical"], 'correct': 1, 'explanation': "Time order matters — past values often help predict future ones."},
        {'q': "What is the main goal of exploratory data analysis (EDA)?", 'options': ["To deploy a model to production", "To understand patterns, relationships, and issues in the data before modeling", "To write the final report", "To collect new data"], 'correct': 1, 'explanation': "EDA builds intuition about the data and surfaces problems before any model is built."},
        {'q': "In an A/B test, what is the purpose of the control group?", 'options': ["To receive the new version being tested", "To provide a baseline for comparison against the variant", "To be excluded from analysis", "To guarantee the test succeeds"], 'correct': 1, 'explanation': "The control group shows what would have happened without the change, for fair comparison."},
        {'q': "Which of these best describes the bias-variance tradeoff?", 'options': ["Balancing a model's simplicity against its flexibility to generalize well", "Choosing between SQL and Python", "Deciding how much data to collect", "Picking a chart color scheme"], 'correct': 0, 'explanation': "Too simple underfits (high bias); too flexible overfits (high variance)."},
        {'q': "What is a common way to handle missing values in a dataset?", 'options': ["Always delete the entire dataset", "Impute them with a reasonable value or remove affected rows", "Ignore that they exist", "Replace them with random text"], 'correct': 1, 'explanation': "Imputation or careful row removal keeps the dataset usable without introducing bad data."},
        {'q': "Which chart type is best suited for showing the trend of a value over time?", 'options': ["Pie chart", "Line chart", "Scatter plot without axes", "Word cloud"], 'correct': 1, 'explanation': "Line charts naturally show how a value changes as time progresses."},
        {'q': "What is clustering an example of?", 'options': ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Data cleaning only"], 'correct': 1, 'explanation': "Clustering groups data by similarity without any labeled outcomes."},
        {'q': "Why is reproducibility important in a data science project?", 'options': ["It makes results look more impressive", "It allows others (and future you) to verify and rerun the analysis reliably", "It is only relevant for academic papers", "It slows down every project unnecessarily"], 'correct': 1, 'explanation': "Versioned, reproducible work can be trusted, audited, and built upon."},
        {'q': "What does a p-value help assess in a statistical test?", 'options': ["The size of the dataset", "The likelihood the observed effect occurred by chance under the null hypothesis", "The exact cause of an effect", "The speed of computation"], 'correct': 1, 'explanation': "A small p-value suggests the observed result is unlikely under the null hypothesis alone."},
        {'q': "What is a primary purpose of normalizing or scaling numeric features?", 'options': ["To make features comparable in range so none dominates a model due to scale", "To remove all outliers automatically", "To convert text to numbers", "To visualize data in 3D"], 'correct': 0, 'explanation': "Many algorithms are sensitive to feature scale, so normalizing puts them on equal footing."},
        {'q': "Which join type returns only rows that match in both tables?", 'options': ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], 'correct': 2, 'explanation': "INNER JOIN keeps only rows with a match on both sides."},
        {'q': "What does \"F1 score\" combine?", 'options': ["Accuracy and runtime", "Precision and recall into a single metric", "Mean and median", "Training and test set size"], 'correct': 1, 'explanation': "F1 is the harmonic mean of precision and recall, balancing both."},
        {'q': "In big data processing frameworks like Spark, what is a key advantage over single-machine tools?", 'options': ["They only work on small datasets", "They distribute computation across many machines to process data too large for one machine", "They eliminate the need for cleaning data", "They require no code"], 'correct': 1, 'explanation': "Distributed processing lets Spark handle datasets far larger than one machine's memory."},
        {'q': "What is a key risk of deploying a model without monitoring it afterward?", 'options': ["The model will automatically retrain itself", "Its real-world performance can silently degrade as data patterns change", "It will run faster over time", "There is no risk"], 'correct': 1, 'explanation': "This is called data drift — the world changes, and an unmonitored model quietly gets worse."},
    ],
    'Business': [
        {'q': "What does the \"O\" in a SWOT analysis stand for?", 'options': ["Objectives", "Opportunities", "Outcomes", "Operations"], 'correct': 1, 'explanation': "SWOT stands for Strengths, Weaknesses, Opportunities, and Threats."},
        {'q': "What is \"scope creep\" in project management?", 'options': ["A project finishing early", "Uncontrolled expansion of a project's requirements beyond its original plan", "A budget surplus", "A well-documented change request process"], 'correct': 1, 'explanation': "Scope creep happens when new requirements sneak in without adjusting time or budget."},
        {'q': "Which of these is a SMART goal?", 'options': ["\"Get better at sales\"", "\"Increase monthly sales by 10% by the end of Q3\"", "\"Improve the company somehow\"", "\"Work harder this year\""], 'correct': 1, 'explanation': "It's Specific, Measurable, Achievable, Relevant, and Time-bound."},
        {'q': "What is the primary purpose of a risk register?", 'options': ["To track employee vacation days", "To log potential risks along with their likelihood, impact, and mitigation plan", "To record customer complaints", "To list company assets"], 'correct': 1, 'explanation': "A risk register keeps identified risks visible and their responses planned in advance."},
        {'q': "In break-even analysis, the break-even point is where:", 'options': ["Total revenue equals total costs", "Profit is at its maximum", "All debt is paid off", "Sales reach zero"], 'correct': 0, 'explanation': "Below break-even the venture loses money; above it, it turns a profit."},
        {'q': "What is a core goal of Lean methodology?", 'options': ["Maximizing paperwork", "Reducing waste while maximizing value delivered to the customer", "Increasing headcount", "Slowing down production intentionally"], 'correct': 1, 'explanation': "Lean focuses relentlessly on cutting anything that doesn't add customer value."},
        {'q': "What does CRM software primarily help a business manage?", 'options': ["Payroll processing", "Interactions and relationships with customers and leads", "Manufacturing schedules", "Network security"], 'correct': 1, 'explanation': "CRM systems track every touchpoint a business has with prospects and customers."},
        {'q': "What are the three essential elements of a legally valid contract?", 'options': ["Offer, acceptance, and consideration", "Signature, date, and witness only", "Price, product, and delivery", "A lawyer, a notary, and a seal"], 'correct': 0, 'explanation': "A valid contract needs a clear offer, an acceptance of it, and something of value exchanged."},
        {'q': "What is the main idea behind principled negotiation (interest-based negotiation)?", 'options': ["Always take the most aggressive position possible", "Focus on underlying interests rather than fixed positions to find mutual value", "Never make any concessions", "Avoid negotiating altogether"], 'correct': 1, 'explanation': "Understanding the *why* behind a position often reveals options both sides can accept."},
        {'q': "What is a Key Performance Indicator (KPI)?", 'options': ["A legal requirement for public companies", "A measurable value showing how effectively a goal or objective is being achieved", "A type of employee contract", "A marketing slogan"], 'correct': 1, 'explanation': "KPIs translate strategy into concrete, trackable numbers."},
        {'q': "What does the term \"supply chain\" refer to?", 'options': ["Only the final sale to the customer", "The full network of activities that move a product from raw materials to the end customer", "A company's org chart", "The company's advertising budget"], 'correct': 1, 'explanation': "The supply chain spans sourcing, production, and logistics through to delivery."},
        {'q': "Why do change management initiatives often build in \"quick wins\"?", 'options': ["To finish the project as fast as possible regardless of quality", "To build early momentum and buy-in that supports the larger change", "To reduce the budget", "To avoid stakeholder involvement"], 'correct': 1, 'explanation': "Visible early success makes people more willing to support the bigger transition."},
        {'q': "What is the purpose of corporate governance?", 'options': ["To maximize short-term stock price only", "To provide the structures and rules that keep a company accountable to shareholders and stakeholders", "To eliminate the board of directors", "To avoid financial reporting"], 'correct': 1, 'explanation': "Governance sets accountability, oversight, and decision rights across a company."},
        {'q': "What does a \"value proposition\" describe?", 'options': ["The company's total revenue", "The specific benefit a product or service delivers to a specific customer", "The org chart of a company", "The legal structure of a business"], 'correct': 1, 'explanation': "A value proposition answers: why should this specific customer choose this product?"},
        {'q': "In project management, what does defining the \"scope\" of a project primarily do?", 'options': ["Sets the marketing budget", "Clarifies what is and isn't included in the project's deliverables", "Assigns performance bonuses", "Chooses the company logo"], 'correct': 1, 'explanation': "A clear scope statement is the anchor used to evaluate every later change request."},
        {'q': "What is the purpose of stakeholder mapping?", 'options': ["To identify who is affected by or can influence a project, and plan how to manage them", "To calculate tax liability", "To design a product's packaging", "To choose office furniture"], 'correct': 0, 'explanation': "Mapping stakeholders by influence and interest guides how much to engage each one."},
        {'q': "Which of these best describes Six Sigma's primary focus?", 'options': ["Increasing marketing spend", "Reducing process variation and defects to improve quality", "Hiring more managers", "Rebranding the company"], 'correct': 1, 'explanation': "Six Sigma uses data to drive defects and variation down to near-zero."},
        {'q': "What is the business model canvas used for?", 'options': ["Filing taxes", "Visually mapping how a company creates, delivers, and captures value on one page", "Tracking employee attendance", "Designing a website"], 'correct': 1, 'explanation': "It's a strategic tool that lays out a business's core logic in one glance."},
        {'q': "What is a common early warning sign that a business risk needs urgent attention?", 'options': ["It has low likelihood and low impact", "It has high likelihood and high impact on objectives", "It was resolved last quarter", "It only affects one junior employee"], 'correct': 1, 'explanation': "High-likelihood, high-impact risks deserve mitigation planning first."},
        {'q': "Why is stakeholder communication considered critical during organizational change?", 'options': ["It is legally required in every case", "Clear, consistent communication reduces uncertainty and resistance to change", "It replaces the need for training", "It guarantees the change will succeed"], 'correct': 1, 'explanation': "Uncertainty breeds resistance; clear communication reduces both."},
        {'q': "What does \"operational efficiency\" generally measure?", 'options': ["How much a company spends on advertising", "How well a company uses its resources to produce output with minimal waste", "The number of products a company sells", "The size of the executive team"], 'correct': 1, 'explanation': "Efficiency compares output achieved against the resources consumed to get there."},
        {'q': "In entrepreneurship, what is a Minimum Viable Product (MVP) used for?", 'options': ["Launching the final, fully-featured product", "Testing a core idea with real users using the least effort needed to learn from it", "Replacing market research entirely", "Avoiding customer feedback"], 'correct': 1, 'explanation': "An MVP validates or invalidates an assumption before investing heavily in it."},
        {'q': "What is the primary purpose of due diligence before a business deal or investment?", 'options': ["To skip legal review to save time", "To thoroughly verify facts, risks, and financials before committing", "To finalize the marketing plan", "To hire new staff"], 'correct': 1, 'explanation': "Due diligence uncovers risks and confirms claims before money changes hands."},
        {'q': "What best describes \"fiduciary duty\" for a company's board members?", 'options': ["An obligation to act in the best interests of the company and its shareholders", "A tax filing requirement only", "A marketing responsibility", "An IT security policy"], 'correct': 0, 'explanation': "Fiduciary duty legally binds directors to prioritize the company's and shareholders' interests."},
    ],
    'Accounting': [
        {'q': "In double-entry bookkeeping, every transaction affects at least how many accounts?", 'options': ["One", "Two", "Three", "Four"], 'correct': 1, 'explanation': "Every transaction has a debit and a corresponding credit, affecting two accounts at minimum."},
        {'q': "What is the accounting equation?", 'options': ["Revenue - Expenses = Profit", "Assets = Liabilities + Equity", "Assets = Revenue - Costs", "Equity = Liabilities - Assets"], 'correct': 1, 'explanation': "This equation must always balance after every recorded transaction."},
        {'q': "Under accrual accounting, when is revenue recorded?", 'options': ["Only when cash is received", "When it is earned, regardless of when cash is received", "At the end of the fiscal year only", "Whenever the accountant prefers"], 'correct': 1, 'explanation': "Accrual accounting matches revenue to when it's earned, not when cash arrives."},
        {'q': "What does a balance sheet show?", 'options': ["Profit over an entire year", "A snapshot of assets, liabilities, and equity at a specific point in time", "Only cash transactions", "Marketing expenses"], 'correct': 1, 'explanation': "It's a financial \"photo\" as of one date, not a period of activity."},
        {'q': "What is the purpose of a cash flow statement?", 'options': ["To show a company's tax liability", "To track actual cash moving in and out through operating, investing, and financing activities", "To calculate depreciation", "To list all employees"], 'correct': 1, 'explanation': "It shows real cash movement, which can differ significantly from reported profit."},
        {'q': "What does depreciation represent?", 'options': ["A sudden loss of cash", "Spreading the cost of a long-term asset over its useful life", "An increase in asset value", "A type of tax refund"], 'correct': 1, 'explanation': "Depreciation matches an asset's cost to the periods it helps generate revenue."},
        {'q': "Accounts receivable represents:", 'options': ["Money a company owes to suppliers", "Money owed to a company by its customers", "Cash held in the bank", "Depreciation expense"], 'correct': 1, 'explanation': "Receivables are amounts customers still owe for goods or services already delivered."},
        {'q': "What is the purpose of a trial balance?", 'options': ["To calculate net income directly", "To check that total debits equal total credits before preparing financial statements", "To file taxes", "To value inventory"], 'correct': 1, 'explanation': "A trial balance is a bookkeeping checkpoint before statements are finalized."},
        {'q': "Why are internal controls, like separation of duties, important?", 'options': ["They speed up reporting deadlines", "They reduce the risk of errors and fraud by ensuring no single person controls a whole process", "They eliminate the need for audits", "They lower tax rates"], 'correct': 1, 'explanation': "Splitting responsibilities makes it harder for mistakes or fraud to go undetected."},
        {'q': "What is the main purpose of an external audit?", 'options': ["To prepare the company's tax return", "To independently verify that financial statements fairly represent the organization's position", "To set employee salaries", "To design the company logo"], 'correct': 1, 'explanation': "Auditors give an independent opinion on whether the statements are fairly presented."},
        {'q': "Gross margin is calculated as:", 'options': ["(Revenue - Cost of Goods Sold) / Revenue", "Net Income / Revenue", "Total Assets / Total Liabilities", "Cash / Current Liabilities"], 'correct': 0, 'explanation': "Gross margin shows the percentage of revenue left after direct production costs."},
        {'q': "What does the current ratio measure?", 'options': ["Long-term profitability", "A company's ability to pay short-term obligations with short-term assets", "Total shareholder equity", "Employee productivity"], 'correct': 1, 'explanation': "Current ratio = current assets / current liabilities, a liquidity measure."},
        {'q': "In cost accounting, what is a \"direct cost\"?", 'options': ["A cost that cannot be traced to a specific product", "A cost directly traceable to producing a specific product or service", "An owner's personal expense", "A one-time donation"], 'correct': 1, 'explanation': "Direct costs, like raw materials, can be clearly attributed to a specific output."},
        {'q': "What is the general ledger?", 'options': ["A summary used only for tax filing", "The complete record of all financial transactions, organized by account", "A list of employee names", "A marketing report"], 'correct': 1, 'explanation': "The general ledger is the master record all financial statements are built from."},
        {'q': "Which financial statement would you check to see if a company was profitable last quarter?", 'options': ["Balance sheet", "Income statement", "Statement of retained earnings only", "Trial balance"], 'correct': 1, 'explanation': "The income statement covers revenue, expenses, and profit over a period of time."},
        {'q': "What is the difference between cash-basis and accrual-basis accounting?", 'options': ["There is no real difference", "Cash-basis records transactions only when cash changes hands; accrual records them when earned or incurred", "Accrual-basis is illegal for small businesses", "Cash-basis is required by all public companies"], 'correct': 1, 'explanation': "Timing is the key distinction between the two methods."},
        {'q': "What does \"accounts payable\" represent for a business?", 'options': ["Cash the business has collected", "Amounts the business owes to its suppliers or vendors", "Revenue earned this month", "Shareholder dividends"], 'correct': 1, 'explanation': "Payables are short-term obligations the business still needs to pay."},
        {'q': "Why might a profitable company still run out of cash?", 'options': ["Profit and cash flow are the same thing, so this can't happen", "Revenue can be recorded before cash is actually collected, e.g. from unpaid invoices", "Depreciation always equals cash spent", "Taxes are never owed on profit"], 'correct': 1, 'explanation': "Profit on paper doesn't guarantee cash in the bank when customers pay late."},
        {'q': "What is the purpose of budgeting in accounting?", 'options': ["To eliminate the need for financial statements", "To plan expected income and expenses in advance to guide spending decisions", "To calculate historical tax refunds only", "To replace the general ledger"], 'correct': 1, 'explanation': "A budget is a forward-looking financial plan used to guide decisions."},
        {'q': "What is a \"contra account\" used for, such as accumulated depreciation?", 'options': ["To record an entirely separate business", "To offset the balance of a related account on the financial statements", "To hide liabilities", "To pay employee bonuses"], 'correct': 1, 'explanation': "A contra account reduces the reported value of its paired account."},
        {'q': "In forensic accounting, what is the primary objective?", 'options': ["To design marketing budgets", "To investigate financial records for evidence of fraud or financial misconduct", "To file routine tax returns", "To manage payroll software"], 'correct': 1, 'explanation': "Forensic accountants dig into records to uncover irregularities for legal or investigative purposes."},
        {'q': "What is the matching principle in accounting?", 'options': ["Expenses should be recorded in the same period as the revenue they help generate", "Assets must always equal liabilities", "Every debit needs a matching customer", "Taxes must match last year's amount"], 'correct': 0, 'explanation': "Matching expenses to the revenue they helped produce gives a truer picture of profitability."},
        {'q': "Which of these best describes \"working capital\"?", 'options': ["Total company revenue", "Current assets minus current liabilities", "Long-term debt", "Total shareholder equity"], 'correct': 1, 'explanation': "Working capital measures short-term financial health and operating liquidity."},
        {'q': "Why do companies reconcile their bank statements regularly?", 'options': ["It's a marketing requirement", "To catch errors, fraud, or discrepancies between recorded transactions and actual bank activity", "To calculate depreciation", "To set employee salaries"], 'correct': 1, 'explanation': "Reconciliation confirms the books match what actually happened in the bank account."},
    ],
    'Digital Marketing': [
        {'q': "What does SEO stand for?", 'options': ["Social Engagement Optimization", "Search Engine Optimization", "Site Enhancement Operations", "Sales Efficiency Overview"], 'correct': 1, 'explanation': "SEO improves a site's visibility in organic (unpaid) search results."},
        {'q': "In a marketing funnel, what typically comes right after \"Awareness\"?", 'options': ["Purchase", "Consideration", "Loyalty", "Advocacy"], 'correct': 1, 'explanation': "Prospects move from awareness to considering their options before deciding to buy."},
        {'q': "What does PPC stand for?", 'options': ["Pay Per Click", "Post Per Campaign", "Product Placement Cost", "Paid Public Content"], 'correct': 0, 'explanation': "Advertisers pay each time someone clicks their ad."},
        {'q': "What is conversion rate?", 'options': ["The total number of website visitors", "The percentage of visitors who complete a desired action", "The cost of running an ad campaign", "The number of social media followers"], 'correct': 1, 'explanation': "Conversion rate measures how effectively traffic turns into desired outcomes."},
        {'q': "Why do marketers run A/B tests?", 'options': ["To guess which version will perform better without evidence", "To compare two versions with real traffic and see which performs better", "To increase website load time", "To reduce SEO rankings"], 'correct': 1, 'explanation': "A/B testing replaces guesswork with evidence from real user behavior."},
        {'q': "What is Customer Acquisition Cost (CAC)?", 'options': ["The total revenue from a customer over their lifetime", "The average cost of acquiring one new paying customer", "The price of a single product", "The company's total marketing budget"], 'correct': 1, 'explanation': "CAC divides total acquisition spend by the number of customers gained."},
        {'q': "Why does email segmentation typically improve campaign performance?", 'options': ["It sends the same message to everyone at once", "It targets relevant messages to specific audience groups based on behavior or interests", "It reduces the number of subscribers", "It removes the need for a subject line"], 'correct': 1, 'explanation': "Relevant, targeted messages get higher engagement than generic blasts."},
        {'q': "What is \"social proof\" in marketing?", 'options': ["A legal requirement for advertising", "Using reviews, testimonials, or user counts to reduce a buyer's perceived risk", "A type of paid ad format", "A government marketing regulation"], 'correct': 1, 'explanation': "Seeing others trust a product makes new buyers more comfortable trusting it too."},
        {'q': "What does \"brand positioning\" describe?", 'options': ["A company's stock price", "How a brand is perceived relative to competitors in the customer's mind", "The physical location of a store", "The size of the marketing team"], 'correct': 1, 'explanation': "Positioning is about the mental space a brand occupies compared to alternatives."},
        {'q': "What is the purpose of marketing attribution?", 'options': ["To determine which touchpoint(s) get credit for driving a conversion", "To calculate employee bonuses", "To design a logo", "To file taxes"], 'correct': 0, 'explanation': "Attribution models help marketers understand which channels actually drive results."},
        {'q': "In influencer marketing, why do brands partner with creators?", 'options': ["To reduce their own marketing budget to zero", "To borrow the creator's audience trust to introduce a product or brand", "To avoid paid advertising entirely", "To replace customer service"], 'correct': 1, 'explanation': "An influencer's existing trust with their audience transfers some credibility to the brand."},
        {'q': "How does affiliate marketing typically compensate partners?", 'options': ["A fixed salary regardless of performance", "A commission based on sales or leads they generate", "Free products only", "Nothing — it's volunteer work"], 'correct': 1, 'explanation': "Affiliates are paid for results, aligning their incentives with the business's."},
        {'q': "Why has short-form video (e.g., TikTok, Reels) become popular in digital marketing?", 'options': ["It requires the largest production budgets", "It's fast, native-feeling content that performs well for reach and engagement", "It only works for B2B companies", "It cannot be measured"], 'correct': 1, 'explanation': "Short, native-feeling video fits how people actually consume content on these platforms."},
        {'q': "What does LTV (Lifetime Value) estimate?", 'options': ["The one-time cost of an ad", "The total revenue a business can expect from a single customer over their relationship", "The number of employees at a company", "The size of a marketing team"], 'correct': 1, 'explanation': "LTV helps decide how much is reasonable to spend acquiring a customer."},
        {'q': "Why is customer retention often emphasized alongside acquisition?", 'options': ["Retaining an existing customer is usually cheaper than acquiring a new one and boosts lifetime value", "New customers are always more profitable", "Retention has no effect on revenue", "Acquisition costs nothing"], 'correct': 0, 'explanation': "Keeping customers happy is typically far more cost-effective than constant new acquisition."},
        {'q': "What is the main goal of content marketing?", 'options': ["To directly sell in every single piece of content", "To build trust and attract an audience by publishing genuinely useful content", "To spend the entire budget on paid ads", "To avoid SEO entirely"], 'correct': 1, 'explanation': "Content marketing earns attention and trust before ever asking for a sale."},
        {'q': "What is a key metric to track in email marketing to gauge subject line effectiveness?", 'options': ["Open rate", "Server uptime", "Page load speed", "Number of employees"], 'correct': 0, 'explanation': "Open rate directly reflects how compelling the subject line was."},
        {'q': "What does \"organic\" traffic mean in the context of SEO?", 'options': ["Traffic from paid advertisements", "Unpaid traffic that arrives through search engine results", "Traffic from email campaigns only", "Traffic from social media ads"], 'correct': 1, 'explanation': "Organic traffic comes from unpaid search rankings, not paid placements."},
        {'q': "In conversion rate optimization (CRO), what is typically the first step?", 'options': ["Redesign the entire website without any data", "Analyze user behavior and identify where visitors drop off", "Increase the ad budget", "Remove all forms from the site"], 'correct': 1, 'explanation': "Understanding where users abandon the funnel points to what's worth fixing first."},
        {'q': "What is a common reason marketers use UTM parameters in a URL?", 'options': ["To speed up page load times", "To track which specific campaign, source, or medium drove traffic to a page", "To improve SEO rankings directly", "To encrypt the URL"], 'correct': 1, 'explanation': "UTM tags let analytics tools attribute traffic to the exact campaign that sent it."},
        {'q': "Why is defining a target audience important before running ad campaigns?", 'options': ["It's a legal requirement everywhere", "It ensures ad spend reaches the people most likely to convert", "It guarantees a campaign will go viral", "It removes the need for creative content"], 'correct': 1, 'explanation': "Well-targeted spend reaches people far more likely to actually respond."},
        {'q': "What best describes a \"lead magnet\"?", 'options': ["A paid advertisement format", "A free resource offered in exchange for a visitor's contact information", "A type of social media platform", "A customer complaint process"], 'correct': 1, 'explanation': "Lead magnets trade something valuable for permission to keep marketing to a prospect."},
        {'q': "Which metric best indicates how engaging a piece of social content is?", 'options': ["Number of employees at the company", "Engagement rate (likes, comments, shares relative to reach)", "The company's stock price", "Website hosting cost"], 'correct': 1, 'explanation': "Engagement rate normalizes interaction against how many people actually saw the post."},
        {'q': "What does \"retargeting\" (or remarketing) allow advertisers to do?", 'options': ["Show ads to people who previously visited a site or interacted with a brand", "Target only brand-new audiences who have never heard of the brand", "Automatically write ad copy", "Block competitors' ads"], 'correct': 0, 'explanation': "Retargeting keeps a brand in front of people who already showed interest."},
    ],
    'Languages': [
        {'q': "What is \"spaced repetition\" in language learning?", 'options': ["Studying the same material for hours without breaks", "Reviewing material at increasing intervals over time to strengthen long-term memory", "Learning only new words and never reviewing old ones", "Studying only right before a test"], 'correct': 1, 'explanation': "Spacing reviews out fights the natural forgetting curve more efficiently than cramming."},
        {'q': "What does \"comprehensible input\" refer to?", 'options': ["Material far too advanced for the learner", "Language input that is understandable but slightly above the learner's current level", "Grammar exercises only", "Native-speed audio with no context"], 'correct': 1, 'explanation': "Input just above your level stretches you without overwhelming you."},
        {'q': "Why is \"active recall\" more effective than simply rereading notes?", 'options': ["It takes less time", "Retrieving information from memory strengthens the memory more than passive review", "It requires no effort", "It only works for grammar"], 'correct': 1, 'explanation': "The effort of retrieval itself is what strengthens the memory trace."},
        {'q': "What is language \"immersion\"?", 'options': ["Studying grammar rules exclusively", "Surrounding yourself with the target language regularly to build intuition faster", "Taking a single class per year", "Avoiding all native speakers"], 'correct': 1, 'explanation': "Regular exposure builds natural intuition that pure rule-study can't provide alone."},
        {'q': "On the CEFR scale, which level represents a beginner?", 'options': ["C2", "B1", "A1", "C1"], 'correct': 2, 'explanation': "A1 is the entry level; the scale rises through A2, B1, B2, C1, to C2."},
        {'q': "What is a \"cognate\"?", 'options': ["A grammar rule with no exceptions", "A word that looks and sounds similar across related languages", "A type of verb conjugation", "A regional dialect"], 'correct': 1, 'explanation': "Cognates share a common origin and can shortcut early vocabulary building."},
        {'q': "What is \"shadowing\" as a language-learning technique?", 'options': ["Reading silently without speaking", "Repeating audio in real time to match rhythm and intonation", "Writing translations by hand", "Avoiding listening practice"], 'correct': 1, 'explanation': "Shadowing trains pronunciation and listening simultaneously by mimicking native speech live."},
        {'q': "Why is consistent daily practice generally more effective than occasional long sessions?", 'options': ["It isn't — long sessions are always better", "Regular, shorter exposure supports better memory retention over time", "It requires more total study time", "It only matters for grammar"], 'correct': 1, 'explanation': "Frequent, spaced practice beats infrequent cramming for long-term retention."},
        {'q': "What is the main benefit of learning vocabulary within example sentences rather than isolated lists?", 'options': ["It takes longer with no benefit", "Context helps the meaning and usage stick better in memory", "It removes the need for grammar", "It only works for advanced learners"], 'correct': 1, 'explanation': "Seeing a word in use shows both meaning and how it's actually applied."},
        {'q': "Why is early pronunciation practice recommended?", 'options': ["It has no long-term effect", "It helps prevent habits that become harder to correct later", "Pronunciation doesn't matter for understanding", "It should be skipped until fluency is reached"], 'correct': 1, 'explanation': "Fossilized pronunciation errors are much harder to fix once they're habitual."},
        {'q': "What is the value of timely error correction while learning a language?", 'options': ["It discourages learners so should be avoided", "It prevents small mistakes from turning into permanent habits", "It only applies to written language", "It replaces the need for practice"], 'correct': 1, 'explanation': "Catching a mistake early is far easier than unlearning it years later."},
        {'q': "Why might setting a real, personal goal (like an upcoming trip) improve language learning outcomes?", 'options': ["Goals have no effect on motivation", "A concrete purpose tends to sustain motivation better than studying in the abstract", "It removes the need for practice", "It only helps with vocabulary, not speaking"], 'correct': 1, 'explanation': "A tangible reason to learn keeps motivation higher than an abstract long-term goal."},
        {'q': "What does regular listening practice with native speech primarily train?", 'options': ["Handwriting speed", "Your ear's ability to parse fast, natural speech", "Typing accuracy", "Reading comprehension only"], 'correct': 1, 'explanation': "Listening practice builds the ability to follow real conversational pace and reductions."},
        {'q': "Why is speaking early and making mistakes considered valuable?", 'options': ["Mistakes should always be avoided until fluent", "Producing the language, even imperfectly, builds real communicative ability faster than waiting for perfection", "It has no effect on progress", "Silence is always the safer strategy"], 'correct': 1, 'explanation': "Active production reveals gaps and builds fluency that passive study alone can't."},
        {'q': "What role does cultural context play in language learning?", 'options': ["None — grammar and vocabulary are all that matter", "Understanding norms like greetings and politeness helps prevent miscommunication", "It only matters for professional translators", "It should be studied only after reaching fluency"], 'correct': 1, 'explanation': "Language and culture are deeply intertwined — norms shape how words should be used."},
        {'q': "What is a practical benefit of learning common grammar patterns rather than isolated rules?", 'options': ["Patterns are less useful than memorizing every rule", "Drilling a pattern across different sentences builds usable fluency faster", "Patterns only apply to writing", "Patterns should be avoided until advanced level"], 'correct': 1, 'explanation': "Repeated patterns become automatic faster than abstract grammar rules alone."},
        {'q': "What best describes the purpose of the CEFR framework (A1–C2)?", 'options': ["It grades pronunciation only", "It describes proficiency levels to help learners and teachers set and track goals", "It replaces the need for a teacher", "It applies only to written exams"], 'correct': 1, 'explanation': "CEFR gives a shared, internationally recognized scale of language proficiency."},
        {'q': "Why do many learners plateau without deliberate practice?", 'options': ["Plateaus are permanent and unavoidable", "Passive exposure alone isn't enough — targeted practice on weak areas is needed to keep improving", "Plateaus mean the learner should stop studying", "Plateaus only happen to beginners"], 'correct': 1, 'explanation': "Deliberate focus on weak spots is what pushes past a plateau that pure exposure can't."},
        {'q': "What is one benefit of using flashcard apps with spaced repetition for vocabulary?", 'options': ["They guarantee overnight fluency", "They automatically schedule reviews right before you're likely to forget a word", "They eliminate the need to ever speak the language", "They only work for grammar"], 'correct': 1, 'explanation': "Spaced repetition software times reviews to maximize retention with minimal effort."},
        {'q': "Why is it useful to learn a handful of high-frequency words early on?", 'options': ["High-frequency words appear often in real conversation, giving quick practical payoff", "Frequency has no relationship to usefulness", "Rare words are always more valuable early on", "Vocabulary size doesn't affect comprehension"], 'correct': 0, 'explanation': "A small set of the most common words covers a large share of everyday conversation."},
        {'q': "What is a benefit of practicing with a conversation partner or tutor?", 'options': ["It removes the need for any structured study", "Real-time feedback and natural back-and-forth build speaking confidence faster than solo study alone", "It only helps with listening, not speaking", "It slows down progress"], 'correct': 1, 'explanation': "Live conversation forces real-time production and gives immediate correction."},
        {'q': "Why might translating word-for-word between languages sometimes lead to errors?", 'options': ["Translation is always accurate word-for-word", "Languages often differ in idiom, word order, and structure, so direct translation can miss meaning", "It never causes issues", "Only beginners make this mistake"], 'correct': 1, 'explanation': "Idiomatic and structural differences mean literal translation often distorts meaning."},
        {'q': "What is the purpose of \"output practice\" (speaking or writing) versus only \"input\" (reading or listening)?", 'options': ["Output practice has no real benefit", "Producing the language actively reinforces recall and reveals gaps that passive input alone won't show", "Input alone is always sufficient for fluency", "Output should be avoided until C1 level"], 'correct': 1, 'explanation': "Actively producing language surfaces exactly what you don't yet know well enough."},
        {'q': "What is a realistic expectation for daily study time to make steady progress in a new language?", 'options': ["Multiple hours are required daily or progress is impossible", "Even 15–30 focused minutes a day, done consistently, can produce steady progress over time", "Studying once a month is just as effective", "Progress only depends on natural talent"], 'correct': 1, 'explanation': "Consistency compounds — short daily sessions reliably outperform sporadic long ones."},
    ],
    'Professional Development': [
        {'q': "What is \"active listening\"?", 'options': ["Planning your response while the other person is still talking", "Fully focusing on the speaker's message without interrupting or planning a rebuttal", "Only listening to your manager", "Multitasking while someone speaks"], 'correct': 1, 'explanation': "Active listening means giving full attention to understand, not just to reply."},
        {'q': "What does emotional intelligence primarily involve?", 'options': ["Being the smartest person in the room", "Recognizing and managing your own emotions and understanding others' emotions", "Avoiding all emotional conversations", "Suppressing emotions at work entirely"], 'correct': 1, 'explanation': "EQ combines self-awareness, self-management, and reading others accurately."},
        {'q': "In the Eisenhower Matrix, which quadrant is most often neglected but most valuable long-term?", 'options': ["Urgent and important", "Not urgent and important", "Urgent and not important", "Not urgent and not important"], 'correct': 1, 'explanation': "Important-but-not-urgent work (planning, relationships) gets crowded out by constant urgency."},
        {'q': "What is the main benefit of effective delegation?", 'options': ["It removes all accountability from the manager", "It frees the delegator's time while developing the team member's skills", "It should only be used for unpleasant tasks", "It always takes longer than doing it yourself"], 'correct': 1, 'explanation': "Good delegation is a growth tool for the team, not just a way to offload work."},
        {'q': "What makes feedback \"constructive\" rather than just critical?", 'options': ["It focuses on personality traits", "It focuses on specific, observable behavior and includes a path forward", "It is given publicly in front of others", "It avoids being specific"], 'correct': 1, 'explanation': "Specific, behavior-focused feedback with a next step is actionable, not just discouraging."},
        {'q': "What is generally the best time to address a workplace conflict?", 'options': ["As soon as reasonably possible", "After it has escalated for months", "Never — avoid it entirely", "Only during annual reviews"], 'correct': 0, 'explanation': "Early conversations are usually easier and less costly than delayed ones."},
        {'q': "What is a \"BATNA\" in negotiation?", 'options': ["A type of contract clause", "Your Best Alternative To a Negotiated Agreement — your walk-away option", "A negotiation tactic to intimidate", "A legal requirement for contracts"], 'correct': 1, 'explanation': "Knowing your BATNA tells you when to accept a deal and when to walk away."},
        {'q': "What does a \"growth mindset\" describe?", 'options': ["Believing abilities are fixed at birth", "Believing abilities can be developed through effort and learning", "Avoiding challenges to protect your reputation", "Focusing only on natural talent"], 'correct': 1, 'explanation': "A growth mindset treats effort and learning as the path to improved ability."},
        {'q': "What is the difference between coaching and mentoring?", 'options': ["They are identical with no difference", "Coaching draws answers out of someone through questions; mentoring shares the mentor's own experience", "Coaching only happens once; mentoring is ongoing", "Mentoring is only for executives"], 'correct': 1, 'explanation': "Coaching is question-led and client-centered; mentoring shares the mentor's own path."},
        {'q': "What is a key element of an effective meeting?", 'options': ["No agenda, so discussion can go anywhere", "A clear agenda, a defined owner for each topic, and follow-up actions", "Inviting as many people as possible regardless of relevance", "Scheduling it without an end time"], 'correct': 1, 'explanation': "Structure and clear ownership are what turn a meeting into decisions, not just talk."},
        {'q': "What does critical thinking primarily involve?", 'options': ["Accepting the first plausible explanation", "Questioning assumptions and evaluating evidence before drawing a conclusion", "Avoiding all uncertainty", "Relying only on intuition"], 'correct': 1, 'explanation': "Critical thinking is a deliberate, evidence-based approach to reasoning."},
        {'q': "Why is networking described as most effective when it's \"genuine\" rather than \"transactional\"?", 'options': ["Because relationships built on mutual value tend to be more durable and useful over time", "Because transactional networking is illegal", "Because genuine networking requires no effort", "Because it guarantees a job offer"], 'correct': 0, 'explanation': "Relationships built on real mutual interest tend to last and pay off over time."},
        {'q': "What is \"personal branding\" in a professional context?", 'options': ["Designing a company logo", "Consistently demonstrating your expertise and values so others form a clear impression of you", "A one-time resume update", "Something only relevant to executives"], 'correct': 1, 'explanation': "Personal branding is the consistent professional impression you build over time."},
        {'q': "What best supports resilience after a professional setback?", 'options': ["Ignoring the setback completely", "Perspective, support from others, and healthy habits, not just willpower alone", "Working longer hours with no breaks", "Avoiding any reflection on what happened"], 'correct': 1, 'explanation': "Resilience is built from a mix of mindset, support systems, and self-care, not sheer grit."},
        {'q': "In public speaking, what is a commonly recommended structure?", 'options': ["A long introduction with no clear point", "A clear opening, a few key points, and a strong close", "Reading a script word-for-word without pauses", "Avoiding eye contact to reduce nerves"], 'correct': 1, 'explanation': "A simple, clear structure helps an audience follow and remember the message."},
        {'q': "What is a common cause of poor time management?", 'options': ["Prioritizing important-but-not-urgent work too early", "Constantly reacting to urgent tasks while important work gets pushed aside", "Using a calendar to plan the week", "Setting clear daily priorities"], 'correct': 1, 'explanation': "Chronic firefighting crowds out the important work that prevents future fires."},
        {'q': "Why is it important to identify your own triggers in emotional intelligence work?", 'options': ["Triggers are irrelevant to workplace performance", "Recognizing what provokes a strong reaction helps you respond deliberately instead of reactively", "Triggers should be suppressed and never examined", "Only managers need to understand their triggers"], 'correct': 1, 'explanation': "Awareness of triggers is the first step to responding thoughtfully instead of reacting."},
        {'q': "What is a practical benefit of preparing your BATNA before a negotiation?", 'options': ["It weakens your position", "It gives you real leverage and confidence because you know your walk-away point", "It guarantees you'll get everything you ask for", "It's only useful in salary negotiations"], 'correct': 1, 'explanation': "Knowing your alternative removes desperation from the negotiating table."},
        {'q': "Why might a manager choose to coach an employee rather than simply give them the answer?", 'options': ["Coaching takes less time than giving an answer", "Coaching builds the employee's own problem-solving ability over time", "Coaching is only appropriate for senior staff", "Giving direct answers is always faster and better"], 'correct': 1, 'explanation': "Coaching trades a short-term shortcut for long-term capability building."},
        {'q': "What is a common sign that a conflict is being avoided rather than resolved?", 'options': ["Both parties openly discuss the disagreement", "The same tension resurfaces repeatedly without ever being addressed directly", "A clear resolution was reached and documented", "Both sides feel heard"], 'correct': 1, 'explanation': "Recurring, unresolved tension is a classic sign of avoidance rather than resolution."},
        {'q': "Why do well-run meetings typically end with documented action items?", 'options': ["To make the meeting last longer", "To ensure decisions turn into accountable next steps rather than just talk", "Action items are optional and rarely useful", "To replace the need for a meeting agenda"], 'correct': 1, 'explanation': "Clear owners and next steps are what make a meeting's outcomes actually happen."},
        {'q': "What is one benefit of practicing a presentation out loud before delivering it?", 'options': ["It has no real benefit", "It surfaces awkward phrasing and timing issues you wouldn't catch by reading silently", "It makes the content less clear", "It should be skipped to sound more natural"], 'correct': 1, 'explanation': "Speaking it aloud reveals pacing and wording issues invisible on the page."},
        {'q': "What does \"prioritization\" fundamentally require?", 'options': ["Treating every task as equally urgent", "Deciding what matters most given limited time and resources", "Avoiding any planning", "Completing tasks in the order they arrive only"], 'correct': 1, 'explanation': "Prioritization is the deliberate act of choosing what deserves attention first."},
        {'q': "Why is self-awareness considered a foundation of emotional intelligence?", 'options': ["It has no connection to how you interact with others", "Understanding your own emotional patterns is a prerequisite for managing them and reading others accurately", "Self-awareness is only useful for therapists", "It replaces the need for empathy"], 'correct': 1, 'explanation': "You can't manage what you don't first notice in yourself."},
    ],
}

# One applied-project brief per category, used to seed a real course assignment.
ASSIGNMENTS = {
    'Software Development': {
        'title': 'Applied Project: Build a Small Working Feature',
        'description': "Apply the concepts from this course by building a small, working piece of software end to end.",
        'instructions': (
            "Objective: Design and build a small feature or tool that uses at least three concepts covered in this "
            "course (e.g. version control, testing, clean structure, API design).\n\n"
            "Deliverables:\n"
            "- A short README explaining what you built and why you made your key design decisions.\n"
            "- The working source code, committed to version control with a clear commit history.\n"
            "- At least one automated test demonstrating the feature works as intended.\n\n"
            "Submission: Submit a link to your repository (or a zip of your code) along with your README."
        ),
    },
    'Information Technology': {
        'title': 'Applied Project: Infrastructure Runbook',
        'description': "Document a real (or simulated) IT environment and the procedures needed to keep it running reliably.",
        'instructions': (
            "Objective: Produce a runbook for a small IT environment of your choice (a home lab, a test network, "
            "or a scenario provided in class).\n\n"
            "Deliverables:\n"
            "- A diagram or description of the environment's key components (network, servers, access control).\n"
            "- A backup and disaster-recovery plan, including the 3-2-1 rule.\n"
            "- A troubleshooting checklist for the two or three most likely failure scenarios.\n\n"
            "Submission: Submit your runbook as a document, plus any diagrams you created."
        ),
    },
    'Data Science': {
        'title': 'Applied Project: End-to-End Data Analysis',
        'description': "Take a dataset from raw data to a clear, evidence-based conclusion.",
        'instructions': (
            "Objective: Choose a dataset (your own or a public one) and carry out a full mini analysis.\n\n"
            "Deliverables:\n"
            "- A short write-up of your data cleaning steps and any assumptions you made.\n"
            "- At least two visualizations that reveal a meaningful pattern in the data.\n"
            "- A clear, evidence-based conclusion or recommendation, including any limitations of your analysis.\n\n"
            "Submission: Submit your notebook or script along with your write-up."
        ),
    },
    'Business': {
        'title': 'Applied Project: Business Plan or Improvement Proposal',
        'description': "Apply this course's frameworks to a real business idea or an improvement to an existing operation.",
        'instructions': (
            "Objective: Pick a real or hypothetical business and apply at least two frameworks from this course "
            "(e.g. SWOT, SMART goals, a risk register, or the business model canvas).\n\n"
            "Deliverables:\n"
            "- A one-page summary of the business or improvement idea and its value proposition.\n"
            "- Your completed framework(s), with a short explanation of what they revealed.\n"
            "- Three concrete next steps you would recommend, with a rough timeline.\n\n"
            "Submission: Submit your write-up as a document."
        ),
    },
    'Accounting': {
        'title': 'Applied Project: Financial Statement Walkthrough',
        'description': "Prepare and interpret a simple set of financial statements for a small business scenario.",
        'instructions': (
            "Objective: Using the sample transactions provided in class (or a small business of your choosing), "
            "prepare a basic set of financial statements.\n\n"
            "Deliverables:\n"
            "- A simple general ledger and trial balance for the period.\n"
            "- A balance sheet and income statement built from that trial balance.\n"
            "- A short written analysis covering at least two financial ratios and what they suggest about the business.\n\n"
            "Submission: Submit your worksheets and written analysis."
        ),
    },
    'Digital Marketing': {
        'title': 'Applied Project: Campaign Plan',
        'description': "Design a realistic marketing campaign for a product or service, grounded in this course's concepts.",
        'instructions': (
            "Objective: Choose a product or service (real or hypothetical) and plan a small marketing campaign for it.\n\n"
            "Deliverables:\n"
            "- A clear target audience and value proposition for the campaign.\n"
            "- A plan covering at least two channels (e.g. SEO, email, paid social, content).\n"
            "- The key metrics you would track to know if the campaign worked, and why.\n\n"
            "Submission: Submit your campaign plan as a document or slide deck."
        ),
    },
    'Languages': {
        'title': 'Applied Project: Personal Learning Plan',
        'description': "Build a structured, realistic plan for continuing to build fluency after this course.",
        'instructions': (
            "Objective: Design a 4-week personal study plan that applies the learning strategies covered in this course.\n\n"
            "Deliverables:\n"
            "- A weekly schedule that includes listening, speaking, and vocabulary review using spaced repetition.\n"
            "- A short recording (audio or video) of yourself speaking for at least one minute in the target language.\n"
            "- A written reflection on which strategies from this course you found most useful and why.\n\n"
            "Submission: Submit your written plan along with your recording."
        ),
    },
    'Professional Development': {
        'title': 'Applied Project: Personal Development Action Plan',
        'description': "Turn this course's concepts into a concrete plan you could actually use at work.",
        'instructions': (
            "Objective: Identify one real professional situation (a recurring conflict, a time-management challenge, "
            "an upcoming presentation, etc.) and apply at least two concepts from this course to address it.\n\n"
            "Deliverables:\n"
            "- A short description of the situation and why it matters to you professionally.\n"
            "- The specific approach or framework you applied, and how you applied it.\n"
            "- A reflection on the outcome (or expected outcome) and what you'd do differently next time.\n\n"
            "Submission: Submit your written plan and reflection."
        ),
    },
}

# A small set of seeded course titles map to a real, specific language name so
# lesson content can reference "German" or "Swahili" instead of staying generic.
LANGUAGE_BY_COURSE_TITLE = {
    'Swahili for Beginners': 'Swahili',
    'Dutch Language Essentials': 'Dutch',
    'Advanced French Grammar': 'French',
    'Arabic for Travel & Business': 'Arabic',
    'Korean Language Foundations': 'Korean',
    'Japanese for Absolute Beginners': 'Japanese',
    'Italian Conversation Basics': 'Italian',
    'Portuguese for Beginners': 'Portuguese',
    'German Language Foundations': 'German',
    'Mandarin Chinese Essentials': 'Mandarin Chinese',
    'Spanish for Beginners': 'Spanish',
    'Business English Communication': 'English',
    'Conversational French for Travel & Work': 'French',
}

# Real, freely-embeddable YouTube videos from well-known free-education
# channels (freeCodeCamp.org, Intellipaat) — each ID was resolved from a real
# freeCodeCamp.org/news article or YouTube watch page (not guessed), so
# lesson video players actually show relevant, working content instead of one
# reused placeholder link. See add_real_media management command.
VIDEOS_BY_CATEGORY = {
    'Software Development': ['rfscVS0vtbw', 'PkZNo7MFNFg', 'mU6anWqZJcc'],
    'Information Technology': ['fQbBPa0ADvs', 'ug8W0sFiVJo'],
    'Data Science': ['-fW2X7fh7Yg', 'pqNCD_5r0IU'],
    'Business': ['UEngvxZ11sw', 'EJHPltmAULA'],
    'Accounting': ['Vl0H-qTclOg', 'EJHPltmAULA'],
    'Digital Marketing': ['vFfV2E6jo6A'],
    'Languages': ['bp9OZoQu3A0'],
    'Professional Development': ['C_jQahOnGUU', 'vT5pcc30Ffw'],
}

# Real reference resources per category — official docs, standards bodies,
# and well-known free learning hubs — used as the content_url for "pdf"-type
# lessons so they link somewhere genuinely useful instead of nowhere.
RESOURCES_BY_CATEGORY = {
    'Software Development': 'https://developer.mozilla.org/en-US/docs/Web',
    'Information Technology': 'https://www.nist.gov/cyberframework',
    'Data Science': 'https://www.kaggle.com/learn',
    'Business': 'https://www.sba.gov/business-guide',
    'Accounting': 'https://www.accountingcoach.com/',
    'Digital Marketing': 'https://academy.hubspot.com/',
    'Languages': 'https://www.bbc.co.uk/languages',
    'Professional Development': 'https://www.mindtools.com/',
}
