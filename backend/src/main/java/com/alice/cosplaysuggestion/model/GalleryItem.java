package com.alice.cosplaysuggestion.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "gallery_items")
public class GalleryItem {

    public enum ItemType { IMAGE, VIDEO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private GalleryFolder folder;

    @NotBlank
    @Size(max = 255)
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "sub_dir", nullable = false)
    private String subDir;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    @Size(max = 255)
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public GalleryItem() {}

    public GalleryItem(GalleryFolder folder, String fileName, String subDir, ItemType itemType, String fileUrl) {
        this.folder = folder;
        this.fileName = fileName;
        this.subDir = subDir;
        this.itemType = itemType;
        this.fileUrl = fileUrl;
        this.isActive = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public GalleryFolder getFolder() { return folder; }
    public void setFolder(GalleryFolder folder) { this.folder = folder; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getSubDir() { return subDir; }
    public void setSubDir(String subDir) { this.subDir = subDir; }
    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


