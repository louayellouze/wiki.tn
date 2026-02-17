package api.tn.wiki.dto.response;

import api.tn.wiki.entity.ActionType;
import api.tn.wiki.entity.EntityType;
import api.tn.wiki.entity.Role;

import java.time.LocalDateTime;

public class HistoriqueResponse {
    private Long id;
    private ActionType actionType;
    private EntityType entityType;
    private String details;
    private Long entityId;
    private LocalDateTime actionDate;
    private Integer userId;
    private String username;
    private String userFullName;
    private Role userRole;

    public HistoriqueResponse() {
    }

    public HistoriqueResponse(Long id, ActionType actionType, EntityType entityType, String details, 
                             Long entityId, LocalDateTime actionDate, Integer userId, String username, 
                             String userFullName, Role userRole) {
        this.id = id;
        this.actionType = actionType;
        this.entityType = entityType;
        this.details = details;
        this.entityId = entityId;
        this.actionDate = actionDate;
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.userRole = userRole;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public LocalDateTime getActionDate() {
        return actionDate;
    }

    public void setActionDate(LocalDateTime actionDate) {
        this.actionDate = actionDate;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public Role getUserRole() {
        return userRole;
    }

    public void setUserRole(Role userRole) {
        this.userRole = userRole;
    }
}
