const fs = require('fs')

let content = fs.readFileSync('app/api/generate-plan/route.ts', 'utf8')

content = content.replace(
  `const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)`,
  `const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)`
)

fs.writeFileSync('app/api/generate-plan/route.ts', content)
console.log('done')
console.log(fs.readFileSync('app/api/generate-plan/route.ts','utf8').substring(200,400))