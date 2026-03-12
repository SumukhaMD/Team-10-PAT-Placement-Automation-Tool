package com.pat.profile_service.service;


import com.opencsv.CSVReader;
import com.pat.profile_service.model.StudentProfile;
import com.pat.profile_service.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.List;

@Service
public class CSVUploadService {

    private final StudentProfileRepository repository;

    public CSVUploadService(StudentProfileRepository repository) {
        this.repository = repository;
    }

    public void uploadCSV(MultipartFile file) {

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {

            List<String[]> rows = reader.readAll();

            for (int i = 1; i < rows.size(); i++) {

                String[] row = rows.get(i);

                StudentProfile profile = new StudentProfile();

                profile.setUsn(row[0]);
                profile.setName(row[1]);
                profile.setEmail(row[2]);
                profile.setBranch(row[3]);
                profile.setCgpa(Double.parseDouble(row[4]));
                profile.setSkills(row[5]);
                profile.setResumeUrl(row[6]);

                repository.save(profile);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload CSV");
        }

    }
}
