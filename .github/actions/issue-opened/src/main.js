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

    let labels = await getLabelsList(owner, repo, issue_number, token)

    let recreated

    if (labels.length === 0) {
      recreated = false
    } else {
      setTimeout(async () => {
        labels = await getLabelsList(owner, repo, issue_number, token)
      }, 30000)
      if (labels.length === 0) {
        recreated = false
      } else {
        labels = labels.map(obj => obj['name'])
      }
    }
    console.log(labels)
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

async function getLabelsList(owner, repo, issue_number, token) {
  try {
    const octokit = new github.getOctokit(token)

    const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number
    })

    return labels
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
