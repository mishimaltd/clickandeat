package com.ezar.clickandeat.scheduling;

import com.ezar.clickandeat.model.Restaurant;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Component
public class MongoKeepAliveTask {
    
    private static final Logger LOGGER = Logger.getLogger(MongoKeepAliveTask.class);

    @Autowired
    private MongoOperations operations;

    @Scheduled(cron="0 0/15 0 * * ?")
    public void execute() throws Exception {
        LOGGER.info("Executing mongo keep alive query");
        Query query = new Query(where("deleted").ne(true));
        long count = operations.count(query,Restaurant.class);
        LOGGER.info("Found " + count + " active restaurants");
    }
}
