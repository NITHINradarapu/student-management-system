# AI-Powered API Testing Agent

An intelligent, locally-running API testing agent built with **Node.js**, **Ollama**, and **Qwen3 4B** (`qwen3:4b`) to interact with, test, and deterministically validate the **Spring Boot Student Management REST API**.

---

## 1. Architectural Philosophy & Design Principles

```
  User (Natural Language)
             │
             ▼
      Node.js CLI Agent
             │
             ▼
     Ollama + Qwen3 4B   ◄── Context Engineering & JSON Tool Schemas
             │
      Tool Selection & Arguments
             │
             ▼
   [JavaScript Runtime Gate]
   - Argument & Type Validation
   - Safety Confirmation Prompts (for soft/hard deletes)
   - Tool Allowlisting
             │
             ▼
   Spring Boot REST API (Port 8080)
             │
             ▼
        MySQL Database
             │
             ▼
   Real HTTP Response (200 / 201 / 204 / 400 / 404 / 409)
             │
             ▼
[Deterministic Validation Engine]  ◄── JavaScript Asserts (PASS / FAIL)
             │                          (Model NEVER invents test outcomes)
             ▼
Result Object Fed Back to Qwen3 ({ role: "tool", content: ... })
             │
             ▼
Natural Language Explanation & Verification Report
```

### Core Engineering Principles:
1. **Deterministic Assertions (No LLM Hallucinations):** The language model decides *what* to test and *which tool* to call, but JavaScript independently executes the network requests and deterministically evaluates status codes, timestamps, and payload fields. The model is never permitted to invent PASS/FAIL results.
2. **Defense-in-Depth Safety Gates:** Destructive operations (`soft_delete_student` and `hard_delete_student`) cannot be triggered by vague instructions or rogue model generations. Runtime interception prompts require explicit user confirmation (`'yes'` / `'CONFIRM'`) before sending destructive HTTP calls.
3. **Smart Input Merging:** In update operations, if a user specifies partial attributes (e.g. *"Change student 5's course to Data Science"*), the tool automatically retrieves the active record to merge existing `name` and `email`, avoiding Jakarta `@NotBlank` validation rejections while preserving data consistency.
4. **Resilient Network Handling:** Distinguishes backend unavailability (`ECONNREFUSED` / connection refused) from application errors, surfacing clear operational feedback.

---

## 2. Directory Structure

```text
ai-api-testing-agent/
├── tools/
│   └── studentApiTools.js       # Typed fetch client for Spring Boot REST endpoints
├── validators/
│   └── studentValidators.js    # Independent deterministic assertion engine
├── agent.js                    # Interactive AI tool-calling agent (Qwen3 + Ollama)
├── testNegative.js             # Standalone 11-scenario negative API test suite runner
├── index.js                    # Baseline independent student creation test
├── package.json                # Dependencies, scripts, and ES Module config
└── .gitignore                  # Shields node_modules/ and .env
```

---

## 3. Registered API Tools & Schema

| Tool Name | HTTP Target | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `create_student` | `POST /students` | Creates a new student; also tests invalid input payloads. | `name` (str), `email` (str), `course` (str) |
| `get_all_students` | `GET /students` | Retrieves all active student records. | `{}` |
| `get_student_by_id` | `GET /students/{id}` | Retrieves a single active student by ID. | `id` (int) |
| `update_student` | `PUT /students/{id}` | Updates name, email, or course for an ID. | `id` (int), `name`, `email`, `course` |
| `soft_delete_student` | `PATCH /students/{id}/soft-delete` | Archives student record (non-destructive). | `id` (int) [Guarded by confirmation] |
| `hard_delete_student` | `DELETE /students/{id}` | Permanently removes student from database. | `id` (int) [Guarded by critical warning] |
| `run_negative_tests` | Full Suite | Runs all 11 deterministic negative test scenarios. | `{}` |

---

## 4. Setup and Execution

### Prerequisites
1. **Ollama running locally** with `qwen3:4b`:
   ```bash
   ollama run qwen3:4b
   ```
2. **Spring Boot Backend running** on `http://localhost:8080`:
   ```bash
   $env:DB_PASSWORD="your_mysql_password"
   .\mvnw.cmd spring-boot:run
   ```

### Running the Scripts

1. **Interactive AI Agent:**
   ```bash
   npm run agent
   ```
2. **Deterministic Negative API Test Suite:**
   ```bash
   npm run test:negative
   ```
3. **Independent Baseline Test:**
   ```bash
   npm start
   ```

---

## 5. Negative Test Suite Matrix (11 Scenarios)

The test suite validates Spring Boot's constraint enforcement, exception handling (`@RestControllerAdvice`), and soft-delete invariants:

| # | Scenario | Test Input / Condition | Expected Status | Verified Status | Verdict |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | Missing Name | `{ name: "", email: "...", course: "CS" }` | `400 Bad Request` | `400` | **PASS** |
| 2 | Missing Email | `{ name: "Alice", email: "", course: "CS" }` | `400 Bad Request` | `400` | **PASS** |
| 3 | Missing Course | `{ name: "Alice", email: "...", course: "" }` | `400 Bad Request` | `400` | **PASS** |
| 4 | Invalid Email Format | `{ name: "Alice", email: "not-an-email", course: "CS" }` | `400 Bad Request` | `400` | **PASS** |
| 5 | Duplicate Email | Attempt to register existing email | `409 Conflict` | `409` | **PASS** |
| 6 | Nonexistent ID | `GET /students/999999` | `404 Not Found` | `404` | **PASS** |
| 7 | Update Nonexistent ID | `PUT /students/999999` | `404 Not Found` | `404` | **PASS** |
| 8 | Email Collision Update | Update Student A with Student B's email | `409 Conflict` | `409` | **PASS** |
| 9 | Soft-Delete Nonexistent ID | `PATCH /students/999999/soft-delete` | `404 Not Found` | `404` | **PASS** |
| 10 | Retrieve Soft-Deleted ID | `GET /students/{id}` after soft delete | `404 Not Found` | `404` | **PASS** |
| 11 | Repeat Soft-Delete | Re-archiving an already archived record | `404 Not Found` | `404` | **PASS** |

---

## 6. Demonstration Scenarios (Interview Walkthrough)

### Scenario A: Positive Natural-Language Lifecycle
1. `"Create a student named Priya Patel, email priya@example.com, course AI & Robotics"`
   - *Result:* Triggers `create_student`, returns `201 Created`, validates ID & timestamps, reports PASS.
2. `"Find student with ID 2"`
   - *Result:* Triggers `get_student_by_id(2)`, displays confirmed database details.
3. `"Update student 2's course to Advanced Java"`
   - *Result:* Merges existing name/email, issues `PUT /students/2`, reports `200 OK`.

### Scenario B: Safety Interception Gate
1. `"Delete student 2"`
   - *Result:* Vague command detected. Qwen3 refuses tool execution and asks for clarification between archive and permanent purge.
2. `"Permanently delete student 2"`
   - *Result:* Interception gate triggers: `⚠️ CRITICAL SAFETY WARNING`. Requires user to type `'CONFIRM'` or `'yes'`. If cancelled, record remains untouched in MySQL.

### Scenario C: Negative Testing
1. `"Run the negative test suite"`
   - *Result:* Executes all 11 failure scenarios via `run_negative_tests`, outputs detailed breakdown, and reports 11/11 ALL PASS.
2. `"What is an AI agent?"`
   - *Result:* Conversational prompt without tool calls; answered directly without touching the backend.

