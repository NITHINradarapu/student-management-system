package com.nithin.student_management_system.service;

import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.exception.DuplicateEmailException;
import com.nithin.student_management_system.exception.StudentNotFoundException;
import com.nithin.student_management_system.model.Student;
import com.nithin.student_management_system.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private StudentResponseDto toDto(Student student) {
        return new StudentResponseDto(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getCourse(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    // ── Public operations ─────────────────────────────────────────────────────

    @Transactional
    public StudentResponseDto createStudent(StudentRequestDto studentRequestDto) {
        if (studentRepository.existsByEmail(studentRequestDto.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        Student student = new Student();
        student.setName(studentRequestDto.getName());
        student.setEmail(studentRequestDto.getEmail());
        student.setCourse(studentRequestDto.getCourse());
        student.setIsDeleted(false);

        // createdAt and updatedAt are set automatically by JPA Auditing (@CreatedDate / @LastModifiedDate)
        return toDto(studentRepository.save(student));
    }

    public StudentResponseDto getStudentById(Long id) {
        Student student = studentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        return toDto(student);
    }

    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAllByIsDeletedFalse()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public StudentResponseDto updateStudent(Long id, StudentRequestDto studentRequestDto) {
        Student student = studentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        if (studentRepository.existsByEmailAndIdNot(studentRequestDto.getEmail(), id)) {
            throw new DuplicateEmailException("Email already exists");
        }

        student.setName(studentRequestDto.getName());
        student.setEmail(studentRequestDto.getEmail());
        student.setCourse(studentRequestDto.getCourse());

        // updatedAt is refreshed automatically by JPA Auditing on save
        return toDto(studentRepository.save(student));
    }

    @Transactional
    public void softDeleteStudent(Long id) {
        Student student = studentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        student.setIsDeleted(true);
        // updatedAt is refreshed automatically by JPA Auditing on save
        studentRepository.save(student);
    }

    @Transactional
    public void hardDeleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        studentRepository.delete(student);
    }
}
