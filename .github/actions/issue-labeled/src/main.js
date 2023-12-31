const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const payload = github.context.payload

    const sender = payload.sender.login
    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const issue_number = payload.issue.number

    const token = core.getInput('github_token', { required: true })

    const octokit = new github.getOctokit(token)

    const body = `
    ${sender},

    _As per the policy of the Repository, manual application of the Labels is not permitted._
    _Therefore the applied Label(s) are being removed._
    `

    if (sender !== 'bot-lfdsystems') {
      const { data: issue } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body
      })
    }
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
