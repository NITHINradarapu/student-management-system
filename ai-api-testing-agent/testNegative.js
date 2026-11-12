import * as apiTools from "./tools/studentApiTools.js";
import { runAllNegativeTests } from "./validators/studentValidators.js";

async function main() {
  console.log("=================================================");
  console.log("   DETERMINISTIC NEGATIVE API TEST RUNNER       ");
  console.log("   Spring Boot Student Management System        ");
  console.log("=================================================\n");

  const startTime = Date.now();
  const report = await runAllNegativeTests(apiTools);
  const duration = Date.now() - startTime;

  console.log(`Test Execution Finished in ${duration}ms\n`);
  console.log("-------------------------------------------------");
  console.log(`Total Scenarios Tested : ${report.totalTests}`);
  console.log(`Passed                 : ${report.passedTests}`);
  console.log(`Failed                 : ${report.failedTests}`);
  console.log(`Final Suite Verdict    : ${report.verdict}`);
  console.log("-------------------------------------------------\n");

  console.log("Detailed Scenario Matrix:");
  report.scenarios.forEach((s) => {
    const icon = s.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${icon}] ${s.scenario}`);
    console.log(`        Expected Status: ${s.expectedStatus} | Actual: ${s.actualStatus}`);
    if (!s.passed) {
      console.log(`        Checks:`, s.checks);
      console.log(`        Payload:`, s.responsePayload);
    }
  });

  console.log("\n=================================================");
}

main();

