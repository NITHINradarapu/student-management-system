# Student Management System

A Spring Boot REST API for managing student records with MySQL persistence, input validation, duplicate-email protection, and support for both soft delete and hard delete operations.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Overview

This project provides CRUD APIs for student data:
- Create a student
- Fetch a student by ID
- List all active students
- Update student details
- Soft delete a student (marks as deleted)
- Hard delete a student (removes from database)

Soft-deleted students are excluded from normal read operations.

## Features

- RESTful API design using Spring Web MVC
- Layered architecture (Controller → Service → Repository)
- MySQL integration with Spring Data JPA
- DTO-based request/response mapping
- Request validation using Jakarta Validation
- Global exception handling for business errors
- Unique email constraint and duplicate email checks
- Timestamps (`createdAt`, `updatedAt`) tracked for each record

## Tech Stack

- Java 25
- Spring Boot 4.1.0
- Spring Web MVC
- Spring Data JPA
- MySQL Connector/J
- Lombok
- Maven

## Project Structure

```text
src/main/java/com/nithin/student_management_system
├── controller
│   └── StudentController.java
├── dto
│   ├── StudentRequestDto.java
│   └── StudentResponseDto.java
├── exception
│   ├── DuplicateEmailException.java
│   ├── GlobalExceptionHandler.java
│   └── StudentNotFoundException.java
├── model
│   └── Student.java
├── repository
│   └── StudentRepository.java
├── service
│   └── StudentService.java
└── StudentManagementSystemApplication.java
```

## Prerequisites

- JDK 25
- Maven 3.9+ (or use the included Maven Wrapper)
- MySQL 8+

## Configuration

The application uses `src/main/resources/application.properties`:

```properties
spring.application.name=student-management-system

spring.datasource.url=jdbc:mysql://localhost:3306/student_management_system
spring.datasource.username=root
spring.datasource.password=<your_mysql_password>

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Notes
- Create the database `student_management_system` before running the app.
- Update `spring.datasource.username` and `spring.datasource.password` to match your local MySQL credentials.
- For security, avoid committing real credentials in shared environments.

## Getting Started

From the repository root:

```bash
./mvnw spring-boot:run
```

The API starts on the default Spring Boot port:

`http://localhost:8080`

## API Endpoints

Base path: `/students`

### 1) Create Student
- **POST** `/students`
- Request body:
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "course": "Computer Science"
}
```
- Success: `201 Created`

### 2) Get Student by ID
- **GET** `/students/{id}`
- Success: `200 OK`

### 3) Get All Active Students
- **GET** `/students`
- Returns only students where `isDeleted = false`
- Success: `200 OK`

### 4) Update Student
- **PUT** `/students/{id}`
- Request body is same format as create
- Success: `200 OK`

### 5) Soft Delete Student
- **PATCH** `/students/{id}/soft-delete`
- Marks `isDeleted = true` and updates `updatedAt`
- Success: `204 No Content`

### 6) Hard Delete Student
- **DELETE** `/students/{id}`
- Permanently removes the record
- Success: `204 No Content`

## Error Handling

Global exception handling is implemented in `GlobalExceptionHandler`.

### Custom business errors
- `409 Conflict` for duplicate email
- `404 Not Found` when student does not exist

Response format:
```json
{
  "status": 404,
  "message": "Student with id 10 not found"
}
```

Validation errors from invalid request bodies are handled by Spring Boot's default validation error handling.

## Testing

Run tests with:

```bash
./mvnw test
```

Current tests include a Spring context load test (`StudentManagementSystemApplicationTests`).
