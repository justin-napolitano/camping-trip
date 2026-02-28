import { spawn } from "node:child_process";

function getDatabaseUrl() {
  return process.env.DATABASE_URL || "";
}

function dockerizeUrl(dbUrl) {
  return dbUrl
    .replace("@localhost:", "@host.docker.internal:")
    .replace("@127.0.0.1:", "@host.docker.internal:");
}

function hasCommand(name) {
  return new Promise((resolve) => {
    const child = spawn("sh", ["-lc", `command -v ${name} >/dev/null 2>&1`], { env: process.env });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

function runCommand(command, args, stdinText = "") {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: process.env });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    if (stdinText) {
      child.stdin.write(stdinText);
    }
    child.stdin.end();
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function runPsql(sql) {
  return new Promise((resolve, reject) => {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
      reject(new Error("DATABASE_URL is not set"));
      return;
    }
    hasCommand("psql")
      .then((psqlAvailable) => {
        if (psqlAvailable) {
          return runCommand("psql", [dbUrl, "-X", "-v", "ON_ERROR_STOP=1", "-q", "-t", "-A"], sql);
        }

        return hasCommand("docker").then((dockerAvailable) => {
          if (!dockerAvailable) {
            throw new Error("neither psql nor docker is available");
          }
          const dockerUrl = dockerizeUrl(dbUrl);
          return runCommand("docker", ["run", "--rm", "-i", "postgres:16", "psql", dockerUrl, "-X", "-v", "ON_ERROR_STOP=1", "-q", "-t", "-A"], sql);
        });
      })
      .then(resolve)
      .catch(reject);
  });
}

export function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "NULL";
    }
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (Array.isArray(value) || typeof value === "object") {
    const raw = JSON.stringify(value).replace(/'/g, "''");
    return `'${raw}'::jsonb`;
  }

  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}

export function sqlUuid(value) {
  if (!value) {
    return "NULL";
  }
  return `${sqlLiteral(value)}::uuid`;
}

export async function queryJson(sql) {
  const output = await runPsql(sql);
  if (!output) {
    return null;
  }
  return JSON.parse(output);
}

export async function queryRows(sql) {
  const cleaned = String(sql).trim().replace(/;+\s*$/g, "");
  const wrapped = `SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM (${cleaned}) t;`;
  const result = await queryJson(wrapped);
  return Array.isArray(result) ? result : [];
}

export async function executeSql(sql) {
  await runPsql(sql);
}
