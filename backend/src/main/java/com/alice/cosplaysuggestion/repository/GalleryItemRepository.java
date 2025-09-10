package com.alice.cosplaysuggestion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.cosplaysuggestion.model.GalleryFolder;
import com.alice.cosplaysuggestion.model.GalleryItem;

@Repository
public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {
    List<GalleryItem> findByFolder(GalleryFolder folder);
    long deleteByFolder(GalleryFolder folder);
}


