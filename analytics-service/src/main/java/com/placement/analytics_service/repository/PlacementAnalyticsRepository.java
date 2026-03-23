package com.placement.analytics_service.repository;

import com.placement.analytics_service.model.PlacementAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementAnalyticsRepository extends JpaRepository<PlacementAnalytics, Long> {

    @Query("SELECT COUNT(p) FROM PlacementAnalytics p WHERE p.status='PLACED'")
    Long getTotalPlacedStudents();
    
    @Query("SELECT AVG(p.salaryPackage) FROM PlacementAnalytics p WHERE p.status='PLACED'")
    Double getAveragePackage();
    
    @Query("SELECT MAX(p.salaryPackage) FROM PlacementAnalytics p WHERE p.status='PLACED'")
    Double getHighestPackage();
    
    @Query("SELECT (COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM PlacementAnalytics p2)) FROM PlacementAnalytics p WHERE p.status='PLACED'")
    Double getPlacementPercentage();

}