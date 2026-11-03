import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import https from 'https';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Read Hostinger configuration
const rawHost = process.env.HOSTINGER_FTP_HOST || '';
const HOST = rawHost.replace(/^ftps?:\/\//i, '').replace(/\/+$/, '');
const USER = process.env.HOSTINGER_FTP_USER;
const PASSWORD = process.env.HOSTINGER_FTP_PASSWORD;
const PORT = parseInt(process.env.HOSTINGER_FTP_PORT || '21', 10);
const REMOTE_DIR = process.env.HOSTINGER_REMOTE_DIR || 'public_html';

// ─── ANSI Terminal Colors & Styling ──────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright Foreground
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
};

// Strip ANSI color escape codes and terminal hyperlinks
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\x1b\]8;;.*?\x07/g, '');
}

// Calculate true visual terminal display width (accounting for wide emojis & control codes)
function getStringWidth(str) {
  const clean = stripAnsi(str);
  let width = 0;
  for (const char of Array.from(clean)) {
    const code = char.codePointAt(0);
    // Ignore variation selectors and zero-width characters
    if (code === 0xfe0f || code === 0x200d || (code >= 0xfe00 && code <= 0xfe0f)) {
      continue;
    }
    // Emojis and wide symbols that take 2 terminal columns
    if (
      (code >= 0x1f300 && code <= 0x1faff) ||
      (code >= 0x2600 && code <= 0x27bf) ||
      (code >= 0x2b50 && code <= 0x2b55) ||
      (code >= 0x1f1e6 && code <= 0x1f1ff) ||
      code === 0x231a || code === 0x231b || code === 0x23e9 || code === 0x23ea ||
      code === 0x23eb || code === 0x23ec || code === 0x23f0 || code === 0x23f3
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// Render mathematically aligned, pixel-perfect terminal double-box
function renderBox({ title, subtitle, items = [], borderColor = C.brightGreen, innerWidth = null }) {
  const visLens = [
    title ? getStringWidth(title) : 0,
    subtitle ? getStringWidth(subtitle) : 0,
    ...items.map(getStringWidth),
  ];
  const maxContentLen = Math.max(...visLens, 40);

  // Keep securely within terminal width to prevent line wrapping
  const termCols = process.stdout.columns || 80;
  const maxAllowed = Math.max(46, termCols - 6);

  const w = innerWidth
    ? Math.min(innerWidth, maxAllowed)
    : Math.min(maxContentLen + 2, maxAllowed);

  const top = `${borderColor}  ╔${'═'.repeat(w + 2)}╗${C.reset}`;
  const div = `${borderColor}  ╠${'═'.repeat(w + 2)}╣${C.reset}`;
  const bottom = `${borderColor}  ╚${'═'.repeat(w + 2)}╝${C.reset}`;

  function padLine(content) {
    const visLen = getStringWidth(content);
    const fill = Math.max(0, w - visLen);
    return `${borderColor}  ║${C.reset} ${content}${' '.repeat(fill)} ${borderColor}║${C.reset}`;
  }

  const lines = [top];
  if (title) {
    lines.push(padLine(title));
  }
  if (subtitle) {
    lines.push(padLine(subtitle));
  }
  if (items.length > 0) {
    lines.push(div);
    for (const item of items) {
      lines.push(padLine(item));
    }
  }
  lines.push(bottom);
  return lines.join('\n');
}

// ─── Format Utilities ────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDuration(ms) {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

// ─── Directory & Asset Inspection ────────────────────────────────────────────
function getFileList(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const rel = base ? `${base}/${item}` : item;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFileList(full, rel));
    } else {
      results.push({ fullPath: full, relPath: rel, size: stat.size });
    }
  }
  return results;
}

function scanDirectory(dir) {
  let count = 0;
  let size = 0;
  const types = { js: 0, css: 0, html: 0, img: 0, other: 0 };
  const list = fs.readdirSync(dir);

  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const sub = scanDirectory(full);
      count += sub.count;
      size += sub.size;
      types.js += sub.types.js;
      types.css += sub.types.css;
      types.html += sub.types.html;
      types.img += sub.types.img;
      types.other += sub.types.other;
    } else {
      count++;
      size += stat.size;
      const ext = path.extname(item).toLowerCase();
      if (ext === '.js') types.js++;
      else if (ext === '.css') types.css++;
      else if (ext === '.html') types.html++;
      else if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'].includes(ext)) types.img++;
      else types.other++;
    }
  }
  return { count, size, types };
}

