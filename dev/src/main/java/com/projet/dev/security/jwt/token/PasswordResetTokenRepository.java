package com.projet.dev.security.jwt.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    @Query("""
        select t from PasswordResetToken t inner join User u
        on t.user.id = u.id
        where u.id = :userId and t.expiryDate > CURRENT_TIMESTAMP
        """)
    List<PasswordResetToken> findAllValidTokenByUser(Long userId);

    Optional<PasswordResetToken> findByToken(String token);
}
