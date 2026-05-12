package api.tn.wiki.repository;

import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findById(Integer integer);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByResetPasswordToken(String token);
    Optional<User> findByVerificationToken(String token);

    boolean existsByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    java.util.List<User> findByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
        "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role AND (" +
        "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsersByRole(@Param("role") Role role, @Param("query") String query, Pageable pageable);
}
