Add-Type -AssemblyName System.Drawing

function Resize-Image($srcPath, $destPath, $width, $height) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $newBmp = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($newBmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcImg, 0, 0, $width, $height)
    
    $newBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newBmp.Dispose()
    $srcImg.Dispose()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicDir = Join-Path $scriptDir "..\public"

$sourceLogo = Join-Path $publicDir "logo novo.png"
$targetLogo = Join-Path $publicDir "Logo.png"

# Copy original logo novo.png to Logo.png
Copy-Item -Path $sourceLogo -Destination $targetLogo -Force

Resize-Image $targetLogo (Join-Path $publicDir "icon-512.png") 512 512
Resize-Image $targetLogo (Join-Path $publicDir "icon-192.png") 192 192
Resize-Image $targetLogo (Join-Path $publicDir "apple-touch-icon.png") 180 180
Resize-Image $targetLogo (Join-Path $publicDir "favicon.png") 64 64

Write-Host "All logo icons generated successfully from logo novo.png!"
