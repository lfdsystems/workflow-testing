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

    const token = core.getInput('github_token', { required: true })

    const octokit = new github.getOctokit(token)

    console.log(sender)
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
