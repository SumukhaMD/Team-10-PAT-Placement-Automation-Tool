package com.placeit.auth.repository;

import com.placeit.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByEmailAndOtpAndUsedFalse(String email, String otp);
    Optional<OtpToken> findByEmailAndUsedFalse(String email);
    void deleteByEmail(String email);
}
