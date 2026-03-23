package com.placement.analytics_service.controller;

import com.placement.analytics_service.model.PlacementAnalytics;
import com.placement.analytics_service.service.PlacementAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class PlacementAnalyticsController {

    @Autowired
    private PlacementAnalyticsService service;

    @GetMapping("/all")
    public List<PlacementAnalytics> getAll() {
        return service.getAllData();
    }

    @PostMapping("/add")
    public PlacementAnalytics addData(@RequestBody PlacementAnalytics data) {
        return service.saveData(data);
    }
}