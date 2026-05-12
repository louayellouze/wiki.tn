package api.tn.wiki.dto.response;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
public class UserResponse {
    @JsonView(Views.Internal.class)
    private Integer id;
    private String username;
    private String email;
    private String lastName;
    private String firstName;
    private String address;
    private String phone;
    private String role;
    private String imageUrl;
    private boolean enabled;

    public UserResponse(Integer id, String username, String email, String lastName, String firstName, String address, String phone, String role, String imageUrl, boolean enabled) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.address = address;
        this.phone = phone;
        this.role = role;
        this.imageUrl = imageUrl;
        this.enabled = enabled;
    }

    @JsonView(Views.Internal.class)
    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getLastName() { return lastName; }
    public String getFirstName() { return firstName; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getImageUrl() { return imageUrl; }
    public boolean isEnabled() { return enabled; }
}
