/**
 * Deterministic Test Validation Engine
 *
 * This module independently validates API responses against expected contract states.
 * The LLM never decides whether a test passes or fails; JavaScript deterministically
 * evaluates response statuses, schemas, field types, and error conditions.
 */

/**
 * Validates a successful student creation (POST /students -> 201).
 */
export function validateStudentCreation(result, expected) {
  const checks = {
    statusIs201: result.status === 201,
    hasStudentId: Number.isInteger(result.data?.id) && result.data?.id > 0,
    nameMatches: result.data?.name === expected.name,
    emailMatches: result.data?.email === expected.email,
    courseMatches: result.data?.course === expected.course,
    hasCreatedAt: Boolean(result.data?.createdAt),
    hasUpdatedAt: Boolean(result.data?.updatedAt),
  };

  return {
    passed: Object.values(checks).every(Boolean),
    verdict: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
  };
}

/**
 * Validates a successful student retrieval (GET /students/{id} -> 200).
 */
export function validateStudentRetrieval(result, expectedId) {
  const checks = {
    statusIs200: result.status === 200,
    idMatches: result.data?.id === expectedId,
    hasName: typeof result.data?.name === "string" && result.data.name.length > 0,
    hasEmail: typeof result.data?.email === "string" && result.data.email.includes("@"),
    hasCourse: typeof result.data?.course === "string" && result.data.course.length > 0,
    hasCreatedAt: Boolean(result.data?.createdAt),
  };

  return {
    passed: Object.values(checks).every(Boolean),
    verdict: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
  };
}

/**
 * Validates a successful student update (PUT /students/{id} -> 200).
 */
export function validateStudentUpdate(result, expected) {
  const checks = {
    statusIs200: result.status === 200,
    idMatches: result.data?.id === expected.id,
    nameMatches: expected.name ? result.data?.name === expected.name : true,
    emailMatches: expected.email ? result.data?.email === expected.email : true,
    courseMatches: expected.course ? result.data?.course === expected.course : true,
    hasUpdatedAt: Boolean(result.data?.updatedAt),
  };

  return {
    passed: Object.values(checks).every(Boolean),
    verdict: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
  };
}

/**
 * Validates an HTTP 204 No Content response for soft or hard deletion.
 */
export function validateDeletion(result) {
  const checks = {
    statusIs204: result.status === 204,
    successIsTrue: result.success === true,
  };

  return {
    passed: Object.values(checks).every(Boolean),
    verdict: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
  };
}

/**
 * Validates a single negative test scenario against expected error status and body.
 */
export function validateNegativeScenario(result, scenarioName, expectedStatus, expectedMessageSubstring = null) {
  const statusMatches = result.status === expectedStatus;
  const isErrorStatus = result.status >= 400;

  let messageMatches = true;
  if (expectedMessageSubstring && result.data) {
    const rawData = typeof result.data === "string" ? result.data : JSON.stringify(result.data);
    messageMatches = rawData.toLowerCase().includes(expectedMessageSubstring.toLowerCase());
  }

  const passed = statusMatches && isErrorStatus && messageMatches;

  return {
    scenario: scenarioName,
    passed,
    verdict: passed ? "PASS" : "FAIL",
    expectedStatus,
    actualStatus: result.status,
    checks: {
      statusMatches,
      isErrorStatus,
      messageMatches,
    },
    responsePayload: result.data,
  };
}

/**
 * Executes and deterministically validates the full suite of 11 negative API scenarios.
 */
export async function runAllNegativeTests(apiTools) {
  const { createStudent, getStudentById, updateStudent, softDeleteStudent, hardDeleteStudent } = apiTools;
  const results = [];

  // Setup: create a temporary baseline student for uniqueness and delete tests
  const seedEmail = `seed.negtest.${Date.now()}@example.com`;
  const seed = await createStudent({
    name: "Seed Test Student",
    email: seedEmail,
    course: "Testing 101",
  });

  const seedId = seed.data?.id;

  // Scenario 1: Missing Name
  const res1 = await createStudent({ name: "", email: `valid1.${Date.now()}@example.com`, course: "CS" });
  results.push(validateNegativeScenario(res1, "1. Create student with missing name", 400));

  // Scenario 2: Missing Email
  const res2 = await createStudent({ name: "Alice", email: "", course: "CS" });
  results.push(validateNegativeScenario(res2, "2. Create student with missing email", 400));

  // Scenario 3: Missing Course
  const res3 = await createStudent({ name: "Alice", email: `valid3.${Date.now()}@example.com`, course: "" });
  results.push(validateNegativeScenario(res3, "3. Create student with missing course", 400));

  // Scenario 4: Invalid Email Format
  const res4 = await createStudent({ name: "Alice", email: "not-an-email", course: "CS" });
  results.push(validateNegativeScenario(res4, "4. Create student with invalid email format", 400));

  // Scenario 5: Duplicate Email Registration
  const res5 = await createStudent({ name: "Duplicate Person", email: seedEmail, course: "CS" });
  results.push(validateNegativeScenario(res5, "5. Create student with duplicate email", 409, "Email already exists"));

  // Scenario 6: Retrieve Nonexistent Student ID
  const res6 = await getStudentById(999999);
  results.push(validateNegativeScenario(res6, "6. Retrieve nonexistent student ID", 404, "not found"));

  // Scenario 7: Update Nonexistent Student ID
  const res7 = await updateStudent(999999, { name: "Ghost", email: "ghost@example.com", course: "CS" });
  results.push(validateNegativeScenario(res7, "7. Update nonexistent student ID", 404, "not found"));

  // Scenario 8: Update Student with Another Student's Email
  if (seedId) {
    const tempStudent = await createStudent({
      name: "Colliding Student",
      email: `collision.${Date.now()}@example.com`,
      course: "Physics",
    });
    const tempId = tempStudent.data?.id;

    if (tempId) {
      const res8 = await updateStudent(tempId, {
        name: "Colliding Student",
        email: seedEmail, // Collides with seed
        course: "Physics",
      });
      results.push(validateNegativeScenario(res8, "8. Update student using another student's email", 409, "Email already exists"));

      // Cleanup temp
      await hardDeleteStudent(tempId);
    }
  }

  // Scenario 9: Soft Delete Nonexistent Student ID
  const res9 = await softDeleteStudent(999999);
  results.push(validateNegativeScenario(res9, "9. Soft delete nonexistent student ID", 404, "not found"));

  // Setup student for soft-delete negative tests
  if (seedId) {
    // Initial soft delete
    await softDeleteStudent(seedId);

    // Scenario 10: Retrieve Student After Soft Deletion
    const res10 = await getStudentById(seedId);
    results.push(validateNegativeScenario(res10, "10. Retrieve student after soft deletion (must be hidden)", 404, "not found"));

    // Scenario 11: Attempt to Soft Delete an Already Deleted Student
    const res11 = await softDeleteStudent(seedId);
    results.push(validateNegativeScenario(res11, "11. Attempt to soft delete an already deleted student", 404, "not found"));

    // Final Cleanup: permanent purge
    await hardDeleteStudent(seedId);
  }

  const passedTests = results.filter((r) => r.passed).length;

  return {
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests,
    allPassed: passedTests === results.length,
    verdict: passedTests === results.length ? "ALL PASS" : "FAILURES DETECTED",
    scenarios: results,
  };
}
