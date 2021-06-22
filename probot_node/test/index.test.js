const nock = require("nock");
// Requiring our app implementation
const myProbotApp = require("../probot");

// const Context = require('probot')
const {Context, Probot, ProbotOctokit } = require("probot");

// Requiring our fixtures
const payload = require("./fixtures/pull_request.opened");
const teams = require('./fixtures/teams.json')

const fs = require("fs");
const path = require("path");
const { handlePullRequest, assigneeAdd, getTeams, getUsers } = require("../probot/handlePR");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {


  let probot;
  let event;
  let context;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);

    event = {
      id: '123',
      name: 'pull_request',
      payload: {
        action: 'opened',
        number: '1',
        pull_request: {
          number: '1',
          title: 'test',
          user: {
            login: 'pr-creator',
          },
        },
        repository: {
          name: 'auto-assign',
          owner: {
            login: 'kentaro-m',
          },
        },
        organization: {
          login: "testOrg"
        }
      },
      draft: false,
    }

    context = new Context(event, {}, {})
  })


  test('adds author as addAssignees', async () => {
    // MOCKS
    context.octokit.issues = {
      addAssignees: jest.fn().mockImplementation(async () => {}),
      createComment: jest.fn().mockImplementation(async () => {}),
    }
    
    const addAssigneesSpy = jest.spyOn(context.octokit.issues, 'addAssignees')
    const createCommentSpy = jest.spyOn(context.octokit.issues, 'createComment')
    
    await assigneeAdd(context);

    expect(addAssigneesSpy.mock.calls[0][0]?.assignees).toHaveLength(1)
    // expect(addAssigneesSpy.mock.calls[0][0]?.assignees?.[0]).toMatch('pr-creator')
    expect(createCommentSpy.mock.calls[0][0]?.body).toMatch('Thank you for opening the pull request')
 

  })

  // test("get teams", async () => {
  
  //   context.octokit.repos = {
  //     listTeams: jest.fn().mockImplementation(async () => {})
  //   }

  //   const listTeamsSpy = jest.spyOn(context.octokit.repos, 'listTeams')

  //   await getTeams(context)

  //   expect(listTeamsSpy).toHaveBeenCalledWith({
  //     owner: 'testOrg',
  //     repo: 'auto-assign'
  //   })
    
  // })

  // test("get users", async () => {

  //   context.octokit.repos = {
  //     listCollaborators: jest.fn().mockImplementation(async () => {})
  //   }

  //   const listCollaboratorsSpy = jest.spyOn(context.octokit.repos, 'listCollaborators')

  //   await getUsers(context)

  //   expect(listCollaboratorsSpy).toHaveBeenCalledWith({
  //     owner: 'testOrg',
  //     repo: 'auto-assign',
  //     affiliation: 'direct'
  //   })

  // })

  test('add reviewers', async () => {
    // module.exports = {
    //   getTeams: jest.fn().mockImplementation(async () => {})
    // }
    // const getTeamsSpy = jest.spyOn(module.exports, 'getTeams')

    context.octokit.teams = {
      listMembersInOrg : jest.fn().mockImplementation(async () => {})
    }

    const listMembersInOrgSpy = jest.spyOn(context.octokit.teams, 'listMembersInOrg')
    
    await handlePullRequest(context);

    expect(listMembersInOrgSpy).toHaveBeenCalledWith({
      org: orgs,
      team_slug: team
    })

    // expect(getTeamsSpy).toHaveReturned();
   

  })
  
  expect(nock.pendingMocks()).toStrictEqual([]);
  
    afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

