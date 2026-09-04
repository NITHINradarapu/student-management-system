package com.nithin.student_management_system;

import com.nithin.student_management_system.controller.StudentController;
import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.exception.GlobalExceptionHandler;
import com.nithin.student_management_system.exception.StudentNotFoundException;
import com.nithin.student_management_system.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer tests for StudentController using Spring Framework 7 standalone MockMvc.
 * Does NOT require a Spring context, database, or @WebMvcTest (removed in Spring Boot 4.x).
 */
@ExtendWith(MockitoExtension.class)
class StudentControllerTest {

    @Mock
    private StudentService studentService;

    @InjectMocks
    private StudentController studentController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(studentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private StudentResponseDto sampleResponseDto() {
        return new StudentResponseDto(
                1L, "Alice Johnson", "alice@example.com", "Computer Science",
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    /** Returns a minimal valid JSON request body */
    private String validJson() {
        return "{\"name\":\"Alice Johnson\",\"email\":\"alice@example.com\",\"course\":\"Computer Science\"}";
    }

    // ── POST /students ────────────────────────────────────────────────────────

    @Test
    void createStudent_validRequest_returns201() throws Exception {
        when(studentService.createStudent(any())).thenReturn(sampleResponseDto());

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    void createStudent_blankName_returns400() throws Exception {
        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"alice@example.com\",\"course\":\"CS\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createStudent_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Alice\",\"email\":\"not-an-email\",\"course\":\"CS\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── GET /students/{id} ────────────────────────────────────────────────────

    @Test
    void getStudentById_exists_returns200() throws Exception {
        when(studentService.getStudentById(1L)).thenReturn(sampleResponseDto());

        mockMvc.perform(get("/students/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice Johnson"));
    }

    @Test
    void getStudentById_notFound_returns404() throws Exception {
        when(studentService.getStudentById(99L))
                .thenThrow(new StudentNotFoundException("Student with id 99 not found"));

        mockMvc.perform(get("/students/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Student with id 99 not found"));
    }

    // ── GET /students ─────────────────────────────────────────────────────────

    @Test
    void getAllStudents_returns200WithList() throws Exception {
        when(studentService.getAllStudents()).thenReturn(List.of(sampleResponseDto()));

        mockMvc.perform(get("/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ── PUT /students/{id} ────────────────────────────────────────────────────

    @Test
    void updateStudent_validRequest_returns200() throws Exception {
        when(studentService.updateStudent(eq(1L), any())).thenReturn(sampleResponseDto());

        mockMvc.perform(put("/students/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice Johnson"));
    }

    // ── PATCH /students/{id}/soft-delete ──────────────────────────────────────

    @Test
    void softDeleteStudent_returns204() throws Exception {
        doNothing().when(studentService).softDeleteStudent(1L);

        mockMvc.perform(patch("/students/1/soft-delete"))
                .andExpect(status().isNoContent());
    }

    // ── DELETE /students/{id} ─────────────────────────────────────────────────

    @Test
    void hardDeleteStudent_returns204() throws Exception {
        doNothing().when(studentService).hardDeleteStudent(1L);

        mockMvc.perform(delete("/students/1"))
                .andExpect(status().isNoContent());
    }
}
