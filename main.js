const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// FEATURE 4: Automatic Backup System
function createBackup() {
  const records = db.listRecords();
  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `backup_${timestamp}.json`;
  const filepath = path.join(backupsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(records, null, 2));
  console.log(`✓ Backup created: ${filename}`);
}

// FEATURE 1: Search Functionality
function searchRecords() {
  rl.question('Enter search keyword: ', (keyword) => {
    const records = db.listRecords();
    const results = records.filter(record => 
      record.name.toLowerCase().includes(keyword.toLowerCase()) ||
      record.id.toString().includes(keyword) ||
      (record.value && record.value.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (results.length === 0) {
      console.log('No records found.');
    } else {
      console.log(`\nFound ${results.length} matching record(s):`);
      results.forEach((record, index) => {
        const createdDate = new Date(record.id).toISOString().split('T')[0];
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Value: ${record.value} | Created: ${createdDate}`);
      });
    }
    menu();
  });
}

// FEATURE 2: Sorting Capability
function sortRecords() {
  rl.question('Choose field to sort by (Name/Date): ', (field) => {
    rl.question('Choose order (Ascending/Descending): ', (order) => {
      const records = db.listRecords();
      let sorted = [...records];
      
      if (field.toLowerCase() === 'name') {
        sorted.sort((a, b) => {
          if (order.toLowerCase() === 'ascending') {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
      } else if (field.toLowerCase() === 'date') {
        sorted.sort((a, b) => {
          if (order.toLowerCase() === 'ascending') {
            return a.id - b.id;
          } else {
            return b.id - a.id;
          }
        });
      }

      console.log('\nSorted Records:');
      sorted.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Value: ${record.value}`);
      });
      
      menu();
    });
  });
}

// FEATURE 3: Export Vault Data to Text File
function exportData() {
  const records = db.listRecords();
  const now = new Date();
  
  const header = `
================================
Vault Data Export
================================
Export Date: ${now.toLocaleString()}
Total Records: ${records.length}
File Name: export.txt
================================

`;

  let content = header;
  records.forEach((record, index) => {
    const createdDate = new Date(record.id).toISOString().split('T')[0];
    content += `${index + 1}. ID: ${record.id}\n`;
    content += `   Name: ${record.name}\n`;
    content += `   Value: ${record.value}\n`;
    content += `   Created: ${createdDate}\n`;
    content += `   --------------------------\n`;
  });

  const exportPath = path.join(__dirname, 'export.txt');
  fs.writeFileSync(exportPath, content);
  console.log('✅ Data exported successfully to export.txt');
  menu();
}

// FEATURE 5: Display Data Statistics
function displayStatistics() {
  const records = db.listRecords();
  
  if (records.length === 0) {
    console.log('No records in vault.');
    menu();
    return;
  }

  const totalRecords = records.length;
  const lastModified = new Date().toLocaleString();
  
  const longestName = records.reduce((longest, record) => 
    record.name.length > longest.length ? record.name : longest, ""
  );
  
  const dates = records.map(r => new Date(r.id)).sort((a, b) => a - b);
  const earliest = dates[0].toISOString().split('T')[0];
  const latest = dates[dates.length - 1].toISOString().split('T')[0];

  console.log('\nVault Statistics:');
  console.log('--------------------------');
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Last Modified: ${lastModified}`);
  console.log(`Longest Name: ${longestName} (${longestName.length} characters)`);
  console.log(`Earliest Record: ${earliest}`);
  console.log(`Latest Record: ${latest}`);
  console.log('--------------------------\n');
  
  menu();
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);
  
  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            createBackup(); // FEATURE 4: Auto backup
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;
        
      case '2':
        const records = db.listRecords();
        if (records.length === 0) {
          console.log('No records found.');
        } else {
          records.forEach(r => {
            const createdDate = new Date(r.id).toISOString().split('T')[0];
            console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${createdDate}`);
          });
        }
        menu();
        break;
        
      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              if (updated) {
                createBackup(); // FEATURE 4: Auto backup
                console.log('✅ Record updated!');
              } else {
                console.log('❌ Record not found.');
              }
              menu();
            });
          });
        });
        break;
        
      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          if (deleted) {
            createBackup(); // FEATURE 4: Auto backup
            console.log('🗑️ Record deleted!');
          } else {
            console.log('❌ Record not found.');
          }
          menu();
        });
        break;
        
      case '5':
        searchRecords(); // FEATURE 1
        break;
        
      case '6':
        sortRecords(); // FEATURE 2
        break;
        
      case '7':
        exportData(); // FEATURE 3
        break;
        
      case '8':
        displayStatistics(); // FEATURE 5
        break;
        
      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;
        
      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
