package com.placeit.company.service;

import com.placeit.company.dto.CompanyDTO;
import com.placeit.company.entity.Company;
import com.placeit.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        try {
            // Validation
            if (companyDTO == null || companyDTO.getName() == null || companyDTO.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Company name is required");
            }
            
            log.info("Creating company: {}", companyDTO.getName());
            
            Company company = Company.builder()
                    .name(companyDTO.getName().trim())
                    .description(companyDTO.getDescription())
                    .website(companyDTO.getWebsite())
                    .location(companyDTO.getLocation())
                    .industry(companyDTO.getIndustry())
                    .build();

            Company saved = companyRepository.save(company);
            log.info("Company created successfully with ID: {}", saved.getId());
            return convertToDTO(saved);
        } catch (IllegalArgumentException e) {
            log.error("Validation error while creating company: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating company: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create company: " + e.getMessage());
        }
    }

    public CompanyDTO getCompany(Long id) {
        return companyRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    public CompanyDTO updateCompany(Long id, CompanyDTO companyDTO) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setName(companyDTO.getName());
        company.setDescription(companyDTO.getDescription());
        company.setWebsite(companyDTO.getWebsite());
        company.setLocation(companyDTO.getLocation());
        company.setIndustry(companyDTO.getIndustry());

        Company updated = companyRepository.save(company);
        log.info("Company updated: {}", id);
        return convertToDTO(updated);
    }

    public Page<CompanyDTO> listCompanies(Pageable pageable) {
        Page<Company> companies = companyRepository.findAll(pageable);
        List<CompanyDTO> companyDtos = companies.getContent()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(companyDtos, pageable, companies.getTotalElements());
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found");
        }
        companyRepository.deleteById(id);
        log.info("Company deleted: {}", id);
    }

    public CompanyDTO getCompanyByRecruiter(Long userId, String email) {
        // For now, return null - this would need recruiter-company relationship
        // In a real implementation, you would query the recruiter table
        // to find their associated company
        log.info("Looking up company for recruiter: userId={}, email={}", userId, email);
        
        // Return the first company as a fallback for demo purposes
        return companyRepository.findAll().stream()
                .findFirst()
                .map(this::convertToDTO)
                .orElse(null);
    }

    private CompanyDTO convertToDTO(Company company) {
        return CompanyDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .location(company.getLocation())
                .industry(company.getIndustry())
                .build();
    }
}
