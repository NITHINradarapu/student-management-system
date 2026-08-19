package com.nithin.student_management_system.repository;

import com.nithin.student_management_system.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Student> findByIdAndIsDeletedFalse(Long id);

    List<Student> findAllByIsDeletedFalse();
}
