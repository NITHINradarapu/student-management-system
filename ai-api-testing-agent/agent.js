import ollama from "ollama";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import * as apiTools from "./tools/studentApiTools.js";
import {
  validateStudentCreation,
  validateStudentRetrieval,
  validateStudentUpdate,
  validateDeletion,
  runAllNegativeTests,
} from "./validators/studentValidators.js";

const MODEL = "qwen3:4b";

// Only functions listed here can be executed by the agent.
const availableTools = {
  create_student: async (args) => {
    const student = {
      name: typeof args.name === "string" ? args.name.trim() : "",
      email: typeof args.email === "string" ? args.email.trim() : "",
      course: typeof args.course === "string" ? args.course.trim() : "",
    };

    const result = await apiTools.createStudent(student);

    if (result.status === 201) {
      const validation = validateStudentCreation(result, student);
      return { apiResult: result, validation };
    }

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    // Deterministic validation for negative/rejected creation attempts
    const isExpectedRejection = result.status === 400 || result.status === 409;
    return {
      apiResult: result,
      validation: {
        passed: isExpectedRejection,
        verdict: isExpectedRejection ? "PASS" : "FAIL",
        expectedErrorHandled: isExpectedRejection,
        note: isExpectedRejection
          ? `Backend correctly rejected invalid/conflicting input with HTTP ${result.status}`
          : `Unexpected HTTP status ${result.status}`,
      },
    };
  },

  get_all_students: async () => {
    const result = await apiTools.getAllStudents();

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    return {
      apiResult: result,
      validation: {
        passed: result.status === 200,
        verdict: result.status === 200 ? "PASS" : "FAIL",
        recordCount: Array.isArray(result.data) ? result.data.length : 0,
      },
    };
  },

  get_student_by_id: async (args) => {
    const id = Number(args.id);
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: `Invalid argument: '${args.id}'. A positive integer 'id' is required.`,
      };
    }

    const result = await apiTools.getStudentById(id);

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    if (result.status === 200) {
      const validation = validateStudentRetrieval(result, id);
      return { apiResult: result, validation };
    }

    // If querying a nonexistent or soft-deleted ID, assert 404
    const isExpected404 = result.status === 404;
    return {
      apiResult: result,
      validation: {
        passed: isExpected404,
        verdict: isExpected404 ? "PASS" : "FAIL",
        note: isExpected404
          ? `Backend correctly returned HTTP 404 Not Found for ID ${id}`
          : `Unexpected HTTP status ${result.status}`,
      },
    };
  },

  update_student: async (args) => {
    const id = Number(args.id);
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: `Invalid argument: '${args.id}'. A positive integer 'id' is required.`,
      };
    }

    let name = typeof args.name === "string" ? args.name.trim() : null;
    let email = typeof args.email === "string" ? args.email.trim() : null;
    let course = typeof args.course === "string" ? args.course.trim() : null;

    if (!name && !email && !course) {
      return {
        success: false,
        error: "At least one field (name, email, or course) must be provided to update.",
      };
    }

    // Merge existing details if only a subset of fields were provided
    if (!name || !email || !course) {
      const existing = await apiTools.getStudentById(id);
      if (existing.status === null) {
        return { apiResult: existing, error: existing.error };
      }
      if (!existing.success || !existing.data) {
        return {
          apiResult: existing,
          error: `Cannot update: student with id ${id} not found or inactive.`,
        };
      }
      name = name || existing.data.name;
      email = email || existing.data.email;
      course = course || existing.data.course;
    }

    const studentData = { name, email, course };
    const result = await apiTools.updateStudent(id, studentData);

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    if (result.status === 200) {
      const validation = validateStudentUpdate(result, { id, ...studentData });
      return { apiResult: result, validation };
    }

    const isExpectedError = result.status === 400 || result.status === 404 || result.status === 409;
    return {
      apiResult: result,
      validation: {
        passed: isExpectedError,
        verdict: isExpectedError ? "PASS" : "FAIL",
        note: isExpectedError
          ? `Backend rejected update with HTTP ${result.status}`
          : `Unexpected HTTP status ${result.status}`,
      },
    };
  },

  soft_delete_student: async (args) => {
    const id = Number(args.id);
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: `Invalid argument: '${args.id}'. A positive integer 'id' is required.`,
      };
    }

    const result = await apiTools.softDeleteStudent(id);

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    if (result.status === 204) {
      const validation = validateDeletion(result);
      return { apiResult: result, validation };
    }

    const isExpected404 = result.status === 404;
    return {
      apiResult: result,
      validation: {
        passed: isExpected404,
        verdict: isExpected404 ? "PASS" : "FAIL",
        note: isExpected404
          ? `Backend returned 404 (student ${id} does not exist or already soft-deleted)`
          : `Unexpected status ${result.status}`,
      },
    };
  },

  hard_delete_student: async (args) => {
    const id = Number(args.id);
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: `Invalid argument: '${args.id}'. A positive integer 'id' is required.`,
      };
    }

    const result = await apiTools.hardDeleteStudent(id);

    if (result.status === null) {
      return { apiResult: result, error: result.error };
    }

    if (result.status === 204) {
      const validation = validateDeletion(result);
      return { apiResult: result, validation };
    }

    const isExpected404 = result.status === 404;
    return {
      apiResult: result,
      validation: {
        passed: isExpected404,
        verdict: isExpected404 ? "PASS" : "FAIL",
      },
    };
  },

  run_negative_tests: async () => {
    console.log("\n[TEST RUNNER] Executing full suite of 11 deterministic negative test scenarios...");
    const report = await runAllNegativeTests(apiTools);
    return {
      suite: "Deterministic Negative API Testing Suite",
      totalTests: report.totalTests,
      passedTests: report.passedTests,
      failedTests: report.failedTests,
      verdict: report.verdict,
      scenarios: report.scenarios.map((s) => ({
        scenario: s.scenario,
        verdict: s.verdict,
        expectedStatus: s.expectedStatus,
        actualStatus: s.actualStatus,
      })),
    };
  },
};

