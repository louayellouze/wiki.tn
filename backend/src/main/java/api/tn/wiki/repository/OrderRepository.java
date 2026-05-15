package api.tn.wiki.repository;

import api.tn.wiki.entity.Order;
import api.tn.wiki.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE o.user = :user " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByUserOrderByOrderDateDesc(@Param("user") User user);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.images " +
           "ORDER BY o.orderDate DESC")
    List<Order> findAllByOrderByOrderDateDesc();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.images WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query(value = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.images",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o")
    Page<Order> findAll(Pageable pageable);
}
