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
    let reason
    let type_label

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

    if (
      /^\[(BUG|EPC|TSK|FET|USS|REP|DOC|MSC)]:\s[A-Z](?!.*\s{2})\S(?:.*\S){3,}/.test(
        title
      )
    ) {
      if (/^\[BUG]:\s.*/.test(title)) {
        type_label = 'type: BUG'
      } else if (/^\[EPC]:\s.*/.test(title)) {
        type_label = 'type: EPIC'
      } else if (/^\[TSK]:\s.*/.test(title)) {
        type_label = 'type: TASK'
      } else if (/^\[FET]:\s.*/.test(title)) {
        type_label = 'type: FEATURE'
      } else if (/^\[USS]:\s.*/.test(title)) {
        type_label = 'type: USERSTORY'
      } else if (/^\[REP]:\s.*/.test(title)) {
        type_label = 'type: REPOSITORY'
      } else if (/^\[DOC]:\s.*/.test(title)) {
        type_label = 'type: DOCUMENTATION'
      } else {
        type_label = 'type: MISCELLANEOUS'
      }
      if (type_label === 'type: BUG') {
        if (/^### DESCRIPTION\n\n\nDS.*/s.test(body)) {
          console.log('Body Matched')
        } else {
          console.log('Body Not Matched')
        }
      }
    } else {
      action = 'rejected'
      reason = 'title'
    }
    console.log(body)
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
