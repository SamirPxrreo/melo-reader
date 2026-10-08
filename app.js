/**
 * MELO READER - Core Application Logic
 * Soporte completo para Markdown, KaTeX, Mermaid, Resaltado de Sintaxis,
 * Personalización de Fuentes, Temas y Voz.
 */

// Default sample markdown for instant offline/file:// protocol fallback
const DEFAULT_FALLBACK_MD = `# 🚀 Melo Reader — Tu Lector de Markdown Todo Firme & Bacano

> [!TIP]
> **¡Bienvenido a Melo Reader!** Arrastra y suelta cualquier archivo \`.md\` en la pantalla, o explora este documento para probar todas las fuentes, temas y funciones que hacen de este lector una experiencia de otro nivel.

---

## ✨ ¿Por qué esta app está tan "Mela"?

Esta no es una aburrida ventana de texto en blanco y negro. Aquí cada detalle fue pensado para que leer tus notas, documentación y artículos técnicos sea un deleite visual:

* 🎨 **Paletas de colores de infarto**: Cyberpunk Neón, Matcha Esmeralda, Catppuccin, Papel Editorial, Obsidian OLED y Synthwave Sunset.
* 🔤 **Tipografías premium**: Desde fuentes ultra-modernas (*Outfit*, *Plus Jakarta*, *Syne*) hasta clásicos editoriales (*Playfair*, *Cinzel*) y fuentes de código (*JetBrains Mono*, *Fira Code*).
* 📑 **Tabla de Contenidos Automática**: Navega por los títulos con un solo clic.
* 📊 **Métricas en tiempo real**: Conteo de palabras, caracteres y tiempo estimado de lectura.
* 🎧 **Lector de voz integrado**: ¡Pásate a modo relax y escucha tus notas!
* 🖨️ **Exportación directa**: Imprime o guarda en PDF con un formato impecable y elegante.

---

## 💡 Callouts & Avisos Especiales

> [!NOTE]
> Este es un bloque de información general para poner apuntes relevantes sin saturar al lector.

> [!TIP]
> Puedes cambiar las fuentes, el tamaño de letra y el ancho del texto desde el menú flotante en la esquina superior derecha.

> [!WARNING]
> Cuidado: Una vez que pruebas leer Markdown con estas fuentes, no vas a querer volver a los editores planos.

> [!CAUTION]
> Asegúrate de guardar tus ideas antes de cerrar la pestaña, aunque tus preferencias se quedan guardadas en tu navegador.

---

## 💻 Bloques de Código con Resaltado y Copiado Rápido

Prueba a pasar el cursor por encima del código y dale clic al botón **"Copiar"**:

\`\`\`javascript
// Servidor ultrarrápido en Node.js
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    vibe: 'Todo Melo caramelo 🍬',
    timestamp: new Date().toISOString()
  }));
});

server.listen(3000, () => {
  console.log('⚡ Melo Reader Server escuchando en http://localhost:3000');
});
\`\`\`

\`\`\`python
# Analizador de texto en Python
from dataclasses import dataclass

@dataclass
class Documento:
    titulo: str
    calidad: str = "10/10 Melo"
    
    def resumir(self) -> str:
        return f"Documento: {self.titulo} | Nivel de flow: {self.calidad}"

doc = Documento("Mis Notas Secretas.md")
print(doc.resumir())
\`\`\`

---

## 📊 Tablas Elegantes

| Característica | Melo Reader | Lectores Tradicionales |
| :--- | :---: | :---: |
| **Fuentes Chéveres** | ✅ Sí (9 familias seleccionadas) | ❌ Solo fuentes del sistema |
| **Temas Estéticos** | ✅ 7 temas vibrantes con modo oscuro/claro | ⚠️ 1 o 2 temas aburridos |
| **Diagramas Mermaid** | ✅ Renderizado automático en vivo | ❌ Código sin procesar |
| **Fórmulas KaTeX** | ✅ Renderizado matemático impecable | ❌ Solo texto plano |
| **Modo Zen / Lectura** | ✅ Enfoque 100% sin distracciones | ❌ Barras llenas de botones |

---

## 📐 Matemáticas y Fórmulas Científicas (KaTeX)

La famosa fórmula de la relatividad especial:

$$E = mc^2$$

Y una integral definida con estilo:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

O una fórmula en línea como $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$ integrada naturalmente con el texto.

---

## 🌿 Diagramas en Vivo con Mermaid

\`\`\`mermaid
graph TD
    A[📄 Archivo .md] --> B{⚡ Melo Reader}
    B --> C[🎨 Tipografía Bacana]
    B --> D[🌈 Tema Personalizado]
    B --> E[📑 Índice Dinámico]
    C --> F[✨ ¡Lectura Todo Melo!]
    D --> F
    E --> F
\`\`\`

---

## 📋 Lista de Tareas Interactivas

- [x] Elegir una fuente bien elegante
- [x] Activar el tema *Cyberpunk Neón*
- [x] Ajustar el ancho del texto a mi gusto
- [ ] Arrastrar mi propio archivo \`.md\` para leerlo sabroso
- [ ] Compartir Melo Reader con los parceros

---

> *"El buen diseño no se trata solo de cómo se ve, sino de cómo te hace sentir al leerlo."*
> — **Melo Reader Team**
`;

