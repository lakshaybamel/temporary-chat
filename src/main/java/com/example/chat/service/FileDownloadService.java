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

        String response =
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
                        .header(
                                "Accept",
                                MediaType.APPLICATION_JSON_VALUE
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
                        .body(String.class);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException(
                    "Unable to generate signed URL."
            );
        }

        response = response.trim();

        /*
         * Expected Supabase response:
         * {"signedURL":"/object/sign/chat-files/..."}
         *
         * The response may sometimes be returned as
         * text/plain, so we read it as String instead
         * of expecting JSON content type.
         */
        String signedUrl = null;

        if (response.contains("\"signedURL\"")) {

            int keyStart =
                    response.indexOf("\"signedURL\"");

            int colon =
                    response.indexOf(":", keyStart);

            int valueStart =
                    response.indexOf("\"", colon);

            int valueEnd =
                    response.indexOf("\"", valueStart + 1);

            if (valueStart != -1 && valueEnd != -1) {

                signedUrl =
                        response.substring(
                                valueStart + 1,
                                valueEnd
                        );
            }
        }

        /*
         * Fallback in case Supabase returns the signed
         * path directly as plain text.
         */
        if (signedUrl == null
                && response.startsWith("/object/sign/")) {

            signedUrl = response;
        }

        if (signedUrl == null || signedUrl.isBlank()) {

            throw new IllegalStateException(
                    "Signed URL was not returned. Supabase response: "
                            + response
            );
        }

        return config.getSupabaseUrl()
                + "/storage/v1"
                + signedUrl;
    }
}