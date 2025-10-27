$files = Get-ChildItem -Path "app","components" -Recurse -Include *.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Indigo to Brand
    if ($content -match 'indigo-600') {
        $content = $content -replace 'from-indigo-600', 'from-brand-teal'
        $content = $content -replace 'to-indigo-600', 'to-brand-teal'
        $content = $content -replace 'via-indigo-600', 'via-brand-teal'
        $content = $content -replace 'bg-indigo-600', 'bg-brand-teal'
        $content = $content -replace 'text-indigo-600', 'text-brand-teal'
        $content = $content -replace 'border-indigo-600', 'border-brand-teal'
        $content = $content -replace 'ring-indigo-600', 'ring-brand-teal'
        $modified = $true
    }
    
    if ($content -match 'indigo-500') {
        $content = $content -replace 'focus:ring-indigo-500', 'focus:ring-brand-teal'
        $content = $content -replace 'focus:border-indigo-500', 'focus:border-brand-teal'
        $modified = $true
    }
    
    if ($content -match 'indigo-700') {
        $content = $content -replace 'from-indigo-700', 'from-brand-700'
        $content = $content -replace 'to-indigo-700', 'to-brand-700'
        $content = $content -replace 'bg-indigo-700', 'bg-brand-700'
        $modified = $true
    }
    
    if ($content -match 'indigo-50') {
        $content = $content -replace 'from-indigo-50', 'from-brand-50'
        $content = $content -replace 'to-indigo-50', 'to-brand-50'
        $content = $content -replace 'via-indigo-50', 'via-brand-50'
        $content = $content -replace 'bg-indigo-50', 'bg-brand-50'
        $modified = $true
    }
    
    if ($content -match 'indigo-100') {
        $content = $content -replace 'from-indigo-100', 'from-brand-100'
        $content = $content -replace 'bg-indigo-100', 'bg-brand-100'
        $content = $content -replace 'text-indigo-100', 'text-brand-100'
        $content = $content -replace 'ring-indigo-100', 'ring-brand-100'
        $modified = $true
    }
    
    if ($content -match 'indigo-200') {
        $content = $content -replace 'border-indigo-200', 'border-brand-200'
        $modified = $true
    }
    
    if ($content -match 'indigo-900') {
        $content = $content -replace 'text-indigo-900', 'text-brand-dark'
        $modified = $true
    }
    
    # Purple to Brand Dark
    if ($content -match 'purple-600') {
        $content = $content -replace 'from-purple-600', 'from-brand-dark'
        $content = $content -replace 'to-purple-600', 'to-brand-dark'
        $content = $content -replace 'via-purple-600', 'via-brand-700'
        $content = $content -replace 'bg-purple-600', 'bg-brand-dark'
        $content = $content -replace 'text-purple-600', 'text-brand-dark'
        $modified = $true
    }
    
    if ($content -match 'purple-700') {
        $content = $content -replace 'from-purple-700', 'from-brand-800'
        $content = $content -replace 'to-purple-700', 'to-brand-800'
        $content = $content -replace 'bg-purple-700', 'bg-brand-800'
        $modified = $true
    }
    
    if ($content -match 'purple-50') {
        $content = $content -replace 'from-purple-50', 'from-brand-100'
        $content = $content -replace 'to-purple-50', 'to-brand-100'
        $content = $content -replace 'via-purple-50', 'via-brand-100'
        $content = $content -replace 'bg-purple-50', 'bg-brand-100'
        $modified = $true
    }
    
    if ($content -match 'purple-500') {
        $content = $content -replace 'from-purple-500', 'from-brand-600'
        $content = $content -replace 'to-purple-500', 'to-brand-600'
        $modified = $true
    }
    
    # Pink to Accent
    if ($content -match 'pink-50') {
        $content = $content -replace 'from-pink-50', 'from-accent-50'
        $content = $content -replace 'to-pink-50', 'to-accent-50'
        $content = $content -replace 'via-pink-50', 'via-accent-50'
        $content = $content -replace 'bg-pink-50', 'bg-accent-50'
        $modified = $true
    }
    
    if ($content -match 'pink-500') {
        $content = $content -replace 'from-pink-500', 'from-accent-500'
        $content = $content -replace 'to-pink-500', 'to-accent-500'
        $content = $content -replace 'bg-pink-500', 'bg-accent-500'
        $modified = $true
    }
    
    if ($content -match 'pink-600') {
        $content = $content -replace 'from-pink-600', 'from-accent-600'
        $content = $content -replace 'to-pink-600', 'to-accent-600'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Modified: $($file.Name)"
    }
}

Write-Host "Done!"
