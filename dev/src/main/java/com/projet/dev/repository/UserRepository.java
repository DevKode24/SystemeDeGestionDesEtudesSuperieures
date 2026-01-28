package com.projet.dev.repository;


import com.projet.dev.models.AppUser;
import com.projet.dev.models.Role;
import com.projet.dev.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    static void save(AppUser user) {
    }

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


    List<User> findByRoles(Role role);



}

