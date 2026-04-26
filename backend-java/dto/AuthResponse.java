package com.giftmart.dto;

import java.util.Map;

// response body for login and register - contains jwt token and user info
public class AuthResponse {

    private String token; // jwt token
    private Map<String, Object> user; // user details

    public AuthResponse(String token, Map<String, Object> user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Map<String, Object> getUser() { return user; }
    public void setUser(Map<String, Object> user) { this.user = user; }
}
