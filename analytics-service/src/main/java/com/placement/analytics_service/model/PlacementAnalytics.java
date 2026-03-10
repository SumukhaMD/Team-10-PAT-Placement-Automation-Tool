package com.placement.analytics_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "placement_analytics")
public class PlacementAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;
    private String companyName;
    private Double packageAmount;
    private String placementStatus;
    private String branch;
    private Integer graduationYear;

}