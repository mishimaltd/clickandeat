package com.ezar.clickandeat.model;

import java.util.List;

public class MenuItem {

    private String name;
    
    private String description;
    
    private Double price;

    private List<MenuItemSubType> subTypes;

    private List<MenuItemOption> options;
    
    private boolean allowMultipleOptions;
    
    private Double optionPrice;

    private MenuItemRestriction restriction;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
