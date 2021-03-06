package com.ezar.clickandeat.util;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.CollectionCallback;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Component(value="sequenceGenerator")
public class SequenceGenerator implements InitializingBean {

    private static final Logger LOGGER = Logger.getLogger(SequenceGenerator.class);

    private static final int DEFAULT_BATCH_SIZE = 100;
    
    private static final String COLLECTION_NAME = "sequence";

    private static final String SEQUENCE_PATTERN = "00000000";
    
    private int batchSize = DEFAULT_BATCH_SIZE;
    
    private final Queue<Integer> sequenceQueue = new ConcurrentLinkedQueue<Integer>();
     
    
    @Autowired
    private MongoOperations operations;

    @Override
    public void afterPropertiesSet() throws Exception {

        // Create collection if it does not exist
        DBCollection collection;
        if(!operations.collectionExists(COLLECTION_NAME)) {
            LOGGER.info("Creating collection [" + COLLECTION_NAME + "]");
            collection = operations.createCollection(COLLECTION_NAME);
        }
        else {
            collection = operations.getCollection(COLLECTION_NAME);
        }

        // Check if the key object already exists
        BasicDBObject key = new BasicDBObject();
        key.put("name","sequence");

        // Create object if necessary
        if( collection.findOne(key) == null ) {
            LOGGER.info("Creating sequence key " + key);
            key.put("counter",0);
            collection.save(key);
        }
    }


    /**
     * Returns the next sequence
     * @return
     */
    
    public String getNextSequence() {

        Integer nextSequence;
        
        if( sequenceQueue.size() > 0 ) {
            nextSequence = sequenceQueue.remove();
        }
        else {
            synchronized (sequenceQueue ) {
                
                if( LOGGER.isDebugEnabled()) {
                    LOGGER.debug("Getting next batch of " + batchSize + " sequence ids");
                }
                
                final Query query = query(where("name").is("sequence"));
                final Update update = new Update().inc("counter",batchSize);

                // Get updated object
                Integer nextBatchSequence = operations.execute(COLLECTION_NAME,new CollectionCallback<Integer>() {
                    public Integer doInCollection(DBCollection collection) throws MongoException, DataAccessException {
                        DBObject result = collection.findAndModify(query.getQueryObject(),null,null,false,update.getUpdateObject(),true,false);
                        return (Integer)result.get("counter");
                    }
                });

                for( int i = nextBatchSequence - batchSize + 1; i <= nextBatchSequence; i++ ) {
                    sequenceQueue.add(i);
                }
            }
            return getNextSequence();
        }

        // Return prefixed zeros with sequence id appended
        String prefix = SEQUENCE_PATTERN.substring(0,SEQUENCE_PATTERN.length() - nextSequence.toString().length());
        return prefix + nextSequence.toString();
    }


    @Required
    @Value(value="${sequence.batchsize}")
    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
    }

}
