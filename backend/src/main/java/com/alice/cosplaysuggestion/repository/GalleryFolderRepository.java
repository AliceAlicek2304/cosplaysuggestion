package com.alice.cosplaysuggestion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.cosplaysuggestion.model.GalleryFolder;

@Repository
public interface GalleryFolderRepository extends JpaRepository<GalleryFolder, Long> {
    Optional<GalleryFolder> findByStorageName(String storageName);
    boolean existsByStorageName(String storageName);
    List<GalleryFolder> findByDisplayNameContainingIgnoreCase(String displayName);
    List<GalleryFolder> findByIsActiveTrue();
    List<GalleryFolder> findByDisplayNameContainingIgnoreCaseAndIsActiveTrue(String displayName);
}