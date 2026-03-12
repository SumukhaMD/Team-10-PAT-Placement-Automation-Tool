package com.pat.profile_service.controller;



import com.pat.profile_service.service.CSVUploadService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class CSVUploadController {

    private final CSVUploadService service;

    public CSVUploadController(CSVUploadService service) {
        this.service = service;
    }

    @PostMapping("/upload-csv")
    public String uploadCSV(@RequestParam("file") MultipartFile file) {

        service.uploadCSV(file);

        return "CSV uploaded successfully";
    }
}
