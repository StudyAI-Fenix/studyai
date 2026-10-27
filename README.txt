STUDYAI - BEGINNER DEMO
=======================

WHAT'S INCLUDED
- index.html: page structure
- style.css: neon gaming design and mobile-responsive layout
- script.js: tasks, sample study helper, timer, and local saving

HOW TO RUN ON A LAPTOP
1. Download and unzip studyai-demo.zip.
2. Open the studyai folder.
3. Double-click index.html.
4. It should open in your browser. Chrome, Edge, or Firefox are good choices.
5. Try the navigation, add a mission, complete it, ask the study buddy about "photosynthesis", start a 5-minute focus timer, then open PDF Library and upload a text-based PDF to try summary, quiz, and flashcards.

HOW TO TEST ON A PHONE
Easiest method: transfer the unzipped folder to your phone and open index.html in a browser or a local HTML preview app.
For a more reliable phone test, serve the folder from your laptop:
1. Make sure your phone and laptop are on the same Wi-Fi network.
2. Install Python on the laptop if it is not already installed.
3. Open a terminal/command prompt inside the studyai folder.
4. Run: python -m http.server 8000
   On some Windows computers use: py -m http.server 8000
5. Find your laptop's local IP address.
   Windows: run ipconfig and look for the IPv4 Address.
   macOS: System Settings > Network.
   Linux: run hostname -I.
6. On your phone, open http://YOUR-LAPTOP-IP:8000
   Example format only: http://192.168.1.20:8000
   Replace that example with your actual laptop IP. Keep the server running.
7. If it does not load, check that both devices are on the same Wi-Fi and that the laptop firewall permits local connections.

FEATURES TO DEMONSTRATE
- Responsive sidebar navigation
- Add, complete, and delete missions
- XP points for completed tasks
- Sample study explanations / study plan generator
- PDF library: choose a PDF from your device and preview it in the app
- Focus timer with 25, 15, and 5 minute presets
- Task saving in the same browser using localStorage

IMPORTANT LIMITATIONS
- The general study helper uses built-in sample content and a generic study plan, not a live AI model. PDF Study Lab uses browser-side text extraction and simple text-processing rules to create study materials; it is not live AI and can make mistakes.
- PDF Study Lab needs an internet connection to load the PDF.js library. It works best with text-based PDFs; scanned/image-only PDFs need OCR and are not supported. Your PDF text is processed in the browser and is not sent to an app server.
- Tasks save in the current browser on the current device; they do not sync between devices.
- PDF files are previewed locally and are not uploaded; select the PDF again after refreshing the page.
- The timer runs while the page is open. For this demo, keep the app open during a focus session.
- An internet connection may be needed for the optional Google Fonts import; the app itself still works without it.

QUICK PRESENTATION SCRIPT
"Good morning. My project is StudyAI, a study companion designed to make learning feel more organized and motivating.
The dashboard shows study missions, progress, and experience points. Users can add tasks, mark them complete, and earn XP.
The study buddy gives quick sample explanations and helps break unfamiliar topics into study steps. Focus mode includes a countdown timer to encourage distraction-free study sessions.
I built the interface with HTML, styled it with CSS, and used JavaScript for the interactive features. This demo uses sample study content rather than a live AI service, and it saves tasks locally in the browser.
In the future, I would connect a real AI API, add student accounts, and synchronize progress across devices. Thank you."

QUICK TEST CHECKLIST
[ ] index.html opens without errors
[ ] navigation buttons switch sections
[ ] add a mission works
[ ] completing a mission increases XP
[ ] deleting a mission works
[ ] refreshing keeps tasks on the same browser
[ ] study buddy responds to "photosynthesis"
[ ] focus timer starts, pauses, resets, and changes duration
[ ] PDF library opens a selected PDF
[ ] layout is usable on a phone-sized screen
