package com.alice.cosplaysuggestion.dto;

import com.alice.cosplaysuggestion.model.GalleryItem;

public class GalleryItemDto {
    public Long id;
    public String fileName;
    public String subDir;
    public String itemType;
    public String fileUrl;
    public Boolean isActive;
    public String createdAt;

    public GalleryItemDto(GalleryItem item) {
        this.id = item.getId();
        this.fileName = item.getFileName();
        this.subDir = item.getSubDir();
        this.itemType = item.getItemType() != null ? item.getItemType().name() : null;
        this.fileUrl = item.getFileUrl();
        this.isActive = item.getIsActive();
        this.createdAt = item.getCreatedAt() != null ? item.getCreatedAt().toString() : null;
    }
}
