package com.nithin.student_management_system.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateEmail(
            DuplicateEmailException exception
    ){
        Map<String, Object> errorResponse = new HashMap<>();

        errorResponse.put("status", HttpStatus.CONFLICT.value());
        errorResponse.put("message", exception.getMessage());

        return new ResponseEntity<>(
                errorResponse, HttpStatus.CONFLICT
        );
    }


    // exception handler for student not found
    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleStudentNotFound(StudentNotFoundException exception){
        Map<String, Object> errorResponse = new HashMap<>();

        errorResponse.put("status", HttpStatus.NOT_FOUND.value());
        errorResponse.put("message", exception.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }
}
