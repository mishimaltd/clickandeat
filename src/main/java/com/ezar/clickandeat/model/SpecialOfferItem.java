package com.ezar.clickandeat.model;

import java.util.ArrayList;
import java.util.List;

public class SpecialOfferItem {

    String title;
    
    String description;
    
    List<String> specialOfferItemChoices;

    public SpecialOfferItem() {
        this.specialOfferItemChoices = new ArrayList<String>();
    }

    public String getTitle() {
        return title;
    }

    public String getNullSafeTitle() {
        return title == null? "null": title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public String getNullSafeDescription() {
        return description == null? "null": description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSpecialOfferItemChoices() {
        return specialOfferItemChoices;
    }

    public void setSpecialOfferItemChoices(List<String> specialOfferItemChoices) {
        this.specialOfferItemChoices = specialOfferItemChoices;
    }
}