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
    const title = payload.issue.title
    const body = payload.issue.body

    const token = core.getInput('github_token', { required: true })

    let labels = await getLabelsList(owner, repo, issue_number, token)

    let recreated
    let type
    let state
    let status
    let category
    let action

    if (labels.length === 0) {
      recreated = false
    } else {
      await new Promise(resolve => setTimeout(resolve, 30000))
      labels = await getLabelsList(owner, repo, issue_number, token)
      if (labels.length === 0) {
        recreated = false
      } else {
        labels = labels.map(obj => obj['name'])
        for (const substr of labels) {
          if (substr.includes('type')) {
            const parts = substr.split(':')
            type = parts[1].trim()
          } else if (substr.includes('state')) {
            const parts = substr.split(':')
            state = parts[1].trim()
          } else if (substr.includes('status')) {
            const parts = substr.split(':')
            status = parts[1].trim()
          } else if (substr.includes('category')) {
            const parts = substr.split(':')
            category = parts[1].trim
          }
          if (
            sender === 'bot-lfdsystems' &&
            state === 'TRIAGE' &&
            status === 'RECREATED' &&
            (category === 'DEL-ISSUE' || category === 'TRF-ISSUE')
          ) {
            recreated = true
          } else {
            recreated = false
          }
        }
      }
    }

    if (/^\[(BUG|EPC|TSK|FET|USS|REP|DOC|MSC)]:\s.*/.test(title)) {
      action = 'accepted'
    } else {
      action = 'rejected'
    }

    console.log(action)
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
