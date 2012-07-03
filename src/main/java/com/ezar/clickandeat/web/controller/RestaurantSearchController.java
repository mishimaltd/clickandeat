package com.ezar.clickandeat.web.controller;

import com.ezar.clickandeat.model.Restaurant;
import com.ezar.clickandeat.model.Search;
import com.ezar.clickandeat.repository.RestaurantRepository;
import com.ezar.clickandeat.repository.SearchRepository;
import com.ezar.clickandeat.util.CuisineProvider;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.*;

@Controller
public class RestaurantSearchController {
    
    private static final Logger LOGGER = Logger.getLogger(RestaurantSearchController.class);
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private SearchRepository searchRepository;

    @Autowired
    private CuisineProvider cuisineProvider;
    
    
    @RequestMapping(value="/search.html", method = RequestMethod.GET)
    public ModelAndView search(@RequestParam(value = "loc", required = false) String location, @RequestParam(value = "c", required = false ) List<String> cuisines,
                                        @RequestParam(value = "s", required = false) String sort, @RequestParam(value = "d", required = false) String dir,
                                        HttpServletRequest request) {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Searching for restaurants serving location: " + location);
        }

        Map<String,Object> model = new HashMap<String,Object>();
                                                            
        Search search = buildSearch(request, location, cuisines, sort, dir);
        
        SortedSet<Restaurant> results = new TreeSet<Restaurant>(new RestaurantSearchComparator());
        results.addAll(restaurantRepository.search(search));
        model.put("results",results);
        model.put("count",results.size());
        model.put("cuisines",cuisineProvider.getCuisineList());
        model.put("search",search);

        return new ModelAndView("results",model);
    }


    /**
     * @param request
     * @return
     */

    private Search buildSearch(HttpServletRequest request, String location, List<String> cuisines, String sort, String dir ) {
        HttpSession session = request.getSession(true);
        String searchId = (String)session.getAttribute("searchid");
        Search search;
        if( searchId == null ) {
            search = searchRepository.create(location,cuisines,sort,dir);
            session.setAttribute("searchid",search.getSearchId());
        }
        else {
            search = searchRepository.findBySearchId(searchId);
            if( search == null ) {
                search = searchRepository.create(location,cuisines,sort,dir);
                session.setAttribute("searchid",search.getSearchId());
            }
            else {
                search.setLocation(location);
                search.setCuisines(cuisines);
                search.setSort(sort);
                search.setDir(dir);
            }
        }
        searchRepository.save(search);
        return search;
    }
    
    
    /**
     * Custom ordering for restaurant search results 
     */
    
    private static final class RestaurantSearchComparator implements Comparator<Restaurant> {

        @Override
        public int compare(Restaurant restaurant1, Restaurant restaurant2) {
            if( restaurant1.isOpenForDelivery() && !restaurant2.isOpenForDelivery()) {
                return -1;                
            }
            else if( !restaurant1.isOpenForDelivery() && restaurant2.isOpenForDelivery()) {
                return 1;
            }
            else {
                double distanceDiff = restaurant1.getDistanceToSearchLocation() - restaurant2.getDistanceToSearchLocation();
                if( distanceDiff == 0 ) {
                    return restaurant1.getName().compareTo(restaurant2.getName());
                }
                else if( distanceDiff < 0 ) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
        }
    }
    
}
