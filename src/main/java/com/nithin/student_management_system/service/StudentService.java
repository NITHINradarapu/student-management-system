package com.nithin.student_management_system.service;

import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.exception.DuplicateEmailException;
import com.nithin.student_management_system.exception.StudentNotFoundException;
import com.nithin.student_management_system.model.Student;
import com.nithin.student_management_system.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository){
        this.studentRepository = studentRepository;
    }

    // we are receiving a requestDto
    // and sending a responseDto
    public StudentResponseDto createStudent(StudentRequestDto studentRequestDto){

        if(studentRepository.existsByEmail(studentRequestDto.getEmail())){
            throw new DuplicateEmailException("Email already exists");
        }

        Student student = new Student();
        student.setName(studentRequestDto.getName());
        student.setEmail(studentRequestDto.getEmail());
        student.setCourse(studentRequestDto.getCourse());

        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        student.setIsDeleted(false);

        Student savedStudent = studentRepository.save(student);

        return new StudentResponseDto(
                savedStudent.getId(),
                savedStudent.getName(),
                savedStudent.getEmail(),
                savedStudent.getCourse(),
                savedStudent.getCreatedAt(),
                savedStudent.getUpdatedAt()
        );
    }

    public StudentResponseDto getStudentById(Long id){
        Student student = studentRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        return new StudentResponseDto(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getCourse(),

                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    public List<StudentResponseDto> getAllStudents(){
        return studentRepository.findAllByIsDeletedFalse().stream().map(student -> new StudentResponseDto(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getCourse(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        )).toList();
    }

    public StudentResponseDto updateStudent(Long id, StudentRequestDto studentRequestDto){
        Student student = studentRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        if(studentRepository.existsByEmailAndIdNot(studentRequestDto.getEmail(), id)){
            throw new DuplicateEmailException("Email already exists");
        }

        student.setName(studentRequestDto.getName());
        student.setEmail(studentRequestDto.getEmail());
        student.setCourse(studentRequestDto.getCourse());

        student.setUpdatedAt(LocalDateTime.now());

        Student updatedStudent = studentRepository.save(student);

        return new StudentResponseDto(
                updatedStudent.getId(),
                updatedStudent.getName(),
                updatedStudent.getEmail(),
                updatedStudent.getCourse(),
                updatedStudent.getCreatedAt(),
                updatedStudent.getUpdatedAt()
        );
    }

    public void softDeleteStudent(Long id){
        Student student = studentRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        student.setIsDeleted(true);
        student.setUpdatedAt(LocalDateTime.now());

        studentRepository.save(student);
    }

    public void hardDeleteStudent(Long id){
        Student student = studentRepository.findById(id).orElseThrow(() -> new StudentNotFoundException("Student with id " + id + " not found"));

        studentRepository.delete(student);
    }
}
