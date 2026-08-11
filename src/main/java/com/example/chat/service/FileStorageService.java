package com.example.chat.service;

import com.example.chat.config.SupabaseStorageConfig;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final SupabaseStorageConfig config;
    private final RestClient restClient;

    public FileStorageService(
            SupabaseStorageConfig config) {

        this.config = config;

        this.restClient =
                RestClient
                        .builder()
                        .baseUrl(config.getSupabaseUrl())
                        .build();
    }

    public String uploadFile(
            String joinCode,
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File cannot be empty."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size cannot exceed 10 MB."
            );
        }

        String originalFileName =
                StringUtils.cleanPath(
                        file.getOriginalFilename() != null
                                ? file.getOriginalFilename()
                                : "file"
                );

        String extension = "";

        String detectedExtension =
                StringUtils.getFilenameExtension(
                        originalFileName
                );

        if (detectedExtension != null &&
                !detectedExtension.isBlank()) {

            extension =
                    "." + detectedExtension;
        }

        String uniqueFileName =
                UUID.randomUUID() + extension;

        String storagePath =
                "rooms/" +
                        joinCode.toUpperCase() +
                        "/" +
                        uniqueFileName;

        ByteArrayResource resource =
                new ByteArrayResource(file.getBytes()) {

                    @Override
                    public String getFilename() {
                        return uniqueFileName;
                    }
                };

        String contentType =
                file.getContentType();

        if (contentType == null ||
                contentType.isBlank()) {

            contentType =
                    MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String uploadUrl =
                "/storage/v1/object/" +
                        config.getBucket() +
                        "/" +
                        storagePath;

        restClient
                .post()
                .uri(uploadUrl)
                .header(
                        "Authorization",
                        "Bearer " +
                                config.getServiceKey()
                )
                .header(
                        "apikey",
                        config.getServiceKey()
                )
                .header(
                        "x-upsert",
                        "false"
                )
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .body(resource)
                .retrieve()
                .toBodilessEntity();

        return storagePath;
    }
}