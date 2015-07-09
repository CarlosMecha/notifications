
var defaultLogger = require('./logging').default;

var defaultTopic = '_default';

/**
 * Formats the results to a list of notifications.
 * 
 * @param messages Messages.
 * @return Notifications.
 */
function format(messages){
    var notifications = [];
    messages.forEach(function(message) {
        var notification = {};
        notification.payload = message.payload;
        if(message.headers.topic === defaultTopic) {
            delete message.headers.topic;   
        }
        Object.keys(message.headers).forEach(function(attr) {
            notification[attr] = message.headers[attr];
        });
        notifications.push(notification);
    });
    return notifications;
}


/**
 * Configures an application to accept request to the predefined routes.
 *
 * @param app Server application.
 * @param mq MQ Service.
 * @param logger Optional. Logger.
 */
module.exports = function(app, mq, logger) {

    var defaultContentType = 'application/json';
    var logger = logger || defaultLogger;

    /**
     * Gets notifications from an specific topic.
     *
     * @param topic Optional. Topic or all.
     * @param limit Optional [query]. Number of notifications;
     * @param requeue Optional [query]. If it's set, requeues the notifications.
     *
     * @return Array of notifications.
     */
    app.get('/:topic?', function(req, res){
        logger.debug('Received GET %s', req.originalUrl);
        var topic = req.params.topic || defaultTopic;
        var limit = req.query.limit || 1;
        var requeue = new Boolean(req.query.requeue);

        logger.debug('Translated to GET /%s?limit=%d&requeue=%s', topic, limit, requeue);

        function callback(err, results) {
            if(err){
                logger.error(err);
                res.status(500).json({error: err});
            } else {
                logger.debug('Returned from %s, %d results: %j', req.originalUrl, results.length, results, {});
                res.json(format(results));
            }
        }

        if(requeue) {
            mq.consumer.peek(topic, limit, callback);
        } else {
            mq.consumer.get(topic, limit, callback);
        }

    });

    /**
     * Posts a notification.
     *
     * @param topic Notification topic.
     * @param format [Content-Type] Notifacation's format.
     * @param payload [body] Notification's payload.
     *
     */
    app.post('/:topic?', function(req, res){
    
        logger.debug('Received POST %s', req.originalUrl);
        logger.debug('Body %j', req.body, {});
        
        var msg = mq.createMessage({
            topic: req.params.topic || defaultTopic,
            format: req.get('Content-Type') || defaultContentType
        }, req.body);
    
        mq.producer.publish(msg, function(err){
            if(err){
                logger.error(err);
                res.status(500).json({error: err});
            } else {
                logger.debug('Returned OK from %s', req.originalUrl);
                res.json({code: 'OK'});
            }
        });
    });

};

