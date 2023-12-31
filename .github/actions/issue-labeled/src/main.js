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
    const label_name = payload.label.name

    let url_label_name = label_name

    url_label_name = url_label_name.replace(':', '%3A')
    url_label_name = url_label_name.replace(' ', '%20')

    const token = core.getInput('github_token', { required: true })

    const octokit = new github.getOctokit(token)

    const body = `
**${sender}**,

_As per the policy of the Repository, manual application of label is **NOT** permitted._
_Therefore the applied label ${payload.repository.html_url}/labels/${label_name} is removed._
`

    if (sender !== 'bot-lfdsystems') {
      const { data: comment } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body
      })
      const { data: unlabel } = await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number,
        name: label_name
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
