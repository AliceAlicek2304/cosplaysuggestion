package com.alice.cosplaysuggestion.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alice.cosplaysuggestion.model.Festival;

@Repository
public interface FestivalRepository extends JpaRepository<Festival, Long> {
    List<Festival> findByIsActiveTrue();
    List<Festival> findByIsActiveTrueOrderByStartDateAsc();

    @Query("SELECT f FROM Festival f WHERE f.isActive = true AND f.startDate >= :currentDate ORDER BY f.startDate ASC")
    List<Festival> findUpcomingActiveFestivals(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT f FROM Festival f WHERE f.isActive = true AND f.startDate BETWEEN :startDate AND :endDate ORDER BY f.startDate ASC")
    List<Festival> findActiveFestivalsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Festival> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
