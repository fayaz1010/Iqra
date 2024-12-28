const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const BACKUP_RETENTION_DAYS = 7;

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get current date for backup name
const date = new Date();
const backupName = `backup_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

try {
  // Create Git bundle
  console.log('Creating Git bundle...');
  execSync(`git bundle create "${path.join(BACKUP_DIR, backupName)}.bundle" --all`);

  // Clean up old backups
  console.log('Cleaning up old backups...');
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const daysOld = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysOld > BACKUP_RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old backup: ${file}`);
    }
  });

  console.log('Backup completed successfully!');
} catch (error) {
  console.error('Backup failed:', error);
  process.exit(1);
}
