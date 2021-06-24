import { Octokit } from "octokit"
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file"
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import dotenv from 'dotenv'

// GET new content from args
const myargs = process.argv.slice(2)
const newContent = myargs[0] || "# EMPTY CONTENT"
const command = "# RUN in terminal node index.js 'YOUR MESSAGE'"


// dotenv.config()
// const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
// const response  = await octokit.request('/user')
// const user = response.data.login
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



async function plugin_run() {
	const MyOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
						  userAgent: 'Octokit TRY',
						});;
	const octokit = new MyOctokit({ 
		authStrategy: createOAuthDeviceAuth,
		auth: {
				clientType: 'oauth-app',
				clientId: 'ec93e5829bf9f4b977f4',
				scopes: ['public_repo'],
				onVerification(verification) {
				  // verification example
				  // {
				  //   device_code: "3584d83530557fdd1f46af8289938c8ef79f9dc5",
				  //   user_code: "WDJB-MJHT",
				  //   verification_uri: "https://github.com/login/device",
				  //   expires_in: 900,
				  //   interval: 5,
				  // };

				  console.log('Open %s', verification.verification_uri);
				  console.log('Enter code: %s', verification.user_code);
				},
			}
		});

	const { data: user } = await octokit.request('GET /user');
	console.log(`authenticated as ${user.login}`);

	try {
	    await octokit.createOrUpdateTextFile({
	      owner: 'Sagar535',
	      repo: repo,
	      path: 'README.md',
	      message: 'BOOP',
	      content: "# Plugin updates " + newContent,
	    });

	    console.log(`Content update sucesss`);
	  } catch (error) {
	  	console.log("ERROR with update text", error)

	    await octokit
	      .request('POST /repos/{owner}/{repo}/issues', {
	        owner: 'Sagar535',
	        repo: repo,
	        title: 'plz to boop',
	        body: 'I bestow upon you my finest of boops',
	      })
	      .catch((err) => {
	        console.log(err);
	      });

	    // console.log(`issue created at ${issue.html_url}`);
  	}

	// const {
	//   updated,
	// } = await octokit.createOrUpdateTextFile({
	//   owner: user,
	//   repo: repo,
	//   path: "README.md",
	//   content: "# Updated with plugin" + newContent,
	//   message: "update readme",
	// });

	// if (updated) {
	//   console.log("readme updated via asdf");
	// } else {
	//   console.log("readme already up to date");
	// }
}

plugin_run();

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
