package com.ezar.clickandeat.model;

import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Document(collection="addresses")
public class Address extends PersistentObject {

    private String address1;

    private String address2;

    private String address3;

    private String town;
    
    private String region;

    private String postCode;

    @GeoSpatialIndexed
    private double[] location;


    public Address() {
    }


    /**
     * @param address1
     * @param address2
     * @param address3
     * @param town
     * @param region
     * @param postCode
     */

    public Address(String address1, String address2, String address3, String town, String region, String postCode) {
        this.address1 = address1;
        this.address2 = address2;
        this.address3 = address3;
        this.town = town;
        this.region = region;
        this.postCode = postCode;
    }

    public String getSummary() {
        return StringUtils.collectionToDelimitedString(getAddressItems(), " ");
    }

    public String getDisplaySummary() {
        return StringUtils.collectionToDelimitedString(getAddressItems(), "\n");
    }
    
    private List<String> getAddressItems() {
        List<String> items = new ArrayList<String>();
        if( StringUtils.hasText(address1)) {
            items.add(address1);
        }
        if( StringUtils.hasText(address2)) {
            items.add(address2);
        }
        if(StringUtils.hasText(address3)) {
            items.add(address3);
        }
        if(StringUtils.hasText(town)) {
            items.add(town);
        }
        if(StringUtils.hasText(region)) {
            items.add(region);
        }
        if(StringUtils.hasText(postCode)) {
            items.add(postCode);
        }
        return items;
    }

    
    public String getPostCode() {
        return postCode;
    }

    public void setPostCode(String postCode) {
        this.postCode = postCode;
    }

    public String getAddress1() {
        return address1;
    }

    public void setAddress1(String address1) {
        this.address1 = address1;
    }

    public String getAddress2() {
        return address2;
    }

    public void setAddress2(String address2) {
        this.address2 = address2;
    }

    public String getAddress3() {
        return address3;
    }

    public void setAddress3(String address3) {
        this.address3 = address3;
    }

    public String getTown() {
        return town;
    }

    public void setTown(String town) {
        this.town = town;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public double[] getLocation() {
        return location;
    }

    public void setLocation(double[] location) {
        this.location = location;
    }
}