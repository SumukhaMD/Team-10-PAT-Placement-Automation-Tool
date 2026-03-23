package com.placement.analytics_service.service;

import com.placement.analytics_service.model.PlacementAnalytics;
import com.placement.analytics_service.repository.PlacementAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlacementAnalyticsService {

    @Autowired
    private PlacementAnalyticsRepository repository;

    public List<PlacementAnalytics> getAllData() {
        return repository.findAll();
    }

    public PlacementAnalytics saveData(PlacementAnalytics data) {
        return repository.save(data);
    }

    public PlacementStatsDTO getStats() {
    
        PlacementStatsDTO dto = new PlacementStatsDTO();
    
        dto.setTotalPlaced(repository.getTotalPlacedStudents());
        dto.setAveragePackage(repository.getAveragePackage());
        dto.setHighestPackage(repository.getHighestPackage());
        dto.setPlacementPercentage(repository.getPlacementPercentage());
    
        return dto;
    }

}