// Tool definitions provided to Qwen3
const tools = [
  {
    type: "function",
    function: {
      name: "create_student",
      description:
        "Create a student in the Student Management System. Also use this to test negative/invalid creation inputs (e.g., missing name, invalid email format, or duplicate email).",
      parameters: {
        type: "object",
        required: ["name", "email", "course"],
        properties: {
          name: {
            type: "string",
            description: "Student's full name",
          },
          email: {
            type: "string",
            description: "Student's email address",
          },
          course: {
            type: "string",
            description: "Student's enrolled course or major",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_all_students",
      description:
        "Retrieve all active students currently enrolled in the Student Management System.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_student_by_id",
      description:
        "Retrieve a specific active student by numeric ID. Can also test nonexistent ID retrieval.",
      parameters: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "integer",
            description: "The numeric primary key ID of the student",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_student",
      description:
        "Update an existing student's details (name, email, or course) by student ID.",
      parameters: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "integer",
            description: "The numeric ID of the student to update",
          },
          name: {
            type: "string",
            description: "Updated full name of the student (optional)",
          },
          email: {
            type: "string",
            description: "Updated email address of the student (optional)",
          },
          course: {
            type: "string",
            description: "Updated course or major of the student (optional)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "soft_delete_student",
      description:
        "Soft-delete (archive) an active student record by ID. Use only when the user explicitly specifies soft deletion or archiving.",
      parameters: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "integer",
            description: "The numeric ID of the student to archive/soft-delete",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hard_delete_student",
      description:
        "Permanently and irreversibly delete a student record from the database by ID. Use ONLY when permanent deletion or purge is explicitly requested.",
      parameters: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "integer",
            description: "The numeric ID of the student to permanently delete",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_negative_tests",
      description:
        "Run the automated deterministic negative API test suite. Executes 11 failure scenarios (missing fields, invalid emails, duplicates, nonexistent IDs, soft-delete invariants) and reports verified PASS/FAIL results.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

async function runAgent() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("Student API Testing Agent");
    console.log(`Model: ${MODEL}`);
    console.log("Tools Registered: CRUD + Negative Test Suite (run_negative_tests)");
    console.log("Validation Engine: Deterministic verification enabled (Model explains, JavaScript asserts).");
    console.log("Type 'exit' to stop.\n");

    const messages = [
      {
        role: "system",
        content: `
You are an API testing assistant for a Student Management System.

Available operations:
- create_student: Creates a new student or tests invalid inputs (requires name, email, course).
- get_all_students: Retrieves all active students.
- get_student_by_id: Retrieves a single student by numeric ID.
- update_student: Updates a student's name, email, or course by ID.
- soft_delete_student: Archives / soft-deletes a student by ID.
- hard_delete_student: Permanently purges a student from the database by ID.
- run_negative_tests: Runs the complete 11-scenario deterministic negative testing suite.

Core Testing & Safety Principles:
1. Deterministic Validation: Tool results include a "validation" object with a verified verdict (PASS or FAIL). Always report this verified verdict to the user. Do NOT invent your own test outcome.
2. Negative Testing: When testing invalid inputs or error scenarios, a rejected request (e.g. 400 Bad Request, 404 Not Found, 409 Conflict) is a SUCCESSFUL TEST (PASS) if it matches the expected error.
3. Vague Deletion Handling: If the user says "Delete student X" without specifying soft or hard delete, DO NOT execute any tool. Explain the difference between archive (soft delete) and permanent delete (hard delete) and ask for clarification.
4. Completeness: Never invent fake student details. If necessary input is missing, prompt the user.
5. Report Accuracy: Clearly explain the HTTP status code (200, 201, 204, 400, 404, 409) and the deterministic validation outcome.
`,
      },
    ];

    while (true) {
      let userInput;
      try {
        userInput = await rl.question("You: ");
      } catch {
        // Stream ended / closed cleanly
        break;
      }

      if (userInput === null || userInput === undefined) {
        break;
      }

      if (userInput.trim().toLowerCase() === "exit") {
        break;
      }

      if (!userInput.trim()) {
        continue;
      }

      messages.push({
        role: "user",
        content: userInput.trim(),
      });

      // Context engineering: keep system prompt and last 18 messages
      if (messages.length > 20) {
        messages.splice(1, messages.length - 19);
      }

      // Ask Qwen3 to choose a tool
      let response;
      try {
        response = await ollama.chat({
          model: MODEL,
          messages,
          tools,
          stream: false,
        });
      } catch (ollamaErr) {
        console.error("\n[Ollama Error]: Could not connect to local model:", ollamaErr.message);
        continue;
      }

      const rawToolCalls = response.message.tool_calls ?? [];

      if (rawToolCalls.length === 0) {
        console.log("\nAgent:", response.message.content, "\n");
        messages.push(response.message);
        continue;
      }

      messages.push(response.message);

      // Deduplicate repeated tool calls in the same turn
      const executedSignatures = new Set();

      for (const toolCall of rawToolCalls) {
        const toolName = toolCall.function.name;
        let args = toolCall.function.arguments;

        // Defensive parsing if arguments were stringified
        if (typeof args === "string") {
          try {
            args = JSON.parse(args);
          } catch {
            args = {};
          }
        }

        const callSignature = `${toolName}:${JSON.stringify(args)}`;
        if (executedSignatures.has(callSignature)) {
          continue;
        }
        executedSignatures.add(callSignature);

        console.log(`\nExecuting tool: ${toolName}`);
        console.log("Arguments:", args);

        const selectedTool = availableTools[toolName];
        let result;

        if (!selectedTool) {
          result = {
            success: false,
            error: `Tool '${toolName}' is not allowed or unrecognized.`,
          };
        } else if (toolName === "hard_delete_student") {
          console.log(`\n⚠️  CRITICAL SAFETY WARNING: Permanent deletion requested for student ID ${args.id}.`);
          console.log("This action is IRREVERSIBLE and will permanently purge the record from the database.");
          let answer = "";
          try {
            answer = await rl.question("Type 'CONFIRM' or 'yes' to proceed with permanent deletion: ");
          } catch {
            answer = "no";
          }

          if (answer.trim().toLowerCase() !== "yes" && answer.trim() !== "CONFIRM") {
            result = {
              success: false,
              cancelled: true,
              message: `Permanent deletion of student ID ${args.id} was CANCELLED by the user. The student record was NOT deleted.`,
            };
          } else {
            try {
              result = await selectedTool(args);
            } catch (error) {
              result = { success: false, error: error.message };
            }
          }
        } else if (toolName === "soft_delete_student") {
          console.log(`\nℹ️  SAFETY CHECK: Archiving (soft deletion) requested for student ID ${args.id}.`);
          let answer = "";
          try {
            answer = await rl.question("Type 'yes' to confirm archiving this student: ");
          } catch {
            answer = "no";
          }

          if (answer.trim().toLowerCase() !== "yes") {
            result = {
              success: false,
              cancelled: true,
              message: `Archiving (soft deletion) of student ID ${args.id} was CANCELLED by the user. The student remains active.`,
            };
          } else {
            try {
              result = await selectedTool(args);
            } catch (error) {
              result = { success: false, error: error.message };
            }
          }
        } else {
          try {
            result = await selectedTool(args);
          } catch (error) {
            result = {
              success: false,
              error: error.message,
            };
          }
        }

        console.log("Tool result:", result);

        messages.push({
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      // Ask Qwen3 to explain the tool result
      try {
        response = await ollama.chat({
          model: MODEL,
          messages,
          stream: false,
        });

        console.log("\nAgent:", response.message.content, "\n");
        messages.push(response.message);
      } catch (explainErr) {
        console.error("\n[Ollama Error]: Could not generate explanation:", explainErr.message);
      }
    }
  } catch (error) {
    if (error.message !== "readline was closed") {
      console.error("Agent error:", error.message);
    }
  } finally {
    rl.close();
  }
}

runAgent();
