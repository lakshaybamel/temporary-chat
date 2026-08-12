package com.example.chat.service;

import com.example.chat.config.SupabaseStorageConfig;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class FileDownloadService {

    private final SupabaseStorageConfig config;
    private final RestClient restClient;

    public FileDownloadService(
            SupabaseStorageConfig config) {

        this.config = config;

        this.restClient =
                RestClient
                        .builder()
                        .baseUrl(config.getSupabaseUrl())
                        .build();
    }

    public String createSignedUrl(
            String filePath,
            int expiresInSeconds) {

        String endpoint =
                "/storage/v1/object/sign/"
                        + config.getBucket()
                        + "/"
                        + filePath;

        Map<String, Object> response =
                restClient
                        .post()
                        .uri(endpoint)
                        .header(
                                "Authorization",
                                "Bearer "
                                        + config.getServiceKey()
                        )
                        .header(
                                "apikey",
                                config.getServiceKey()
                        )
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .body(
                                Map.of(
                                        "expiresIn",
                                        expiresInSeconds
                                )
                        )
                        .retrieve()
                        .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "Unable to generate signed URL."
            );
        }

        Object signedUrl =
                response.get("signedURL");

        if (signedUrl == null) {
            throw new IllegalStateException(
                    "Signed URL was not returned."
            );
        }

        return config.getSupabaseUrl()
                + "/storage/v1"
                + signedUrl;
    }
}