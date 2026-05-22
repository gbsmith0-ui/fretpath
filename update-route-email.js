const fs = require('fs')

let content = fs.readFileSync('app/api/generate-plan/route.ts', 'utf8')

const emailCall = `
    try {
      await fetch(process.env.NEXT_PUBLIC_APP_URL + "/api/send-plan-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: planData }),
      })
    } catch (emailErr) {
      console.error("Email send failed:", emailErr)
    }
`

content = content.replace(
  'return NextResponse.json({ planId, plan: planData, email })',
  emailCall + '\n    return NextResponse.json({ planId, plan: planData, email })'
)

fs.writeFileSync('app/api/generate-plan/route.ts', content)
console.log('Done!')