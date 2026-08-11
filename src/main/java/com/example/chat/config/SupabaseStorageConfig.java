package com.example.chat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseStorageConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    public String getSupabaseUrl() {
        return supabaseUrl;
    }

    public String getServiceKey() {
        return serviceKey;
    }

    public String getBucket() {
        return bucket;
    }
}