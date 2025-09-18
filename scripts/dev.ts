import net from "net";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

const stagingUrl = "http://staging.weekview.my";

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

function isPortTaken(port: number) {
    return new Promise<boolean>((res, rej) => {
        const tester = net
            .createServer()
            .once("error", (err) => {
                if ("code" in err && err.code != "EADDRINUSE") return rej(err);
                res(true);
            })
            .once("listening", function () {
                tester.once("close", () => res(false)).close();
            })
            .listen(port);
    });
}

// Small helper to wait for port to be taken
async function waitForPort(timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const taken = await isPortTaken(port);
            if (taken) return true;
        } catch {
            // not ready yet
        }

        await new Promise((r) => setTimeout(r, 500));
    }
    return false;
}

const proc = Bun.spawn(["next", "dev", "--port", String(port)], {
    stdout: "inherit",
    stderr: "inherit",
});

// Check staging after 3000 is up
const ready = await waitForPort();
if (!ready) {
    console.error(
        `${RED}❌ Next.js server did not start on port ${port}${RESET}`,
    );
    proc.kill();
    process.exit(1);
}

try {
    const res = await fetch(stagingUrl, {
        method: "HEAD",
        headers: { "Is-Proxy-Check": "1" },
    });
    if (!res.ok) throw new Error("Bad status: " + res.status);
    console.log(`${GREEN}✔ Proxy is up:${RESET} ${CYAN}${stagingUrl}${RESET}`);
} catch {
    console.log(`${YELLOW}⚠ Could not reach ${stagingUrl}.${RESET}`);
    console.log(`${YELLOW}👉 Did you forget to enable the proxy?${RESET}`);
    console.log(`${CYAN}${stagingUrl}${RESET}`);
}
