package com.nithin.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class StudentResponseDto {
    private Long id;
    private String name;
    private String email;
    private String course;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
