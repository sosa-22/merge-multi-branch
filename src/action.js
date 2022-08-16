import fetch from "node-fetch";
const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  try {
    const token = core.getInput("github_token");
    const source_ref = core.getInput("source_ref");
    const commit_message_template = core.getInput("commit_message_template");
    const octokit = github.getOctokit(token);

    const repo = github.context.repo;

    const { data } = await octokit.rest.repos.listBranches({
      owner: repo.owner,
      repo: repo.repo,
    });

    for (const currentBranch of data) {
      let splitBranch = currentBranch.name.split("-");
      if (splitBranch.pop() === "stable") {
        let commitMessage = commit_message_template
          .replace("{source_ref}", source_ref)
          .replace("{target_branch}", currentBranch.name);

        await octokit.rest.repos.merge({
          owner: repo.owner,
          repo: repo.repo,
          base: currentBranch.name,
          head: source_ref,
          commit_message: commitMessage,
        });
      }
    }
  } catch (e) {
    core.setFailed(e.message);
    sendNotificationSlack("#desarrollo", core.getInput("SLACK_WEBHOOK"));
  }
}

async function sendNotificationSlack(channel, slackWedHook) {
  try {
    const payload = {
      channel: channel,
      username: "webhookbot",
      text: "Esto se publica en #desarrollo y procede de un robot llamado webhookbot.",
      icon_emoji: ":ghost:",
    };
    console.log("Antes del APIIIII: ", slackWedHook);
    const rest = await fetch(slackWedHook, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(rest);
    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
