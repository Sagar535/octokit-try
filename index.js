import { Octokit } from "octokit"
import dotenv from 'dotenv'

dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function run() {
	const response  = await octokit.request('/user')

	console.log(`Logged in as ${(response.data.login)}`)
}

run();
