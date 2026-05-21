const fs = require('fs')

let content = fs.readFileSync('app/plan/[id]/page.tsx', 'utf8')

content = content.replace(
  "import { useEffect, useState } from 'react'",
  "import React, { useEffect, useState } from 'react'"
)

content = content.replace(
  'export default function PlanPage({ params }: { params: { id: string } }) {',
  'export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {'
)

content = content.replace(
  'const [loading, setLoading] = useState(true)',
  'const [loading, setLoading] = useState(true)\n  const resolvedParams = React.use(params)'
)

content = content.replace(/params\.id/g, 'resolvedParams.id')

fs.writeFileSync('app/plan/[id]/page.tsx', content)
console.log('done')