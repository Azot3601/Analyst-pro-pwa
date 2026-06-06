import { execFileSync } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  '.serena',
  '.vercel',
  '.codex',
  '.vite',
  '.cache'
]);

const textExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.yml',
  '.yaml',
  '.toml',
  '.txt',
  '.svg',
  '.gitignore'
]);

const secretPatterns = [
  { type: 'private key', pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i },
  { type: 'generic api key assignment', pattern: /\b(?:api[_-]?key|secret|token|password|passwd|pwd)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{16,}/i },
  { type: 'OpenAI-style key', pattern: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { type: 'JWT-like token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { type: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { type: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ }
];

const findings = [];

function rel(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(fullPath);
      continue;
    }

    const info = await stat(fullPath);
    if (entry.name.startsWith('.env') && entry.name !== '.env.example' && entry.name !== '.env.local.example') {
      findings.push({ severity: 'high', file: rel(fullPath), message: 'local env file exists' });
    }

    if (info.size > 5 * 1024 * 1024) {
      findings.push({ severity: 'medium', file: rel(fullPath), message: `large file ${(info.size / 1024 / 1024).toFixed(1)} MB` });
    }

    const ext = path.extname(entry.name);
    if (!textExtensions.has(ext) && entry.name !== '.gitignore') continue;

    const content = await readFile(fullPath, 'utf8').catch(() => '');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      secretPatterns.forEach(({ type, pattern }) => {
        if (pattern.test(line)) {
          findings.push({
            severity: 'high',
            file: `${rel(fullPath)}:${index + 1}`,
            message: `possible ${type}; value intentionally not printed`
          });
        }
      });
    });
  }
}

function checkIgnored(pathToCheck) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', pathToCheck], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

function trackedIgnoredFiles() {
  try {
    const output = execFileSync('git', ['ls-files', '-i', '-c', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8'
    });
    return output
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

await walk(root);

['node_modules/', 'dist/', 'build/', 'coverage/', 'test-results/', 'playwright-report/', '.vercel/', '.env', '.env.local'].forEach((item) => {
  if (!checkIgnored(item)) {
    findings.push({ severity: 'medium', file: '.gitignore', message: `${item} is not ignored` });
  }
});

trackedIgnoredFiles().forEach((file) => {
  findings.push({ severity: 'high', file, message: 'tracked file matches .gitignore' });
});

if (findings.length) {
  console.error('Security scan failed:');
  findings.forEach((finding) => {
    console.error(`[${finding.severity}] ${finding.file} — ${finding.message}`);
  });
  process.exit(1);
}

console.log('Security scan passed: no local env files, likely secrets, tracked ignored files, or unexpected large files found.');
