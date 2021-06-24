import { Octokit } from "octokit"
import dotenv from 'dotenv'

// GET new content from args
const myargs = process.argv.slice(2)
const newContent = myargs[0] || "# EMPTY CONTENT"
const command = "# RUN in terminal node index.js 'YOUR MESSAGE'"


dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const response  = await octokit.request('/user')
const user = response.data.login
const repo = 'octokit-try'



async function run() {
	console.log(`Logged in as ${(user)}`)

	console.log("######### GETTING README ##########")
	const {content, sha} = await getReadme()
	console.log("##########GOT README###########")	
	console.log("########## UPDDATING README #######")

	await updateReadme(command + '\n' +newContent, sha)

	console.log("CHECK in remote repo, it should be updated....")
}

run();

async function getReadme() {
	// get the README
	const { data: readme } = await octokit.request(
	  'GET /repos/{owner}/{repo}/contents/{path}',
	  {
	    owner: user,
	    repo: repo,
	    path: 'README.md',
	  },
	);

	const content = Buffer.from(readme.content, 'base64').toString();

	return {content, sha: readme.sha}
}

async function updateReadme(new_content, sha) {
	const response = await octokit.request(
	  'PUT /repos/{owner}/{repo}/contents/{path}',
	  {
	    owner: user,
	    repo: repo,
	    path: 'README.md',
	    message: 'BOOP',
	    content: Buffer.from(new_content, 'utf8').toString('base64'),
	    sha: sha,
	  },
	);
}
