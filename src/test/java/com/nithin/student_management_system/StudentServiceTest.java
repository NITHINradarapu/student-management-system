package com.nithin.student_management_system;

import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.exception.DuplicateEmailException;
import com.nithin.student_management_system.exception.StudentNotFoundException;
import com.nithin.student_management_system.model.Student;
import com.nithin.student_management_system.repository.StudentRepository;
import com.nithin.student_management_system.service.StudentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Student sampleStudent() {
        Student s = new Student();
        s.setId(1L);
        s.setName("Alice Johnson");
        s.setEmail("alice@example.com");
        s.setCourse("Computer Science");
        s.setIsDeleted(false);
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return s;
    }

    private StudentRequestDto sampleRequestDto() {
        StudentRequestDto dto = new StudentRequestDto();
        dto.setName("Alice Johnson");
        dto.setEmail("alice@example.com");
        dto.setCourse("Computer Science");
        return dto;
    }

    // ── createStudent ──────────────────────────────────────────────────────────

    @Test
    void createStudent_success_returnsResponseDto() {
        when(studentRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(sampleStudent());

        StudentResponseDto result = studentService.createStudent(sampleRequestDto());

        assertThat(result.getName()).isEqualTo("Alice Johnson");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void createStudent_duplicateEmail_throwsDuplicateEmailException() {
        when(studentRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> studentService.createStudent(sampleRequestDto()))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessage("Email already exists");

        verify(studentRepository, never()).save(any());
    }

    // ── getStudentById ────────────────────────────────────────────────────────

    @Test
    void getStudentById_success_returnsResponseDto() {
        when(studentRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(sampleStudent()));

        StudentResponseDto result = studentService.getStudentById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void getStudentById_notFound_throwsStudentNotFoundException() {
        when(studentRepository.findByIdAndIsDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.getStudentById(99L))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── getAllStudents ─────────────────────────────────────────────────────────

    @Test
    void getAllStudents_returnsOnlyActiveStudents() {
        when(studentRepository.findAllByIsDeletedFalse()).thenReturn(List.of(sampleStudent()));

        List<StudentResponseDto> result = studentService.getAllStudents();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Alice Johnson");
    }

    @Test
    void getAllStudents_emptyList_returnsEmptyList() {
        when(studentRepository.findAllByIsDeletedFalse()).thenReturn(List.of());

        assertThat(studentService.getAllStudents()).isEmpty();
    }

    // ── updateStudent ─────────────────────────────────────────────────────────

    @Test
    void updateStudent_success_returnsUpdatedDto() {
        Student student = sampleStudent();
        when(studentRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(student));
        when(studentRepository.existsByEmailAndIdNot("alice@example.com", 1L)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponseDto result = studentService.updateStudent(1L, sampleRequestDto());

        assertThat(result).isNotNull();
        verify(studentRepository).save(student);
    }

    @Test
    void updateStudent_notFound_throwsStudentNotFoundException() {
        when(studentRepository.findByIdAndIsDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.updateStudent(99L, sampleRequestDto()))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updateStudent_duplicateEmail_throwsDuplicateEmailException() {
        when(studentRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(sampleStudent()));
        when(studentRepository.existsByEmailAndIdNot("alice@example.com", 1L)).thenReturn(true);

        assertThatThrownBy(() -> studentService.updateStudent(1L, sampleRequestDto()))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessage("Email already exists");
    }

    // ── softDeleteStudent ─────────────────────────────────────────────────────

    @Test
    void softDeleteStudent_success_setsIsDeletedTrue() {
        Student student = sampleStudent();
        when(studentRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(student));

        studentService.softDeleteStudent(1L);

        assertThat(student.getIsDeleted()).isTrue();
        verify(studentRepository).save(student);
    }

    @Test
    void softDeleteStudent_notFound_throwsStudentNotFoundException() {
        when(studentRepository.findByIdAndIsDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.softDeleteStudent(99L))
                .isInstanceOf(StudentNotFoundException.class);
    }

    // ── hardDeleteStudent ─────────────────────────────────────────────────────

    @Test
    void hardDeleteStudent_success_callsRepositoryDelete() {
        Student student = sampleStudent();
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        studentService.hardDeleteStudent(1L);

        verify(studentRepository).delete(student);
    }

    @Test
    void hardDeleteStudent_notFound_throwsStudentNotFoundException() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.hardDeleteStudent(99L))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining("99");
    }
}
