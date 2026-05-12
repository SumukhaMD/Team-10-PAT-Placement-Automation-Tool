package com.placeit.placement.repository;

import com.placeit.placement.entity.PlacementDrive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    Page<PlacementDrive> findByStatus(PlacementDrive.DriveStatus status, Pageable pageable);
    Page<PlacementDrive> findByCompanyId(Long companyId, Pageable pageable);
    List<PlacementDrive> findByCompanyIdAndStatus(Long companyId, PlacementDrive.DriveStatus status);
}
