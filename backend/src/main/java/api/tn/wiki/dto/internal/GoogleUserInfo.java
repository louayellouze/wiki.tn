package api.tn.wiki.dto.internal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GoogleUserInfo {
    private String email;
    
    @JsonProperty("email_verified")
    private boolean emailVerified;
    
    private String name;
    
    @JsonProperty("given_name")
    private String givenName;
    
    @JsonProperty("family_name")
    private String familyName;
    
    private String picture;
    private String sub; 
    private String aud; 

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGivenName() { return givenName; }
    public void setGivenName(String givenName) { this.givenName = givenName; }

    public String getFamilyName() { return familyName; }
    public void setFamilyName(String familyName) { this.familyName = familyName; }

    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }

    public String getSub() { return sub; }
    public void setSub(String sub) { this.sub = sub; }

    public String getAud() { return aud; }
    public void setAud(String aud) { this.aud = aud; }
}
