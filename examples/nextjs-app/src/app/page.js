'use client'

export default function Home() {
  return (
    <>
      <div className="page">
        <h1>Churchill Test Page</h1>

        <h2>Send Log Messages</h2>
        <div className="input-section">
          <div className="input-toggle">
            <label>
              <input type="radio" name="input-type" value="string" defaultChecked /> String Message
            </label>
            <label>
              <input type="radio" name="input-type" value="object" /> JavaScript Object
            </label>
          </div>

          <div id="string-input-container">
            <input type="text" id="custom-message" className="custom-message" placeholder="Enter a custom message..." />
          </div>

          <div id="object-input-container" style={{ display: 'none' }}>
            <p>Enter JSON object:</p>
            <textarea id="json-input" defaultValue={`{
    "user": "Frederik B.",
    "action": "login",
    "details": {
        "browser": "Chrome",
        "successful": true
    }
}`} />
            <div id="json-error" className="json-error"></div>
          </div>
        </div>

        <div>
          <button className="btn btn-trace" onClick={() => sendLog('trace')}>Trace</button>
          <button className="btn btn-debug" onClick={() => sendLog('debug')}>Debug</button>
          <button className="btn btn-info" onClick={() => sendLog('info')}>Info</button>
          <button className="btn btn-warn" onClick={() => sendLog('warn')}>Warn</button>
          <button className="btn btn-error" onClick={() => sendLog('error')}>Error</button>
        </div>

        <h2>Log History</h2>
        <div id="log-area"></div>
      </div>

      <script src="https://unpkg.com/churchill-client@latest/dist/churchill.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        let logger;
        let Churchill;

        // Wait for Churchill to be available
        function initializeChurchill() {
          if (typeof window !== 'undefined' && window.Churchill) {
            Churchill = window.Churchill;
            logger = Churchill.create();
            logger.config({
              serverUrl: 'http://localhost:3000/api/logs',
              console: true,
              level: 'trace',
              useragent: true,
            });
          } else {
            setTimeout(initializeChurchill, 100);
          }
        }
        
        // Initialize when the page loads
        if (typeof window !== 'undefined') {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeChurchill);
          } else {
            initializeChurchill();
          }
        }

        // Log level values from Churchill
        const LOG_LEVELS = {
          "error": 10,
          "warn": 20,
          "info": 30,  
          "debug": 40,
          "trace": 50
        };

        // Set up input type toggle
        function setupToggle() {
          document.querySelectorAll('input[name="input-type"]').forEach(radio => {
            radio.addEventListener('change', function () {
              document.getElementById('string-input-container').style.display =
                this.value === 'string' ? 'block' : 'none';
              document.getElementById('object-input-container').style.display =
                this.value === 'object' ? 'block' : 'none';
            });
          });
        }

        function sendLog(level) {
          if (!logger) {
            console.error('Logger not initialized yet');
            return;
          }

          const inputType = document.querySelector('input[name="input-type"]:checked').value;
          let payload;

          if (inputType === 'string') {
            payload = document.getElementById('custom-message').value ||
              \`This is a \${level} message at \${new Date().toLocaleTimeString()}\`;
          } else {
            const jsonText = document.getElementById('json-input').value;
            try {
              payload = JSON.parse(jsonText);
              document.getElementById('json-error').textContent = '';
            } catch (e) {
              document.getElementById('json-error').textContent = \`Invalid JSON: \${e.message}\`;
              return;
            }
          }

          // Check if this log level would be processed based on the current logger level
          const willBeSent = LOG_LEVELS[level] <= LOG_LEVELS[logger.level];

          switch (level) {
            case 'trace':
              logger.trace(payload);
              break;
            case 'debug':
              logger.debug(payload);
              break;
            case 'info':
              logger.info(payload);
              break;
            case 'warn':
              logger.warn(payload);
              break;
            case 'error':
              logger.error(payload);
              break;
            default:
              console.error('Unknown log level:', level);
              return;
          }

          addLogEntry(payload, level, willBeSent);
        }

        function addLogEntry(payload, level, sent) {
          const logArea = document.getElementById('log-area');
          const entry = document.createElement('div');
          entry.className = \`log-entry log-\${level}\`;

          const status = sent ? "Sent" : "Not sent";

          if (typeof payload === 'object') {
            entry.innerHTML = \`<div>\${status} [\${level}]:</div>
                             <div class="log-object">\${JSON.stringify(payload, null, 2)}</div>\`;
          } else {
            entry.textContent = \`\${status} [\${level}]: \${payload}\`;
          }

          logArea.prepend(entry);
        }

        // Make functions globally available
        window.sendLog = sendLog;

        // Setup toggle when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupToggle);
        } else {
          setupToggle();
        }
        `
      }} />
    </>
  );
}
