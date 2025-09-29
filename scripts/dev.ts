import { $ } from "bun";
import { mkdir } from "fs/promises";
import { createProxyServer } from "http-proxy-3";
import path from "path";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

const stagingHost = "localhost.weekview.my";

const projectRootDir = path.resolve(import.meta.dir + "/..");

const hostname = process.env.HOSTNAME || stagingHost;
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const cmds = [
	"next",
	"dev",
	"--turbopack",
	"--experimental-https",
	"--hostname",
	hostname,
	"--port",
	String(port),
];

const certificatesPath = projectRootDir + "/certificates/localhost.pem";
const keyPath = projectRootDir + "/certificates/localhost-key.pem";

let certificatesExist =
	(await Bun.file(certificatesPath).exists()) &&
	(await Bun.file(keyPath).exists());

if (process.env.WSL_DISTRO_NAME && !certificatesExist) {
	console.log(
		YELLOW +
			"Running in WSL and certificates not found. mkcert needs to be installed on your Windows system to generate self-signed certificates." +
			RESET,
	);
	const which = await $`which mkcert.exe`.quiet().then((r) => r.text().trim());
	if (!which) {
		console.error(
			RED +
				"mkcert.exe not found. Please install mkcert for Windows from https://github.com/FiloSottile/mkcert" +
				RESET,
		);
		process.exit(1);
	}

	console.log(CYAN + "Generating certificates using mkcert..." + RESET);
	await mkdir(`${projectRootDir}/certificates`);
	await $`mkcert.exe -install -key-file ${keyPath} -cert-file ${certificatesPath} ${{ raw: `localhost 127.0.0.1 ::1 ${stagingHost} "*.${stagingHost}"` }}`.cwd(
		projectRootDir,
	);

	console.log(GREEN + "Certificates generated." + RESET);
	certificatesExist = true;
}

if (certificatesExist) {
	cmds.push("--experimental-https-key", keyPath);
	cmds.push("--experimental-https-cert", certificatesPath);
} else {
	console.log(
		YELLOW +
			"Certificates not found. Next.js will generate self-signed certificates, which may not include all necessary SANs." +
			`\nIt is highly recommended to include "*.${stagingHost}" in your trusted certificates.` +
			RESET,
	);

	const readline = await import("readline");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await new Promise((resolve) => {
		rl.question("Do you want to continue? (y/N) ", (ans) => {
			rl.close();
			resolve(ans);
		});
	});

	if (String(answer).toLowerCase() !== "y") {
		console.log(RED + "Aborting." + RESET);
		process.exit(1);
	}
}

Bun.spawn(cmds, {
	cwd: projectRootDir,
	stdout: "inherit",
	stderr: "inherit",
});

createProxyServer({
	target: "http://localhost:8787",
	ssl: {
		key: await Bun.file(keyPath).text(),
		cert: await Bun.file(certificatesPath).text(),
	},
})
	.on("error", (err) => {
		console.error(RED + "Proxy server error:", err.message, RESET);
	})
	.on("proxyRes", (proxyRes, req, res) => {
		console.log(
			CYAN + `[Proxy] ${res.statusCode} ${req.method} ${req.url}` + RESET,
		);
	})
	.listen(3200, "api.localhost.weekview.my");
