package com.giftmart.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Structured address from reverse geocoding (live location / map pin). */
public class ReversedAddress {

    private String street = "";
    private String city = "";
    private String district = "";
    private String state = "";
    private String zip = "";
    private String country = "";
    private String formattedAddress = "";

    /**
     * True when reverse geocode could not fill city/district/province — user should complete address manually.
     */
    public boolean isIncomplete() {
        boolean noCity = city == null || city.isBlank();
        boolean noDistrict = district == null || district.isBlank();
        boolean noState = state == null || state.isBlank();
        return noCity && noDistrict && noState;
    }

    public Map<String, String> toMap() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("street", street != null ? street : "");
        m.put("city", city != null ? city : "");
        m.put("district", district != null ? district : "");
        m.put("state", state != null ? state : "");
        m.put("province", state != null ? state : "");
        m.put("zip", zip != null ? zip : "");
        m.put("country", country != null ? country : "");
        m.put("formattedAddress", formattedAddress != null ? formattedAddress : "");
        return m;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getFormattedAddress() {
        return formattedAddress;
    }

    public void setFormattedAddress(String formattedAddress) {
        this.formattedAddress = formattedAddress;
    }
}