class MeloReader {
  constructor() {
    this.currentMarkdown = '';
    this.currentFileName = 'sample.md';
    this.speechSynth = window.speechSynthesis;
    this.speakingUtterance = null;
    this.isSpeaking = false;
    this.searchMatches = [];
    this.currentSearchIndex = -1;

    // Cache DOM elements
    this.articleEl = document.getElementById('markdownArticle');
    this.tocListEl = document.getElementById('tocList');
    this.fileInputEl = document.getElementById('fileInput');
    this.dragOverlayEl = document.getElementById('dragOverlay');
    this.settingsDrawerEl = document.getElementById('settingsDrawer');
    this.drawerOverlayEl = document.getElementById('drawerOverlay');
    this.searchModalEl = document.getElementById('searchModal');
    this.searchInputEl = document.getElementById('searchInput');
    this.searchStatsEl = document.getElementById('searchStats');
    this.ttsBtn = document.getElementById('btnTts');
    this.docTitleEl = document.getElementById('docTitle');
    
    // Stats elements
    this.statWordsEl = document.getElementById('statWords');
    this.statTimeEl = document.getElementById('statTime');
    this.statCharsEl = document.getElementById('statChars');

    this.init();
  }

  async init() {
    this.setupMarked();
    this.setupMermaid();
    this.setupEventListeners();
    this.loadSavedPreferences();

    if (window.lucide) {
      lucide.createIcons();
    }
    
    // Try to fetch sample.md or use fallback
    await this.loadInitialDocument();
  }

