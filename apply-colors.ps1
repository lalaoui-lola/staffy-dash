# Script PowerShell pour remplacer les couleurs dans tous les fichiers TSX

$files = Get-ChildItem -Path "app","components" -Recurse -Include *.tsx

$replacements = @{
    # Indigo → Brand Teal
    'from-indigo-600' = 'from-brand-teal'
    'to-indigo-600' = 'to-brand-teal'
    'via-indigo-600' = 'via-brand-teal'
    'bg-indigo-600' = 'bg-brand-teal'
    'text-indigo-600' = 'text-brand-teal'
    'border-indigo-600' = 'border-brand-teal'
    'ring-indigo-600' = 'ring-brand-teal'
    'focus:ring-indigo-500' = 'focus:ring-brand-teal'
    'focus:border-indigo-500' = 'focus:border-brand-teal'
    
    'from-indigo-700' = 'from-brand-700'
    'to-indigo-700' = 'to-brand-700'
    'bg-indigo-700' = 'bg-brand-700'
    
    'from-indigo-50' = 'from-brand-50'
    'to-indigo-50' = 'to-brand-50'
    'via-indigo-50' = 'via-brand-50'
    'bg-indigo-50' = 'bg-brand-50'
    
    'from-indigo-100' = 'from-brand-100'
    'bg-indigo-100' = 'bg-brand-100'
    'text-indigo-100' = 'text-brand-100'
    'ring-indigo-100' = 'ring-brand-100'
    
    'text-indigo-900' = 'text-brand-dark'
    'border-indigo-200' = 'border-brand-200'
    
    # Purple → Brand Dark
    'from-purple-600' = 'from-brand-dark'
    'to-purple-600' = 'to-brand-dark'
    'via-purple-600' = 'via-brand-700'
    'bg-purple-600' = 'bg-brand-dark'
    'text-purple-600' = 'text-brand-dark'
    
    'from-purple-700' = 'from-brand-800'
    'to-purple-700' = 'to-brand-800'
    'bg-purple-700' = 'bg-brand-800'
    
    'from-purple-50' = 'from-brand-100'
    'to-purple-50' = 'to-brand-100'
    'via-purple-50' = 'via-brand-100'
    'bg-purple-50' = 'bg-brand-100'
    
    'from-purple-500' = 'from-brand-600'
    'to-purple-500' = 'to-brand-600'
    
    # Pink → Accent
    'from-pink-50' = 'from-accent-50'
    'to-pink-50' = 'to-accent-50'
    'via-pink-50' = 'via-accent-50'
    'bg-pink-50' = 'bg-accent-50'
    
    'from-pink-500' = 'from-accent-500'
    'to-pink-500' = 'to-accent-500'
    'bg-pink-500' = 'bg-accent-500'
    
    'from-pink-600' = 'from-accent-600'
    'to-pink-600' = 'to-accent-600'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✓ Modifié: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Remplacement des couleurs terminé!" -ForegroundColor Cyan