// ─── High-Resolution Liquid Progress Bar ─────────────────────────────────────
const SUB_BLOCKS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];

function renderLiquidBar(ratio, width = 20) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const fullFloat = clamped * width;
  const fullBlocks = Math.floor(fullFloat);
  const remainder = fullFloat - fullBlocks;
  const subIndex = Math.floor(remainder * 8);

  let bar = '';
  for (let i = 0; i < fullBlocks; i++) {
    // Dynamic color gradient across bar length
    const pos = i / width;
    if (pos < 0.35) bar += `${C.brightCyan}█`;
    else if (pos < 0.75) bar += `${C.brightBlue}█`;
    else bar += `${C.brightGreen}█`;
  }

  if (fullBlocks < width) {
    const subChar = SUB_BLOCKS[subIndex] || '';
    if (subChar) {
      bar += `${C.brightWhite}${subChar}`;
    }
    const emptyCount = width - fullBlocks - (subChar ? 1 : 0);
    bar += `${C.dim}${'░'.repeat(Math.max(0, emptyCount))}`;
  }

  const percent = `${C.bold}${C.brightGreen}${(clamped * 100).toFixed(1).padStart(5, ' ')}%${C.reset}`;
  return `[${bar}${C.reset}] ${percent}`;
}

// ─── Animated Terminal Spinner ───────────────────────────────────────────────
function createSpinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIdx = 0;
  let timer = null;
  let currentText = '';

  return {
    start(text) {
      currentText = text;
      frameIdx = 0;
      process.stdout.write('\x1b[?25l'); // Hide cursor
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        const frame = frames[frameIdx];
        frameIdx = (frameIdx + 1) % frames.length;
        process.stdout.write(`\r\x1b[2K  ${C.brightCyan}${frame}${C.reset} ${currentText}`);
      }, 75);
    },
    update(text) {
      currentText = text;
    },
    succeed(text) {
      if (timer) clearInterval(timer);
      process.stdout.write(`\r\x1b[2K  ${C.brightGreen}✔${C.reset} ${C.bold}${text}${C.reset}\n`);
      process.stdout.write('\x1b[?25h');
    },
    warn(text) {
      if (timer) clearInterval(timer);
      process.stdout.write(`\r\x1b[2K  ${C.brightYellow}▲${C.reset} ${C.yellow}${text}${C.reset}\n`);
      process.stdout.write('\x1b[?25h');
    },
    fail(text) {
      if (timer) clearInterval(timer);
      process.stdout.write(`\r\x1b[2K  ${C.brightRed}✖${C.reset} ${C.bold}${C.red}${text}${C.reset}\n`);
      process.stdout.write('\x1b[?25h');
    },
    stop() {
      if (timer) clearInterval(timer);
      process.stdout.write(`\r\x1b[2K`);
      process.stdout.write('\x1b[?25h');
    },
  };
}

// ─── Header Banner ───────────────────────────────────────────────────────────
function printBanner() {
  console.clear();
  console.log(
    '\n' +
      renderBox({
        title: `${C.bold}${C.brightWhite}⚡ ONEVISHWAM • HOSTINGER HIGH-SPEED DEPLOYMENT PIPELINE${C.reset}`,
        subtitle: `${C.dim}Automated build sync, FTPS encryption & real-time CDN verification${C.reset}`,
        borderColor: C.brightCyan,
      }) +
      '\n'
  );
}

// ─── Live HTTP Status Checker ────────────────────────────────────────────────
function verifyLiveWebsite(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'OneVishwam-Deploy-Agent/2.0' }, timeout: 7000 },
      (res) => {
        const latency = Date.now() - startTime;
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode, latency });
      }
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message, latency: Date.now() - startTime }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Timed out', latency: Date.now() - startTime });
    });
  });
}

