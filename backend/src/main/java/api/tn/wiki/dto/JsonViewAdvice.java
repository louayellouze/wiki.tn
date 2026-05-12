package api.tn.wiki.dto;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Automatically selects the Jackson JSON View based on the user's role.
 * Admins and Webmasters get the 'Internal' view (includes IDs), while others get the 'Public' view.
 */
@RestControllerAdvice
public class JsonViewAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        
        // If the return type already has a @JsonView annotation, respect it.
        if (returnType.hasMethodAnnotation(com.fasterxml.jackson.annotation.JsonView.class)) {
            return body;
        }

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WEBMASTER"));

        // Do not wrap raw Strings or primitives to avoid ClassCastException with StringHttpMessageConverter
        if (body instanceof String || body instanceof Number || body instanceof Boolean) {
            return body;
        }

        // Wrap the body in MappingJacksonValue to set the view dynamically
        org.springframework.http.converter.json.MappingJacksonValue mappingJacksonValue = 
                new org.springframework.http.converter.json.MappingJacksonValue(body);

        if (isAdmin) {
            mappingJacksonValue.setSerializationView(Views.Internal.class);
        } else {
            mappingJacksonValue.setSerializationView(Views.Public.class);
        }

        return mappingJacksonValue;
    }
}
