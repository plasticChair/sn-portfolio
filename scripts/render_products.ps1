[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [string]$OutputPath,
    [string]$BlenderPath,
    [ValidateRange(1, 16384)]
    [int]$Width = 1600,
    [ValidateRange(1, 16384)]
    [int]$Height = 1200,
    [ValidateRange(1, 100000)]
    [int]$Samples = 128,
    [ValidatePattern('^#?[0-9a-fA-F]{6}$')]
    [string]$Color = '#3C4148',
    [ValidateRange(-360, 360)]
    [double]$Azimuth = 45,
    [ValidateRange(5, 85)]
    [double]$Elevation = 35,
    [ValidateSet('X', 'Y', 'Z')]
    [string]$UpAxis = 'Z',
    [switch]$Recursive,
    [switch]$SaveBlend,
    [switch]$SceneOnly,
    [switch]$KeepMaterials,
    [switch]$Overwrite
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path -LiteralPath $InputPath).Path
if (-not $OutputPath) {
    $base = if (Test-Path -LiteralPath $source -PathType Container) { $source } else { Split-Path $source }
    $OutputPath = Join-Path $base 'StudioRenders'
}
$output = [System.IO.Path]::GetFullPath($OutputPath)
$script = Join-Path $PSScriptRoot 'blender_product_render.py'
$arguments = @('--background', '--factory-startup', '--python-exit-code', '1',
               '--python', $script, '--', $source, '--output', $output,
               '--resolution', "$Width", "$Height", '--samples', "$Samples", '--color', $Color,
               '--azimuth', $Azimuth.ToString([Globalization.CultureInfo]::InvariantCulture),
               '--elevation', $Elevation.ToString([Globalization.CultureInfo]::InvariantCulture),
               '--up-axis', $UpAxis)
if ($Recursive) { $arguments += '--recursive' }
if ($SaveBlend) { $arguments += '--save-blend' }
if ($SceneOnly) { $arguments += '--scene-only' }
if ($KeepMaterials) { $arguments += '--keep-materials' }
if ($Overwrite) { $arguments += '--overwrite' }

$package = $null
if (-not $BlenderPath) {
    $package = Get-AppxPackage -Name 'BlenderFoundation.Blender' -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($package) {
        $manifest = Get-AppxPackageManifest -Package $package.PackageFullName
        $application = $manifest.Package.Applications.Application | Select-Object -First 1
        $launcher = Join-Path $package.InstallLocation $application.Executable
        $BlenderPath = Join-Path (Split-Path $launcher) 'blender.exe'
    } else {
        $command = Get-Command blender.exe -ErrorAction SilentlyContinue
        if ($command) { $BlenderPath = $command.Source }
    }
}
if (-not $BlenderPath -or -not (Test-Path -LiteralPath $BlenderPath)) {
    throw 'Blender was not found. Specify -BlenderPath or install Blender.'
}
Write-Output "Blender: $BlenderPath"
Write-Output "Output: $output"
if (-not $package) {
    & $BlenderPath @arguments
    if ($LASTEXITCODE -ne 0) { throw "Blender failed with exit code $LASTEXITCODE." }
    return
}

function ConvertTo-CmdArgument([string]$Value) {
    if ($Value -match '[%"\r\n]') {
        throw 'Store launch arguments cannot contain percent signs, double quotes, or newlines.'
    }
    return '"' + ($Value -replace '(\\+)$', '$1$1') + '"'
}

$null = New-Item -ItemType Directory -Path $output -Force
$log = Join-Path $output ('render-' + [guid]::NewGuid().ToString('N') + '.log')
$commandLine = (@($BlenderPath) + $arguments | ForEach-Object { ConvertTo-CmdArgument $_ }) -join ' '
$launchArguments = '/d /v:off /c "' + $commandLine + ' > ' + (ConvertTo-CmdArgument $log) + ' 2>&1"'
Invoke-CommandInDesktopPackage -PackageFamilyName $package.PackageFamilyName -AppId $application.Id `
    -Command $env:ComSpec -Args $launchArguments -PreventBreakaway
$processIds = @(Get-CimInstance Win32_Process -Filter "Name = 'cmd.exe'" |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains($log) } |
    Select-Object -ExpandProperty ProcessId)
if ($processIds) { Wait-Process -Id $processIds -ErrorAction SilentlyContinue }
if (-not (Test-Path -LiteralPath $log)) { throw 'Store launch did not produce a Blender log.' }
$logText = Get-Content -LiteralPath $log -Raw
Write-Output $logText
Write-Output "Log: $log"
if ($logText -notmatch 'Finished: \d+ input\(s\), 0 failure\(s\)\.') {
    throw "Blender did not complete successfully. See $log"
}