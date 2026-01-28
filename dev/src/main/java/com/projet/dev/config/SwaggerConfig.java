package com.projet.dev.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API S.G.E.S")
                        .version("1.0")
                        .description("Documentation de l'API REST avec Swagger / OpenAPI")
                        .contact(new Contact()
                                .name("SERVICE KING DIGITAL")
                                .email("ton.email@example.com")
                                .url("https://ton-site-web.com")
                        )
                );
    }
}
