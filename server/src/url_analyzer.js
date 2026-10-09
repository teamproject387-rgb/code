import dns from 'dns/promises';
import { URL } from 'url';

/**
 * SSRF Protection Validator
 * Verifies that a target URL is public and does not point to internal networks,
 * loopbacks, or cloud metadata instances.
 */
export async function validateSsrfSafeUrl(targetUrl) {
  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch (err) {
    throw new Error('Invalid URL format. Please provide a full URL starting with https:// or http://');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: ${parsed.protocol}. Only http and https are allowed.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, local, internal domain names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa')
  ) {
    throw new Error('Access to local/private domain names is forbidden for security (SSRF prevention).');
  }

  // Resolve DNS to verify IP addresses
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        throw new Error(`SSRF Protection: Hostname resolves to private/reserved IP address (${record.address}). Access denied.`);
      }
    }
  } catch (err) {
    if (err.message.includes('SSRF Protection')) throw err;
    throw new Error(`DNS Resolution failed for host "${hostname}": ${err.message}`);
  }

  return parsed;
}

function isPrivateOrReservedIp(ip) {
  // IPv6 checks
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fe80:')) return true; // Link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local
    if (lower.startsWith('fec0:')) return true; // Site-local
    if (lower.includes('::ffff:127.') || lower.includes('::ffff:10.') || lower.includes('::ffff:192.168.')) return true;
    return false; // Global public IPv6
  }

  // IPv4 checks
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;
  // 10.0.0.0/8 (Private A)
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (Private B: 172.16.0.0 - 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16 (Private C)
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link Local & AWS/GCP Metadata 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 0.0.0.0/8
  if (parts[0] === 0) return true;

  return false;
}

/**
 * Website URL Analysis Engine
 * Inspects accessible frontend resources, checks security headers,
 * identifies rendering bottlenecks, mixed content, and a11y issues.
 */
export async function analyzeWebsiteUrl(targetUrl) {
  const parsedUrl = await validateSsrfSafeUrl(targetUrl);

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

  let response;
  try {
    response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AetherAudit/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to connect to ${targetUrl}: ${err.name === 'AbortError' ? 'Request timed out' : err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const durationMs = Date.now() - startTime;
  const status = response.status;
  const headers = Object.fromEntries(response.headers.entries());
  const html = await response.text();

  const findings = [];

  // 1. Security Header Inspections
  if (!headers['content-security-policy']) {
    findings.push({
      severity: 'warning',
      category: 'security',
      title: 'Missing Content-Security-Policy (CSP)',
      explanation: 'A Content-Security-Policy header restricts where scripts, images, and styles can be loaded from, protecting users from XSS attacks and unauthorized data exfiltration.',
      recommendation: 'Add a `Content-Security-Policy` header to your web server (e.g., `default-src \'self\'; script-src \'self\' https://cdn.example.com`).'
    });
  }

  if (parsedUrl.protocol === 'https:' && !headers['strict-transport-security']) {
    findings.push({
      severity: 'warning',
      category: 'security',
      title: 'Missing Strict-Transport-Security (HSTS)',
      explanation: 'Without HSTS, initial connections may downgrade to insecure HTTP, allowing SSL stripping attacks.',
      recommendation: 'Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header.'
    });
  }

  if (!headers['x-content-type-options']) {
    findings.push({
      severity: 'info',
      category: 'security',
      title: 'Missing X-Content-Type-Options: nosniff',
      explanation: 'Without this header, older browsers might MIME-sniff response content, interpreting text/plain files as executable JavaScript.',
      recommendation: 'Add `X-Content-Type-Options: nosniff` header.'
    });
  }

  // 2. HTML Markup & Performance Inspections
  if (parsedUrl.protocol === 'https:' && /src=["']http:\/\//i.test(html)) {
    findings.push({
      severity: 'critical',
      category: 'security',
      title: 'Active Mixed Content Detected',
      explanation: 'The page is served over HTTPS but loads active scripts or stylesheets over unencrypted HTTP. Modern browsers will block these resources or show dangerous security warnings.',
      recommendation: 'Update all resource links to use `https://` or protocol-relative `//` URLs.'
    });
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    findings.push({
      severity: 'warning',
      category: 'a11y',
      title: 'Missing Responsive Viewport Meta Tag',
      explanation: 'Mobile devices will render the page with a desktop viewport width (~980px), forcing users to pinch-zoom and failing mobile-friendliness audits.',
      recommendation: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside `<head>`.'
    });
  }

  if (!/<title[^>]*>.*?<\/title>/i.test(html)) {
    findings.push({
      severity: 'warning',
      category: 'seo',
      title: 'Missing Document Title `<title>`',
      explanation: 'The page does not declare a `<title>` tag, hurting bookmarking, browser tab readability, and search engine indexation.',
      recommendation: 'Include a descriptive `<title>Your Page Title</title>` in the `<head>` section.'
    });
  }

  // Count images without alt
  const imgMatches = html.match(/<img\b[^>]*>/gi) || [];
  const missingAltCount = imgMatches.filter(img => !/\balt=/i.test(img)).length;
  if (missingAltCount > 0) {
    findings.push({
      severity: 'warning',
      category: 'a11y',
      title: `${missingAltCount} image${missingAltCount > 1 ? 's' : ''} missing alt attributes`,
      explanation: 'Images without alt attributes prevent screen readers from announcing image contents to users with visual disabilities.',
      recommendation: 'Ensure all `<img>` tags specify descriptive `alt="..."` attributes.'
    });
  }

  // Blocking scripts in head
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const headContent = headMatch[1];
    const blockingScripts = (headContent.match(/<script\b(?![^>]*(?:async|defer|type=["']module["']))[^>]*src=/gi) || []).length;
    if (blockingScripts > 0) {
      findings.push({
        severity: 'info',
        category: 'performance',
        title: `${blockingScripts} render-blocking <script> in <head>`,
        explanation: 'Synchronous scripts in `<head>` pause HTML parsing and delay First Contentful Paint (FCP) and Largest Contentful Paint (LCP).',
        recommendation: 'Add `defer` or `async` attribute to non-critical external scripts.'
      });
    }
  }

  // Calculate Health Score
  let deductions = 0;
  findings.forEach(f => {
    if (f.severity === 'critical') deductions += 25;
    else if (f.severity === 'error') deductions += 15;
    else if (f.severity === 'warning') deductions += 8;
    else deductions += 3;
  });

  const healthScore = Math.max(20, Math.min(100, 100 - deductions));

  return {
    url: targetUrl,
    statusCode: status,
    responseTimeMs: durationMs,
    htmlSizeBytes: Buffer.byteLength(html, 'utf8'),
    healthScore,
    securityHeaders: {
      csp: !!headers['content-security-policy'],
      hsts: !!headers['strict-transport-security'],
      xContentTypeOptions: !!headers['x-content-type-options'],
      xFrameOptions: !!headers['x-frame-options'],
      referrerPolicy: !!headers['referrer-policy']
    },
    findings,
    findingsCount: findings.length,
    timestamp: new Date().toISOString()
  };
}
