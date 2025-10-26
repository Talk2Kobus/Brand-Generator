import type { BrandBible } from '../types';

export const generateBrandGuideHtml = (brandBible: BrandBible, mission: string, companyName: string): string => {
  const { colorPalette, fontPairing, brandVoice } = brandBible;

  const colorsHtml = colorPalette.map(color => `
    <div style="margin-bottom: 20px; text-align: center;">
      <div style="width: 100px; height: 100px; background-color: ${color.hex}; border-radius: 8px; border: 1px solid #4A5568; margin: 0 auto;"></div>
      <h3 style="margin-top: 10px; font-size: 1.1em; font-weight: bold;">${color.name}</h3>
      <p style="margin: 2px 0; color: #A0AEC0;">${color.hex}</p>
      <p style="margin: 2px 0; color: #A0AEC0; font-size: 0.9em; font-style: italic;">${color.usage}</p>
    </div>
  `).join('');

  const brandVoiceHtml = brandVoice ? `
    <h2>Brand Voice: ${brandVoice.name}</h2>
    <div class="section-content">
      <p>${brandVoice.description}</p>
      <p><strong>Keywords:</strong> ${brandVoice.keywords.join(', ')}</p>
    </div>
  ` : '';

  const headerFont = fontPairing.header.replace(/ /g, '+');
  const bodyFont = fontPairing.body.replace(/ /g, '+');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${companyName} | Brand Guide</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=${headerFont}:wght@700&family=${bodyFont}:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #1A202C;
          color: #E2E8F0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #2D3748;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #4A5568;
        }
        h1 {
          font-size: 2.5em;
          color: #FFFFFF;
          border-bottom: 2px solid #4FD1C5;
          padding-bottom: 10px;
          margin-bottom: 30px;
          text-align: center;
        }
        h2 {
          font-size: 1.8em;
          color: #FFFFFF;
          margin-top: 40px;
          border-bottom: 1px solid #4A5568;
          padding-bottom: 8px;
        }
        p, blockquote {
          line-height: 1.6;
          color: #CBD5E0;
        }
        blockquote {
          border-left: 4px solid #4FD1C5;
          padding-left: 20px;
          margin: 20px 0;
          font-style: italic;
        }
        .section-content {
          padding: 10px 0;
        }
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .font-section {
          margin-top: 20px;
          padding: 20px;
          background-color: #1A202C;
          border-radius: 8px;
        }
        .font-section h3 {
          color: #A0AEC0;
          font-size: 1em;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 0;
        }
        .font-preview-header {
          font-family: '${fontPairing.header}', sans-serif;
          font-size: 2.5em;
          font-weight: 700;
          margin: 10px 0;
          word-wrap: break-word;
        }
        .font-preview-body {
          font-family: '${fontPairing.body}', sans-serif;
          font-size: 1em;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${companyName} Brand Guide</h1>
        
        <h2>Mission Statement</h2>
        <blockquote>${mission}</blockquote>

        ${brandVoiceHtml}

        <h2>Color Palette</h2>
        <div class="color-grid">
          ${colorsHtml}
        </div>

        <h2>Typography</h2>
        <div class="font-section">
          <h3>Header Font: ${fontPairing.header}</h3>
          <p class="font-preview-header">The quick brown fox jumps over the lazy dog.</p>
        </div>
        <div class="font-section">
          <h3>Body Font: ${fontPairing.body}</h3>
          <p class="font-preview-body">The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};