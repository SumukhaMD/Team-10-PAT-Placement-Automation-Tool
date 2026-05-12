package com.placeit.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
@Slf4j
public class OtpService {

    private final Random random = new Random();

    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
