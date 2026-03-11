package com.placement.analytics_service.repository;

import com.placement.analytics_service.model.PlacementAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementAnalyticsRepository extends JpaRepository<PlacementAnalytics, Long> {

}