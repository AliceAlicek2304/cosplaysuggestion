package com.alice.cosplaysuggestion.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.cosplaysuggestion.model.Festival;
import com.alice.cosplaysuggestion.repository.FestivalRepository;

@Service
public class FestivalService {

    private static final Logger log = LoggerFactory.getLogger(FestivalService.class);

    private final FestivalRepository festivalRepository;

    public FestivalService(FestivalRepository festivalRepository) {
        this.festivalRepository = festivalRepository;
    }

    // Get all active festivals
    public List<Festival> getAllActiveFestivals() {
        return festivalRepository.findByIsActiveTrueOrderByStartDateAsc();
    }

    // Get all festivals (for admin)
    public List<Festival> getAllFestivals() {
        return festivalRepository.findAll();
    }

    // Get festival by ID
    public Optional<Festival> getFestivalById(Long id) {
        return festivalRepository.findById(id);
    }

    // Get upcoming festivals
    public List<Festival> getUpcomingFestivals() {
        return festivalRepository.findUpcomingActiveFestivals(LocalDateTime.now());
    }

    // Search festivals by name
    public List<Festival> searchFestivalsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllActiveFestivals();
        }
        return festivalRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name.trim());
    }

    // Create new festival
    @Transactional
    public Festival createFestival(Festival festival) {
        log.info("Creating new festival: {}", festival.getName());
        festival.setIsActive(true);
        return festivalRepository.save(festival);
    }

    // Update festival
    @Transactional
    public Festival updateFestival(Long id, Festival festivalDetails) {
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found with id: " + id));

        festival.setName(festivalDetails.getName());
        festival.setDescription(festivalDetails.getDescription());
        festival.setLocation(festivalDetails.getLocation());
        festival.setLink(festivalDetails.getLink());
        festival.setStartDate(festivalDetails.getStartDate());
        festival.setEndDate(festivalDetails.getEndDate());

        log.info("Updated festival: {}", festival.getName());
        return festivalRepository.save(festival);
    }

    // Delete festival
    @Transactional
    public void deleteFestival(Long id) {
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found with id: " + id));

        log.info("Deleting festival: {}", festival.getName());
        festivalRepository.delete(festival);
    }

    // Activate/Deactivate festival
    @Transactional
    public Festival toggleFestivalStatus(Long id) {
        Festival festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found with id: " + id));

        festival.setIsActive(!festival.getIsActive());
        log.info("Toggled festival status: {} - Active: {}", festival.getName(), festival.getIsActive());
        return festivalRepository.save(festival);
    }

    // Get festivals in date range
    public List<Festival> getFestivalsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return festivalRepository.findActiveFestivalsInDateRange(startDate, endDate);
    }
}
