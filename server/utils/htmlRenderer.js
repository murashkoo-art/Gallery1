const fs = require('fs')
const path = require('path')

// Функция для получения имен файлов ассетов
function getAssetFiles() {
  const assetsDir = path.join(__dirname, '../public/assets')
  
  try {
    const files = fs.readdirSync(assetsDir)
    // Ищем файлы, которые начинаются с app- и имеют нужные расширения
    const jsFile = files.find(f => f.startsWith('app-') && f.endsWith('.js'))
    const cssFile = files.find(f => f.startsWith('app-') && f.endsWith('.css'))
    
    return {
      jsFile: jsFile ? `/assets/${jsFile}` : null,
      cssFile: cssFile ? `/assets/${cssFile}` : null
    }
  } catch (error) {
    console.warn('Assets directory not found:', error.message)
    return { jsFile: null, cssFile: null }
  }
}
// Функция рендеринга HTML
function renderHtml(moduleData) {
  const { jsFile, cssFile } = getAssetFiles()
  
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${moduleData.title}</title>
    ${cssFile ? `<link rel="stylesheet" crossorigin href="${cssFile}">` : ''}
</head>
<body>
    <div id="app"></div>
    <script>
        window.INITIAL_MODULE_DATA = ${JSON.stringify(moduleData)};
    </script>
    ${jsFile ? `<script type="module" crossorigin src="${jsFile}"></script>` : ''}
</body>
</html>
  `
}

module.exports = {
  renderHtml
}