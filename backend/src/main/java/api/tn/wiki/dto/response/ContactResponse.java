package api.tn.wiki.dto.response;

import api.tn.wiki.entity.ContactStatus;
import java.time.LocalDateTime;

public class ContactResponse {
    private Long id;
    private String subject;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String message;
    private String response;
    private ContactStatus status;
    private LocalDateTime createdAt;

    public ContactResponse() {}

    public ContactResponse(Long id, String subject, String firstName, String lastName, String email, 
                           String phone, String message, String response, ContactStatus status, 
                           LocalDateTime createdAt) {
        this.id = id;
        this.subject = subject;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.message = message;
        this.response = response;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public ContactStatus getStatus() { return status; }
    public void setStatus(ContactStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