  setupMarked() {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (__) {}
        }
        return hljs.highlightAuto(code).value;
      }
    });
  }

  setupMermaid() {
    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
    }
  }

  async loadInitialDocument() {
    try {
      const apiRes = await fetch('/api/opened-file');
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.hasFile && data.content) {
          this.renderMarkdown(data.content, data.filename);
          return;
        }
      }
    } catch (e) {
      // Ignored
    }

    try {
      const response = await fetch('sample.md');
      if (response.ok) {
        const text = await response.text();
        this.renderMarkdown(text, 'sample.md');
        return;
      }
    } catch (e) {
      // Ignored - fallback will execute
    }
    this.renderMarkdown(DEFAULT_FALLBACK_MD, 'sample.md');
  }

  /**
   * Process and render Markdown into HTML with all plugins
   */
  renderMarkdown(markdown, fileName = 'Documento.md') {
    this.currentMarkdown = markdown;
    this.currentFileName = fileName;
    this.docTitleEl.textContent = fileName;

    // Pre-process KaTeX math: protect math expressions
    let mathMap = [];
    let processed = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, { displayMode: true, throwOnError: false });
        mathMap.push(rendered);
        return `@@MATH_BLOCK_${mathMap.length - 1}@@`;
      } catch (err) {
        return match;
      }
    });

    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, { displayMode: false, throwOnError: false });
        mathMap.push(rendered);
        return `@@MATH_INLINE_${mathMap.length - 1}@@`;
      } catch (err) {
        return match;
      }
    });

    // Parse Markdown to HTML
    let html = marked.parse(processed);

    // Restore Math formulas
    html = html.replace(/@@MATH_BLOCK_(\d+)@@/g, (_, id) => `<div class="katex-display">${mathMap[id]}</div>`);
    html = html.replace(/@@MATH_INLINE_(\d+)@@/g, (_, id) => mathMap[id]);

    // Enhance Callouts / Admonitions: > [!NOTE], [!TIP], [!WARNING], [!CAUTION]
    html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|CAUTION)\]([\s\S]*?)<\/blockquote>/gi, (match, type, content) => {
      const t = type.toLowerCase();
      const icons = {
        note: 'ℹ️ NOTA',
        tip: '💡 TIP PRO',
        warning: '⚠️ ADVERTENCIA',
        caution: '🚨 PRECAUCIÓN'
      };
      return `
        <div class="callout-box callout-${t}">
          <div class="callout-header">${icons[t]}</div>
          <div class="callout-content">${content.trim()}</div>
        </div>
      `;
    });

    // Wrap tables for horizontal responsiveness
    html = html.replace(/<table>[\s\S]*?<\/table>/g, (tableMatch) => {
      return `<div class="table-responsive">${tableMatch}</div>`;
    });

    // Wrap pre/code with language header & copy button
    html = html.replace(/<pre><code class="language-([a-zA-Z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
      if (lang === 'mermaid') {
        return `<div class="mermaid-wrapper"><div class="mermaid">${this.decodeHtml(code)}</div></div>`;
      }
      return `
        <div class="code-wrapper">
          <div class="code-header">
            <span class="code-lang">${lang}</span>
            <button class="code-copy-btn" onclick="MeloApp.copyCode(this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copiar</span>
            </button>
          </div>
          <pre><code class="language-${lang}">${code}</code></pre>
        </div>
      `;
    });

    // Inject into container
    this.articleEl.innerHTML = html;

    // Render Mermaid diagrams
    if (window.mermaid) {
      try {
        mermaid.run({
          nodes: document.querySelectorAll('.mermaid')
        });
      } catch (err) {
        console.warn('Mermaid rendering error:', err);
      }
    }

    // Refresh Lucide icons if any
    if (window.lucide) {
      lucide.createIcons();
    }

    // Update TOC & Reading Metrics
    this.buildTableOfContents();
    this.calculateReadingMetrics(markdown);
  }

  decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  copyCode(btn) {
    const wrapper = btn.closest('.code-wrapper');
    const code = wrapper.querySelector('pre code').innerText;
    navigator.clipboard.writeText(code).then(() => {
      const span = btn.querySelector('span');
      const originalText = span.textContent;
      span.textContent = '¡Copiado! ✓';
      btn.style.borderColor = 'var(--accent-primary)';
      btn.style.color = 'var(--accent-primary)';
      setTimeout(() => {
        span.textContent = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2000);
    });
  }

  /**
   * Build Table of Contents dynamically from headings
   */
  buildTableOfContents() {
    this.tocListEl.innerHTML = '';
    const headings = this.articleEl.querySelectorAll('h1, h2, h3, h4');

    if (headings.length === 0) {
      this.tocListEl.innerHTML = '<li class="toc-item"><span style="color:var(--text-muted);font-size:12px;">Sin encabezados</span></li>';
      return;
    }

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const id = heading.id || `heading-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = 'toc-item';
      
      const a = document.createElement('a');
      a.className = `toc-link depth-${level}`;
      a.href = `#${id}`;
      a.textContent = heading.innerText;
      a.title = heading.innerText;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
        // Close TOC on mobile
        if (window.innerWidth <= 768) {
          document.getElementById('sidebarToc').classList.remove('open');
        }
      });

      li.appendChild(a);
      this.tocListEl.appendChild(li);
    });

    this.setupScrollSpy();

    const navTocCountEl = document.getElementById('navTocCount');
    if (navTocCountEl) navTocCountEl.textContent = headings.length;
  }

  setupScrollSpy() {
    const headings = Array.from(this.articleEl.querySelectorAll('h1, h2, h3, h4'));
    const tocLinks = Array.from(this.tocListEl.querySelectorAll('.toc-link'));

    window.removeEventListener('scroll', this._scrollSpyHandler);
    this._scrollSpyHandler = () => {
      const scrollPos = window.scrollY + 140;
      let activeId = '';

      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].offsetTop <= scrollPos) {
          activeId = headings[i].id;
          break;
        }
      }

      tocLinks.forEach(link => {
        if (link.getAttribute('href') === `#${activeId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };
    window.addEventListener('scroll', this._scrollSpyHandler);
  }

  /**
   * Calculate live reading metrics
   */
  calculateReadingMetrics(markdown) {
    const cleanText = markdown.replace(/```[\s\S]*?```/g, '').replace(/#|\*|_|\[|\]|\(|\)/g, ' ').trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));

    this.statWordsEl.textContent = words.toLocaleString();
    this.statTimeEl.textContent = `${readMinutes} min`;
    this.statCharsEl.textContent = chars.toLocaleString();

    const navReadingTimeEl = document.getElementById('navReadingTime');
    if (navReadingTimeEl) navReadingTimeEl.textContent = `${readMinutes} min`;
  }

  /**
   * Event Listeners & UI Controls
   */
  setupEventListeners() {
    // File selector button
    document.getElementById('btnOpenFile').addEventListener('click', () => {
      this.fileInputEl.click();
    });

    this.fileInputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.readFile(file);
    });

    // Drag and Drop
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dragOverlayEl.classList.add('active');
    });

    this.dragOverlayEl.addEventListener('dragleave', () => {
      this.dragOverlayEl.classList.remove('active');
    });

    this.dragOverlayEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dragOverlayEl.classList.remove('active');
      const file = e.dataTransfer.files[0];
      if (file) this.readFile(file);
    });

    // TOC Toggle
    const sidebarToc = document.getElementById('sidebarToc');
    const btnToggleToc = document.getElementById('btnToggleToc');
    btnToggleToc.addEventListener('click', () => {
      sidebarToc.classList.toggle('open');
      const isOpen = sidebarToc.classList.contains('open');
      btnToggleToc.classList.toggle('active', isOpen);
      btnToggleToc.setAttribute('aria-expanded', isOpen);
    });

    document.getElementById('btnCloseToc').addEventListener('click', () => {
      sidebarToc.classList.remove('open');
      btnToggleToc.classList.remove('active');
      btnToggleToc.setAttribute('aria-expanded', 'false');
    });

    // Settings Drawer Toggle
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const closeDrawer = () => {
      this.settingsDrawerEl.classList.remove('open');
      this.drawerOverlayEl.classList.remove('active');
      btnOpenSettings.classList.remove('active');
      btnOpenSettings.setAttribute('aria-expanded', 'false');
    };

    btnOpenSettings.addEventListener('click', () => {
      const isOpen = this.settingsDrawerEl.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        this.settingsDrawerEl.classList.add('open');
        this.drawerOverlayEl.classList.add('active');
        btnOpenSettings.classList.add('active');
        btnOpenSettings.setAttribute('aria-expanded', 'true');
      }
    });

    document.getElementById('btnCloseDrawer').addEventListener('click', closeDrawer);
    this.drawerOverlayEl.addEventListener('click', closeDrawer);

    // Theme selector buttons
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Font Selectors & Sliders
    const fontSelect = document.getElementById('fontSelect');
    fontSelect.addEventListener('change', (e) => {
      this.setFont(e.target.value);
    });

    const codeFontSelect = document.getElementById('codeFontSelect');
    codeFontSelect.addEventListener('change', (e) => {
      this.setCodeFont(e.target.value);
    });

    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeVal = document.getElementById('fontSizeVal');
    fontSizeSlider.addEventListener('input', (e) => {
      const val = `${e.target.value}px`;
      document.documentElement.style.setProperty('--content-font-size', val);
      fontSizeVal.textContent = val;
      localStorage.setItem('melo_fontSize', val);
    });

    const lineHeightSlider = document.getElementById('lineHeightSlider');
    const lineHeightVal = document.getElementById('lineHeightVal');
    lineHeightSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.documentElement.style.setProperty('--content-line-height', val);
      lineHeightVal.textContent = val;
      localStorage.setItem('melo_lineHeight', val);
    });

    const widthSlider = document.getElementById('widthSlider');
    const widthVal = document.getElementById('widthVal');
    widthSlider.addEventListener('input', (e) => {
      const val = `${e.target.value}px`;
      document.documentElement.style.setProperty('--content-max-width', val);
      widthVal.textContent = val;
      localStorage.setItem('melo_maxWidth', val);
    });

    // Zen Mode
    const btnZen = document.getElementById('btnZen');
    btnZen.addEventListener('click', () => {
      document.body.classList.toggle('zen-mode');
    });

    // Print / Export
    document.getElementById('btnPrint').addEventListener('click', () => {
      window.print();
    });

    // Text to Speech
    this.ttsBtn.addEventListener('click', () => {
      this.toggleSpeech();
    });

    // In-Page Search
    const btnSearch = document.getElementById('btnSearch');
    btnSearch.addEventListener('click', () => {
      this.toggleSearchModal();
    });

    document.getElementById('btnCloseSearch').addEventListener('click', () => {
      this.closeSearchModal();
    });

    this.searchInputEl.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    document.getElementById('btnSearchNext').addEventListener('click', () => {
      this.navigateSearch(1);
    });

    document.getElementById('btnSearchPrev').addEventListener('click', () => {
      this.navigateSearch(-1);
    });

    // Keyboard Shortcuts (Linear / Obsidian style)
    window.addEventListener('keydown', (e) => {
      // Escape closes modals or exits Zen mode
      if (e.key === 'Escape') {
        if (document.body.classList.contains('zen-mode')) {
          document.body.classList.remove('zen-mode');
        }
        this.closeSearchModal();
        closeDrawer();
      }
      // Ctrl+K / Ctrl+F opens search
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        this.openSearchModal();
      }
      // Ctrl+O opens file picker
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.fileInputEl.click();
      }
      // Alt+T toggles Table of Contents
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        sidebarToc.classList.toggle('open');
        btnToggleToc.classList.toggle('active', sidebarToc.classList.contains('open'));
        btnToggleToc.setAttribute('aria-expanded', sidebarToc.classList.contains('open'));
      }
      // Alt+Z toggles Zen Mode
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        document.body.classList.toggle('zen-mode');
      }
    });
  }

  readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.renderMarkdown(e.target.result, file.name);
    };
    reader.readAsText(file);
  }

  setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('melo_theme', themeName);

    // Update active state in pills
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    // Update theme active dot in navbar
    const themeColors = {
      'neon-cyberpunk': '#00f0ff',
      'tokyo-matcha': '#10b981',
      'catppuccin-mocha': '#cba6f7',
      'vintage-paper': '#c25927',
      'synthwave-sunset': '#ff2a85',
      'obsidian-dark': '#ffffff',
      'nordic-glacier': '#38bdf8'
    };
    const ind = document.getElementById('navThemeIndicator');
    if (ind && themeColors[themeName]) {
      ind.style.background = themeColors[themeName];
      ind.style.boxShadow = `0 0 6px ${themeColors[themeName]}`;
    }

    // Update Mermaid theme if possible
    if (window.mermaid) {
      const mermaidTheme = themeName === 'vintage-paper' ? 'default' : 'dark';
      mermaid.initialize({ theme: mermaidTheme });
      this.renderMarkdown(this.currentMarkdown, this.currentFileName);
    }
  }

  setFont(fontName) {
    document.documentElement.style.setProperty('--font-main', fontName);
    localStorage.setItem('melo_font', fontName);
  }

  setCodeFont(fontName) {
    document.documentElement.style.setProperty('--font-code', fontName);
    localStorage.setItem('melo_codeFont', fontName);
  }

  loadSavedPreferences() {
    const savedTheme = localStorage.getItem('melo_theme') || 'neon-cyberpunk';
    this.setTheme(savedTheme);

    const savedFont = localStorage.getItem('melo_font');
    if (savedFont) {
      document.getElementById('fontSelect').value = savedFont;
      this.setFont(savedFont);
    }

    const savedCodeFont = localStorage.getItem('melo_codeFont');
    if (savedCodeFont) {
      document.getElementById('codeFontSelect').value = savedCodeFont;
      this.setCodeFont(savedCodeFont);
    }

    const savedFontSize = localStorage.getItem('melo_fontSize');
    if (savedFontSize) {
      document.documentElement.style.setProperty('--content-font-size', savedFontSize);
      document.getElementById('fontSizeSlider').value = parseInt(savedFontSize);
      document.getElementById('fontSizeVal').textContent = savedFontSize;
    }

    const savedLineHeight = localStorage.getItem('melo_lineHeight');
    if (savedLineHeight) {
      document.documentElement.style.setProperty('--content-line-height', savedLineHeight);
      document.getElementById('lineHeightSlider').value = savedLineHeight;
      document.getElementById('lineHeightVal').textContent = savedLineHeight;
    }

    const savedMaxWidth = localStorage.getItem('melo_maxWidth');
    if (savedMaxWidth) {
      document.documentElement.style.setProperty('--content-max-width', savedMaxWidth);
      document.getElementById('widthSlider').value = parseInt(savedMaxWidth);
      document.getElementById('widthVal').textContent = savedMaxWidth;
    }
  }

  /**
   * Text-to-Speech (Escuchar documento)
   */
  toggleSpeech() {
    if (!this.speechSynth) {
      alert('Tu navegador no soporta lectura de voz');
      return;
    }

    if (this.isSpeaking) {
      this.speechSynth.cancel();
      this.isSpeaking = false;
      this.ttsBtn.classList.remove('active');
      this.ttsBtn.classList.remove('is-speaking');
      this.ttsBtn.setAttribute('data-tooltip', 'Escuchar texto');
      return;
    }

    const plainText = this.articleEl.innerText;
    this.speakingUtterance = new SpeechSynthesisUtterance(plainText);
    this.speakingUtterance.lang = 'es-ES';
    this.speakingUtterance.rate = 1.0;

    this.speakingUtterance.onend = () => {
      this.isSpeaking = false;
      this.ttsBtn.classList.remove('active');
      this.ttsBtn.classList.remove('is-speaking');
      this.ttsBtn.setAttribute('data-tooltip', 'Escuchar texto');
    };

    this.speechSynth.speak(this.speakingUtterance);
    this.isSpeaking = true;
    this.ttsBtn.classList.add('active');
    this.ttsBtn.classList.add('is-speaking');
    this.ttsBtn.setAttribute('data-tooltip', 'Pausar voz');
  }

  /**
   * Internal Search
   */
  openSearchModal() {
    this.searchModalEl.classList.add('active');
    this.searchInputEl.focus();
    this.searchInputEl.select();
  }

  closeSearchModal() {
    this.searchModalEl.classList.remove('active');
    this.clearSearchHighlights();
  }

  toggleSearchModal() {
    if (this.searchModalEl.classList.contains('active')) {
      this.closeSearchModal();
    } else {
      this.openSearchModal();
    }
  }

  clearSearchHighlights() {
    this.articleEl.querySelectorAll('mark.search-highlight').forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    this.searchMatches = [];
    this.currentSearchIndex = -1;
    this.searchStatsEl.textContent = '';
  }

  performSearch(query) {
    this.clearSearchHighlights();
    const q = query.trim();
    if (!q) return;

    const walker = document.createTreeWalker(this.articleEl, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
        nodes.push(node);
      }
    }

    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    nodes.forEach(textNode => {
      if (regex.test(textNode.nodeValue)) {
        const span = document.createElement('span');
        span.innerHTML = textNode.nodeValue.replace(regex, '<mark class="search-highlight">$1</mark>');
        textNode.parentNode.replaceChild(span, textNode);
      }
    });

    this.searchMatches = Array.from(this.articleEl.querySelectorAll('mark.search-highlight'));
    if (this.searchMatches.length > 0) {
      this.currentSearchIndex = 0;
      this.highlightMatch(0);
    } else {
      this.searchStatsEl.textContent = '0 de 0';
    }
  }

  navigateSearch(dir) {
    if (this.searchMatches.length === 0) return;
    this.currentSearchIndex = (this.currentSearchIndex + dir + this.searchMatches.length) % this.searchMatches.length;
    this.highlightMatch(this.currentSearchIndex);
  }

  highlightMatch(index) {
    this.searchMatches.forEach((m, idx) => {
      m.classList.toggle('current', idx === index);
    });
    const target = this.searchMatches[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.searchStatsEl.textContent = `${index + 1} de ${this.searchMatches.length}`;
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.MeloApp = new MeloReader();

  // Electron IPC listener if running inside Electron
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.on('load-file-content', (event, data) => {
        if (window.MeloApp && data) {
          window.MeloApp.renderMarkdown(data.content, data.filename);
        }
      });
    } catch (e) {}
  }
});
