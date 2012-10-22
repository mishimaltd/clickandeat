package com.ezar.clickandeat.repository;

import com.ezar.clickandeat.maps.GeoLocationService;
import com.ezar.clickandeat.model.*;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.junit.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.List;
import java.util.Map;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/application-context.xml"})
public class RestaurantSearchTest {

    private static final Logger LOGGER = Logger.getLogger(RestaurantSearchTest.class);
    
    @Autowired
    private RestaurantRepository repository;

    @Autowired
    private GeoLocationService locationService;

    private String restaurantId = "testrestaurant";

    @Before
    public void setup() throws Exception {

        removeRestaurant(restaurantId);
        
        Restaurant restaurant = repository.create();
        restaurant.setRestaurantId(restaurantId);
        restaurant.setName("Test Restaurant");
        
        Person mainContact = new Person();
        mainContact.setFirstName("test");
        mainContact.setLastName("owner");
        restaurant.setMainContact(mainContact);
        
        Address address = new Address();
        address.setPostCode("E18 2LG");
        address.setTown("London");
        restaurant.setAddress(address);

        restaurant.getCuisines().add("Mexican");
        restaurant.getCuisines().add("Chinese");
        
        DeliveryOptions deliveryOptions = new DeliveryOptions();
        deliveryOptions.setDeliveryRadiusInKilometres(3d) ;
        deliveryOptions.getAreasDeliveredTo().add("E17");
        deliveryOptions.getAreasDeliveredTo().add("E6");
        restaurant.setDeliveryOptions(deliveryOptions);

        OpeningTimes openingTimes = new OpeningTimes();
        openingTimes.getClosedDates().add(new LocalDate(2012,12,1));
        restaurant.setOpeningTimes(openingTimes);
        repository.saveRestaurant(restaurant);
        LOGGER.debug("Saved restaurant");
        
    }

    
    @After
    public void tearDown() throws Exception {
        removeRestaurant(restaurantId);        
    }
    
    
    private void removeRestaurant(String restaurantId) throws Exception {
        Restaurant restaurant = repository.findByRestaurantId(restaurantId);
        if( restaurant != null ) {
            repository.deleteRestaurant(restaurant);
        }
    }


    @Test
    public void testGetCuisineCountByLocation() throws Exception {
        Map<String,Integer> results = repository.getCuisineCountByLocation("London");
        Assert.assertTrue(results.size() > 0);
    }


    @Test
    @Ignore
    public void testGetLocationCountByCuisine() throws Exception {
        Map<String,Integer> results = repository.getLocationCountByCuisine("Mexican");
        Assert.assertTrue(results.size() > 0);
    }
    
    
}
