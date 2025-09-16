package com.alice.cosplaysuggestion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alice.cosplaysuggestion.model.NotificationFes;

@Repository
public interface NotificationFesRepository extends JpaRepository<NotificationFes, Long> {
    List<NotificationFes> findByUserId(Long userId);
    List<NotificationFes> findByUserIdAndIsActiveTrue(Long userId);
    List<NotificationFes> findByFestivalIdAndIsActiveTrue(Long festivalId);
    Optional<NotificationFes> findByUserIdAndFestivalId(Long userId, Long festivalId);

    @Query("SELECT n FROM NotificationFes n JOIN FETCH n.festival f WHERE n.user.id = :userId AND n.isActive = true AND f.isActive = true AND f.startDate > :currentDate ORDER BY f.startDate ASC")
    List<NotificationFes> findActiveNotificationsWithUpcomingFestivals(@Param("userId") Long userId, @Param("currentDate") java.time.LocalDateTime currentDate);

    @Query("SELECT n FROM NotificationFes n JOIN FETCH n.festival f WHERE n.isActive = true AND f.isActive = true AND f.startDate BETWEEN :startDate AND :endDate")
    List<NotificationFes> findNotificationsForFestivalsInDateRange(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT n FROM NotificationFes n JOIN FETCH n.festival f JOIN FETCH n.user u WHERE n.isActive = true AND f.isActive = true AND u.isActive = true AND f.startDate BETWEEN :startDate AND :endDate")
    List<NotificationFes> findNotificationsForFestivalReminders(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}
