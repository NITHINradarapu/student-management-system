package com.nithin.student_management_system.controller;

import com.nithin.student_management_system.dto.StudentRequestDto;
import com.nithin.student_management_system.dto.StudentResponseDto;
import com.nithin.student_management_system.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService){
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponseDto> createStudent(@Valid @RequestBody StudentRequestDto studentRequestDto){
        StudentResponseDto response = studentService.createStudent(studentRequestDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDto> getStudentById(@PathVariable Long id){
        StudentResponseDto response = studentService.getStudentById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<StudentResponseDto>> getAllStudents(){
        List<StudentResponseDto> students = studentService.getAllStudents();

        return ResponseEntity.ok(students);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDto> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequestDto studentRequestDto){
        StudentResponseDto response = studentService.updateStudent(id, studentRequestDto);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/soft-delete")
    public ResponseEntity<Void> softDeleteStudent(@PathVariable Long id){
        studentService.softDeleteStudent(id);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> hardDeleteStudent(@PathVariable Long id){
        studentService.hardDeleteStudent(id);

        return ResponseEntity.noContent().build();
    }
}
