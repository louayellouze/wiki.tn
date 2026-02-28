package api.tn.wiki.dto.response;

public class UserResponse {
    private Integer id;
    private String username;
    private String email;
    private String lastName;
    private String firstName;
    private String address;
    private String phone;
    private String role;
    private String imageUrl;

    public UserResponse(Integer id, String username, String email, String lastName, String firstName, String address, String phone, String role, String imageUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.address = address;
        this.phone = phone;
        this.role = role;
        this.imageUrl = imageUrl;
    }

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getLastName() { return lastName; }
    public String getFirstName() { return firstName; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getImageUrl() { return imageUrl; }
}
