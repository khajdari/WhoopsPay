#!/usr/bin/env node

/**
 * SonarCloud JSON to HTML Converter
 * Converts SonarCloud API responses and analysis data to professional HTML reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateHTML(sonarData, projectInfo) {
  const timestamp = new Date().toISOString();
  const reportTitle = `SonarCloud Security Report - ${projectInfo.name} v${projectInfo.version}`;
  
  // Extract key metrics
  const issues = sonarData.issues || [];
  const metrics = sonarData.measures || [];
  const hotspots = sonarData.hotspots || [];
  
  // Count issues by severity
  const severityCounts = {
    BLOCKER: issues.filter(i => i.severity === 'BLOCKER').length,
    CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
    MAJOR: issues.filter(i => i.severity === 'MAJOR').length,
    MINOR: issues.filter(i => i.severity === 'MINOR').length,
    INFO: issues.filter(i => i.severity === 'INFO').length
  };
  
  // Count issues by type
  const typeCounts = {
    BUG: issues.filter(i => i.type === 'BUG').length,
    VULNERABILITY: issues.filter(i => i.type === 'VULNERABILITY').length,
    CODE_SMELL: issues.filter(i => i.type === 'CODE_SMELL').length,
    SECURITY_HOTSPOT: hotspots.length
  };
  
  // Generate severity badges
  function getSeverityBadge(severity, count) {
    const colors = {
      BLOCKER: '#d73027',
      CRITICAL: '#fc8d59', 
      MAJOR: '#fee08b',
      MINOR: '#91bfdb',
      INFO: '#4575b4'
    };
    return `<span class="severity-badge ${severity.toLowerCase()}" style="background-color: ${colors[severity] || '#666'};">${severity}: ${count}</span>`;
  }
  
  // Generate issue rows
  function generateIssueRows(issues) {
    return issues.map((issue, index) => `
      <tr class="issue-row ${issue.severity.toLowerCase()}">
        <td class="number-cell">${index + 1}</td>
        <td class="severity-cell">
          <span class="severity-tag ${issue.severity.toLowerCase()}">${issue.severity}</span>
        </td>
        <td class="type-cell">
          <span class="type-tag ${issue.type.toLowerCase()}">${issue.type}</span>
        </td>
        <td class="message-cell">${escapeHtml(issue.message || 'No message')}</td>
        <td class="file-cell">${escapeHtml(issue.component || 'Unknown file')}</td>
        <td class="line-cell">${issue.line || '-'}</td>
        <td class="rule-cell">${escapeHtml(issue.rule || 'Unknown rule')}</td>
      </tr>
    `).join('');
  }
  
  // Helper function to escape HTML
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  // Generate the HTML report
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #74b9ff;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: "☁️";
            font-size: 2em;
            margin-right: 15px;
            vertical-align: middle;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #74b9ff;
            display: inline-block;
            vertical-align: middle;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.8;
            color: #a0c4ff;
        }
        
        .metadata {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .metadata h2 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .meta-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        
        .summary {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .summary h2 {
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: bold;
        }
        
        .card-bugs { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .card-vulnerabilities { background: linear-gradient(135deg, #e67e22, #d35400); }
        .card-code-smells { background: linear-gradient(135deg, #f39c12, #e67e22); }
        .card-hotspots { background: linear-gradient(135deg, #3498db, #2980b9); }
        
        .summary-card h3 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .summary-card p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .severity-overview {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .severity-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .severity-badge {
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .issues-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .issues-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            table-layout: fixed;
        }
        
        .issues-table th {
            background: #f8f9fa;
            padding: 15px 12px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
        }
        
        .issues-table th:nth-child(1) { width: 6%; }  /* # */
        .issues-table th:nth-child(2) { width: 12%; } /* Severity */
        .issues-table th:nth-child(3) { width: 14%; } /* Type */
        .issues-table th:nth-child(4) { width: 35%; } /* Message */
        .issues-table th:nth-child(5) { width: 20%; } /* File */
        .issues-table th:nth-child(6) { width: 8%; }  /* Line */
        .issues-table th:nth-child(7) { width: 15%; } /* Rule */
        
        .issues-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .number-cell {
            text-align: center;
            font-weight: 600;
            color: #666;
        }
        
        .issue-row:hover {
            background-color: #f8f9fa;
        }
        
        .severity-tag, .type-tag {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        
        .severity-tag.blocker { background-color: #d73027; }
        .severity-tag.critical { background-color: #fc8d59; }
        .severity-tag.major { background-color: #fee08b; color: #333; }
        .severity-tag.minor { background-color: #91bfdb; }
        .severity-tag.info { background-color: #4575b4; }
        
        .type-tag.bug { background-color: #e74c3c; }
        .type-tag.vulnerability { background-color: #e67e22; }
        .type-tag.code_smell { background-color: #f39c12; }
        .type-tag.security_hotspot { background-color: #3498db; }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2em; }
            .summary-grid { grid-template-columns: 1fr; }
            .issues-table { font-size: 0.9em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ SonarCloud Security Report</h1>
            <div class="subtitle">${projectInfo.name} - Version ${projectInfo.version}</div>
        </div>
        
        <div class="metadata">
            <h2>📊 Analysis Metadata</h2>
            <div class="meta-grid">
                <div class="meta-item">
                    <strong>Project:</strong> ${escapeHtml(projectInfo.name)}
                </div>
                <div class="meta-item">
                    <strong>Version:</strong> ${escapeHtml(projectInfo.version)}
                </div>
                <div class="meta-item">
                    <strong>Generated:</strong> ${new Date(timestamp).toLocaleString()}
                </div>
                <div class="meta-item">
                    <strong>Total Issues:</strong> ${issues.length}
                </div>
                <div class="meta-item">
                    <strong>Security Hotspots:</strong> ${hotspots.length}
                </div>
                <div class="meta-item">
                    <strong>Analysis Source:</strong> SonarCloud
                </div>
            </div>
        </div>
        
        <div class="summary">
            <h2>🎯 Issue Summary</h2>
            <div class="summary-grid">
                <div class="summary-card card-bugs">
                    <h3>${typeCounts.BUG}</h3>
                    <p>Bugs</p>
                </div>
                <div class="summary-card card-vulnerabilities">
                    <h3>${typeCounts.VULNERABILITY}</h3>
                    <p>Vulnerabilities</p>
                </div>
                <div class="summary-card card-code-smells">
                    <h3>${typeCounts.CODE_SMELL}</h3>
                    <p>Code Smells</p>
                </div>
                <div class="summary-card card-hotspots">
                    <h3>${typeCounts.SECURITY_HOTSPOT}</h3>
                    <p>Security Hotspots</p>
                </div>
            </div>
        </div>
        
        <div class="severity-overview">
            <h2>⚠️ Severity Distribution</h2>
            <div class="severity-badges">
                ${getSeverityBadge('BLOCKER', severityCounts.BLOCKER)}
                ${getSeverityBadge('CRITICAL', severityCounts.CRITICAL)}
                ${getSeverityBadge('MAJOR', severityCounts.MAJOR)}
                ${getSeverityBadge('MINOR', severityCounts.MINOR)}
                ${getSeverityBadge('INFO', severityCounts.INFO)}
            </div>
        </div>
        
        <div class="issues-section">
            <h2>🔍 Detailed Issues ${issues.length > 0 ? `(${issues.length} total)` : ''}</h2>
            ${issues.length > 0 ? `
            <table class="issues-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Severity</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>File</th>
                        <th>Line</th>
                        <th>Rule</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateIssueRows(issues)}
                </tbody>
            </table>
            ` : '<p style="text-align: center; padding: 40px; color: #28a745; font-size: 1.2em;">🎉 No issues found! Your code looks great.</p>'}
        </div>
        
        <div class="footer">
            <p>Report generated by WhoopsPay Security Pipeline • ${timestamp}</p>
            <p>Data source: SonarCloud Analysis • Visit <a href="https://sonarcloud.io" target="_blank">sonarcloud.io</a> for detailed analysis</p>
        </div>
    </div>
</body>
</html>`;
}

function loadSonarData(inputPath) {
  try {
    // Try to load from different possible file locations
    const possibleFiles = [
      path.join(inputPath, 'sonarcloud-issues.json'),
      path.join(inputPath, 'sonarcloud-data.json'), 
      path.join(inputPath, 'report-task.txt'),
      path.join(inputPath, 'scanner-report.json')
    ];
    
    let sonarData = { issues: [], measures: [], hotspots: [] };
    
    // Check each possible file
    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        console.log(`📄 Found data file: ${filePath}`);
        
        if (filePath.endsWith('.txt')) {
          // Parse report-task.txt for project info
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          for (const line of lines) {
            if (line.includes('projectKey=')) {
              console.log(`🔑 Project key: ${line.split('=')[1]}`);
            }
          }
        } else if (filePath.endsWith('.json')) {
          // Load JSON data
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          sonarData = { ...sonarData, ...data };
        }
      }
    }
    
    // Sort local issues by severity if loaded
    if (sonarData.issues && sonarData.issues.length > 0) {
      const severityOrder = {
        'BLOCKER': 1,
        'CRITICAL': 2, 
        'MAJOR': 3,
        'MINOR': 4,
        'INFO': 5
      };
      
      sonarData.issues.sort((a, b) => {
        const severityA = severityOrder[a.severity] || 999;
        const severityB = severityOrder[b.severity] || 999;
        return severityA - severityB;
      });
      
      console.log(`🔄 Sorted ${sonarData.issues.length} local issues by severity criticality`);
    }
    
    return sonarData;
  } catch (error) {
    console.warn(`⚠️ Error loading SonarCloud data: ${error.message}`);
    return { issues: [], measures: [], hotspots: [] };
  }
}

async function fetchFromSonarCloudAPI(projectKey, organization, token) {
  try {
    console.log('🌐 Fetching live data from SonarCloud API...');
    
    const fetch = (await import('node-fetch')).default;
    const baseUrl = 'https://sonarcloud.io/api';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };
    
    // Fetch ALL issues with pagination
    let allIssues = [];
    let page = 1;
    const pageSize = 500;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`📄 Fetching page ${page} of issues...`);
      const issuesResponse = await fetch(
        `${baseUrl}/issues/search?componentKeys=${projectKey}&organization=${organization}&ps=${pageSize}&p=${page}`,
        { headers }
      );
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        const pageIssues = issuesData.issues || [];
        allIssues = allIssues.concat(pageIssues);
        
        // Check if there are more pages
        const total = issuesData.total || 0;
        hasMore = allIssues.length < total;
        page++;
        
        console.log(`✅ Fetched ${pageIssues.length} issues from page ${page - 1} (${allIssues.length}/${total} total)`);
      } else {
        console.log(`⚠️ Issues API failed on page ${page}: ${issuesResponse.status}`);
        hasMore = false;
      }
    }
    
    let issues = allIssues;
    console.log(`✅ Found ${issues.length} total issues`);
    
    // Sort issues by severity criticality (most critical first)
    const severityOrder = {
      'BLOCKER': 1,
      'CRITICAL': 2, 
      'MAJOR': 3,
      'MINOR': 4,
      'INFO': 5
    };
    
    issues.sort((a, b) => {
      const severityA = severityOrder[a.severity] || 999;
      const severityB = severityOrder[b.severity] || 999;
      return severityA - severityB;
    });
    
    console.log(`🔄 Sorted ${issues.length} issues by severity criticality`);
    
    // Fetch ALL hotspots with pagination
    let allHotspots = [];
    page = 1;
    hasMore = true;
    
    while (hasMore) {
      console.log(`🔥 Fetching page ${page} of security hotspots...`);
      const hotspotsResponse = await fetch(
        `${baseUrl}/hotspots/search?projectKey=${projectKey}&ps=${pageSize}&p=${page}`,
        { headers }
      );
      
      if (hotspotsResponse.ok) {
        const hotspotsData = await hotspotsResponse.json();
        const pageHotspots = hotspotsData.hotspots || [];
        allHotspots = allHotspots.concat(pageHotspots);
        
        // Check if there are more pages
        const total = hotspotsData.paging?.total || 0;
        hasMore = allHotspots.length < total;
        page++;
        
        console.log(`✅ Fetched ${pageHotspots.length} hotspots from page ${page - 1} (${allHotspots.length}/${total} total)`);
      } else {
        console.log(`⚠️ Hotspots API failed on page ${page}: ${hotspotsResponse.status}`);
        hasMore = false;
      }
    }
    
    let hotspots = allHotspots;
    console.log(`✅ Found ${hotspots.length} total security hotspots`);
    
    // Fetch measures
    const measuresResponse = await fetch(
      `${baseUrl}/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,security_hotspots`,
      { headers }
    );
    
    let measures = [];
    if (measuresResponse.ok) {
      const measuresData = await measuresResponse.json();
      measures = measuresData.component?.measures || [];
      console.log(`✅ Found ${measures.length} metrics`);
    } else {
      console.log(`⚠️ Measures API failed: ${measuresResponse.status}`);
    }
    
    return { issues, hotspots, measures };
    
  } catch (error) {
    console.warn(`⚠️ API fetch failed: ${error.message}`);
    return { issues: [], hotspots: [], measures: [] };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node sonarcloud-to-html.js <input-directory> <output-file> [project-name] [version]');
    console.log('Example: node sonarcloud-to-html.js ./security-reports/v1.0.0/01-sonarcloud report.html WhoopsPay 1.0.0');
    process.exit(1);
  }
  
  const [inputPath, outputFile, projectName = 'Unknown Project', version = '1.0.0'] = args;
  
  console.log(`🔄 Converting SonarCloud data to HTML...`);
  console.log(`📂 Input path: ${inputPath}`);
  console.log(`📄 Output file: ${outputFile}`);
  
  // Load local data first
  let sonarData = loadSonarData(inputPath);
  
  // Try to fetch live data from API if token is available
  const token = process.env.SONAR_TOKEN;
  if (token) {
    console.log('🔑 SonarCloud token found - fetching live data...');
    const liveData = await fetchFromSonarCloudAPI('khajdari_WhoopsPay', 'khajdari', token);
    
    // Merge live data with local data
    sonarData = {
      issues: liveData.issues.length > 0 ? liveData.issues : sonarData.issues,
      hotspots: liveData.hotspots.length > 0 ? liveData.hotspots : sonarData.hotspots,
      measures: liveData.measures.length > 0 ? liveData.measures : sonarData.measures
    };
  } else {
    console.log('⚠️ No SonarCloud token - using local data only');
  }
  
  const projectInfo = {
    name: projectName,
    version: version
  };
  
  const html = generateHTML(sonarData, projectInfo);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, html);
  
  console.log(`✅ HTML report generated successfully!`);
  console.log(`📄 File: ${outputFile}`);
  console.log(`📊 Issues: ${sonarData.issues.length}`);
  console.log(`🔥 Hotspots: ${sonarData.hotspots.length}`);
  console.log(`📏 Size: ${Math.round(fs.statSync(outputFile).size / 1024)} KB`);
}

// Run main function if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error generating HTML report:', error);
    process.exit(1);
  });
}

export { generateHTML, loadSonarData };