package com.grameencraft.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StoryRequest {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Artisan name is required")
    private String artisanName;

    private String artisanDistrict;
    private String category;
}
