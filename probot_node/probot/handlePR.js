module.exports = {
    async assigneeAdd (context, owner){
        const comment = context.issue({ body: 'Thank you for opening the pull request' });
        
        const addAssigneeParams = context.issue({ assignees: [owner] })
        await context.octokit.issues.addAssignees(addAssigneeParams);
        await context.octokit.issues.createComment(comment);
    },

    async getTeams(context, orgs, repo){
        const list = await context.octokit.repos.listTeams({
            owner: orgs,
            repo: repo,
        });

        const teams_arr = [];
        list.data.forEach(item => {
            teams_arr.push(item.slug)
        });

        return teams_arr;
    },

    async getUsers(context, orgs, repo){
        const users = await context.octokit.repos.listCollaborators({
            owner: orgs,
            repo: repo,
            affiliation: 'direct'
        });
        
        const reviewers = [];
        users.data.forEach(item => {
            reviewers.push(item.login);
        
        })

        return reviewers;
    },

    async handlePullRequest(context){

        const owner = context.payload.pull_request.user.login;
        const orgs =  context.payload.organization.login;
        const repo = context.payload.repository.name; 

        module.exports.assigneeAdd(context, owner);
        const team_arr = await module.exports.getTeams(context, orgs, repo);
        const reviewers = await module.exports.getUsers(context, orgs, repo);

        
        team_arr.forEach( async team => {
            const teamMembers = await context.octokit.teams.listMembersInOrg({
              org: orgs,
              team_slug: team,
            //   role: 'maintainer'
            });
    
            teamMembers.data.forEach(item => {
                const reviewer = item.login;
                
                if(reviewer !== owner){
                    reviewers.push(reviewer)
                }   
            })
          
            if(reviewers.length > 0){
                const params = context.pullRequest({reviewers: reviewers});
                await context.octokit.pulls.requestReviewers(params);
            }
          
        });

    }
}