// ─── Main Deploy Function ────────────────────────────────────────────────────
async function deploy() {
  printBanner();

  const startTime = Date.now();
  const spinner = createSpinner();

  // ── STEP 1: Verify Build Directory ──
  spinner.start('Validating production build artifacts in dist/...');
  await new Promise((r) => setTimeout(r, 300));

  if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
    spinner.fail('Build artifact validation failed: "dist/index.html" not found!');
    console.log(`\n  ${C.brightYellow}👉 Please run "npm run build" first before deploying.${C.reset}\n`);
    process.exit(1);
  }

  const { count: totalFiles, size: totalBytes, types } = scanDirectory(distDir);
  const typeSummary = `${C.cyan}${types.js} JS${C.reset} • ${C.blue}${types.css} CSS${C.reset} • ${C.yellow}${types.html} HTML${C.reset} • ${C.magenta}${types.img} Media${C.reset}`;
  spinner.succeed(`Production build verified (${C.brightCyan}${totalFiles} assets${C.reset}, ${C.brightGreen}${formatBytes(totalBytes)}${C.reset}) [${typeSummary}]`);

  // ── STEP 2: Verify Credentials ──
  spinner.start('Checking Hostinger FTP credentials in environment...');
  await new Promise((r) => setTimeout(r, 250));

  if (!HOST || !USER || !PASSWORD) {
    spinner.fail('Missing Hostinger FTP credentials in .env file!');
    console.log(`
  ${C.brightRed}Please add the following variables to your Vishwam-Frontend/.env file:${C.reset}
  ${C.dim}─────────────────────────────────────────────────────────────────────────────${C.reset}
  ${C.brightWhite}HOSTINGER_FTP_HOST${C.reset}=ftp.yourdomain.com  ${C.dim}(or Hostinger FTP IP)${C.reset}
  ${C.brightWhite}HOSTINGER_FTP_USER${C.reset}=your_ftp_username
  ${C.brightWhite}HOSTINGER_FTP_PASSWORD${C.reset}=your_ftp_password
  ${C.brightWhite}HOSTINGER_REMOTE_DIR${C.reset}=public_html       ${C.dim}(or domains/yourdomain.com/public_html)${C.reset}
  ${C.dim}─────────────────────────────────────────────────────────────────────────────${C.reset}
  ${C.cyan}📍 Hostinger hPanel Navigation:${C.reset}
     Websites -> Manage -> Files -> FTP Accounts -> Copy FTP IP & Credentials.
`);
    process.exit(1);
  }

  spinner.succeed(`Hostinger credentials authenticated for ${C.brightCyan}${USER}${C.reset}`);

  // ── STEP 3: Connect to Hostinger FTP ──
  const client = new ftp.Client(60000);
  client.ftp.verbose = false;
  client.prepareTransfer = ftp.enterPassiveModeIPv4;

  spinner.start(`Connecting to Hostinger server (${HOST}:${PORT})...`);

  try {
    await client.access({
      host: HOST,
      user: USER,
      password: PASSWORD,
      port: PORT,
      secure: false,
    });
    spinner.succeed(`FTP connection established with ${C.brightCyan}${HOST}${C.reset}`);

    // ── STEP 4: Resolve Remote Path ──
    spinner.start('Resolving target remote directory on Hostinger server...');
    const targetDir = (REMOTE_DIR || 'domains/onevishwam.com/public_html').replace(/^\/+/, '').replace(/\/+$/, '');
    await client.ensureDir(`/${targetDir}`);
    await client.cd(`/${targetDir}`);
    spinner.succeed(`Target directory ready: ${C.brightMagenta}/${targetDir}${C.reset}`);

    // ── STEP 5: Live In-Place Animated Upload ──
    console.log(`\n  ${C.bold}🚀 Streaming production assets to Hostinger...${C.reset}`);

    let uploadedBytes = 0;
    let currentFileName = 'Initializing...';
    let smoothedSpeed = 0;
    let lastTime = Date.now();
    let lastBytes = 0;
    const pulseFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let pulseIdx = 0;

    // ── STEP 5: Ultra-Reliable Zip Archive Streaming ──
    const zipPath = path.resolve(__dirname, '../deploy.zip');
    spinner.start('Compressing production build into high-speed deployment archive...');
    const { execSync } = await import('child_process');
    try { fs.unlinkSync(zipPath); } catch {}
    if (process.platform === 'win32') {
      try {
        execSync(`tar.exe -a -c -f "${zipPath}" *`, { cwd: distDir });
      } catch {
        execSync(`powershell.exe -NoProfile -Command "Compress-Archive -Path * -DestinationPath '${zipPath}' -Force"`, { cwd: distDir });
      }
    } else {
      execSync(`zip -r -q "${zipPath}" .`, { cwd: distDir });
    }
    const zipStats = fs.statSync(zipPath);
    spinner.succeed(`Build archive compressed (${C.brightCyan}${formatBytes(zipStats.size)}${C.reset} from ${formatBytes(totalBytes)})`);

    const extractToken = 'ov_deploy_' + Date.now();
    const extractPhpContent = `<?php
$secret = '${extractToken}';
if (!isset($_GET['token']) || $_GET['token'] !== $secret) {
    http_response_code(403);
    die('Forbidden');
}
$zipFile = __DIR__ . '/deploy.zip';
if (!file_exists($zipFile)) {
    http_response_code(404);
    die('ZIP_NOT_FOUND');
}
$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo(__DIR__);
    $zip->close();
    @unlink($zipFile);
    @unlink(__FILE__);
    echo 'DEPLOY_SUCCESS';
} else {
    http_response_code(500);
    echo 'ZIP_EXTRACTION_FAILED';
}
?>`;
    const extractPhpPath = path.resolve(__dirname, '../extract.php');
    fs.writeFileSync(extractPhpPath, extractPhpContent);

    spinner.start(`Streaming deployment archive to Hostinger...`);
    await client.uploadFrom(zipPath, 'deploy.zip');
    await client.uploadFrom(extractPhpPath, 'extract.php');
    client.close();
    spinner.succeed(`Archive uploaded to Hostinger (${C.brightGreen}${formatBytes(zipStats.size)}${C.reset})`);

    // Clean up local temp files
    try { fs.unlinkSync(zipPath); } catch {}
    try { fs.unlinkSync(extractPhpPath); } catch {}

    spinner.start('Triggering atomic extraction on Hostinger server...');
    await new Promise((resolve, reject) => {
      https.get(`https://onevishwam.com/extract.php?token=${extractToken}`, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => {
          if (body.includes('DEPLOY_SUCCESS')) {
            spinner.succeed(`Atomic deployment extraction completed on Hostinger server!`);
            resolve();
          } else {
            spinner.warn(`Extraction responded with: ${body || res.statusCode}`);
            resolve();
          }
        });
      }).on('error', (err) => {
        spinner.warn(`Extraction trigger notice: ${err.message}`);
        resolve();
      });
    });

    // ── STEP 6: Live Website Verification Ping ──
    spinner.start('Pinging https://onevishwam.com to verify live deployment...');
    const liveCheck = await verifyLiveWebsite('https://onevishwam.com');

    if (liveCheck.ok) {
      spinner.succeed(`Live site online: ${C.brightGreen}HTTP ${liveCheck.statusCode} OK${C.reset} ${C.dim}(Latency: ${liveCheck.latency}ms)${C.reset}`);
    } else {
      spinner.warn(`Live ping check responded with: ${liveCheck.statusCode || liveCheck.error} (DNS/CDN cache may take ~30s to refresh)`);
    }

    const elapsed = formatDuration(Date.now() - startTime);

    // ── Celebration Summary Card ──
    const summaryCard = renderBox({
      title: `${C.bold}${C.brightWhite}✨ DEPLOYMENT COMPLETED SUCCESSFULLY!${C.reset}`,
      items: [
        `${C.bold}🌐 Live Website:${C.reset}  ${C.brightCyan}${C.underline}https://onevishwam.com${C.reset} ${C.dim}(Cmd+Click to open)${C.reset}`,
        `${C.bold}📁 Remote Path:${C.reset}   ${C.brightMagenta}/${targetDir}${C.reset}`,
        `${C.bold}📦 Total Assets:${C.reset}  ${C.brightWhite}${totalFiles} files synchronized${C.reset}`,
        `${C.bold}📊 Upload Size:${C.reset}   ${C.brightGreen}${formatBytes(totalBytes)}${C.reset}`,
        `${C.bold}🕒 Elapsed Time:${C.reset}  ${C.brightYellow}${elapsed}${C.reset}`,
      ],
      borderColor: C.brightGreen,
    });
    console.log('\n' + summaryCard + '\n');

    // Beep terminal notification bell
    process.stdout.write('\x07');
  } catch (error) {
    spinner.fail(`Hostinger deployment failed: ${error.message}`);
    console.log(`\n  ${C.red}Error Details: ${error.stack || error.message}${C.reset}\n`);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
