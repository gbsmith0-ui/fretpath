const fs = require('fs')

let content = fs.readFileSync('app/plan/[id]/page.tsx', 'utf8')

const checkoutFunction = `
  async function handleCheckout() {
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: resolvedParams.id }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout failed:', err)
    }
  }
`

content = content.replace(
  'function copyLink() {',
  checkoutFunction + '\n  function copyLink() {'
)

content = content.replace(
  '<a href="/checkout" className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#c07a09] transition-colors text-sm">Get the 30-day pack</a>',
  '<button onClick={handleCheckout} className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#c07a09] transition-colors text-sm">Get the 30-day pack</button>'
)

fs.writeFileSync('app/plan/[id]/page.tsx', content)
console.log('Done!')