package com.pat.profile_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "internships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentUsn;

    private String companyName;

    private String duration;

    private String status;

}