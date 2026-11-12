const BASE_URL = "http://localhost:8080/students";

/**
 * Validates that an ID is a positive integer.
 */
function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Shared helper to execute HTTP requests, parse responses, and handle network failures.
 */
async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const responseText = await response.text();

    let data = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    return {
      status: response.status,
      success: response.ok,
      data,
    };
  } catch (error) {
    const isConnError =
      error.cause?.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("connect");

    return {
      status: null,
      success: false,
      error: isConnError
        ? "Backend service is unavailable at http://localhost:8080. Please ensure the Spring Boot application is running."
        : error.message,
    };
  }
}

/**
 * Creates a student using the Spring Boot POST API.
 */
export async function createStudent(studentData) {
  return request(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });
}

/**
 * Retrieves all active students from the Spring Boot GET API.
 */
export async function getAllStudents() {
  return request(BASE_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
}

/**
 * Retrieves a single active student by ID from the Spring Boot GET API.
 */
export async function getStudentById(id) {
  if (!isValidId(id)) {
    return {
      status: null,
      success: false,
      error: `Invalid student ID: '${id}'. ID must be a positive integer.`,
    };
  }

  return request(`${BASE_URL}/${Number(id)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
}

/**
 * Updates an active student using the Spring Boot PUT API.
 */
export async function updateStudent(id, studentData) {
  if (!isValidId(id)) {
    return {
      status: null,
      success: false,
      error: `Invalid student ID: '${id}'. ID must be a positive integer.`,
    };
  }

  return request(`${BASE_URL}/${Number(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });
}

/**
 * Soft-deletes (archives) a student using the Spring Boot PATCH API.
 */
export async function softDeleteStudent(id) {
  if (!isValidId(id)) {
    return {
      status: null,
      success: false,
      error: `Invalid student ID: '${id}'. ID must be a positive integer.`,
    };
  }

  return request(`${BASE_URL}/${Number(id)}/soft-delete`, {
    method: "PATCH",
  });
}

/**
 * Hard-deletes (permanently removes) a student using the Spring Boot DELETE API.
 */
export async function hardDeleteStudent(id) {
  if (!isValidId(id)) {
    return {
      status: null,
      success: false,
      error: `Invalid student ID: '${id}'. ID must be a positive integer.`,
    };
  }

  return request(`${BASE_URL}/${Number(id)}`, {
    method: "DELETE",
  });
}

// Aliases matching snake_case tool names
export const get_all_students = getAllStudents;
export const get_student_by_id = getStudentById;
export const create_student = createStudent;
export const update_student = updateStudent;
export const soft_delete_student = softDeleteStudent;
export const hard_delete_student = hardDeleteStudent;
