package com.projet.dev.repository;

import com.projet.dev.security.auth.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findByEmailAndCode(String email, String code);

    void deleteByEmail(String email);
}