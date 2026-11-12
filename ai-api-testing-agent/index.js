// import ollama from "ollama";

// const MODEL = "qwen3:4b";

// async function testOllama() {
//   try {
//     console.log("Connecting to local Ollama model...");

//     const response = await ollama.chat({
//       model: MODEL,
//       messages: [
//         {
//           role: "user",
//           content:
//             "Explain what an AI agent is in simple terms, with one practical example.",
//         },
//       ],
//       stream: false,
//     });

//     console.log("\nQwen3 Response:\n");
//     console.log(response.message.content);
//   } catch (error) {
//     console.error("\nOllama connection error:");
//     console.error(error.message);
//   }
// }

// testOllama();

import { createStudent } from "./tools/studentApiTools.js";
import { validateStudentCreation } from "./validators/studentValidators.js";

async function main() {
  const student = {
    name: "Agent Test Student",
    email: `agent.test.${Date.now()}@example.com`,
    course: "Computer Science",
  };

  console.log("Sending student creation request...");

  const result = await createStudent(student);

  console.log("\nAPI Response:");
  console.log(result);

  if (result.status === 201) {
    const validation = validateStudentCreation(result, student);

    console.log("\nValidation Results:");
    console.log(validation);

    console.log("\nFinal Test Result:", validation.passed ? "PASS" : "FAIL");
  } else {
    console.log("\nStudent creation request failed.");
  }
}

main();
