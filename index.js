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
	console.log(content)
	// console.log("########## UPDDATING README #######")

	// await updateReadme(command + '\n' +newContent, sha)

	// console.log("CHECK in remote repo, it should be updated....")
	const response = await getReference()
	console.log(response.data)
	console.log(response.data.object.sha)

	console.log("%%%%%%%%% Creating ref %%%%%%%%")
	const res = await createReferecne(response.data.object.sha, 'some-topic')

	console.log(res.response.data)

	const branchExists = await exists('some-topic')
	console.log(branchExists)
}

run();

// check if branch already exists
async function exists(branch_name) {
	const response = getReference(branch_name)
	return response
}

async function getReadme(ref='master') {
	// get the README
	const { data: readme } = await octokit.request(
	  'GET /repos/{owner}/{repo}/contents/{path}',
	  {
	    owner: user,
	    repo: repo,
	    path: 'README.md',
	    ref: ref
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

async function getReference(ref='master') {
	const response = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
						  owner: user,
						  repo: repo,
						  ref: 'heads/' + ref
						}).catch(err => console.log(err))

	return response
}

async function createReferecne(sha, branch_name) {
	try {
		const response = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
							owner: user,
							repo: repo,
							ref: 'refs/heads/' + branch_name,
							sha: sha
						})

		return response
	} catch(e) {
		if (e.status == 422 && e.message == 'Reference already exists') {
			const response = await getReference('some-topic')
			console.log(response)
			console.log(response.data)
			console.log(response.data.object.sha)

			return { status: 422, message: 'Reference already exists', response: response }
		} else {
			console.log(e.status)
			return e.message
		}
	}
}
