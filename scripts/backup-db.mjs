import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const rootDir = process.cwd();
const stateDir = path.join(rootDir, '.wrangler', 'state', 'v3');
const backupsDir = process.env.BACKUP_DIR || path.join(os.homedir(), '.papercommons-backups');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(backupsDir, `backup-${timestamp}`);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Starting automated backup to: ${targetDir}...`);

  // Backup D1 SQLite database
  const d1Dir = path.join(stateDir, 'd1');
  if (fs.existsSync(d1Dir)) {
    copyFolderSync(d1Dir, path.join(targetDir, 'd1'));
    console.log('✔ D1 SQLite Database tables backed up successfully.');
  }

  // Backup R2 File Storage (uploaded PDFs and images)
  const r2Dir = path.join(stateDir, 'r2');
  if (fs.existsSync(r2Dir)) {
    copyFolderSync(r2Dir, path.join(targetDir, 'r2'));
    console.log('✔ R2 Upload Storage (PDFs & Avatars) backed up successfully.');
  }

  // Write metadata manifest
  const manifest = {
    backupDate: new Date().toISOString(),
    version: '1.0.0',
    platform: 'PaperVault PRO (Cloudflare D1 & R2)',
    status: 'completed',
  };
  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n🎉 Backup successfully created at: ${targetDir}`);
}

runBackup();
