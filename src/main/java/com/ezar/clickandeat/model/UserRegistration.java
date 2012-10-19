package com.ezar.clickandeat.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="registrations")
public class UserRegistration extends PersistentObject { 
    
    private String emailAddress;
    
    private String remoteIpAddress;

    private Double requestedDiscount;
    
    private GeoLocation location;

    public UserRegistration() {
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getRemoteIpAddress() {
        return remoteIpAddress;
    }

    public void setRemoteIpAddress(String remoteIpAddress) {
        this.remoteIpAddress = remoteIpAddress;
    }

    public Double getRequestedDiscount() {
        return requestedDiscount;
    }

    public void setRequestedDiscount(Double requestedDiscount) {
        this.requestedDiscount = requestedDiscount;
    }

    public GeoLocation getLocation() {
        return location;
    }

    public void setLocation(GeoLocation location) {
        this.location = location;
    }
}
