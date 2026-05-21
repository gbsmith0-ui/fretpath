const fs = require('fs')

let content = fs.readFileSync('app/plan/[id]/page.tsx', 'utf8')

const downloadFunction = `
  async function downloadPlan() {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fretpath-practice-plan.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }
`

content = content.replace(
  'function copyLink() {',
  downloadFunction + '\n  function copyLink() {'
)

content = content.replace(
  '<button onClick={copyLink} className="text-xs border border-neutral-200 px-3 py-1.5 rounded-md text-neutral-500 hover:border-neutral-400 transition-colors whitespace-nowrap">',
  '<div className="flex gap-2">\n            <button onClick={downloadPlan} className="text-xs bg-[#1E2A3A] text-[#D4890A] px-3 py-1.5 rounded-md hover:bg-[#162030] transition-colors whitespace-nowrap">Download plan</button>\n            <button onClick={copyLink} className="text-xs border border-neutral-200 px-3 py-1.5 rounded-md text-neutral-500 hover:border-neutral-400 transition-colors whitespace-nowrap">'
)

content = content.replace(
  '{copied ? \'Copied!\' : \'Share link\'}\n            </button>',
  '{copied ? \'Copied!\' : \'Share link\'}\n            </button>\n            </div>'
)

fs.writeFileSync('app/plan/[id]/page.tsx', content)
console.log('Done!')