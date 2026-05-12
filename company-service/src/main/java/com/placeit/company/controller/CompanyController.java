package com.placeit.company.controller;

import com.placeit.company.dto.CompanyDTO;
import com.placeit.company.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Company Management APIs")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "List companies")
    public ResponseEntity<Page<CompanyDTO>> listCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        Pageable pageable = PageRequest.of(page, limit);
        return ResponseEntity.ok(companyService.listCompanies(pageable));
    }

    @PostMapping
    @Operation(summary = "Create a new company")
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO companyDTO) {
        CompanyDTO created = companyService.createCompany(companyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details")
    public ResponseEntity<CompanyDTO> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompany(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update company details")
    public ResponseEntity<CompanyDTO> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyDTO companyDTO) {
        return ResponseEntity.ok(companyService.updateCompany(id, companyDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a company")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mine")
    @Operation(summary = "Get current recruiter's company")
    public ResponseEntity<?> getMyCompany(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String email) {
        try {
            if (userId == null && (email == null || email.isBlank())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "error", "User not authenticated"));
            }
            CompanyDTO company = companyService.getCompanyByRecruiter(userId, email);
            if (company == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("success", false, "error", "No company associated with this recruiter"));
            }
            return ResponseEntity.ok(java.util.Map.of("success", true, "data", company));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/recruiters")
    @Operation(summary = "Get recruiters for a company")
    public ResponseEntity<?> getRecruiters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Return empty list for now - this would need recruiter repository
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "data", java.util.List.of(),
                    "total", 0,
                    "page", page,
                    "size", size
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/recruiters")
    @Operation(summary = "Get recruiters for a specific company")
    public ResponseEntity<?> getCompanyRecruiters(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Return empty list for now - this would need recruiter repository
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "data", java.util.List.of(),
                    "total", 0,
                    "page", page,
                    "size", size
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }
}
