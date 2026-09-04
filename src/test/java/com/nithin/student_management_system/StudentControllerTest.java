package com.nithin.student_management_system;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nithin.student_management_system.controller.StudentController;
import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.exception.StudentNotFoundException;
import com.nithin.student_management_system.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentService studentService;

    @Autowired
    private ObjectMapper objectMapper;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private StudentResponseDto sampleResponseDto() {
        return new StudentResponseDto(
                1L, "Alice Johnson", "alice@example.com", "Computer Science",
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    private StudentRequestDto sampleRequestDto() {
        StudentRequestDto dto = new StudentRequestDto();
        dto.setName("Alice Johnson");
        dto.setEmail("alice@example.com");
        dto.setCourse("Computer Science");
        return dto;
    }

    // ── POST /students ────────────────────────────────────────────────────────

    @Test
    void createStudent_validRequest_returns201() throws Exception {
        when(studentService.createStudent(any())).thenReturn(sampleResponseDto());

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequestDto())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    void createStudent_blankName_returns400() throws Exception {
        StudentRequestDto invalid = new StudentRequestDto();
        invalid.setName("");
        invalid.setEmail("alice@example.com");
        invalid.setCourse("Computer Science");

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createStudent_invalidEmail_returns400() throws Exception {
        StudentRequestDto invalid = new StudentRequestDto();
        invalid.setName("Alice");
        invalid.setEmail("not-an-email");
        invalid.setCourse("CS");

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
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
                        .content(objectMapper.writeValueAsString(sampleRequestDto())))
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
