package com.nithin.student_management_system.processor;


import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AddressPreprocessor {

    private static final Map<String, String> ABBREVIATIONS = Map.of(
            "hyd", "hyderabad",
            "ts", "telangana",
            "ap", "andhra pradesh",
            "st", "street",
            "rd", "road"
    );

    public String preprocess(String rawAddress){
        if(rawAddress == null || rawAddress.isBlank()){
            return "";
        }

        String cleanedAddress = rawAddress.toLowerCase();

        // Remove unnecessary punctuation
        cleanedAddress = cleanedAddress.replaceAll("[^a-z0-9\\s]", " ");

        // Normalize spaces
        cleanedAddress = cleanedAddress.replaceAll("\\s+", " ").trim();

        // Normalize common abbreviations
        String[] words = cleanedAddress.split(" ");

        StringBuilder normalizedAddress = new StringBuilder();

        for (String word : words) {

            if (ABBREVIATIONS.containsKey(word)) {
                normalizedAddress.append(ABBREVIATIONS.get(word));
            } else {
                normalizedAddress.append(word);
            }

            normalizedAddress.append(" ");
        }

        return normalizedAddress.toString().trim();
    }
}
