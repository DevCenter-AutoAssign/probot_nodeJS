const { handlePullRequest } = require('./handlePR');

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

module.exports = (app) => {
    app.on("pull_request.opened", handlePullRequest);
    
}



    
 

 
